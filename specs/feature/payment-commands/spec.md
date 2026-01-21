# Feature Specification: Payment Commands

**Feature Branch**: `feature/payment-commands`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "At the moment the payments view is read only so I want to be able to create, and update status of payments"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create New Payment (Priority: P1)

As an administrator, I want to create a new payment record for an existing order so that I can manually record payments made outside the system or initiate payment tracking for orders.

**Why this priority**: Creating payments is the foundational operation - without it, users cannot add any payment data. This enables the core workflow of associating payments with orders.

**Independent Test**: Can be fully tested by navigating to order detail, clicking "Add Payment", filling in amount and payment method, and verifying the payment appears in the payments list with "Pending" status.

**Acceptance Scenarios**:

1. **Given** I am viewing an order detail page, **When** I click "Add Payment" and enter a valid amount and payment method, **Then** a new payment is created with "Pending" status and I see a success confirmation.

2. **Given** I am on the payments list page, **When** I click "Create Payment", select an order, enter amount and payment method, **Then** the payment is created and appears in the list.

3. **Given** I am creating a payment, **When** I leave the amount field empty or enter zero/negative, **Then** validation errors are displayed and submission is prevented.

4. **Given** I am creating a payment, **When** I select an order that doesn't exist (edge case), **Then** an appropriate error message is displayed.

---

### User Story 2 - Update Payment Status (Priority: P1)

As an administrator, I want to update the status of an existing payment so that I can mark payments as successful when they clear or failed when they are rejected.

**Why this priority**: Equally critical as creation - payments in "Pending" status need status updates to complete the payment lifecycle. Without this, payment tracking is incomplete.

**Independent Test**: Can be fully tested by viewing a pending payment's detail page, clicking "Update Status", selecting "Successful" or "Failed", and verifying the status change is reflected.

**Acceptance Scenarios**:

1. **Given** I am viewing a payment with "Pending" status, **When** I click "Mark as Successful" and confirm, **Then** the payment status changes to "Successful" and I see a success confirmation.

2. **Given** I am viewing a payment with "Pending" status, **When** I click "Mark as Failed" and confirm, **Then** the payment status changes to "Failed" and I see a success confirmation.

3. **Given** I am viewing a payment with "Successful" status, **When** I attempt to change the status, **Then** the status change options are disabled or hidden (terminal state).

4. **Given** I am viewing a payment with "Failed" status, **When** I attempt to change the status, **Then** the status change options are disabled or hidden (terminal state).

---

### User Story 3 - Create Payment from Order Context (Priority: P2)

As an administrator, I want to create a payment directly from an order's detail view so that I can quickly add payments without navigating away from the order context.

**Why this priority**: Provides a streamlined workflow when working with orders. While not essential for MVP (users can create payments from payments list), it significantly improves user efficiency.

**Independent Test**: Can be fully tested by navigating to an order detail, clicking "Add Payment" button, and verifying the form pre-fills the order and its total amount.

**Acceptance Scenarios**:

1. **Given** I am viewing an order detail page, **When** I click "Add Payment", **Then** a payment form opens with the order pre-selected and amount pre-filled with order total.

2. **Given** I complete payment creation from order detail, **When** I save the payment, **Then** I return to the order detail page and the new payment is visible in the order's payment section.

---

### Edge Cases

- What happens when the network connection is lost during payment creation? System displays an error message and preserves form data for retry.
- How does the system handle concurrent status updates on the same payment? Last write wins with optimistic locking; user sees current state after refresh.
- What happens when trying to update a payment that was just deleted? System displays "Payment not found" error and redirects to payments list.
- What happens when the order total changes after payment amount is pre-filled? User can modify the amount before submission; system does not auto-sync.

## Clarifications

### Session 2026-01-15

- Q: Should payment creation use dialog or separate page? → A: Separate routed page (`/payments/create`) following products/orders pattern.
- Q: How should status update controls be presented? → A: Mat-menu dropdown (following orders Update Status pattern).
- Q: Where should action buttons be placed? → A: Header for list view "Create Payment" button; detail view header-right for status actions.
- Q: What confirmation pattern for status changes? → A: MatDialog confirmation (following products delete confirmation pattern).

## Requirements *(mandatory)*

### Functional Requirements

#### Payment Creation
- **FR-001**: System MUST provide a form to create new payments via a separate routed page (`/payments/create`), not a dialog, with fields: Order selection (autocomplete), Amount, Currency, and Payment Method.
- **FR-002**: System MUST validate that Amount is a positive number greater than zero using Reactive Forms with field-level validation.
- **FR-003**: System MUST validate that an Order is selected before allowing submission.
- **FR-004**: System MUST default new payments to "Pending" status (handled by backend).
- **FR-005**: System MUST display success feedback via NotificationService after successful payment creation, then navigate to payments list.
- **FR-006**: System MUST display validation errors inline with the form fields using `mat-error` components.
- **FR-007**: System MUST support creating payment from both the payments list page (via header "Create Payment" button) and order detail page (via "Add Payment" button).

#### Payment Status Update
- **FR-008**: System MUST provide controls to update payment status via a mat-menu dropdown in payment detail header (following orders "Update Status" pattern), showing available transitions from "Pending" to "Successful" or "Failed".
- **FR-009**: System MUST hide the status update menu for payments in terminal states (Successful, Failed).
- **FR-010**: System MUST require user confirmation via MatDialog before changing payment status (following products delete confirmation pattern with warning icon, consequence text, and Cancel/Confirm buttons).
- **FR-011**: System MUST display success feedback via NotificationService after successful status update.
- **FR-012**: System MUST update the payment detail view immediately after status change using Apollo cache update.

#### Error Handling
- **FR-013**: System MUST display appropriate error messages when backend operations fail.
- **FR-014**: System MUST handle "Order not found" errors gracefully when creating payments.
- **FR-015**: System MUST handle "Payment not found" errors gracefully when updating status.
- **FR-016**: System MUST handle invalid status transition errors gracefully.

#### UI/UX
- **FR-017**: System MUST provide loading indicators during form submission using signal-based state (`isSubmitting`) and `mat-progress-spinner`.
- **FR-018**: System MUST allow canceling payment creation via Cancel button that navigates back to payments list (or order detail if from order context).
- **FR-019**: System MUST pre-fill order and amount when creating payment from order context via route query parameters.
- **FR-020**: System MUST follow page structure pattern: page-header (title + actions), filters card (for list), mat-cards for content sections.
- **FR-021**: System MUST use shared `StatusBadgeComponent` with appropriate variants (warning for Pending, success for Successful, error for Failed).

### Key Entities

- **Payment**: Record of a payment transaction linked to an order, with status tracking (Pending, Successful, Failed), amount (money value), payment method, and optional transaction ID.
- **Order**: The associated order entity that the payment is linked to. Orders can have multiple payments.
- **PaymentStatus**: Enumeration representing payment lifecycle states with defined state machine transitions (Pending can transition to Successful or Failed; terminal states cannot transition).
- **Money**: Value object representing amount with currency (e.g., 100.00 USD).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new payment in under 30 seconds from the payments list.
- **SC-002**: Users can update payment status in under 10 seconds with 2 or fewer clicks.
- **SC-003**: Form validation feedback appears within 1 second of user input.
- **SC-004**: All payment operations provide visual feedback (success/error) within 2 seconds.
- **SC-005**: 100% of UI payment operations are covered by unit tests.
- **SC-006**: Users can successfully complete payment creation on first attempt when provided valid data.

## Assumptions

- Backend GraphQL mutations for CreatePayment and UpdatePaymentStatus already exist and are functional.
- The existing PaymentService can be extended to include mutation methods.
- Apollo Angular cache invalidation/update patterns are already established in the codebase.
- Order selection will use a mat-autocomplete component with order search capability.
- Currency defaults to "USD" with option to change (following existing payment creation API).
- Payment method options include: Credit Card, Debit Card, PayPal, Bank Transfer, Cash, Other.
- Confirmation dialogs for status changes follow existing Angular Material dialog patterns (as in products delete/deactivate).
- Unit tests will use Angular testing utilities (TestBed, ComponentFixture) with mocked services.
- Route structure follows products/orders pattern: `/payments` (list), `/payments/:id` (detail), `/payments/create` (create form).
- GraphQL error extraction follows existing pattern with validation errors handling from `gqlError.extensions.validationErrors`.

## Constraints

- Must not create a new git branch (work on existing `feature/payment-commands` branch).
- Backend mutations may need creation if not present (including seeding changes, unit tests, integration tests).
- All new UI operations require client-side unit tests.
- Must follow existing code patterns and architecture established in the codebase.
