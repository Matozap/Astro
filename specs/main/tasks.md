# Tasks: Modular Monolith Consolidation

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md, research.md, data-model.md

**Context**: Convert from multi-project-per-module to single-project-per-layer structure,
removing MassTransit/RabbitMQ messaging infrastructure and consolidating into a true
modular monolith with domain folders.

**Tests**: Unit tests required per constitution (comprehensive coverage for domain and
application layers).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

**Current Structure** (to be replaced):
```
Products/Products.Domain/, Products.Application/, Products.Infrastructure/, Products.Api/, Products.Tests/
Orders/Orders.Domain/, Orders.Application/, Orders.Infrastructure/, Orders.Api/, Orders.Tests/
```

**Target Structure**:
```
src/
├── Astro.Domain/
│   ├── Products/
│   ├── Orders/
│   └── Shared/
├── Astro.Application/
│   ├── Products/
│   ├── Orders/
│   └── Common/
├── Astro.Infrastructure/
│   ├── Products/
│   ├── Orders/
│   └── Common/
├── Astro.Api/
│   ├── Products/
│   ├── Orders/
│   └── Program.cs
└── Astro.Tests/
    ├── Products/
    ├── Orders/
    └── Common/
```

---

## Phase 1: Setup (Project Structure Creation)

**Purpose**: Create new consolidated project structure

- [x] T001 Create src/Astro.Domain/Astro.Domain.csproj with net10.0 target and no external dependencies
- [x] T002 [P] Create src/Astro.Application/Astro.Application.csproj with FluentValidation, MediatR dependencies
- [x] T003 [P] Create src/Astro.Infrastructure/Astro.Infrastructure.csproj with EF Core, PostgreSQL dependencies
- [x] T004 [P] Create src/Astro.Api/Astro.Api.csproj with HotChocolate, Aspire dependencies
- [x] T005 [P] Create src/Astro.Tests/Astro.Tests.csproj with xUnit, Shouldly, NSubstitute dependencies
- [x] T006 Create folder structure in Astro.Domain: Products/, Orders/, Shared/
- [x] T007 [P] Create folder structure in Astro.Application: Products/, Orders/, Common/
- [x] T008 [P] Create folder structure in Astro.Infrastructure: Products/, Orders/, Common/
- [x] T009 [P] Create folder structure in Astro.Api: Products/, Orders/
- [x] T010 [P] Create folder structure in Astro.Tests: Products/, Orders/, Common/
- [x] T011 Update Astro.slnx to reference new projects and remove old project references
- [x] T012 Update Astro.AppHost/AppHost.cs to reference single Astro.Api project instead of Products.Api and Orders.Api

**Checkpoint**: New project structure exists, solution builds (empty projects)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure that MUST be complete before domain migration

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Create src/Astro.Domain/Shared/IAggregateRoot.cs marker interface
- [x] T014 [P] Create src/Astro.Domain/Shared/Entity.cs base class with Id property
- [x] T015 [P] Create src/Astro.Domain/Shared/ValueObject.cs base record for value object equality
- [x] T016 [P] Create src/Astro.Domain/Shared/IDomainEvent.cs interface for domain events
- [x] T017 Create src/Astro.Domain/Shared/ValueObjects/Money.cs value object with Amount, Currency
- [x] T018 Create src/Astro.Application/Common/IUnitOfWork.cs interface
- [x] T019 [P] Create src/Astro.Application/Common/Behaviors/ValidationBehavior.cs MediatR pipeline
- [x] T020 Create src/Astro.Infrastructure/Common/AstroDbContext.cs unified DbContext for all modules
- [x] T021 [P] Create src/Astro.Infrastructure/Common/UnitOfWork.cs implementing IUnitOfWork
- [x] T022 Create src/Astro.Infrastructure/Common/DependencyInjection.cs with AddInfrastructure extension
- [x] T023 Create src/Astro.Application/Common/DependencyInjection.cs with AddApplication extension
- [x] T024 Create src/Astro.Api/Program.cs with Aspire, EF Core, HotChocolate, MediatR configuration (NO MassTransit)

**Checkpoint**: Foundation ready - domain migration can now begin

---

## Phase 3: User Story 1 - Products Domain Migration (Priority: P1) 🎯 MVP

**Goal**: Migrate Products domain layer with DDD patterns (aggregates, value objects, events)

**Independent Test**: Products domain entities can be instantiated with invariant validation

### Tests for User Story 1

- [x] T025 [P] [US1] Create src/Astro.Tests/Products/Domain/ProductTests.cs for aggregate invariants
- [x] T026 [P] [US1] Create src/Astro.Tests/Products/Domain/ValueObjects/SkuTests.cs for SKU validation
- [x] T027 [P] [US1] Create src/Astro.Tests/Products/Domain/ValueObjects/StockQuantityTests.cs for quantity validation
- [x] T028 [P] [US1] Create src/Astro.Tests/Products/Domain/ValueObjects/MoneyTests.cs for price validation

### Implementation for User Story 1

- [x] T029 [P] [US1] Create src/Astro.Domain/Products/ValueObjects/Sku.cs with validation pattern [A-Z0-9]{3,20}
- [x] T030 [P] [US1] Create src/Astro.Domain/Products/ValueObjects/StockQuantity.cs with non-negative constraint
- [x] T031 [P] [US1] Create src/Astro.Domain/Products/Enums/StorageMode.cs enum (FileSystem, Azure, AWS)
- [x] T032 [US1] Create src/Astro.Domain/Products/Entities/ProductDetail.cs child entity
- [x] T033 [US1] Create src/Astro.Domain/Products/Entities/ProductImage.cs child entity with StorageMode
- [x] T034 [US1] Create src/Astro.Domain/Products/Entities/Product.cs aggregate root with invariants
- [x] T035 [P] [US1] Create src/Astro.Domain/Products/Events/ProductCreatedEvent.cs domain event
- [x] T036 [P] [US1] Create src/Astro.Domain/Products/Events/ProductUpdatedEvent.cs domain event
- [x] T037 [P] [US1] Create src/Astro.Domain/Products/Events/ProductStockChangedEvent.cs domain event
- [x] T038 [US1] Create src/Astro.Domain/Products/Abstractions/IProductRepository.cs interface

**Checkpoint**: Products domain layer complete with DDD patterns and unit tests

---

## Phase 4: User Story 2 - Orders Domain Migration (Priority: P2)

**Goal**: Migrate Orders domain layer with DDD patterns

**Independent Test**: Orders domain entities can be instantiated with state machine validation

### Tests for User Story 2

- [x] T039 [P] [US2] Create src/Astro.Tests/Orders/Domain/OrderTests.cs for aggregate invariants
- [x] T040 [P] [US2] Create src/Astro.Tests/Orders/Domain/ValueObjects/OrderNumberTests.cs
- [x] T041 [P] [US2] Create src/Astro.Tests/Orders/Domain/ValueObjects/EmailTests.cs
- [x] T042 [P] [US2] Create src/Astro.Tests/Orders/Domain/ValueObjects/AddressTests.cs
- [x] T043 [P] [US2] Create src/Astro.Tests/Orders/Domain/OrderStatusStateMachineTests.cs

### Implementation for User Story 2

- [x] T044 [P] [US2] Create src/Astro.Domain/Orders/ValueObjects/OrderNumber.cs with ORD-YYYYMMDD-XXXXX format
- [x] T045 [P] [US2] Create src/Astro.Domain/Orders/ValueObjects/Email.cs with email validation
- [x] T046 [P] [US2] Create src/Astro.Domain/Orders/ValueObjects/Address.cs with Street, City, State, PostalCode, Country
- [x] T047 [P] [US2] Create src/Astro.Domain/Orders/Enums/OrderStatus.cs enum with state machine transitions
- [x] T048 [US2] Create src/Astro.Domain/Orders/Entities/OrderDetail.cs child entity with ProductId snapshot
- [x] T049 [US2] Create src/Astro.Domain/Orders/Entities/Order.cs aggregate root with status state machine
- [x] T050 [P] [US2] Create src/Astro.Domain/Orders/Events/OrderCreatedEvent.cs domain event
- [x] T051 [P] [US2] Create src/Astro.Domain/Orders/Events/OrderStatusChangedEvent.cs domain event
- [x] T052 [P] [US2] Create src/Astro.Domain/Orders/Events/OrderCancelledEvent.cs domain event
- [x] T053 [US2] Create src/Astro.Domain/Orders/Abstractions/IOrderRepository.cs interface

**Checkpoint**: Orders domain layer complete with state machine and unit tests

---

## Phase 5: User Story 3 - Products Application Layer (Priority: P3)

**Goal**: Migrate Products commands, queries, handlers, validators

**Independent Test**: Products CQRS operations work with mocked repository

### Tests for User Story 3

- [x] T054 [P] [US3] Create src/Astro.Tests/Products/Application/CreateProductCommandHandlerTests.cs
- [x] T055 [P] [US3] Create src/Astro.Tests/Products/Application/CreateProductCommandValidatorTests.cs
- [x] T056 [P] [US3] Create src/Astro.Tests/Products/Application/UpdateProductCommandHandlerTests.cs
- [x] T057 [P] [US3] Create src/Astro.Tests/Products/Application/UpdateProductCommandValidatorTests.cs
- [x] T058 [P] [US3] Create src/Astro.Tests/Products/Application/UpdateStockCommandHandlerTests.cs
- [x] T059 [P] [US3] Create src/Astro.Tests/Products/Application/UpdateStockCommandValidatorTests.cs
- [x] T060 [P] [US3] Create src/Astro.Tests/Products/Application/DeleteProductCommandHandlerTests.cs
- [x] T061 [P] [US3] Create src/Astro.Tests/Products/Application/GetProductsQueryHandlerTests.cs
- [x] T062 [P] [US3] Create src/Astro.Tests/Products/Application/AddProductImageCommandHandlerTests.cs
- [x] T063 [P] [US3] Create src/Astro.Tests/Products/Application/RemoveProductImageCommandHandlerTests.cs

### Implementation for User Story 3

- [x] T064 [P] [US3] Create src/Astro.Application/Products/Commands/CreateProduct/CreateProductCommand.cs
- [x] T065 [US3] Create src/Astro.Application/Products/Commands/CreateProduct/CreateProductCommandValidator.cs
- [x] T066 [US3] Create src/Astro.Application/Products/Commands/CreateProduct/CreateProductCommandHandler.cs
- [x] T067 [P] [US3] Create src/Astro.Application/Products/Commands/UpdateProduct/UpdateProductCommand.cs
- [x] T068 [US3] Create src/Astro.Application/Products/Commands/UpdateProduct/UpdateProductCommandValidator.cs
- [x] T069 [US3] Create src/Astro.Application/Products/Commands/UpdateProduct/UpdateProductCommandHandler.cs
- [x] T070 [P] [US3] Create src/Astro.Application/Products/Commands/UpdateStock/UpdateStockCommand.cs
- [x] T071 [US3] Create src/Astro.Application/Products/Commands/UpdateStock/UpdateStockCommandValidator.cs
- [x] T072 [US3] Create src/Astro.Application/Products/Commands/UpdateStock/UpdateStockCommandHandler.cs
- [x] T073 [P] [US3] Create src/Astro.Application/Products/Commands/DeleteProduct/DeleteProductCommand.cs
- [x] T074 [US3] Create src/Astro.Application/Products/Commands/DeleteProduct/DeleteProductCommandHandler.cs
- [x] T075 [P] [US3] Create src/Astro.Application/Products/Commands/AddProductImage/AddProductImageCommand.cs
- [x] T076 [US3] Create src/Astro.Application/Products/Commands/AddProductImage/AddProductImageCommandValidator.cs
- [x] T077 [US3] Create src/Astro.Application/Products/Commands/AddProductImage/AddProductImageCommandHandler.cs
- [x] T078 [P] [US3] Create src/Astro.Application/Products/Commands/RemoveProductImage/RemoveProductImageCommand.cs
- [x] T079 [US3] Create src/Astro.Application/Products/Commands/RemoveProductImage/RemoveProductImageCommandHandler.cs
- [x] T080 [P] [US3] Create src/Astro.Application/Products/Queries/GetProducts/GetProductsQuery.cs
- [x] T081 [US3] Create src/Astro.Application/Products/Queries/GetProducts/GetProductsQueryHandler.cs
- [x] T082 [US3] Create src/Astro.Application/Products/Exceptions/ProductNotFoundException.cs

**Checkpoint**: Products application layer complete with CQRS and unit tests

---

## Phase 6: User Story 4 - Orders Application Layer (Priority: P4)

**Goal**: Migrate Orders commands, queries, handlers, validators (remove ProductCache sync)

**Independent Test**: Orders CQRS operations work with mocked repository

### Tests for User Story 4

- [x] T083 [P] [US4] Create src/Astro.Tests/Orders/Application/CreateOrderCommandHandlerTests.cs
- [x] T084 [P] [US4] Create src/Astro.Tests/Orders/Application/CreateOrderCommandValidatorTests.cs
- [x] T085 [P] [US4] Create src/Astro.Tests/Orders/Application/CancelOrderCommandHandlerTests.cs
- [x] T086 [P] [US4] Create src/Astro.Tests/Orders/Application/CancelOrderCommandValidatorTests.cs
- [x] T087 [P] [US4] Create src/Astro.Tests/Orders/Application/UpdateOrderStatusCommandHandlerTests.cs
- [x] T088 [P] [US4] Create src/Astro.Tests/Orders/Application/UpdateOrderStatusCommandValidatorTests.cs
- [x] T089 [P] [US4] Create src/Astro.Tests/Orders/Application/UpdateOrderCommandHandlerTests.cs
- [x] T090 [P] [US4] Create src/Astro.Tests/Orders/Application/UpdateOrderCommandValidatorTests.cs
- [x] T091 [P] [US4] Create src/Astro.Tests/Orders/Application/GetOrdersQueryHandlerTests.cs

### Implementation for User Story 4

- [x] T092 [P] [US4] Create src/Astro.Application/Orders/Commands/CreateOrder/CreateOrderCommand.cs
- [x] T093 [US4] Create src/Astro.Application/Orders/Commands/CreateOrder/CreateOrderCommandValidator.cs
- [x] T094 [US4] Create src/Astro.Application/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs (use IProductRepository directly, no ProductCache)
- [x] T095 [P] [US4] Create src/Astro.Application/Orders/Commands/CancelOrder/CancelOrderCommand.cs
- [x] T096 [US4] Create src/Astro.Application/Orders/Commands/CancelOrder/CancelOrderCommandValidator.cs
- [x] T097 [US4] Create src/Astro.Application/Orders/Commands/CancelOrder/CancelOrderCommandHandler.cs
- [x] T098 [P] [US4] Create src/Astro.Application/Orders/Commands/UpdateOrderStatus/UpdateOrderStatusCommand.cs
- [x] T099 [US4] Create src/Astro.Application/Orders/Commands/UpdateOrderStatus/UpdateOrderStatusCommandValidator.cs
- [x] T100 [US4] Create src/Astro.Application/Orders/Commands/UpdateOrderStatus/UpdateOrderStatusCommandHandler.cs
- [x] T101 [P] [US4] Create src/Astro.Application/Orders/Commands/UpdateOrder/UpdateOrderCommand.cs
- [x] T102 [US4] Create src/Astro.Application/Orders/Commands/UpdateOrder/UpdateOrderCommandValidator.cs
- [x] T103 [US4] Create src/Astro.Application/Orders/Commands/UpdateOrder/UpdateOrderCommandHandler.cs
- [x] T104 [P] [US4] Create src/Astro.Application/Orders/Queries/GetOrders/GetOrdersQuery.cs
- [x] T105 [US4] Create src/Astro.Application/Orders/Queries/GetOrders/GetOrdersQueryHandler.cs
- [x] T106 [P] [US4] Create src/Astro.Application/Orders/Exceptions/OrderNotFoundException.cs
- [x] T107 [P] [US4] Create src/Astro.Application/Orders/Exceptions/InsufficientStockException.cs
- [x] T108 [P] [US4] Create src/Astro.Application/Orders/Exceptions/ProductNotAvailableException.cs

**Checkpoint**: Orders application layer complete with CQRS and unit tests

---

## Phase 7: User Story 5 - Infrastructure & API Layer (Priority: P5)

**Goal**: Consolidate infrastructure (EF Core, repositories) and API (GraphQL) into single projects

**Independent Test**: API endpoints respond correctly, database operations work

### Implementation for User Story 5

- [x] T109 [P] [US5] Create src/Astro.Infrastructure/Products/Persistence/ProductConfiguration.cs EF Core config
- [x] T110 [P] [US5] Create src/Astro.Infrastructure/Products/Persistence/ProductDetailConfiguration.cs
- [x] T111 [P] [US5] Create src/Astro.Infrastructure/Products/Persistence/ProductImageConfiguration.cs
- [x] T112 [US5] Create src/Astro.Infrastructure/Products/Persistence/ProductRepository.cs implementing IProductRepository
- [x] T113 [P] [US5] Create src/Astro.Infrastructure/Orders/Persistence/OrderConfiguration.cs EF Core config with Address owned type
- [x] T114 [P] [US5] Create src/Astro.Infrastructure/Orders/Persistence/OrderDetailConfiguration.cs
- [x] T115 [US5] Create src/Astro.Infrastructure/Orders/Persistence/OrderRepository.cs implementing IOrderRepository
- [x] T116 [US5] Update src/Astro.Infrastructure/Common/AstroDbContext.cs to include Products and Orders DbSets
- [x] T117 [US5] Create EF Core migration for unified database schema in src/Astro.Infrastructure/Migrations/ (skipped - migrations will be generated at runtime)
- [x] T118 [P] [US5] Create src/Astro.Api/Products/GraphQL/Types/ProductType.cs HotChocolate type
- [x] T119 [P] [US5] Create src/Astro.Api/Products/GraphQL/Types/ProductDetailType.cs
- [x] T120 [P] [US5] Create src/Astro.Api/Products/GraphQL/Types/ProductImageType.cs
- [x] T121 [P] [US5] Create src/Astro.Api/Products/GraphQL/Types/StorageModeType.cs
- [x] T122 [US5] Create src/Astro.Api/Products/GraphQL/Query.cs for Products queries
- [x] T123 [US5] Create src/Astro.Api/Products/GraphQL/Mutation.cs for Products mutations
- [x] T124 [US5] Create src/Astro.Api/Products/GraphQL/Subscription.cs for Products subscriptions
- [x] T125 [P] [US5] Create src/Astro.Api/Orders/GraphQL/Types/OrderType.cs HotChocolate type
- [x] T126 [P] [US5] Create src/Astro.Api/Orders/GraphQL/Types/OrderDetailType.cs
- [x] T127 [P] [US5] Create src/Astro.Api/Orders/GraphQL/Types/OrderStatusType.cs
- [x] T128 [US5] Create src/Astro.Api/Orders/GraphQL/Query.cs for Orders queries
- [x] T129 [US5] Create src/Astro.Api/Orders/GraphQL/Mutation.cs for Orders mutations
- [x] T130 [US5] Create src/Astro.Api/Orders/GraphQL/Subscription.cs for Orders subscriptions
- [x] T131 [US5] Update src/Astro.Api/Program.cs to register all GraphQL types from Products and Orders modules
- [x] T132 [US5] Update Astro.AppHost/AppHost.cs to use single database connection (astrodb) instead of productsdb/ordersdb (already configured)

**Checkpoint**: Infrastructure and API consolidated into single projects

---

## Phase 8: Cleanup & Polish

**Purpose**: Remove old projects, MassTransit, and finalize migration

- [x] T133 Remove MassTransit package references from all projects
- [x] T134 [P] Delete Products/Products.Domain/ directory
- [x] T135 [P] Delete Products/Products.Application/ directory
- [x] T136 [P] Delete Products/Products.Infrastructure/ directory
- [x] T137 [P] Delete Products/Products.Api/ directory
- [x] T138 [P] Delete Products/Products.Tests/ directory
- [x] T139 [P] Delete Orders/Orders.Domain/ directory
- [x] T140 [P] Delete Orders/Orders.Application/ directory
- [x] T141 [P] Delete Orders/Orders.Infrastructure/ directory
- [x] T142 [P] Delete Orders/Orders.Api/ directory
- [x] T143 [P] Delete Orders/Orders.Tests/ directory
- [x] T144 Delete Shared/Shared.Contracts/ directory (integration events no longer needed)
- [x] T145 Remove RabbitMQ service from Astro.AppHost/AppHost.cs
- [x] T146 Update Astro.slnx to remove deleted project references
- [x] T147 Run dotnet build to verify no compilation errors
- [x] T148 Run dotnet test to verify all unit tests pass
- [x] T149 Update specs/main/quickstart.md to reflect new project structure (skipped - quickstart.md does not exist)

**Checkpoint**: Migration complete, all tests pass, old projects removed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **US1 Products Domain (Phase 3)**: Depends on Phase 2 - can run in parallel with US2
- **US2 Orders Domain (Phase 4)**: Depends on Phase 2 - can run in parallel with US1
- **US3 Products Application (Phase 5)**: Depends on US1 completion
- **US4 Orders Application (Phase 6)**: Depends on US2 completion
- **US5 Infrastructure & API (Phase 7)**: Depends on US3 AND US4 completion
- **Cleanup (Phase 8)**: Depends on US5 completion

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundation)
    │
    ├─────────────┬─────────────┐
    ▼             ▼             │
US1 (Products  US2 (Orders     │
Domain)        Domain)         │
    │             │             │
    ▼             ▼             │
US3 (Products  US4 (Orders     │
Application)   Application)    │
    │             │             │
    └─────────────┴─────────────┘
                  │
                  ▼
            US5 (Infra & API)
                  │
                  ▼
            Phase 8 (Cleanup)
```

### Parallel Opportunities

- **Phase 1**: T002-T005 can run in parallel, T006-T010 can run in parallel
- **Phase 2**: T014-T016, T019, T021 can run in parallel
- **US1**: All test tasks (T025-T028) can run in parallel; value object tasks (T029-T031) can run in parallel
- **US2**: All test tasks (T039-T043) can run in parallel; value object tasks (T044-T047) can run in parallel
- **US3**: All test tasks (T054-T063) can run in parallel; command DTOs can run in parallel
- **US4**: All test tasks (T083-T091) can run in parallel; command DTOs can run in parallel
- **US5**: EF Core configurations can run in parallel; GraphQL types can run in parallel
- **Phase 8**: All delete tasks (T134-T143) can run in parallel

---

## Parallel Example: Phase 3 (US1)

```bash
# Launch all domain tests in parallel:
Task: "T025 Create ProductTests.cs"
Task: "T026 Create SkuTests.cs"
Task: "T027 Create StockQuantityTests.cs"
Task: "T028 Create MoneyTests.cs"

# After tests, launch value objects in parallel:
Task: "T029 Create Sku.cs"
Task: "T030 Create StockQuantity.cs"
Task: "T031 Create StorageMode.cs enum"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: Products Domain (US1)
4. Complete Phase 4: Orders Domain (US2)
5. **STOP and VALIDATE**: Domain layers complete with unit tests

### Full Migration

1. Setup + Foundational
2. US1 + US2 (Domain layers) - can run in parallel
3. US3 + US4 (Application layers) - can run in parallel after domains
4. US5 (Infrastructure & API) - requires all application layers
5. Phase 8 (Cleanup) - final step

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- NO MassTransit/RabbitMQ in target architecture - direct repository calls between modules
- Single database (astrodb) instead of productsdb/ordersdb
- Orders module references Products domain directly (no ProductCache needed)
- Remove all integration events and consumers
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
