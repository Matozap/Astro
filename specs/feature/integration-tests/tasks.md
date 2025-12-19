# Tasks: GraphQL Integration Tests

**Input**: Design documents from `/specs/feature/integration-tests/`
**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: This feature IS about creating tests, so all tasks involve test implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Test project**: `tests/Astro.IntegrationTests/`
- **AppHost**: `Astro.AppHost/`

---

## Phase 1: Setup (Project Infrastructure)

**Purpose**: Create the integration test project with all dependencies and basic structure

- [X] T001 Create integration test project directory at tests/Astro.IntegrationTests/
- [X] T002 Create Astro.IntegrationTests.csproj with Aspire.Hosting.Testing 13.1.0, Verify.Xunit 31.9.0, xUnit 2.9.3, Shouldly 4.2.1, Microsoft.NET.Test.Sdk 18.0.1 at tests/Astro.IntegrationTests/Astro.IntegrationTests.csproj
- [X] T003 Add project reference to Astro.AppHost in tests/Astro.IntegrationTests/Astro.IntegrationTests.csproj
- [X] T004 Add test project to solution file Astro.sln
- [X] T005 Create Infrastructure directory at tests/Astro.IntegrationTests/Infrastructure/
- [X] T006 [P] Create Products directory at tests/Astro.IntegrationTests/Products/
- [X] T007 [P] Create Orders directory at tests/Astro.IntegrationTests/Orders/
- [X] T008 [P] Create Products/Payloads directory at tests/Astro.IntegrationTests/Products/Payloads/
- [X] T009 [P] Create Orders/Payloads directory at tests/Astro.IntegrationTests/Orders/Payloads/

**Checkpoint**: Project structure created, ready for infrastructure code

---

## Phase 2: Foundational (Core Infrastructure)

**Purpose**: Implement base classes and utilities that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Create VerifyConfiguration.cs with GUID/timestamp scrubbing setup at tests/Astro.IntegrationTests/Infrastructure/VerifyConfiguration.cs
- [X] T011 Create GraphQLClient.cs helper for sending GraphQL requests and loading payloads at tests/Astro.IntegrationTests/Infrastructure/GraphQLClient.cs
- [X] T012 Create IntegrationTestBase.cs with DistributedApplicationTestingBuilder setup, HttpClient creation, and GraphQL helper integration at tests/Astro.IntegrationTests/Infrastructure/IntegrationTestBase.cs
- [X] T013 Verify build succeeds with `dotnet build tests/Astro.IntegrationTests/`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Product Query Integration Tests (Priority: P1)

**Goal**: Verify Product query GraphQL operations return valid responses via snapshot testing

**Independent Test**: Run `dotnet test --filter "FullyQualifiedName~ProductQueryTests"` and verify snapshots are created/matched

### Payloads for User Story 1

- [X] T014 [P] [US1] Create GetProducts.graphql query payload at tests/Astro.IntegrationTests/Products/Payloads/GetProducts.graphql
- [X] T015 [P] [US1] Create GetProductById.graphql query payload at tests/Astro.IntegrationTests/Products/Payloads/GetProductById.graphql

### Implementation for User Story 1

- [X] T016 [US1] Create ProductQueryTests.cs with test class inheriting IntegrationTestBase at tests/Astro.IntegrationTests/Products/ProductQueryTests.cs
- [X] T017 [US1] Implement GetProducts_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Products/ProductQueryTests.cs
- [X] T018 [US1] Implement GetProductById_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Products/ProductQueryTests.cs
- [X] T019 [US1] Run tests and verify snapshots are generated correctly (Requires Docker)

**Checkpoint**: Product queries tested, snapshots verified

---

## Phase 4: User Story 2 - Product Mutation Integration Tests (Priority: P2)

**Goal**: Verify Product mutation GraphQL operations execute successfully and return expected response structures

**Independent Test**: Run `dotnet test --filter "FullyQualifiedName~ProductMutationTests"` and verify snapshots are created/matched

### Payloads for User Story 2

- [X] T020 [P] [US2] Create CreateProduct.graphql mutation payload at tests/Astro.IntegrationTests/Products/Payloads/CreateProduct.graphql
- [X] T021 [P] [US2] Create UpdateProduct.graphql mutation payload at tests/Astro.IntegrationTests/Products/Payloads/UpdateProduct.graphql
- [X] T022 [P] [US2] Create DeleteProduct.graphql mutation payload at tests/Astro.IntegrationTests/Products/Payloads/DeleteProduct.graphql
- [X] T023 [P] [US2] Create UpdateStock.graphql mutation payload at tests/Astro.IntegrationTests/Products/Payloads/UpdateStock.graphql
- [X] T024 [P] [US2] Create AddProductImage.graphql mutation payload at tests/Astro.IntegrationTests/Products/Payloads/AddProductImage.graphql
- [X] T025 [P] [US2] Create RemoveProductImage.graphql mutation payload at tests/Astro.IntegrationTests/Products/Payloads/RemoveProductImage.graphql

### Implementation for User Story 2

- [X] T026 [US2] Create ProductMutationTests.cs with test class inheriting IntegrationTestBase at tests/Astro.IntegrationTests/Products/ProductMutationTests.cs
- [X] T027 [US2] Implement CreateProduct_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Products/ProductMutationTests.cs
- [X] T028 [US2] Implement UpdateProduct_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Products/ProductMutationTests.cs
- [X] T029 [US2] Implement DeleteProduct_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Products/ProductMutationTests.cs
- [X] T030 [US2] Implement UpdateStock_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Products/ProductMutationTests.cs
- [X] T031 [US2] Implement AddProductImage_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Products/ProductMutationTests.cs
- [X] T032 [US2] Implement RemoveProductImage_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Products/ProductMutationTests.cs
- [X] T033 [US2] Run tests and verify snapshots are generated correctly (Requires Docker)

**Checkpoint**: Product mutations tested, snapshots verified

---

## Phase 5: User Story 3 - Order Query Integration Tests (Priority: P3)

**Goal**: Verify Order query GraphQL operations return valid responses via snapshot testing

**Independent Test**: Run `dotnet test --filter "FullyQualifiedName~OrderQueryTests"` and verify snapshots are created/matched

### Payloads for User Story 3

- [X] T034 [P] [US3] Create GetOrders.graphql query payload at tests/Astro.IntegrationTests/Orders/Payloads/GetOrders.graphql
- [X] T035 [P] [US3] Create GetOrderById.graphql query payload at tests/Astro.IntegrationTests/Orders/Payloads/GetOrderById.graphql

### Implementation for User Story 3

- [X] T036 [US3] Create OrderQueryTests.cs with test class inheriting IntegrationTestBase at tests/Astro.IntegrationTests/Orders/OrderQueryTests.cs
- [X] T037 [US3] Implement GetOrders_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Orders/OrderQueryTests.cs
- [X] T038 [US3] Implement GetOrderById_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Orders/OrderQueryTests.cs
- [X] T039 [US3] Run tests and verify snapshots are generated correctly (Requires Docker)

**Checkpoint**: Order queries tested, snapshots verified

---

## Phase 6: User Story 4 - Order Mutation Integration Tests (Priority: P4)

**Goal**: Verify Order mutation GraphQL operations execute successfully and return expected response structures

**Independent Test**: Run `dotnet test --filter "FullyQualifiedName~OrderMutationTests"` and verify snapshots are created/matched

### Payloads for User Story 4

- [X] T040 [P] [US4] Create CreateOrder.graphql mutation payload at tests/Astro.IntegrationTests/Orders/Payloads/CreateOrder.graphql
- [X] T041 [P] [US4] Create UpdateOrder.graphql mutation payload at tests/Astro.IntegrationTests/Orders/Payloads/UpdateOrder.graphql
- [X] T042 [P] [US4] Create UpdateOrderStatus.graphql mutation payload at tests/Astro.IntegrationTests/Orders/Payloads/UpdateOrderStatus.graphql
- [X] T043 [P] [US4] Create CancelOrder.graphql mutation payload at tests/Astro.IntegrationTests/Orders/Payloads/CancelOrder.graphql

### Implementation for User Story 4

- [X] T044 [US4] Create OrderMutationTests.cs with test class inheriting IntegrationTestBase at tests/Astro.IntegrationTests/Orders/OrderMutationTests.cs
- [X] T045 [US4] Implement CreateOrder_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Orders/OrderMutationTests.cs
- [X] T046 [US4] Implement UpdateOrder_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Orders/OrderMutationTests.cs
- [X] T047 [US4] Implement UpdateOrderStatus_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Orders/OrderMutationTests.cs
- [X] T048 [US4] Implement CancelOrder_ReturnsValidStructure test method in tests/Astro.IntegrationTests/Orders/OrderMutationTests.cs
- [X] T049 [US4] Run tests and verify snapshots are generated correctly (Requires Docker)

**Checkpoint**: Order mutations tested, snapshots verified

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [X] T050 Run all integration tests with `dotnet test tests/Astro.IntegrationTests/` (Requires Docker)
- [X] T051 Verify all snapshot files are committed and properly formatted (Requires Docker - snapshots generated on first test run)
- [X] T052 Ensure CI pipeline can execute tests (verify Docker availability for Aspire PostgreSQL)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Product Queries) and US3 (Order Queries) can proceed in parallel
  - US2 (Product Mutations) can start after US1 (needs product to exist for some tests)
  - US4 (Order Mutations) can start after US2 (needs product for order creation)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Some mutation tests create data needed by later tests within same class
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (can run parallel with US1)
- **User Story 4 (P4)**: Best started after US2 - CreateOrder needs a product to exist; tests can create their own data

### Within Each User Story

- Payload files MUST be created before test implementation
- Test class creation before individual test methods
- Infrastructure must be complete before any test runs

### Parallel Opportunities

- All Setup directory creation tasks marked [P] can run in parallel (T006-T009)
- All payload file tasks within a user story marked [P] can run in parallel
- US1 and US3 can be developed in parallel after Foundational phase
- US2 and US4 can be developed in parallel after their payload files exist

---

## Parallel Example: User Story 1 (Product Queries)

```bash
# Launch all payloads for User Story 1 together:
Task: "Create GetProducts.graphql at tests/Astro.IntegrationTests/Products/Payloads/GetProducts.graphql"
Task: "Create GetProductById.graphql at tests/Astro.IntegrationTests/Products/Payloads/GetProductById.graphql"

# Then implement tests sequentially:
Task: "Create ProductQueryTests.cs"
Task: "Implement GetProducts_ReturnsValidStructure"
Task: "Implement GetProductById_ReturnsValidStructure"
```

---

## Parallel Example: User Story 2 (Product Mutations)

```bash
# Launch all payloads for User Story 2 together:
Task: "Create CreateProduct.graphql"
Task: "Create UpdateProduct.graphql"
Task: "Create DeleteProduct.graphql"
Task: "Create UpdateStock.graphql"
Task: "Create AddProductImage.graphql"
Task: "Create RemoveProductImage.graphql"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Product Queries)
4. **STOP and VALIDATE**: Run product query tests, verify snapshots work
5. Proceed with remaining stories

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> MVP for Product Queries
3. Add User Story 2 -> Test independently -> Full Product coverage
4. Add User Story 3 -> Test independently -> Order Query coverage
5. Add User Story 4 -> Test independently -> Full Order coverage
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Product Queries)
   - Developer B: User Story 3 (Order Queries)
3. After initial queries done:
   - Developer A: User Story 2 (Product Mutations)
   - Developer B: User Story 4 (Order Mutations)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Snapshot files (.verified.json) are auto-generated by Verify on first test run
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests do NOT assert on database values - only response structure
- Aspire tests require Docker for PostgreSQL container
