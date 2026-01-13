# Tasks: Order Management Commands

**Input**: Design documents from `specs/feature/order-commands/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests are explicitly required by FR-018, FR-019, and FR-020. All test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application project:
- Backend: `server/Astro.*/Orders/`
- Frontend: `client/src/app/features/orders/`
- Backend Tests: `server/Astro.Tests/Orders/`
- Frontend Tests: `client/src/app/features/orders/**/**.spec.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing backend infrastructure and prepare frontend development environment

- [X] T001 Verify backend GraphQL mutations exist in server/Astro.Api/Orders/GraphQL/Mutation.cs (CreateOrder, UpdateOrder, CancelOrder)
- [X] T002 [P] Verify backend CQRS commands exist in server/Astro.Application/Orders/Commands/ directories
- [X] T003 [P] Verify Order domain aggregate methods in server/Astro.Domain/Orders/Entities/Order.cs (Create, UpdateCustomerInfo, UpdateShippingAddress, Cancel)
- [X] T004 [P] Install frontend dependencies if needed (Angular Material 19.x, Apollo Angular 13.0 already in package.json)
- [X] T005 Review existing frontend orders structure in client/src/app/features/orders/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend validators and shared frontend infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Validators

- [X] T006 [P] Create/verify CreateOrderCommandValidator.cs in server/Astro.Application/Orders/Commands/CreateOrder/ with all validation rules from data-model.md
- [X] T007 [P] Create/verify UpdateOrderCommandValidator.cs in server/Astro.Application/Orders/Commands/UpdateOrder/ with validation rules for updatable fields
- [X] T008 [P] Create/verify CancelOrderCommandValidator.cs in server/Astro.Application/Orders/Commands/CancelOrder/ with reason validation (updated to require reason)

### Backend Unit Tests (Required by FR-018)

- [X] T009 [P] Create/verify CreateOrderCommandHandlerTests.cs in server/Astro.Tests/Orders/Application/ with comprehensive test coverage
- [X] T010 [P] Create UpdateOrderCommandHandlerTests.cs in server/Astro.Tests/Orders/Application/ testing happy path, validation failures, and terminal status prevention
- [X] T011 [P] Create CancelOrderCommandHandlerTests.cs in server/Astro.Tests/Orders/Application/ testing cancellation logic and terminal status prevention
- [X] T012 [P] Create CreateOrderCommandValidatorTests.cs in server/Astro.Tests/Orders/Application/ testing all validation rules
- [X] T013 [P] Create UpdateOrderCommandValidatorTests.cs in server/Astro.Tests/Orders/Application/ testing all validation rules
- [X] T014 [P] Create CancelOrderCommandValidatorTests.cs in server/Astro.Tests/Orders/Application/ testing reason validation
- [X] T015 Run all backend tests to verify 90%+ coverage for command handlers: dotnet test --filter "FullyQualifiedName~Orders" (173 tests passed)

### Frontend Shared Infrastructure

- [X] T016 Add GraphQL mutation definitions to client/src/app/features/orders/graphql/order.queries.ts (CREATE_ORDER, UPDATE_ORDER, CANCEL_ORDER from contracts/mutations.graphql)
- [X] T017 Update OrderService in client/src/app/features/orders/services/order.service.ts with createOrder(), updateOrder(), and cancelOrder() methods
- [X] T018 Add routing configuration to client/src/app/app.routes.ts for /orders/create and /orders/:id/edit routes
- [X] T019 [P] Copy TypeScript type definitions from contracts/typescript-types.ts to client/src/app/shared/models/order.model.ts (types already exist)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create New Order (Priority: P1) 🎯 MVP

**Goal**: Administrators can create new orders with customer information, shipping address, and product line items

**Independent Test**: Navigate to /orders, click "Create Order", fill form with customer details and products, submit, verify order appears in list with "Pending" status and correct totals

### Frontend Unit Tests for User Story 1 (Required by FR-020)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [P] [US1] Create order.service.spec.ts in client/src/app/features/orders/services/ with tests for createOrder() method
- [ ] T021 [P] [US1] Create order-create.component.spec.ts in client/src/app/features/orders/components/order-create/ testing form validation, submission, error handling, and navigation

### Implementation for User Story 1

- [X] T022 [US1] Generate OrderCreateComponent using Angular CLI: ng generate component features/orders/components/order-create --standalone in client/
- [X] T023 [US1] Implement order create form in client/src/app/features/orders/components/order-create/order-create.component.ts using Reactive Forms with customer info, shipping address, and order details FormArray
- [X] T024 [US1] Create order create template in client/src/app/features/orders/components/order-create/order-create.component.html using Angular Material form fields (mat-form-field, mat-input, mat-autocomplete for products)
- [X] T025 [US1] Add form validation in order-create.component.ts including required fields, email format, at least one product, quantity > 0
- [X] T026 [US1] Implement product search/autocomplete in order-create.component for selecting products to add to order
- [X] T027 [US1] Implement order total calculation in order-create.component.ts (sum of line item totals)
- [X] T028 [US1] Implement form submission handler calling OrderService.createOrder() in order-create.component.ts
- [X] T029 [US1] Add error handling and validation error display in order-create.component (GraphQL errors, field-level validation)
- [X] T030 [US1] Implement navigation to order detail page on successful creation in order-create.component.ts
- [X] T031 [US1] Add "Create Order" button to orders list component in client/src/app/features/orders/orders-list/orders-list.component.html
- [X] T032 [US1] Style order create form in client/src/app/features/orders/components/order-create/order-create.component.scss following Material Design 3 patterns
- [X] T033 [US1] Update orders list component in client/src/app/features/orders/orders-list/orders-list.component.ts to refresh after navigation back from create (Apollo cache should handle automatically with refetchQueries)

### Frontend Unit Tests Execution for User Story 1

- [ ] T034 [US1] Run frontend tests for order create: ng test --include='**/order-create.component.spec.ts' --watch=false
- [ ] T035 [US1] Run frontend service tests: ng test --include='**/order.service.spec.ts' --watch=false
- [ ] T036 [US1] Verify test coverage for User Story 1 components meets 80%+ target

**Checkpoint**: At this point, User Story 1 should be fully functional - administrators can create orders through UI

---

## Phase 4: User Story 2 - Edit Existing Order (Priority: P2)

**Goal**: Administrators can modify customer information, shipping address, and notes for non-terminal orders

**Independent Test**: Open existing order in "Pending" status, click "Edit Order", modify customer name and address, save, verify updates reflected in order detail view

### Frontend Unit Tests for User Story 2 (Required by FR-020)

- [ ] T037 [P] [US2] Create order-edit.component.spec.ts in client/src/app/features/orders/components/order-edit/ testing form pre-population, validation, submission, and terminal status handling
- [ ] T038 [P] [US2] Update order.service.spec.ts in client/src/app/features/orders/services/ with tests for updateOrder() method

### Implementation for User Story 2

- [ ] T039 [US2] Generate OrderEditComponent using Angular CLI: ng generate component features/orders/components/order-edit --standalone in client/
- [ ] T040 [US2] Implement order edit form in client/src/app/features/orders/components/order-edit/order-edit.component.ts with Reactive Forms pre-populated from route parameter orderId
- [ ] T041 [US2] Create order edit template in client/src/app/features/orders/components/order-edit/order-edit.component.html reusing form fields from create (customer info, shipping address, notes)
- [ ] T042 [US2] Load existing order data in order-edit.component.ts ngOnInit using OrderService.getOrderById() from route params
- [ ] T043 [US2] Implement form validation in order-edit.component.ts (same rules as create for updatable fields)
- [ ] T044 [US2] Implement form submission handler calling OrderService.updateOrder() in order-edit.component.ts
- [ ] T045 [US2] Add error handling for terminal status prevention (backend will reject, display user-friendly message) in order-edit.component
- [ ] T046 [US2] Implement navigation to order detail page on successful update in order-edit.component.ts
- [ ] T047 [US2] Add "Edit Order" button to order detail component in client/src/app/features/orders/order-detail/order-detail.component.html (conditional on non-terminal status)
- [ ] T048 [US2] Update order detail component TypeScript in client/src/app/features/orders/order-detail/order-detail.component.ts to check order status and show/hide edit button using canEditOrder() helper
- [ ] T049 [US2] Style order edit form in client/src/app/features/orders/components/order-edit/order-edit.component.scss following Material Design 3 patterns

### Frontend Unit Tests Execution for User Story 2

- [ ] T050 [US2] Run frontend tests for order edit: ng test --include='**/order-edit.component.spec.ts' --watch=false
- [ ] T051 [US2] Run updated service tests: ng test --include='**/order.service.spec.ts' --watch=false
- [ ] T052 [US2] Verify test coverage for User Story 2 components meets 80%+ target

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - administrators can create and edit orders

---

## Phase 5: User Story 3 - Cancel Order (Priority: P3)

**Goal**: Administrators can cancel orders with a reason for non-terminal orders

**Independent Test**: Open order in "Pending" status, click "Cancel Order", enter reason in dialog, confirm, verify status changes to "Cancelled" and reason displayed

### Frontend Unit Tests for User Story 3 (Required by FR-020)

- [ ] T053 [P] [US3] Create cancel-order-dialog.component.spec.ts in client/src/app/features/orders/components/cancel-order-dialog/ testing dialog form, reason validation, and cancellation confirmation
- [ ] T054 [P] [US3] Update order.service.spec.ts in client/src/app/features/orders/services/ with tests for cancelOrder() method

### Implementation for User Story 3

- [ ] T055 [US3] Generate CancelOrderDialogComponent using Angular CLI: ng generate component features/orders/components/cancel-order-dialog --standalone in client/
- [ ] T056 [US3] Implement cancel order dialog in client/src/app/features/orders/components/cancel-order-dialog/cancel-order-dialog.component.ts using MatDialog with reason textarea
- [ ] T057 [US3] Create cancel dialog template in client/src/app/features/orders/components/cancel-order-dialog/cancel-order-dialog.component.html with mat-dialog, mat-form-field for reason, and mat-dialog-actions for buttons
- [ ] T058 [US3] Add form validation for cancellation reason in cancel-order-dialog.component.ts (required, max 500 characters)
- [ ] T059 [US3] Implement dialog result handling in cancel-order-dialog.component.ts returning reason or null on cancel
- [ ] T060 [US3] Add "Cancel Order" button to order detail component in client/src/app/features/orders/order-detail/order-detail.component.html (conditional on non-terminal status)
- [ ] T061 [US3] Update order detail component TypeScript in client/src/app/features/orders/order-detail/order-detail.component.ts to open cancel dialog using MatDialog service
- [ ] T062 [US3] Implement cancellation handler in order-detail.component.ts calling OrderService.cancelOrder() with dialog reason
- [ ] T063 [US3] Add error handling for terminal status prevention and display success message in order-detail.component
- [ ] T064 [US3] Update order detail view to refresh after cancellation (Apollo cache should update automatically) in order-detail.component.ts
- [ ] T065 [US3] Style cancel order dialog in client/src/app/features/orders/components/cancel-order-dialog/cancel-order-dialog.component.scss following Material Design 3 patterns

### Frontend Unit Tests Execution for User Story 3

- [ ] T066 [US3] Run frontend tests for cancel dialog: ng test --include='**/cancel-order-dialog.component.spec.ts' --watch=false
- [ ] T067 [US3] Run updated service tests: ng test --include='**/order.service.spec.ts' --watch=false
- [ ] T068 [US3] Verify test coverage for User Story 3 components meets 80%+ target

**Checkpoint**: All user stories should now be independently functional - administrators can create, edit, and cancel orders

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure production readiness

### Frontend Component Tests (Existing components - Required by FR-020)

- [ ] T069 [P] Create orders-list.component.spec.ts in client/src/app/features/orders/orders-list/ testing orders display, create button, pagination, filtering, and navigation
- [ ] T070 [P] Create order-detail.component.spec.ts in client/src/app/features/orders/order-detail/ testing order display, edit button conditional display, cancel button conditional display, and status updates

### Integration and End-to-End Validation

- [ ] T071 Run full backend test suite: cd server/Astro.Tests && dotnet test
- [ ] T072 Run full frontend test suite with coverage: cd client && ng test --watch=false --code-coverage
- [ ] T073 Verify backend test coverage meets 90%+ for Orders command handlers
- [ ] T074 Verify frontend test coverage meets 80%+ for all orders components
- [ ] T075 Manual testing: Execute all acceptance scenarios from spec.md User Story 1
- [ ] T076 Manual testing: Execute all acceptance scenarios from spec.md User Story 2
- [ ] T077 Manual testing: Execute all acceptance scenarios from spec.md User Story 3
- [ ] T078 Test all edge cases from spec.md (stock depletion, concurrent edits, network failures, validation edge cases)

### Code Quality and Documentation

- [ ] T079 [P] Code review: Verify all components follow Angular best practices (signals, standalone components, reactive forms)
- [ ] T080 [P] Code review: Verify backend follows Clean Architecture and DDD patterns (domain logic in aggregates, no leakage)
- [ ] T081 [P] Accessibility review: Ensure all forms have proper ARIA labels and keyboard navigation
- [ ] T082 [P] Performance review: Check bundle size increase < 50KB gzipped for frontend components
- [ ] T083 [P] Add JSDoc/TSDoc comments to public methods in frontend services and components
- [ ] T084 [P] Update CLAUDE.md if any new patterns or technologies were introduced (likely no changes needed)

### Deployment Readiness

- [ ] T085 Run quickstart.md validation: Follow setup steps to ensure new developers can get started
- [ ] T086 Build production frontend bundle: ng build --configuration production
- [ ] T087 Verify no console errors or warnings in browser DevTools during manual testing
- [ ] T088 Test GraphQL mutations via Banana Cake Pop or GraphQL Playground for API validation
- [ ] T089 Verify Apollo cache updates correctly after all mutations (create, update, cancel)
- [ ] T090 Test optimistic UI updates work correctly for better user experience

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Reuses some components from US1 (form fields) but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses order detail component from existing code but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach per FR-020)
- Components before integration
- Form logic before submission handlers
- Error handling before polish
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase**:
- T002, T003, T004, T005 can all run in parallel (different areas)

**Foundational Phase**:
- Backend validators (T006, T007, T008) can run in parallel
- Backend unit tests (T009-T014) can run in parallel after handlers verified
- Frontend infrastructure (T016, T017, T018, T019) can run in parallel

**User Story 1**:
- Tests T020 and T021 can run in parallel (different files)
- After form created (T023), styling (T032) can run in parallel with logic implementation

**User Story 2**:
- Tests T037 and T038 can run in parallel
- After form created (T040), styling (T049) can run in parallel with logic implementation

**User Story 3**:
- Tests T053 and T054 can run in parallel
- After dialog created (T056), styling (T065) can run in parallel with logic implementation

**Polish Phase**:
- Tests T069 and T070 can run in parallel
- Code quality tasks (T079-T084) can all run in parallel
- Deployment tasks (T086-T090) can run in sequence after testing complete

**Cross-User Story Parallelism**:
- Once Foundational complete, all three user stories can be worked on simultaneously by different developers
- Each story has independent components and routes
- Integration points are minimal (shared service methods already defined in Foundational)

---

## Parallel Example: User Story 1

```bash
# Write tests first (parallel):
Task T020: "Create order.service.spec.ts with createOrder() tests"
Task T021: "Create order-create.component.spec.ts with form tests"

# After component generated (T022), can parallelize:
# Developer A: Form logic (T023-T030)
# Developer B: Styling (T032)
# Both working on same component but different aspects
```

---

## Parallel Example: All User Stories After Foundational

```bash
# Once Phase 2 complete, assign to team:
# Developer A: User Story 1 (Tasks T020-T036)
# Developer B: User Story 2 (Tasks T037-T052)
# Developer C: User Story 3 (Tasks T053-T068)

# All stories proceed independently and can be tested separately
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Tasks T001-T005)
2. Complete Phase 2: Foundational (Tasks T006-T019) - CRITICAL
3. Complete Phase 3: User Story 1 (Tasks T020-T036)
4. **STOP and VALIDATE**: Test create order flow end-to-end
5. Deploy/demo if ready - administrators can now create orders manually

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP - create orders)
3. Add User Story 2 → Test independently → Deploy (create + edit orders)
4. Add User Story 3 → Test independently → Deploy (create + edit + cancel orders)
5. Complete Polish phase → Full production ready
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Tasks T001-T019)
2. Once Foundational is done:
   - Developer A: User Story 1 (Tasks T020-T036)
   - Developer B: User Story 2 (Tasks T037-T052)
   - Developer C: User Story 3 (Tasks T053-T068)
3. Stories complete independently
4. Team regathers for Polish phase (Tasks T069-T090)

### Test-Driven Development Flow (Required)

Per FR-020, all frontend components must have unit tests:

1. Write test first (ensure it fails)
2. Implement minimum code to make test pass
3. Refactor while keeping tests green
4. Repeat for next test case

Example for User Story 1:
- T020-T021: Write failing tests
- T022-T033: Implement until tests pass
- T034-T036: Verify all tests pass with coverage

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are REQUIRED per FR-018, FR-019, FR-020 (not optional)
- Backend mutations already exist - no backend mutation implementation needed
- Backend validators may need creation/verification
- Focus is primarily frontend development with comprehensive testing
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Apollo cache should handle most UI updates automatically
- Material Design 3 patterns already established in existing components

---

## Success Criteria Validation

After completing all phases, verify against spec.md Success Criteria:

- **SC-001**: Time create order flow - should complete in < 3 minutes
- **SC-002**: Attempt invalid order creation - should prevent with clear errors
- **SC-003**: Edit order and verify immediate reflection of changes
- **SC-004**: Verify edit button hidden for terminal statuses
- **SC-005**: Cancel order and verify immediate status change to "Cancelled"
- **SC-006**: Run backend test coverage report - should be 90%+ for command handlers
- **SC-007**: Run frontend test coverage report - should cover happy paths and errors
- **SC-008**: Execute integration tests for all three workflows
- **SC-009**: Verify all validation errors display clear, actionable messages
- **SC-010**: Verify orders list updates automatically after all operations
