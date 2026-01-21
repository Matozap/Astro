# Tasks: Payment Commands

**Input**: Design documents from `/specs/feature/payment-commands/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit tests are REQUIRED per SC-005 (100% UI payment operations coverage)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `client/src/app/features/payments/`
- **Shared Models**: `client/src/app/shared/models/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: GraphQL mutations and shared types that all user stories depend on

- [x] T001 [P] Create GraphQL mutations file in `client/src/app/features/payments/graphql/payment.mutations.ts` with CREATE_PAYMENT and UPDATE_PAYMENT_STATUS mutations
- [x] T002 [P] Add CreatePaymentInput, UpdatePaymentStatusInput interfaces to `client/src/app/shared/models/payment.model.ts`
- [x] T003 [P] Add PAYMENT_STATUS_TRANSITIONS constant and helper functions (canUpdatePaymentStatus, getAvailablePaymentStatuses) to `client/src/app/shared/models/payment.model.ts`
- [x] T004 [P] Add PAYMENT_METHOD_OPTIONS constant to `client/src/app/shared/models/payment.model.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Payment service mutations that MUST be complete before ANY user story UI can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add createPayment method to PaymentService in `client/src/app/features/payments/services/payment.service.ts`
- [x] T006 Add updatePaymentStatus method to PaymentService in `client/src/app/features/payments/services/payment.service.ts`
- [x] T007 Create PaymentService unit tests in `client/src/app/features/payments/services/payment.service.spec.ts` covering createPayment and updatePaymentStatus methods

**Checkpoint**: Foundation ready - PaymentService mutations working, user story implementation can now begin

---

## Phase 3: User Story 1 - Create New Payment (Priority: P1) MVP

**Goal**: Enable administrators to create new payment records for existing orders from the payments list page

**Independent Test**: Navigate to payments list, click "Create Payment", select an order, enter amount and payment method, verify payment appears in list with "Pending" status

### Unit Tests for User Story 1

- [x] T008 [P] [US1] Create unit tests for PaymentCreateComponent in `client/src/app/features/payments/components/payment-create/payment-create.component.spec.ts` covering form validation, submission success, submission error, and cancel navigation

### Implementation for User Story 1

- [x] T009 [P] [US1] Create payment-create component TypeScript in `client/src/app/features/payments/components/payment-create/payment-create.component.ts` with reactive form, order autocomplete, validation, and submit/cancel handlers
- [x] T010 [P] [US1] Create payment-create component HTML template in `client/src/app/features/payments/components/payment-create/payment-create.component.html` with mat-card layout, form fields (order autocomplete, amount, currency dropdown, payment method dropdown), validation errors, and action buttons
- [x] T011 [P] [US1] Create payment-create component styles in `client/src/app/features/payments/components/payment-create/payment-create.component.scss` following existing products/orders page styling patterns
- [x] T012 [US1] Update payments routes to add create route in `client/src/app/features/payments/payments.routes.ts` with path 'create' lazy-loading PaymentCreateComponent
- [x] T013 [US1] Update payments-list component to add "Create Payment" header button in `client/src/app/features/payments/payments-list/payments-list.component.ts` with RouterLink to /payments/create
- [x] T014 [US1] Update payments-list component template to include the Create Payment button in header-actions section in `client/src/app/features/payments/payments-list/payments-list.component.html`
- [x] T015 [P] [US1] Create unit tests for PaymentsListComponent create button in `client/src/app/features/payments/payments-list/payments-list.component.spec.ts` verifying button presence and navigation

**Checkpoint**: User Story 1 complete - Payment creation from payments list is fully functional and testable

---

## Phase 4: User Story 2 - Update Payment Status (Priority: P1)

**Goal**: Enable administrators to update payment status (Pending → Successful/Failed) via a dropdown menu with confirmation dialog

**Independent Test**: View a pending payment's detail page, click "Update Status" dropdown, select "Successful" or "Failed", confirm in dialog, verify status changes

### Unit Tests for User Story 2

- [ ] T016 [P] [US2] Create unit tests for StatusConfirmDialogComponent in `client/src/app/features/payments/dialogs/status-confirm-dialog/status-confirm-dialog.component.spec.ts` covering confirm/cancel actions and data display
- [ ] T017 [P] [US2] Create/extend unit tests for PaymentDetailComponent status update in `client/src/app/features/payments/payment-detail/payment-detail.component.spec.ts` covering canUpdateStatus, getAvailableStatuses, onStatusUpdate, and terminal state hiding

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create status-confirm-dialog component TypeScript in `client/src/app/features/payments/dialogs/status-confirm-dialog/status-confirm-dialog.component.ts` with StatusConfirmDialogData interface, onCancel/onConfirm methods
- [ ] T019 [P] [US2] Create status-confirm-dialog component HTML template in `client/src/app/features/payments/dialogs/status-confirm-dialog/status-confirm-dialog.component.html` with mat-dialog structure, payment info display, warning text, and action buttons
- [ ] T020 [P] [US2] Create status-confirm-dialog component styles in `client/src/app/features/payments/dialogs/status-confirm-dialog/status-confirm-dialog.component.scss` following products delete-confirm-dialog styling
- [ ] T021 [US2] Update payment-detail component TypeScript in `client/src/app/features/payments/payment-detail/payment-detail.component.ts` adding MatMenuModule, MatDialog imports, updatingStatus signal, canUpdateStatus, getAvailableStatuses, getStatusLabel, onStatusUpdate, and updateStatus methods
- [ ] T022 [US2] Update payment-detail component HTML template in `client/src/app/features/payments/payment-detail/payment-detail.component.html` adding mat-menu dropdown in header-right with status options, conditional display based on canUpdateStatus

**Checkpoint**: User Story 2 complete - Payment status updates with confirmation dialog are fully functional and testable

---

## Phase 5: User Story 3 - Create Payment from Order Context (Priority: P2)

**Goal**: Enable administrators to create payments directly from order detail page with pre-filled order and amount

**Independent Test**: Navigate to order detail, click "Add Payment" button, verify form pre-fills order ID and order total amount, complete creation and verify return to order page

### Unit Tests for User Story 3

- [ ] T023 [P] [US3] Extend PaymentCreateComponent unit tests in `client/src/app/features/payments/components/payment-create/payment-create.component.spec.ts` adding tests for query parameter pre-filling (orderId, amount) and returnUrl navigation

### Implementation for User Story 3

- [ ] T024 [US3] Update PaymentCreateComponent to handle query params (orderId, amount, returnUrl) in `client/src/app/features/payments/components/payment-create/payment-create.component.ts` - verify checkQueryParams method populates form and onCancel uses returnUrl
- [ ] T025 [US3] Update order-detail component to add "Add Payment" button in `client/src/app/features/orders/order-detail/order-detail.component.ts` with router navigation passing orderId, totalAmount, and returnUrl query parameters
- [ ] T026 [US3] Update order-detail component template to include "Add Payment" button in header or payment section in `client/src/app/features/orders/order-detail/order-detail.component.html`

**Checkpoint**: User Story 3 complete - Payment creation from order context with pre-filling is fully functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [ ] T027 Run all unit tests and verify 100% coverage of new payment operations using `ng test --code-coverage`
- [ ] T028 Verify form validation messages display correctly for all error states
- [ ] T029 Test error handling for GraphQL errors (OrderNotFoundException, PaymentNotFoundException, invalid status transition)
- [ ] T030 Validate quickstart.md manual testing checklist - all scenarios pass
- [ ] T031 Code cleanup: ensure consistent imports, remove unused code, verify linting passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority and can run in parallel
  - US3 (P2) can run after Foundational but depends on US1 PaymentCreateComponent
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Depends on US1 (extends PaymentCreateComponent with query params)

### Within Each User Story

- Unit tests FIRST (T008, T016-T017, T023)
- Component implementation (TypeScript, HTML, SCSS in parallel)
- Integration tasks (routes, list/detail updates) after components
- Verify story independently before moving to next

### Parallel Opportunities

**Phase 1** (all parallel):
```
T001 (mutations) | T002 (input types) | T003 (transitions) | T004 (method options)
```

**Phase 3 - User Story 1** (after T008 tests):
```
T009 (create.ts) | T010 (create.html) | T011 (create.scss)
Then: T012-T015 sequentially (route, list updates)
```

**Phase 4 - User Story 2** (after T016-T017 tests):
```
T018 (dialog.ts) | T019 (dialog.html) | T020 (dialog.scss)
Then: T021-T022 sequentially (detail updates)
```

---

## Parallel Example: User Story 1 + User Story 2

Once Foundational phase (T007) is complete, both stories can proceed in parallel:

```bash
# Developer A: User Story 1
Task: T008 - Unit tests for PaymentCreateComponent
Task: T009 - Create payment-create.component.ts
Task: T010 - Create payment-create.component.html
...

# Developer B: User Story 2 (simultaneously)
Task: T016 - Unit tests for StatusConfirmDialogComponent
Task: T017 - Unit tests for PaymentDetailComponent status update
Task: T018 - Create status-confirm-dialog.component.ts
...
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T007)
3. Complete Phase 3: User Story 1 (T008-T015)
4. **STOP and VALIDATE**: Test payment creation from payments list
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Service mutations ready
2. Add User Story 1 → Test independently → Deploy (MVP - Create payments)
3. Add User Story 2 → Test independently → Deploy (Status updates)
4. Add User Story 3 → Test independently → Deploy (Order context workflow)
5. Polish phase → Final validation

### Parallel Team Strategy

With multiple developers after Foundational phase:

- **Developer A**: User Story 1 (Create payment from list)
- **Developer B**: User Story 2 (Status update with dialog)
- **After US1 complete**: Developer A moves to User Story 3

---

## Notes

- [P] tasks = different files, no dependencies - can run simultaneously
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Unit tests written FIRST, ensure they FAIL before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend mutations already exist - no server-side changes needed
- Follow existing products/orders UI patterns for consistency
