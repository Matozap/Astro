# Data Model: Order Management Commands

**Feature**: Order Management Commands
**Date**: 2026-01-07
**Purpose**: Document entity relationships, validation rules, and state transitions for order management

## Entity Overview

This feature works with existing entities in the Orders bounded context. No schema changes are required.

## Core Entities

### Order (Aggregate Root)

**Purpose**: Represents a customer order with complete lifecycle management

**Properties**:

| Property | Type | Constraints | Description |
|----------|------|-------------|-------------|
| Id | Guid | Required, PK | Unique identifier |
| OrderNumber | OrderNumber (VO) | Required, Unique | Human-readable order number (format: ORD-{timestamp}) |
| CustomerName | string | Required, MaxLength(200) | Customer's full name |
| CustomerEmail | Email (VO) | Required | Customer's email address (validated) |
| ShippingAddress | Address (VO) | Required | Delivery address |
| Status | OrderStatus | Required | Current order status (enum) |
| TotalAmount | Money (VO) | Required, >= 0 | Calculated total from line items |
| Notes | string | Optional, MaxLength(1000) | Additional order notes |
| Details | Collection<OrderDetail> | Required, MinCount(1) | Order line items |
| Payments | Collection<Payment> | Optional | Associated payments |
| CreatedAt | DateTime | Required | Order creation timestamp |
| UpdatedAt | DateTime | Required | Last modification timestamp |
| CreatedBy | string | Required | User who created the order |
| ModifiedBy | string | Optional | User who last modified the order |

**Business Methods**:

```csharp
// Factory method
public static Order Create(
    string customerName,
    string email,
    Address shippingAddress,
    string? notes,
    IEnumerable<OrderDetailInput> details,
    string createdBy)

// Update methods
public void UpdateCustomerInfo(string customerName, string email, string modifiedBy)
public void UpdateShippingAddress(Address newAddress, string modifiedBy)
public void UpdateStatus(OrderStatus newStatus, string modifiedBy)
public void Cancel(string reason, string cancelledBy)

// Line item management
public void AddDetail(Guid productId, string productName, string sku, int quantity, decimal unitPrice)
public void RemoveDetail(Guid detailId)
public void RecalculateTotal()
```

**Invariants**:
- CustomerName must not be empty or exceed 200 characters
- At least one OrderDetail required
- Status must follow valid transitions (see state machine below)
- Cannot modify orders in terminal statuses (Delivered, Cancelled, Refunded)
- TotalAmount must equal sum of all line item totals

**Domain Events**:
- OrderCreatedEvent
- OrderStatusChangedEvent
- OrderCancelledEvent

### OrderDetail (Child Entity)

**Purpose**: Represents a single line item within an order (product snapshot at order time)

**Properties**:

| Property | Type | Constraints | Description |
|----------|------|-------------|-------------|
| Id | Guid | Required, PK | Unique identifier |
| OrderId | Guid | Required, FK | Parent order |
| ProductId | Guid | Required | Product reference |
| ProductName | string | Required, MaxLength(200) | Product name at order time |
| ProductSku | string | Required, MaxLength(50) | Product SKU at order time |
| Quantity | int | Required, > 0 | Quantity ordered |
| UnitPrice | Money (VO) | Required, >= 0 | Price per unit at order time |
| LineTotal | Money (VO) | Calculated | Quantity × UnitPrice (read-only) |

**Relationships**:
- Belongs to one Order (aggregate root)
- References Product (external aggregate) by ProductId only

**Invariants**:
- Quantity must be > 0
- LineTotal automatically calculated (Quantity × UnitPrice)
- Cannot be modified directly (only through Order aggregate)

**Notes**:
- OrderDetail is a child entity, not an aggregate root
- All access goes through Order aggregate
- Product information is snapshot at order time (denormalized for historical accuracy)

### OrderStatus (Enumeration)

**Purpose**: Defines valid order states and transitions

**Values**:
```csharp
public enum OrderStatus
{
    Pending = 1,      // Initial state
    Confirmed = 2,    // Order confirmed by customer/admin
    Processing = 3,   // Order being prepared
    Shipped = 4,      // Order dispatched
    Delivered = 5,    // Order delivered (terminal)
    Cancelled = 6,    // Order cancelled (terminal)
    Refunded = 7      // Order refunded (terminal)
}
```

**State Machine - Valid Transitions**:

```
Pending ───────┬──→ Confirmed ──→ Processing ──→ Shipped ──→ Delivered (terminal)
               │                      │              │
               │                      │              │
               └──────────────────────┴──────────────┴──────→ Cancelled (terminal)

Delivered ──→ Refunded (terminal)
```

**Transition Rules**:
- **From Pending**: Can transition to Confirmed or Cancelled
- **From Confirmed**: Can transition to Processing or Cancelled
- **From Processing**: Can transition to Shipped or Cancelled
- **From Shipped**: Can transition to Delivered or Cancelled (in case of failed delivery)
- **From Delivered**: Can only transition to Refunded
- **From Cancelled**: Terminal state, no further transitions
- **From Refunded**: Terminal state, no further transitions

**Terminal Statuses**:
- Delivered, Cancelled, Refunded
- Orders in terminal statuses cannot be edited
- Only Delivered orders can be refunded

**Extension Methods**:
```csharp
public static bool CanTransitionTo(this OrderStatus current, OrderStatus target)
public static bool IsTerminal(this OrderStatus status)
public static IEnumerable<OrderStatus> GetValidNextStatuses(this OrderStatus current)
```

## Value Objects

### OrderNumber

**Purpose**: Strongly-typed order number with format validation

**Format**: `ORD-{timestamp}`
**Example**: `ORD-20260107-143052`

**Properties**:
- Immutable
- Unique across all orders
- Human-readable and sortable by creation time

**Validation**:
- Must match pattern: `ORD-\d{8}-\d{6}`
- Automatically generated via factory method

### Email

**Purpose**: Validated email address value object

**Properties**:
- Immutable
- RFC 5322 compliant validation

**Validation**:
- Must be valid email format
- Max length: 254 characters

### Address

**Purpose**: Structured shipping address value object

**Properties**:
```csharp
public record Address(
    string Street,
    string City,
    string State,
    string PostalCode,
    string Country
)
```

**Validation**:
- All properties required
- Street: MaxLength(200)
- City: MaxLength(100)
- State: MaxLength(100)
- PostalCode: MaxLength(20)
- Country: MaxLength(100)

### Money

**Purpose**: Currency amount value object

**Properties**:
```csharp
public record Money(
    decimal Amount,
    string Currency
)
```

**Validation**:
- Amount >= 0
- Currency: 3-letter ISO code (default: "USD")

**Operations**:
- Addition, subtraction, multiplication
- Equality comparison
- Currency must match for arithmetic operations

## Related Entities (External Aggregates)

### Product

**Purpose**: Referenced entity for order line items

**Relevant Properties**:
- Id (Guid)
- Name (string)
- Sku (string)
- Price (Money)
- StockQuantity (int)
- IsActive (bool)

**Interaction**:
- Order creation validates ProductId exists and IsActive = true
- Order creation validates StockQuantity >= requested quantity
- Order stores product snapshot (Name, SKU, Price) in OrderDetail
- Product stock decreased on order creation (handled by CreateOrderCommandHandler)

**Repository Interface**:
```csharp
Task<Product?> GetByIdAsync(Guid id)
Task<bool> IsAvailableAsync(Guid id)
Task<bool> HasSufficientStockAsync(Guid id, int requestedQuantity)
```

## Validation Rules

### Create Order Validation (FR-001, FR-002, FR-003)

**Customer Information**:
- CustomerName: Required, not empty, max 200 characters
- CustomerEmail: Required, valid email format (RFC 5322)

**Shipping Address**:
- Street: Required, not empty, max 200 characters
- City: Required, not empty, max 100 characters
- State: Required, not empty, max 100 characters
- PostalCode: Required, not empty, max 20 characters
- Country: Required, not empty, max 100 characters

**Order Details**:
- At least one OrderDetail required
- Each ProductId must exist
- Each ProductId must be active (IsActive = true)
- Each ProductId must have sufficient stock
- Each Quantity must be > 0

**Notes**:
- Optional, max 1000 characters

**Business Rules**:
- Order number automatically generated (cannot be specified)
- Status set to Pending on creation
- TotalAmount calculated from line items
- CreatedAt and UpdatedAt set to current timestamp
- CreatedBy must be provided (current user)

### Update Order Validation (FR-007, FR-008, FR-009)

**Order Status Check**:
- Order must exist
- Order status must not be terminal (Delivered, Cancelled, Refunded)

**Updatable Fields**:
- CustomerName: Optional, if provided must follow same rules as create
- CustomerEmail: Optional, if provided must follow same rules as create
- ShippingAddress: Optional, if provided all address components must follow same rules as create
- Notes: Optional, if provided max 1000 characters

**Business Rules**:
- Cannot update order line items (Details collection is immutable after creation)
- Cannot update OrderNumber, Status, TotalAmount directly (use dedicated methods)
- ModifiedBy set to current user
- UpdatedAt set to current timestamp

### Cancel Order Validation (FR-011, FR-012, FR-014)

**Order Status Check**:
- Order must exist
- Order status must not be terminal (Delivered, Cancelled, Refunded)

**Cancellation Reason**:
- Required, not empty, max 500 characters

**Business Rules**:
- Status changed to Cancelled
- Cancellation reason stored in Notes or dedicated CancellationReason field
- CancelledBy set to current user
- UpdatedAt set to current timestamp
- Domain event raised (OrderCancelledEvent)

## Data Access Patterns

### Repository Methods (IOrderRepository)

```csharp
// Queries
Task<Order?> GetByIdAsync(Guid id)
Task<Order?> GetByIdWithDetailsAsync(Guid id)  // Eager load Details
Task<Order?> GetByOrderNumberAsync(string orderNumber)
IQueryable<Order> GetAll()  // For filtering/paging with HotChocolate

// Commands
Task AddAsync(Order order)
void Update(Order order)
void Delete(Order order)

// Utility
Task<bool> HasProductOrdersAsync(Guid productId)
```

**Notes**:
- Repository operates on Order aggregate root only
- GetByIdWithDetailsAsync eager loads OrderDetails collection for performance
- GetAll() returns IQueryable for HotChocolate filtering, sorting, and paging
- Update() doesn't return anything (EF Core change tracking handles updates)

### EF Core Configuration

**Order Configuration**:
- Table: "Orders"
- Value object conversions: OrderNumber → string, Email → string
- Owned types: Address (flatten to columns), Money (flatten to Amount/Currency columns)
- Relationships: One-to-many with OrderDetails (cascade delete), One-to-many with Payments (cascade delete)
- Indexes: Unique index on OrderNumber

**OrderDetail Configuration**:
- Table: "OrderDetails"
- Foreign key: OrderId
- Owned type: Money for UnitPrice and LineTotal
- No navigation property to Product (only ProductId reference)

## Aggregate Boundary Rules

### Order Aggregate

**Root**: Order entity
**Children**: OrderDetail entities

**Boundary Rules**:
- All OrderDetail modifications go through Order aggregate methods
- External code cannot create/modify OrderDetails directly
- Order enforces invariants (e.g., at least one detail, total calculated correctly)
- Aggregate is transaction boundary (all changes persisted atomically)

**Cross-Aggregate References**:
- Order references Product by ProductId only (no navigation property)
- Product information denormalized in OrderDetail for historical accuracy
- Product repository used for validation during order creation

**Consistency Rules**:
- Strong consistency within Order aggregate (enforced by aggregate root)
- Eventual consistency with Product aggregate (stock updates may be async)

## Summary

The data model leverages existing Order aggregate structure following DDD patterns:

- **Aggregate Root**: Order with rich domain behavior
- **Child Entity**: OrderDetail (not directly accessible)
- **Value Objects**: OrderNumber, Email, Address, Money
- **State Machine**: OrderStatus with validated transitions
- **Validation**: FluentValidation for input validation, domain invariants in aggregate

No schema changes required. Implementation focuses on:
1. Verifying/creating command validators with comprehensive rules
2. Ensuring aggregate methods enforce all invariants
3. Testing domain logic thoroughly
4. Building UI that respects aggregate boundaries and business rules

**Next Steps**: Generate API contracts (GraphQL schema)
