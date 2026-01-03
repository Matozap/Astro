# Tasks: Connect Orders UI to Backend

**Input**: Design documents from `/specs/feature/orders-connect/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. No test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `client/src/` for Angular frontend, `server/` for .NET backend
- Backend changes: NOT REQUIRED (already implemented)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Model updates and GraphQL query preparation shared across all user stories

- [X] T001 [P] Add productSku field to OrderDetail interface in client/src/app/shared/models/order.model.ts
- [X] T002 [P] Update GET_ORDERS query to use cursor-based pagination (first/after) in client/src/app/features/orders/graphql/order.queries.ts
- [X] T003 [P] Update GET_ORDER_BY_ID query to use filter pattern in client/src/app/features/orders/graphql/order.queries.ts
- [X] T004 [P] Update UPDATE_ORDER_STATUS mutation to match backend command pattern in client/src/app/features/orders/graphql/order.queries.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core service infrastructure that MUST be complete before ANY user story can work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Add OrderConnection interface to OrderService in client/src/app/features/orders/services/order.service.ts
- [X] T006 Remove MOCK_ORDERS array from OrderService in client/src/app/features/orders/services/order.service.ts
- [X] T007 Add cursor storage Map for pagination in OrderService in client/src/app/features/orders/services/order.service.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Orders List (Priority: P1) 🎯 MVP

**Goal**: Display a paginated list of real orders from the backend

**Independent Test**: Navigate to Orders page and verify orders match database data, test pagination by clicking next/previous

### Implementation for User Story 1

- [X] T008 [US1] Implement getOrders() method using Apollo query with cursor pagination in client/src/app/features/orders/services/order.service.ts
- [X] T009 [US1] Add response mapping from OrderConnection to PaginatedResult in client/src/app/features/orders/services/order.service.ts
- [X] T010 [US1] Add cursor storage logic to store endCursor for next page navigation in client/src/app/features/orders/services/order.service.ts
- [X] T011 [US1] Add loading state management with catchError in getOrders() in client/src/app/features/orders/services/order.service.ts
- [X] T012 [US1] Verify orders-list component displays orders from backend in client/src/app/features/orders/orders-list/orders-list.component.ts

**Checkpoint**: Orders list displays real data from backend with pagination working

---

## Phase 4: User Story 2 - View Order Details (Priority: P1)

**Goal**: Display complete order details including shipping address and line items

**Independent Test**: Click on an order in the list and verify all details (customer info, address, line items) match backend data

### Implementation for User Story 2

- [X] T013 [US2] Implement getOrderById() method using Apollo query with filter pattern in client/src/app/features/orders/services/order.service.ts
- [X] T014 [US2] Add response mapping to extract single order from nodes array in client/src/app/features/orders/services/order.service.ts
- [X] T015 [US2] Add error handling for order not found scenario in client/src/app/features/orders/services/order.service.ts
- [X] T016 [US2] Verify order-detail component displays complete order from backend in client/src/app/features/orders/order-detail/order-detail.component.ts

**Checkpoint**: Order details view shows real data including line items and shipping address

---

## Phase 5: User Story 3 - Filter and Search Orders (Priority: P2)

**Goal**: Allow filtering orders by search text and status

**Independent Test**: Enter search terms and select status filters, verify displayed orders match filter criteria

### Implementation for User Story 3

- [X] T017 [US3] Verify filter parameter mapping in getOrders() passes filters to GraphQL query in client/src/app/features/orders/services/order.service.ts
- [X] T018 [US3] Verify orders-list component search input triggers backend filter in client/src/app/features/orders/orders-list/orders-list.component.ts
- [X] T019 [US3] Verify orders-list component status filter triggers backend filter in client/src/app/features/orders/orders-list/orders-list.component.ts

**Checkpoint**: Search and status filter work against backend data

---

## Phase 6: User Story 4 - Sort Orders (Priority: P2)

**Goal**: Allow sorting orders by different columns

**Independent Test**: Click column headers and verify order list is re-sorted correctly

### Implementation for User Story 4

- [X] T020 [US4] Verify sort parameter mapping in getOrders() passes sort config to GraphQL query in client/src/app/features/orders/services/order.service.ts
- [X] T021 [US4] Verify orders-list component column sort triggers backend sorting in client/src/app/features/orders/orders-list/orders-list.component.ts

**Checkpoint**: Column sorting works against backend data

---

## Phase 7: User Story 5 - Update Order Status (Priority: P2)

**Goal**: Allow updating an order's status via backend mutation

**Independent Test**: Change an order's status and verify the change persists in the backend

### Implementation for User Story 5

- [X] T022 [US5] Implement updateOrderStatus() method using Apollo mutation in client/src/app/features/orders/services/order.service.ts
- [X] T023 [US5] Add error handling for invalid status transitions in updateOrderStatus() in client/src/app/features/orders/services/order.service.ts
- [X] T024 [US5] Add success response mapping and UI refresh after status update in client/src/app/features/orders/services/order.service.ts
- [X] T025 [US5] Verify order-detail component status update triggers mutation in client/src/app/features/orders/order-detail/order-detail.component.ts

**Checkpoint**: Status updates persist to backend and reflect in UI

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T026 Verify all error scenarios display user-friendly messages in orders-list and order-detail components
- [X] T027 Verify loading states display correctly during API calls in orders-list and order-detail components
- [X] T028 Verify empty state displays when no orders exist in client/src/app/features/orders/orders-list/orders-list.component.ts
- [ ] T029 Manual validation of quickstart.md testing checklist against running application

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP target
- **User Story 2 (Phase 4)**: Depends on Foundational - Can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on US1 (uses getOrders with filters)
- **User Story 4 (Phase 6)**: Depends on US1 (uses getOrders with sort)
- **User Story 5 (Phase 7)**: Depends on US2 (needs order detail view)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Setup (T001-T004) → Foundational (T005-T007)
                           ↓
              ┌────────────┼────────────┐
              ↓            ↓            ↓
           US1 (P1)    US2 (P1)    (after US1)
           T008-T012   T013-T016      ↓
              ↓            ↓      ┌───┴───┐
              └────────────┼──────┤       │
                           ↓      ↓       ↓
                        US3 (P2) US4    US5
                        T017-T019 T020-T021 T022-T025
                                      ↓
                                   Polish
                                   T026-T029
```

### Parallel Opportunities

**Phase 1 (all parallel)**:
- T001, T002, T003, T004 can all run in parallel (different files or sections)

**Phase 3 & 4 (stories parallel)**:
- US1 (T008-T012) and US2 (T013-T016) can run in parallel after Foundational

**Phase 5 & 6 (dependent on US1, parallel with each other)**:
- US3 (T017-T019) and US4 (T020-T021) can run in parallel with each other

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all setup tasks together:
Task: "Add productSku field to OrderDetail in client/src/app/shared/models/order.model.ts"
Task: "Update GET_ORDERS query in client/src/app/features/orders/graphql/order.queries.ts"
Task: "Update GET_ORDER_BY_ID query in client/src/app/features/orders/graphql/order.queries.ts"
Task: "Update UPDATE_ORDER_STATUS mutation in client/src/app/features/orders/graphql/order.queries.ts"
```

## Parallel Example: User Stories 1 & 2

```bash
# After Foundational is complete, launch both stories in parallel:
# Developer A: User Story 1
Task: "Implement getOrders() with cursor pagination in client/src/app/features/orders/services/order.service.ts"

# Developer B: User Story 2
Task: "Implement getOrderById() with filter pattern in client/src/app/features/orders/services/order.service.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T007)
3. Complete Phase 3: User Story 1 - View Orders List (T008-T012)
4. Complete Phase 4: User Story 2 - View Order Details (T013-T016)
5. **STOP and VALIDATE**: Test US1 & US2 independently - this is a functional MVP
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (View Orders List) → Test → MVP for listing!
3. Add US2 (View Order Details) → Test → Full read-only MVP
4. Add US3+US4 (Filter/Sort) → Test → Enhanced UX
5. Add US5 (Update Status) → Test → Full feature complete
6. Polish → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All service changes are in single file but sequential within a story
- Components should require minimal changes (verify existing bindings work)
- Reference: client/src/app/features/products/services/product.service.ts for pattern
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
