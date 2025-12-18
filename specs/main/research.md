# Research: Modular Monolith & DDD Migration

**Date**: 2025-12-14
**Context**: Evolving Astro from Clean Architecture to DDD-compliant modular monolith

## Research Summary

This document captures architectural decisions for migrating the Astro application to
full DDD compliance while maintaining the existing modular monolith structure.

---

## 1. Aggregate Root Identification

### Decision: Product and Order as Aggregate Roots

**Products Module:**
- `Product` is the aggregate root
- `ProductDetail` and `ProductImage` are child entities within the Product aggregate
- External modules reference products by `ProductId` only

**Orders Module:**
- `Order` is the aggregate root
- `OrderDetail` is a child entity within the Order aggregate
- `ProductCache` is a separate read model (not part of Order aggregate)

### Rationale

- Products and Orders are the primary business concepts with clear lifecycle boundaries
- Child entities (details, images, line items) have no independent existence
- This aligns with constitution principle I: "Aggregates MUST control access to child entities"

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| ProductImage as separate aggregate | Images have no business identity without product |
| OrderDetail as separate aggregate | Line items have no meaning outside order context |

---

## 2. Value Object Candidates

### Decision: Introduce Value Objects for Domain Concepts

**Products Module:**
- `Money` - Represents price with currency (Price property)
- `Sku` - Product SKU with validation rules
- `StockQuantity` - Non-negative quantity with threshold logic

**Orders Module:**
- `Money` - Order total and line item amounts
- `Email` - Customer email with validation
- `Address` - Shipping address as value object
- `OrderNumber` - Formatted order identifier

**Shared:**
- `Money` value object should be in `Shared.Contracts` for cross-module consistency

### Rationale

- Constitution principle I requires: "Value objects MUST be immutable with equality based
  on properties"
- These concepts have no identity and are defined by their values
- Encapsulates validation and business rules at the domain level

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| Keep primitives | Loses domain semantics and validation at boundaries |
| Module-specific Money | Duplication; Money concept is universal |

---

## 3. Domain Events Strategy

### Decision: Two-Tier Event Architecture

**Tier 1: Internal Domain Events (Module-scoped)**
- Raised by aggregates for intra-module communication
- Handled by domain event handlers within same module
- Examples: `ProductPriceChanged`, `OrderStatusChanged`
- Located in `[Module].Domain/Events/`

**Tier 2: Integration Events (Cross-module)**
- Published to message broker for inter-module communication
- Current events in `Shared.Contracts` are integration events
- Examples: `ProductCreatedEvent`, `ProductStockUpdatedEvent`
- Application layer translates domain events to integration events

### Rationale

- Constitution principle I: "Domain events for cross-aggregate communication"
- Constitution principle VI: "Modules MUST communicate through well-defined contracts"
- Separation allows domain to remain pure while enabling distributed communication

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| Single event type | Couples domain to infrastructure concerns |
| Direct module calls | Violates module boundary isolation |

---

## 4. Repository Pattern Enhancement

### Decision: Aggregate Root Repositories Only

**Current State:**
- `IProductRepository` - Operates on Product
- `IOrderRepository` - Operates on Order
- `IProductCacheRepository` - Operates on read model

**Target State:**
- Repositories MUST only operate on aggregate roots
- No separate repositories for `ProductDetail`, `ProductImage`, `OrderDetail`
- Aggregate root repository handles persistence of entire aggregate graph

**Repository Interface Design:**
```csharp
public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Product?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct);
    Task AddAsync(Product product, CancellationToken ct);
    Task UpdateAsync(Product product, CancellationToken ct);
    Task DeleteAsync(Product product, CancellationToken ct);
}
```

### Rationale

- Constitution principle I: "Repositories MUST operate on aggregate roots only"
- Constitution principle V: Same requirement for EF Core repositories
- Ensures aggregate invariants are enforced on every persistence operation

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| Generic repository | Bypasses aggregate boundaries |
| Separate child entity repos | Allows invariant violations |

---

## 5. Unit Test Coverage Strategy

### Decision: Comprehensive Domain and Application Layer Testing

**Domain Layer Tests (NEW):**
- Aggregate invariant tests (e.g., Product cannot have negative price)
- Value object equality and validation tests
- Domain event raising tests

**Application Layer Tests (EXISTING + EXPAND):**
- Command handler tests with mocked repositories
- Query handler tests with mocked data sources
- Validator tests for all commands

**Test Naming Convention:**
- `[ClassUnderTest]Tests.cs`
- Test methods: `[Method]_[Scenario]_[ExpectedResult]`

**Mocking Strategy:**
- Use NSubstitute for all repository and service mocks
- No in-memory database for unit tests
- Test isolation: each test independent, no shared state

### Rationale

- Constitution principle III: "Unit tests required for handlers, validators, domain logic,
  aggregates, and value objects"
- Constitution principle III: "Tests MUST NOT depend on external resources"

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| Integration tests | Constitution explicitly excludes them |
| In-memory EF Core | Still external resource dependency |

---

## 6. Module Communication Patterns

### Decision: Event-Driven Async Communication

**Current Implementation (KEEP):**
- MassTransit + RabbitMQ for async messaging
- Integration events defined in `Shared.Contracts`
- Consumers in receiving module's Infrastructure layer

**Synchronous Communication (AVOID):**
- No direct module-to-module API calls
- No shared database access between modules
- Use eventual consistency with ProductCache pattern

**Event Flow:**
```
Product Aggregate → Domain Event → Application Handler → Integration Event → RabbitMQ →
Orders Consumer → ProductCache Update
```

### Rationale

- Constitution principle VI: "Modules MUST communicate only through well-defined contracts"
- Constitution principle VI: "Direct cross-module database access is FORBIDDEN"
- Current implementation already follows this pattern correctly

---

## 7. Invariant Enforcement Location

### Decision: Aggregate Root Enforces All Invariants

**Product Aggregate Invariants:**
- Price must be non-negative
- SKU must be unique within system (enforced at persistence + domain)
- Stock quantity cannot go negative
- Name is required and has length limits

**Order Aggregate Invariants:**
- Order must have at least one order detail
- Total amount must equal sum of line items
- Status transitions must follow valid state machine
- Cannot cancel a delivered order

**Enforcement Strategy:**
- Validation in aggregate constructors and mutation methods
- Throw domain exceptions for invariant violations
- FluentValidation for command validation (entry point validation)

### Rationale

- Constitution principle I: "Aggregates MUST enforce invariants and encapsulate business rules"
- Defense in depth: validate at API (commands) and domain (aggregates)

---

## 8. EF Core Configuration for DDD

### Decision: Owned Types and Value Conversions

**Value Object Persistence:**
- Use `OwnsOne()` for complex value objects (Address)
- Use value conversions for simple value objects (Money, Email, Sku)

**Aggregate Configuration:**
- Configure navigation properties within aggregate
- Use `HasMany().WithOne()` for child entities
- Cascade delete for child entities

**Example Configuration:**
```csharp
builder.OwnsOne(o => o.ShippingAddress, address =>
{
    address.Property(a => a.Street).HasColumnName("ShippingStreet");
    address.Property(a => a.City).HasColumnName("ShippingCity");
    // ...
});

builder.Property(p => p.Price)
    .HasConversion(
        v => v.Amount,
        v => Money.FromDecimal(v, "USD"));
```

### Rationale

- Constitution principle V: "Entity configurations MUST be in separate *Configuration.cs files"
- Constitution principle V: "MUST NOT use data annotations"
- EF Core owned types map cleanly to DDD value objects

---

## Resolved Clarifications

All NEEDS CLARIFICATION items from Technical Context have been resolved:

| Item | Resolution |
|------|------------|
| Testing framework | xUnit, Shouldly, NSubstitute (per constitution) |
| Performance goals | Standard CRUD (no specific SLA defined) |
| Constraints | Unit tests only per constitution |
| Scale/Scope | 2 modules now, extensible for future modules |

---

## Next Steps

1. **Phase 1**: Generate data-model.md with aggregate boundaries
2. **Phase 1**: Document GraphQL contracts
3. **Phase 1**: Create quickstart.md for development setup
4. **Phase 2**: Generate tasks.md for implementation work
