# Tasks: Connect Payments and Shipments UI to Backend

**Input**: Based on orders-connect pattern - remove mock data from Payments and Shipments features
**Prerequisites**: Backend GraphQL APIs for Payments and Shipments are implemented

**Tests**: Tests are NOT requested for this feature - focus on implementation only.

**Organization**: Tasks are organized into two parallel user stories (Payments and Shipments) that can be implemented independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Client**: `client/src/app/features/`
- **Shared Models**: `client/src/app/shared/models/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup needed - using existing Angular infrastructure

*No tasks required - infrastructure already exists*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify backend APIs and update shared types if needed

**⚠️ CRITICAL**: Verify backend GraphQL APIs exist before proceeding

- [X] T001 [P] Verify Payments GraphQL API is available at backend and document schema
- [X] T002 [P] Verify Shipments GraphQL API is available at backend and document schema

**Checkpoint**: Backend APIs confirmed - UI integration can now begin in parallel

---

## Phase 3: User Story 1 - Connect Payments to Backend (Priority: P1) 🎯 MVP

**Goal**: Replace mock payment data with real GraphQL API calls following the orders pattern

**Independent Test**: Navigate to Payments page and verify payments displayed match backend database. Click on a payment to view details.

### Implementation for User Story 1

- [X] T003 [US1] Update GET_PAYMENTS query to use cursor-based pagination (first/after instead of skip/take) in client/src/app/features/payments/graphql/payment.queries.ts
- [X] T004 [US1] Update GET_PAYMENT_BY_ID query to use filter-based approach (where: {id: {eq: $id}}) in client/src/app/features/payments/graphql/payment.queries.ts
- [X] T005 [US1] Add PaymentConnection interface for cursor-based pagination in client/src/app/features/payments/services/payment.service.ts
- [X] T006 [US1] Remove MOCK_PAYMENTS array and all mock data logic from client/src/app/features/payments/services/payment.service.ts
- [X] T007 [US1] Add cursor storage Map<number, string> for pagination state in client/src/app/features/payments/services/payment.service.ts
- [X] T008 [US1] Replace getPayments() mock Observable with Apollo query call using GET_PAYMENTS in client/src/app/features/payments/services/payment.service.ts
- [X] T009 [US1] Replace getPaymentById() mock Observable with Apollo query call using GET_PAYMENT_BY_ID in client/src/app/features/payments/services/payment.service.ts
- [X] T010 [US1] Add error handling with catchError and loading signal management in client/src/app/features/payments/services/payment.service.ts
- [X] T011 [US1] Map GraphQL PaymentConnection response to PaginatedResult in client/src/app/features/payments/services/payment.service.ts
- [X] T012 [US1] Verify payments-list component displays real data without code changes in client/src/app/features/payments/payments-list/payments-list.component.ts
- [X] T013 [US1] Verify payment-detail component displays real data without code changes in client/src/app/features/payments/payment-detail/payment-detail.component.ts

**Checkpoint**: At this point, Payments feature should be fully functional with real backend data

---

## Phase 4: User Story 2 - Connect Shipments to Backend (Priority: P1)

**Goal**: Replace mock shipment data with real GraphQL API calls following the orders pattern

**Independent Test**: Navigate to Shipments page and verify shipments displayed match backend database. Click on a shipment to view details including tracking information.

### Implementation for User Story 2

- [X] T014 [US2] Update GET_SHIPMENTS query to use cursor-based pagination (first/after instead of skip/take) in client/src/app/features/shipments/graphql/shipment.queries.ts
- [X] T015 [US2] Update GET_SHIPMENT_BY_ID query to use filter-based approach (where: {id: {eq: $id}}) in client/src/app/features/shipments/graphql/shipment.queries.ts
- [X] T016 [US2] Add ShipmentConnection interface for cursor-based pagination in client/src/app/features/shipments/services/shipment.service.ts
- [X] T017 [US2] Remove MOCK_SHIPMENTS array and all mock data logic from client/src/app/features/shipments/services/shipment.service.ts
- [X] T018 [US2] Add cursor storage Map<number, string> for pagination state in client/src/app/features/shipments/services/shipment.service.ts
- [X] T019 [US2] Replace getShipments() mock Observable with Apollo query call using GET_SHIPMENTS in client/src/app/features/shipments/services/shipment.service.ts
- [X] T020 [US2] Replace getShipmentById() mock Observable with Apollo query call using GET_SHIPMENT_BY_ID in client/src/app/features/shipments/services/shipment.service.ts
- [X] T021 [US2] Add error handling with catchError and loading signal management in client/src/app/features/shipments/services/shipment.service.ts
- [X] T022 [US2] Map GraphQL ShipmentConnection response to PaginatedResult in client/src/app/features/shipments/services/shipment.service.ts
- [X] T023 [US2] Verify shipments-list component displays real data without code changes in client/src/app/features/shipments/shipments-list/shipments-list.component.ts
- [X] T024 [US2] Verify shipment-detail component displays real data including tracking details without code changes in client/src/app/features/shipments/shipment-detail/shipment-detail.component.ts

**Checkpoint**: At this point, Shipments feature should be fully functional with real backend data

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup across both features

- [X] T025 [P] Test pagination on Payments list (next/previous pages work correctly)
- [X] T026 [P] Test pagination on Shipments list (next/previous pages work correctly)
- [X] T027 [P] Test filter/search functionality on Payments list
- [X] T028 [P] Test filter/search functionality on Shipments list
- [X] T029 [P] Test sorting on Payments list (click column headers)
- [X] T030 [P] Test sorting on Shipments list (click column headers)
- [X] T031 [P] Verify error states display correctly for Payments (backend down, network error)
- [X] T032 [P] Verify error states display correctly for Shipments (backend down, network error)
- [X] T033 [P] Verify empty states display correctly for Payments (no data in database)
- [X] T034 [P] Verify empty states display correctly for Shipments (no data in database)
- [X] T035 Remove any console.log debugging statements from both features

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks - infrastructure exists
- **Foundational (Phase 2)**: Must verify backend APIs exist - BLOCKS all user stories
- **User Stories (Phase 3 & 4)**: Both depend on Foundational phase completion
  - User Story 1 (Payments) and User Story 2 (Shipments) can proceed in parallel
  - No dependencies between Payments and Shipments features
- **Polish (Phase 5)**: Depends on both user stories being complete

### User Story Dependencies

- **User Story 1 (Payments)**: Can start after Foundational (Phase 2) - No dependencies on Shipments
- **User Story 2 (Shipments)**: Can start after Foundational (Phase 2) - No dependencies on Payments

### Within Each User Story

- GraphQL queries must be updated before service implementation
- Service interfaces (Connection types) before query implementation
- Remove mock data as queries are implemented
- Component verification happens after service is complete

### Parallel Opportunities

- **Phase 2**: T001 and T002 can run in parallel (verify different APIs)
- **Phases 3 & 4**: Entire Payments (US1) and Shipments (US2) features can be developed in parallel
  - Developer A can work on Payments while Developer B works on Shipments
  - No shared files between the two features
- **Phase 5**: All validation tasks marked [P] can run in parallel

---

## Parallel Example: Payments and Shipments

```bash
# After completing Foundational phase, launch BOTH user stories in parallel:

# Developer A - Payments (User Story 1):
Task: "Update GET_PAYMENTS query to cursor-based pagination"
Task: "Update GET_PAYMENT_BY_ID query"
Task: "Implement PaymentService with Apollo"
# ... continue with remaining Payments tasks

# Developer B - Shipments (User Story 2):
Task: "Update GET_SHIPMENTS query to cursor-based pagination"
Task: "Update GET_SHIPMENT_BY_ID query"
Task: "Implement ShipmentService with Apollo"
# ... continue with remaining Shipments tasks

# OR work sequentially: Complete Payments (T003-T013), then Shipments (T014-T024)
```

---

## Implementation Strategy

### MVP First (Payments Only)

1. Complete Phase 2: Foundational (verify APIs)
2. Complete Phase 3: Payments (User Story 1)
3. **STOP and VALIDATE**: Test Payments independently
4. Deploy/demo if ready
5. Proceed to Shipments

### Incremental Delivery

1. Complete Foundational → Backend APIs verified
2. Add Payments (US1) → Test independently → Deploy/Demo (MVP!)
3. Add Shipments (US2) → Test independently → Deploy/Demo
4. Complete Polish → Final validation and cleanup

### Parallel Team Strategy

With two developers:

1. Team completes Foundational together (verify both APIs)
2. Once Foundational is done:
   - Developer A: Payments (User Story 1) - T003 to T013
   - Developer B: Shipments (User Story 2) - T014 to T024
3. Both features complete independently without conflicts

---

## Reference Implementation

**Pattern Source**: Orders feature implementation in `client/src/app/features/orders/`

**Key Files to Reference**:
- `client/src/app/features/orders/services/order.service.ts` - Shows Apollo integration pattern
- `client/src/app/features/orders/graphql/order.queries.ts` - Shows cursor-based pagination queries
- `client/src/app/features/products/services/product.service.ts` - Alternative reference for pagination pattern

**Key Patterns**:
1. **Cursor-based pagination**: Use `first`/`after` instead of `skip`/`take`
2. **Connection type**: Define interface matching `{ nodes: T[], pageInfo: {...}, totalCount: number }`
3. **Cursor storage**: Use `Map<number, string>` to track page cursors
4. **Error handling**: Use `catchError()` and manage loading signal
5. **Query execution**: Use `apollo.query()` with `fetchPolicy: 'network-only'`

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story (US1=Payments, US2=Shipments)
- Each user story is independently completable and testable
- No tests requested - focus on implementation and manual validation
- Components should work without changes since they consume the service interface
- Commit after each task or logical group of related changes
- Stop at any checkpoint to validate independently
- Follow the exact pattern from orders feature for consistency
