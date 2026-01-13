# Implementation Plan: Order Management Commands

**Branch**: `feature/order-commands` | **Date**: 2026-01-07 | **Spec**: [spec.md](../001-order-commands/spec.md)
**Input**: Feature specification from `specs/001-order-commands/spec.md`

## Summary

This feature enables administrators to create, edit, and cancel orders through the UI by implementing Angular components that connect to existing backend GraphQL mutations. The backend already has CreateOrder, UpdateOrder, and CancelOrder mutations with CQRS command handlers following Clean Architecture and DDD patterns. The primary work involves building frontend forms, validation, service integration, and comprehensive unit tests for both frontend and backend.

## Technical Context

**Language/Version**:
- Backend: C# 14.0 / .NET 10.0
- Frontend: TypeScript 5.7+ / Angular 19.x

**Primary Dependencies**:
- Backend: HotChocolate 15.1.11 (GraphQL), MediatR (CQRS), FluentValidation 12.1.1, Entity Framework Core (PostgreSQL), .NET Aspire 10+
- Frontend: Apollo Angular 13.0, @apollo/client 4.x, Angular Material 19.x (Material Design 3)

**Storage**: PostgreSQL via Entity Framework Core with code-first migrations

**Testing**:
- Backend: xUnit, NSubstitute (mocking), Shouldly (assertions)
- Frontend: Jasmine, Karma

**Target Platform**:
- Backend: .NET Aspire orchestrated services (Linux containers in production)
- Frontend: Web browsers (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application (Angular frontend + .NET backend)

**Performance Goals**:
- Order creation form submission < 2 seconds under normal load
- Form validation feedback < 100ms
- GraphQL mutations respond in < 500ms p95
- Frontend bundle size increase < 50KB (gzipped) for new components

**Constraints**:
- Must maintain existing Clean Architecture boundaries (Domain → Application → Infrastructure → API)
- Must follow DDD aggregate patterns (Order aggregate root)
- Must enforce CQRS pattern (separate commands and queries)
- Frontend must work offline with graceful error handling for network failures
- Terminal order statuses (Delivered, Cancelled, Refunded) cannot be edited
- Order line items cannot be modified after creation (only customer info and shipping address)

**Scale/Scope**:
- Expected usage: 10-50 administrators creating/editing orders daily
- Average 20-50 orders created per day
- Orders contain 1-10 line items on average
- Frontend: 3 new Angular components, 1 updated component, GraphQL operations
- Backend: Verify existing mutations, add missing tests, potentially create/update validators and handlers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Clean Architecture & DDD (Principle I)

**Status**: ✅ PASS

- Backend already follows Clean Architecture with Domain, Application, Infrastructure, and API layers
- Order aggregate root exists with proper encapsulation and invariant enforcement
- Value objects used (OrderNumber, Email, Address, Money)
- Repository pattern implemented (IOrderRepository in Domain, implementation in Infrastructure)
- Domain events raised for state changes (OrderCreatedEvent, OrderStatusChangedEvent, OrderCancelledEvent)

**Actions**:
- Verify Order aggregate methods (Create, UpdateCustomerInfo, UpdateShippingAddress, Cancel) exist
- Ensure all domain logic stays in aggregate, not leaking to command handlers
- Frontend follows service layer abstraction pattern

### CQRS Pattern (Principle II)

**Status**: ✅ PASS

- Existing backend uses MediatR for command/query separation
- Command naming follows convention: CreateOrderCommand, UpdateOrderCommand, UpdateOrderStatusCommand, CancelOrderCommand
- Each command has corresponding handler and FluentValidation validator
- Queries use IQueryable for deferred execution (GetOrdersQuery)

**Actions**:
- Verify all command handlers exist and follow patterns
- Ensure all commands have validators
- Add any missing validators for new command properties

### Unit Test Coverage (Principle III)

**Status**: ⚠️ REQUIRES ATTENTION

- Backend has unit test infrastructure (xUnit, NSubstitute, Shouldly)
- Tests exist for CreateOrderCommandHandler (CreateOrderCommandHandlerTests.cs)
- Tests exist for Order domain logic (OrderTests.cs)
- **GAP**: Frontend orders components lack unit tests (no test files found for orders-list, order-detail)
- **GAP**: Need to verify backend test coverage for UpdateOrder and CancelOrder commands

**Actions**:
- Create frontend unit tests for all new components (create-order, edit-order, cancel-order dialog)
- Create frontend unit tests for updated order-detail component
- Verify/create backend unit tests for UpdateOrderCommand and CancelOrderCommand handlers
- Verify/create backend unit tests for all validators
- Target 90% coverage for all new code

### .NET Aspire Platform (Principle IV)

**Status**: ✅ PASS

- Backend already integrated with .NET Aspire 10+
- Astro.ServiceDefaults referenced for health checks and telemetry
- Astro.AppHost orchestrates services

**Actions**:
- No changes required for this feature (backend changes minimal)

### Entity Framework Core (Principle V)

**Status**: ✅ PASS

- EF Core with code-first migrations already used
- Order and OrderDetail entities configured with separate configuration classes
- Migrations exist for Orders domain
- Repository pattern implemented

**Actions**:
- No schema changes expected (entities already exist)
- If any schema changes needed, create migration

### Modular Monolith Architecture (Principle VI)

**Status**: ✅ PASS

- Orders module follows pattern with Domain, Application, Infrastructure, API layers
- GraphQL types co-located in Orders module (Astro.Api/Orders/GraphQL/)
- No cross-module database access

**Actions**:
- Keep all order management logic within Orders module
- Use existing Product repository interface for stock validation (proper inter-module communication)

## Project Structure

### Documentation (this feature)

```text
specs/feature/order-commands/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions and patterns
├── data-model.md        # Phase 1: Entity relationships and validation rules
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: GraphQL schema and TypeScript types
│   ├── mutations.graphql
│   └── inputs.graphql
└── tasks.md             # Phase 2: Implementation tasks (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# Backend (existing structure - minimal changes expected)
server/
├── Astro.Api/
│   └── Orders/
│       └── GraphQL/
│           ├── Mutation.cs           # Verify CreateOrder, UpdateOrder, CancelOrder
│           ├── Query.cs              # Existing queries
│           └── Subscription.cs       # Existing subscriptions
├── Astro.Application/
│   └── Orders/
│       ├── Commands/
│       │   ├── CreateOrder/
│       │   │   ├── CreateOrderCommand.cs
│       │   │   ├── CreateOrderCommandHandler.cs
│       │   │   └── CreateOrderCommandValidator.cs
│       │   ├── UpdateOrder/
│       │   │   ├── UpdateOrderCommand.cs
│       │   │   ├── UpdateOrderCommandHandler.cs
│       │   │   └── UpdateOrderCommandValidator.cs
│       │   └── CancelOrder/
│       │       ├── CancelOrderCommand.cs
│       │       ├── CancelOrderCommandHandler.cs
│       │       └── CancelOrderCommandValidator.cs
│       └── Queries/
│           └── GetOrders/
│               ├── GetOrdersQuery.cs
│               └── GetOrdersQueryHandler.cs
├── Astro.Domain/
│   └── Orders/
│       ├── Entities/
│       │   ├── Order.cs             # Aggregate root with business methods
│       │   └── OrderDetail.cs       # Child entity
│       ├── Enums/
│       │   └── OrderStatus.cs       # State machine
│       └── ValueObjects/
│           └── OrderNumber.cs
└── Astro.Infrastructure/
    └── Orders/
        └── Persistence/
            ├── OrderRepository.cs
            └── OrderConfiguration.cs

# Backend Tests (additions needed)
server/
└── Astro.Tests/
    └── Orders/
        ├── Application/
        │   ├── CreateOrderCommandHandlerTests.cs    # Existing
        │   ├── UpdateOrderCommandHandlerTests.cs    # Verify/create
        │   ├── CancelOrderCommandHandlerTests.cs    # Verify/create
        │   ├── CreateOrderCommandValidatorTests.cs  # Verify/create
        │   ├── UpdateOrderCommandValidatorTests.cs  # Verify/create
        │   └── CancelOrderCommandValidatorTests.cs  # Verify/create
        └── Domain/
            └── OrderTests.cs                        # Existing

# Frontend (new components and tests)
client/src/app/
├── features/
│   └── orders/
│       ├── components/
│       │   ├── order-create/
│       │   │   ├── order-create.component.ts         # NEW
│       │   │   ├── order-create.component.html       # NEW
│       │   │   ├── order-create.component.scss       # NEW
│       │   │   └── order-create.component.spec.ts    # NEW
│       │   ├── order-edit/
│       │   │   ├── order-edit.component.ts           # NEW
│       │   │   ├── order-edit.component.html         # NEW
│       │   │   ├── order-edit.component.scss         # NEW
│       │   │   └── order-edit.component.spec.ts      # NEW
│       │   └── cancel-order-dialog/
│       │       ├── cancel-order-dialog.component.ts  # NEW
│       │       ├── cancel-order-dialog.component.html # NEW
│       │       ├── cancel-order-dialog.component.scss # NEW
│       │       └── cancel-order-dialog.component.spec.ts # NEW
│       ├── order-detail/
│       │   ├── order-detail.component.ts             # UPDATE (add edit/cancel buttons)
│       │   ├── order-detail.component.html           # UPDATE
│       │   └── order-detail.component.spec.ts        # NEW
│       ├── orders-list/
│       │   ├── orders-list.component.ts              # UPDATE (add create button)
│       │   ├── orders-list.component.html            # UPDATE
│       │   └── orders-list.component.spec.ts         # NEW
│       ├── services/
│       │   ├── order.service.ts                      # UPDATE (add create, update, cancel)
│       │   └── order.service.spec.ts                 # NEW
│       └── graphql/
│           └── order.queries.ts                      # UPDATE (add mutations)
└── app.routes.ts                                     # UPDATE (add create/edit routes)
```

**Structure Decision**: This is a web application with separate backend (.NET/C#) and frontend (Angular/TypeScript) projects. The backend follows modular monolith architecture with Orders as a self-contained module. The frontend follows Angular best practices with feature modules, standalone components, and service layer abstraction. Both sides maintain clear separation of concerns.

## Complexity Tracking

No constitution violations. All checks pass or have documented gaps that will be addressed during implementation (primarily adding missing unit tests).

## Post-Design Constitution Re-evaluation

*Re-checked after Phase 1 design completion*

### Final Assessment

**Status**: ✅ ALL PRINCIPLES PASS

After completing research, data model, and API contract design, the implementation plan remains fully compliant with all constitutional principles:

1. **Clean Architecture & DDD**: Design maintains aggregate boundaries, value objects, and layer separation. Frontend service layer abstracts backend communication. No leakage of domain logic.

2. **CQRS Pattern**: All operations use existing command/query separation via MediatR. No deviations from pattern.

3. **Unit Test Coverage**: Design includes comprehensive test specifications for all new components (frontend) and fills gaps in backend test coverage (UpdateOrder, CancelOrder handlers and validators).

4. **Aspire Platform**: No changes required. Backend integration remains intact.

5. **Entity Framework Core**: No schema changes. Existing Order and OrderDetail configurations sufficient.

6. **Modular Monolith**: All work stays within Orders module. Cross-module communication via repository interfaces (Product validation).

**Design Decisions Summary**:
- Reuse existing GraphQL mutations (CreateOrder, UpdateOrder, CancelOrder)
- Reuse existing CQRS commands and handlers (verify/enhance only)
- Add missing FluentValidation validators where needed
- Build frontend components using Angular Reactive Forms + Material Design
- Comprehensive unit tests for both frontend and backend

**No Architecture Deviations**: The design follows established patterns throughout. Implementation will add missing test coverage and build UI components without introducing new architectural patterns or violating constitutional principles.

