# Tasks: Shipment Commands

**Input**: Design documents from `/specs/feature/shipment-commands/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Unit tests ARE REQUIRED per FR-015 ("All new UI components MUST have unit tests")

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Client**: `client/src/app/features/shipments/`
- **Shared Models**: `client/src/app/shared/models/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: GraphQL mutations, shared models, and service extensions needed by all user stories

- [ ] T001 [P] Add CreateShipmentInput, CreateShipmentItemInput, WeightUnit, DimensionUnit types to `client/src/app/shared/models/shipment.model.ts`
- [ ] T002 [P] Add UpdateShipmentInput type to `client/src/app/shared/models/shipment.model.ts`
- [ ] T003 [P] Add SHIPMENT_STATUS_TRANSITIONS map, isTerminalStatus(), getAvailableTransitions() functions to `client/src/app/shared/models/shipment.model.ts`
- [ ] T004 [P] Add StatusUpdateDialogData, StatusUpdateDialogResult, ShipmentEditDialogData, ShipmentEditDialogResult interfaces to `client/src/app/shared/models/shipment.model.ts`
- [ ] T005 [P] Add CARRIER_OPTIONS, WEIGHT_UNIT_OPTIONS, DIMENSION_UNIT_OPTIONS, CURRENCY_OPTIONS constants to `client/src/app/shared/models/shipment.model.ts`
- [ ] T006 Create GraphQL mutations file with CREATE_SHIPMENT and UPDATE_SHIPMENT in `client/src/app/features/shipments/graphql/shipment.mutations.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend ShipmentService with mutation methods used by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Add createShipment() method to `client/src/app/features/shipments/services/shipment.service.ts`
- [ ] T008 Add updateShipment() method to `client/src/app/features/shipments/services/shipment.service.ts`
- [ ] T009 Create service unit tests file `client/src/app/features/shipments/services/shipment.service.spec.ts` with tests for createShipment() and updateShipment()

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create New Shipment (Priority: P1) 🎯 MVP

**Goal**: Users can create a new shipment for an existing order via a form

**Independent Test**: Navigate to shipments page, click "Create Shipment", fill in details, submit, verify shipment appears in list with Pending status

### Tests for User Story 1

- [ ] T010 [P] [US1] Create unit test file `client/src/app/features/shipments/components/shipment-create/shipment-create.component.spec.ts` with test stubs for initialization, form validation, order selection, item management, submission success, submission error, cancel navigation

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create component files: `client/src/app/features/shipments/components/shipment-create/shipment-create.component.ts`, `.html`, `.scss`
- [ ] T012 [US1] Implement ShipmentCreateComponent with FormBuilder, order selection (mat-autocomplete), address fields, weight/dimensions, shipping cost, and estimated delivery date in `client/src/app/features/shipments/components/shipment-create/shipment-create.component.ts`
- [ ] T013 [US1] Implement order selection with auto-populate destination address from selected order's shipping address in `client/src/app/features/shipments/components/shipment-create/shipment-create.component.ts`
- [ ] T014 [US1] Implement item selection from order details (add/remove items with quantity) in `client/src/app/features/shipments/components/shipment-create/shipment-create.component.ts`
- [ ] T015 [US1] Implement form validation with error messages per data-model.md validation rules in `client/src/app/features/shipments/components/shipment-create/shipment-create.component.ts`
- [ ] T016 [US1] Implement form submission with loading state, success notification, and navigation to detail page in `client/src/app/features/shipments/components/shipment-create/shipment-create.component.ts`
- [ ] T017 [US1] Implement error handling for GraphQL errors with user-friendly notifications in `client/src/app/features/shipments/components/shipment-create/shipment-create.component.ts`
- [ ] T018 [US1] Create HTML template with mat-card sections for Order Selection, Carrier Info, Origin Address, Destination Address, Package Details, Items in `client/src/app/features/shipments/components/shipment-create/shipment-create.component.html`
- [ ] T019 [US1] Add styles for create form layout in `client/src/app/features/shipments/components/shipment-create/shipment-create.component.scss`
- [ ] T020 [US1] Add "Create Shipment" button to shipments list header in `client/src/app/features/shipments/shipments-list/shipments-list.component.html`
- [ ] T021 [US1] Add create route to `client/src/app/features/shipments/shipments.routes.ts`: `{ path: 'create', component: ShipmentCreateComponent }`
- [ ] T022 [US1] Create unit test file `client/src/app/features/shipments/shipments-list/shipments-list.component.spec.ts` with tests for Create button presence and navigation
- [ ] T023 [US1] Complete unit tests in `client/src/app/features/shipments/components/shipment-create/shipment-create.component.spec.ts` with full test implementations

**Checkpoint**: User Story 1 complete - users can create shipments independently

---

## Phase 4: User Story 2 - Update Shipment Status (Priority: P2)

**Goal**: Users can update an existing shipment's status with location and notes

**Independent Test**: Navigate to existing shipment detail, click status dropdown, select new status, fill location/notes, confirm, verify status updated and tracking detail added

### Tests for User Story 2

- [ ] T024 [P] [US2] Create unit test file `client/src/app/features/shipments/dialogs/status-update-dialog/status-update-dialog.component.spec.ts` with test stubs for initialization, form validation, confirm, cancel

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create component files: `client/src/app/features/shipments/dialogs/status-update-dialog/status-update-dialog.component.ts`, `.html`, `.scss`
- [ ] T026 [US2] Implement StatusUpdateDialogComponent with MAT_DIALOG_DATA injection, location/notes form fields, and confirm/cancel actions in `client/src/app/features/shipments/dialogs/status-update-dialog/status-update-dialog.component.ts`
- [ ] T027 [US2] Create dialog HTML template with status display, location input, notes textarea, and action buttons in `client/src/app/features/shipments/dialogs/status-update-dialog/status-update-dialog.component.html`
- [ ] T028 [US2] Add styles for dialog layout in `client/src/app/features/shipments/dialogs/status-update-dialog/status-update-dialog.component.scss`
- [ ] T029 [US2] Add canUpdateStatus() and getAvailableStatuses() methods to `client/src/app/features/shipments/shipment-detail/shipment-detail.component.ts`
- [ ] T030 [US2] Add openStatusDialog() method that opens StatusUpdateDialogComponent with current shipment and selected status in `client/src/app/features/shipments/shipment-detail/shipment-detail.component.ts`
- [ ] T031 [US2] Add updateStatus() method that calls shipmentService.updateShipment() with status change and handles response in `client/src/app/features/shipments/shipment-detail/shipment-detail.component.ts`
- [ ] T032 [US2] Add mat-menu with status options to shipment detail header in `client/src/app/features/shipments/shipment-detail/shipment-detail.component.html`
- [ ] T033 [US2] Create unit test file `client/src/app/features/shipments/shipment-detail/shipment-detail.component.spec.ts` with tests for status update functionality
- [ ] T034 [US2] Complete unit tests in `client/src/app/features/shipments/dialogs/status-update-dialog/status-update-dialog.component.spec.ts` with full test implementations

**Checkpoint**: User Story 2 complete - users can update shipment status independently

---

## Phase 5: User Story 3 - Update Shipment Details (Priority: P3)

**Goal**: Users can edit carrier and tracking number for Pending shipments

**Independent Test**: Navigate to Pending shipment detail, click Edit, change carrier and tracking number, save, verify changes persisted

### Tests for User Story 3

- [ ] T035 [P] [US3] Create unit test file `client/src/app/features/shipments/dialogs/shipment-edit-dialog/shipment-edit-dialog.component.spec.ts` with test stubs for initialization, form validation, save, cancel

### Implementation for User Story 3

- [ ] T036 [P] [US3] Create component files: `client/src/app/features/shipments/dialogs/shipment-edit-dialog/shipment-edit-dialog.component.ts`, `.html`, `.scss`
- [ ] T037 [US3] Implement ShipmentEditDialogComponent with MAT_DIALOG_DATA injection, carrier and trackingNumber form fields with validation in `client/src/app/features/shipments/dialogs/shipment-edit-dialog/shipment-edit-dialog.component.ts`
- [ ] T038 [US3] Create dialog HTML template with carrier input, tracking number input, validation errors, and action buttons in `client/src/app/features/shipments/dialogs/shipment-edit-dialog/shipment-edit-dialog.component.html`
- [ ] T039 [US3] Add styles for dialog layout in `client/src/app/features/shipments/dialogs/shipment-edit-dialog/shipment-edit-dialog.component.scss`
- [ ] T040 [US3] Add canEditShipment() method (returns true only for Pending status) to `client/src/app/features/shipments/shipment-detail/shipment-detail.component.ts`
- [ ] T041 [US3] Add openEditDialog() method that opens ShipmentEditDialogComponent in `client/src/app/features/shipments/shipment-detail/shipment-detail.component.ts`
- [ ] T042 [US3] Add Edit button (visible only for Pending status) to shipment detail header in `client/src/app/features/shipments/shipment-detail/shipment-detail.component.html`
- [ ] T043 [US3] Extend unit tests in `client/src/app/features/shipments/shipment-detail/shipment-detail.component.spec.ts` for edit functionality
- [ ] T044 [US3] Complete unit tests in `client/src/app/features/shipments/dialogs/shipment-edit-dialog/shipment-edit-dialog.component.spec.ts` with full test implementations

**Checkpoint**: User Story 3 complete - users can edit Pending shipment details independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and verification

- [ ] T045 Verify all unit tests pass: run `ng test --watch=false` in client directory
- [ ] T046 Verify no TypeScript compilation errors: run `ng build` in client directory
- [ ] T047 Run quickstart.md verification checklist manually
- [ ] T048 Verify existing shipment read functionality still works (no regressions)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) or sequentially in priority order
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1 (uses existing shipments for testing)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on US1/US2 (uses existing shipments for testing)

### Within Each User Story

- Test file creation first (structure only)
- Component files created
- Core implementation
- HTML template
- Styles
- Integration with existing components
- Full test implementation last

### Parallel Opportunities

**Phase 1 (all parallel)**:
```
T001, T002, T003, T004, T005 can run simultaneously (different sections of same file)
T006 can run in parallel (different file)
```

**Phase 3 - US1 (tests and component creation parallel)**:
```
T010, T011 can run simultaneously
T022 can run in parallel with T012-T019
```

**Phase 4-5 - US2/US3 (independent stories)**:
```
Entire Phase 4 can run in parallel with Phase 5 if multiple developers
```

---

## Parallel Example: User Story 1

```bash
# Create test stubs and component files in parallel:
Task: "Create unit test file client/src/app/features/shipments/components/shipment-create/shipment-create.component.spec.ts"
Task: "Create component files client/src/app/features/shipments/components/shipment-create/*.ts,.html,.scss"

# Create list component tests in parallel with create component implementation:
Task: "Create unit test file client/src/app/features/shipments/shipments-list/shipments-list.component.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T009)
3. Complete Phase 3: User Story 1 (T010-T023)
4. **STOP and VALIDATE**: Test creating a shipment end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP!)
3. Add User Story 2 → Test independently → Deploy (Status updates)
4. Add User Story 3 → Test independently → Deploy (Edit details)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T009)
2. Once Foundational is done:
   - Developer A: User Story 1 (T010-T023)
   - Developer B: User Story 2 (T024-T034)
   - Developer C: User Story 3 (T035-T044)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- All unit tests required per FR-015 specification
- Follow existing payment-create patterns for consistency
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
