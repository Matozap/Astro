# Data Model: Astro Modular Monolith

**Date**: 2025-12-14
**Context**: DDD-compliant domain model with aggregate boundaries

## Overview

This document defines the domain model for Astro using DDD tactical patterns. Each module
has clearly defined aggregate boundaries, value objects, and domain events.

---

## Products Module

### Aggregate: Product (Root)

```
┌─────────────────────────────────────────────────────────────┐
│                    Product Aggregate                        │
├─────────────────────────────────────────────────────────────┤
│  Product (Aggregate Root)                                   │
│  ├── Id: Guid                                               │
│  ├── Name: string (required, max 200 chars)                 │
│  ├── Description: string (optional, max 2000 chars)         │
│  ├── Price: Money (value object)                            │
│  ├── Sku: Sku (value object)                                │
│  ├── StockQuantity: StockQuantity (value object)            │
│  ├── LowStockThreshold: int                                 │
│  ├── IsActive: bool                                         │
│  ├── CreatedAt: DateTimeOffset                              │
│  ├── UpdatedAt: DateTimeOffset?                             │
│  ├── CreatedBy: string                                      │
│  ├── ModifiedBy: string?                                    │
│  │                                                          │
│  ├── Details: List<ProductDetail> (child entity)            │
│  │   ├── Id: Guid                                           │
│  │   ├── Key: string                                        │
│  │   └── Value: string                                      │
│  │                                                          │
│  └── Images: List<ProductImage> (child entity)              │
│      ├── Id: Guid                                           │
│      ├── FileName: string                                   │
│      ├── Url: string                                        │
│      ├── StorageMode: StorageMode (enum)                    │
│      └── IsPrimary: bool                                    │
└─────────────────────────────────────────────────────────────┘
```

### Value Objects (Products)

**Money**
```csharp
public record Money
{
    public decimal Amount { get; }
    public string Currency { get; }  // Default: "USD"

    // Factory methods
    public static Money FromDecimal(decimal amount, string currency = "USD");

    // Invariants
    // - Amount MUST be >= 0
    // - Currency MUST be valid ISO code
}
```

**Sku**
```csharp
public record Sku
{
    public string Value { get; }

    // Factory methods
    public static Sku Create(string value);

    // Invariants
    // - Value MUST match pattern: [A-Z0-9]{3,20}
    // - Value MUST be unique (enforced at repository level)
}
```

**StockQuantity**
```csharp
public record StockQuantity
{
    public int Value { get; }

    // Factory methods
    public static StockQuantity Create(int value);
    public StockQuantity Add(int amount);
    public StockQuantity Subtract(int amount);

    // Invariants
    // - Value MUST be >= 0
}
```

### Domain Events (Products)

| Event | Trigger | Payload |
|-------|---------|---------|
| `ProductCreated` | New product added | ProductId, Name, Sku, Price |
| `ProductUpdated` | Product details changed | ProductId, changed fields |
| `ProductDeleted` | Product removed | ProductId |
| `ProductPriceChanged` | Price modified | ProductId, OldPrice, NewPrice |
| `ProductStockChanged` | Stock quantity changed | ProductId, OldQty, NewQty |
| `LowStockDetected` | Stock below threshold | ProductId, CurrentQty, Threshold |

### Invariants (Products)

1. Product name MUST NOT be empty or exceed 200 characters
2. Product price MUST be non-negative
3. Product SKU MUST be unique across all products
4. Stock quantity MUST NOT go negative
5. At least one image MAY be marked as primary
6. Product MUST NOT be deleted if active orders reference it

---

## Orders Module

### Aggregate: Order (Root)

```
┌─────────────────────────────────────────────────────────────┐
│                     Order Aggregate                         │
├─────────────────────────────────────────────────────────────┤
│  Order (Aggregate Root)                                     │
│  ├── Id: Guid                                               │
│  ├── OrderNumber: OrderNumber (value object)                │
│  ├── CustomerName: string (required)                        │
│  ├── CustomerEmail: Email (value object)                    │
│  ├── ShippingAddress: Address (value object)                │
│  ├── Status: OrderStatus (enum)                             │
│  ├── TotalAmount: Money (value object)                      │
│  ├── Notes: string (optional)                               │
│  ├── CreatedAt: DateTimeOffset                              │
│  ├── UpdatedAt: DateTimeOffset?                             │
│  ├── CreatedBy: string                                      │
│  ├── ModifiedBy: string?                                    │
│  │                                                          │
│  └── Details: List<OrderDetail> (child entity)              │
│      ├── Id: Guid                                           │
│      ├── ProductId: Guid (reference to Products module)     │
│      ├── ProductName: string (snapshot)                     │
│      ├── ProductSku: string (snapshot)                      │
│      ├── Quantity: int                                      │
│      └── UnitPrice: Money (value object)                    │
└─────────────────────────────────────────────────────────────┘
```

### Read Model: ProductCache

```
┌─────────────────────────────────────────────────────────────┐
│                 ProductCache (Read Model)                   │
├─────────────────────────────────────────────────────────────┤
│  NOT an aggregate - synchronized from Products module       │
│  ├── ProductId: Guid (primary key)                          │
│  ├── Name: string                                           │
│  ├── Sku: string                                            │
│  ├── Price: decimal                                         │
│  ├── StockQuantity: int                                     │
│  ├── IsActive: bool                                         │
│  └── LastUpdated: DateTimeOffset                            │
└─────────────────────────────────────────────────────────────┘
```

### Value Objects (Orders)

**OrderNumber**
```csharp
public record OrderNumber
{
    public string Value { get; }

    // Factory methods
    public static OrderNumber Generate();  // Format: ORD-YYYYMMDD-XXXXX
    public static OrderNumber Create(string value);

    // Invariants
    // - Value MUST match pattern: ORD-\d{8}-[A-Z0-9]{5}
}
```

**Email**
```csharp
public record Email
{
    public string Value { get; }

    // Factory methods
    public static Email Create(string value);

    // Invariants
    // - Value MUST be valid email format
}
```

**Address**
```csharp
public record Address
{
    public string Street { get; }
    public string City { get; }
    public string State { get; }
    public string PostalCode { get; }
    public string Country { get; }

    // Factory methods
    public static Address Create(string street, string city, string state,
                                  string postalCode, string country);

    // Invariants
    // - Street, City, Country MUST NOT be empty
    // - PostalCode MUST match country-specific format
}
```

### Order Status State Machine

```
┌─────────┐    ┌───────────┐    ┌────────────┐    ┌─────────┐    ┌───────────┐
│ Pending │───▶│ Confirmed │───▶│ Processing │───▶│ Shipped │───▶│ Delivered │
└─────────┘    └───────────┘    └────────────┘    └─────────┘    └───────────┘
     │              │                 │                │
     │              │                 │                │
     ▼              ▼                 ▼                ▼
┌───────────────────────────────────────────────────────────┐
│                        Cancelled                          │
└───────────────────────────────────────────────────────────┘

Valid Transitions:
- Pending → Confirmed, Cancelled
- Confirmed → Processing, Cancelled
- Processing → Shipped, Cancelled
- Shipped → Delivered, Cancelled
- Delivered → (terminal state)
- Cancelled → (terminal state)
```

### Domain Events (Orders)

| Event | Trigger | Payload |
|-------|---------|---------|
| `OrderCreated` | New order placed | OrderId, OrderNumber, CustomerId |
| `OrderConfirmed` | Order confirmed | OrderId |
| `OrderStatusChanged` | Status transition | OrderId, OldStatus, NewStatus |
| `OrderCancelled` | Order cancelled | OrderId, Reason |
| `OrderShipped` | Order shipped | OrderId, TrackingNumber |
| `OrderDelivered` | Order delivered | OrderId, DeliveryDate |

### Invariants (Orders)

1. Order MUST have at least one order detail
2. Order total MUST equal sum of (Quantity * UnitPrice) for all details
3. Order status transitions MUST follow valid state machine
4. Cancelled or Delivered orders MUST NOT be modified
5. Order details MUST reference valid products from ProductCache
6. Product stock MUST be available at order creation time

---

## Shared Contracts

### Integration Events

Located in `Shared.Contracts/Events/`:

```csharp
// Base interface
public interface IIntegrationEvent
{
    Guid EventId { get; }
    DateTimeOffset OccurredAt { get; }
}

// Product events (published by Products module)
public record ProductCreatedEvent : IIntegrationEvent
{
    public Guid ProductId { get; init; }
    public string Name { get; init; }
    public string Sku { get; init; }
    public decimal Price { get; init; }
    public int StockQuantity { get; init; }
    public bool IsActive { get; init; }
}

public record ProductUpdatedEvent : IIntegrationEvent { ... }
public record ProductDeletedEvent : IIntegrationEvent { ... }
public record ProductStockUpdatedEvent : IIntegrationEvent { ... }
```

---

## Database Schema Overview

### Products Database (productsdb)

| Table | Columns | Notes |
|-------|---------|-------|
| `Products` | Id, Name, Description, Price, Sku, StockQuantity, LowStockThreshold, IsActive, CreatedAt, UpdatedAt, CreatedBy, ModifiedBy | Aggregate root |
| `ProductDetails` | Id, ProductId (FK), Key, Value | Child of Product |
| `ProductImages` | Id, ProductId (FK), FileName, Url, StorageMode, IsPrimary | Child of Product |

### Orders Database (ordersdb)

| Table | Columns | Notes |
|-------|---------|-------|
| `Orders` | Id, OrderNumber, CustomerName, CustomerEmail, ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry, Status, TotalAmount, Notes, CreatedAt, UpdatedAt, CreatedBy, ModifiedBy | Aggregate root with owned Address |
| `OrderDetails` | Id, OrderId (FK), ProductId, ProductName, ProductSku, Quantity, UnitPrice | Child of Order |
| `ProductCache` | ProductId (PK), Name, Sku, Price, StockQuantity, IsActive, LastUpdated | Read model |

---

## Entity Relationship Diagram

```
PRODUCTS MODULE                          ORDERS MODULE
═══════════════                          ═════════════

┌──────────────┐                        ┌──────────────┐
│   Product    │                        │    Order     │
├──────────────┤                        ├──────────────┤
│ PK: Id       │                        │ PK: Id       │
│ Name         │                        │ OrderNumber  │
│ Description  │                        │ CustomerName │
│ Price        │◄───────────────────────│ CustomerEmail│
│ Sku          │   (via ProductCache)   │ Address (VO) │
│ StockQty     │                        │ Status       │
│ IsActive     │                        │ TotalAmount  │
└──────┬───────┘                        └──────┬───────┘
       │ 1:N                                   │ 1:N
       ▼                                       ▼
┌──────────────┐                        ┌──────────────┐
│ProductDetail │                        │ OrderDetail  │
├──────────────┤                        ├──────────────┤
│ PK: Id       │                        │ PK: Id       │
│ FK: ProductId│                        │ FK: OrderId  │
│ Key          │                        │ ProductId    │──┐
│ Value        │                        │ ProductName  │  │
└──────────────┘                        │ ProductSku   │  │
       │                                │ Quantity     │  │
       │ 1:N                            │ UnitPrice    │  │
       ▼                                └──────────────┘  │
┌──────────────┐                                          │
│ ProductImage │                        ┌──────────────┐  │
├──────────────┤                        │ ProductCache │◄─┘
│ PK: Id       │                        ├──────────────┤
│ FK: ProductId│                        │ PK: ProductId│
│ FileName     │                        │ Name         │
│ Url          │    Events via          │ Sku          │
│ StorageMode  │───RabbitMQ────────────▶│ Price        │
│ IsPrimary    │                        │ StockQty     │
└──────────────┘                        │ IsActive     │
                                        └──────────────┘
```
