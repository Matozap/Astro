# Feature Specification: Shipment Commands

**Feature Branch**: `feature/shipment-commands`
**Created**: 2026-01-21
**Status**: Draft
**Input**: User description: "At the moment the shipments view is read only so I want to be able to create and update shipments but we need to consider this:
- Do not create a new git branch
- The backend (server) should already have mutations for such operations but, if not, lets create them along with seeding changes, new unit and integrations tests
- Create client (UI) unit tests for all the new operations
- I'm using windows"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create New Shipment (Priority: P1)

As an operations user, I want to create a new shipment for an existing order so that I can track the delivery of products to customers.

**Why this priority**: Creating shipments is the primary action needed to transition from a read-only view to a functional shipment management system. Without creation capability, no shipments can be managed.

**Independent Test**: Can be fully tested by navigating to the shipments page, clicking "Create Shipment", filling in shipment details for an existing order, and verifying the shipment appears in the list with correct status.

**Acceptance Scenarios**:

1. **Given** I am on the shipments list page, **When** I click the "Create Shipment" button, **Then** I am navigated to the shipment creation form.
2. **Given** I am on the shipment creation form, **When** I select an order, fill in carrier, addresses, weight, dimensions, shipping cost, estimated delivery date, and add at least one item, **Then** I can submit the form and the shipment is created with "Pending" status.
3. **Given** I am on the shipment creation form, **When** I submit without filling required fields, **Then** I see validation error messages indicating which fields are required.
4. **Given** I have successfully created a shipment, **When** the creation completes, **Then** I am navigated to the shipment detail page and see a success notification.

---

### User Story 2 - Update Shipment Status (Priority: P2)

As an operations user, I want to update an existing shipment's status and tracking information so that I can reflect the current state of the delivery process.

**Why this priority**: Once shipments exist, tracking their progress through status updates is essential for operations. This enables the core workflow of managing shipment lifecycle.

**Independent Test**: Can be fully tested by navigating to an existing shipment's detail page, clicking "Edit" or "Update Status", changing the status (e.g., from Pending to Shipped), and verifying the new status is displayed.

**Acceptance Scenarios**:

1. **Given** I am viewing a shipment detail page for a shipment in "Pending" status, **When** I click the "Update" action, **Then** I see a form/dialog allowing me to update carrier, tracking number, and status.
2. **Given** I am updating a shipment, **When** I change the status from "Pending" to "Shipped", **Then** the status is updated and a tracking detail entry is added with timestamp and optional location/notes.
3. **Given** I am updating a shipment, **When** I enter an invalid status transition (e.g., Pending directly to Delivered), **Then** I see an error message explaining valid transitions.
4. **Given** I have successfully updated a shipment, **When** the update completes, **Then** the detail page refreshes showing the new information and I see a success notification.

---

### User Story 3 - Update Shipment Details (Priority: P3)

As an operations user, I want to update shipment carrier and tracking number for a shipment that hasn't shipped yet so that I can correct or complete shipping details.

**Why this priority**: Correcting carrier and tracking information is important but less critical than basic create/update status functionality. This addresses data correction needs.

**Independent Test**: Can be fully tested by viewing a "Pending" shipment, editing the carrier and tracking number, and verifying the changes are persisted.

**Acceptance Scenarios**:

1. **Given** a shipment is in "Pending" status, **When** I update the carrier name and tracking number, **Then** the changes are saved successfully.
2. **Given** a shipment is in "Shipped" or later status, **When** I attempt to change the carrier or tracking number, **Then** I am prevented from making changes (only status updates allowed).
3. **Given** I enter an invalid tracking number format, **When** I try to save, **Then** I see a validation error message.

---

### Edge Cases

- What happens when a user tries to create a shipment for an order that already has a shipment?
  - **Behavior**: Allow multiple shipments per order (split shipments are common in e-commerce)
- What happens when a user tries to create a shipment for a cancelled order?
  - **Behavior**: Prevent shipment creation for cancelled orders with clear error message
- What happens when the update mutation fails mid-operation?
  - **Behavior**: Display error notification, keep form data intact for retry
- What happens when a user enters a tracking number that already exists?
  - **Behavior**: Allow duplicate tracking numbers (carriers may reuse numbers)
- What happens when concurrent users update the same shipment?
  - **Behavior**: Last write wins; optimistic concurrency via updatedAt comparison (standard web app behavior)

## Requirements *(mandatory)*

### Functional Requirements

**Backend (if needed)**
- **FR-001**: System MUST expose GraphQL mutations for creating shipments (already exists in backend)
- **FR-002**: System MUST expose GraphQL mutations for updating shipments (already exists in backend)
- **FR-003**: System MUST validate shipment data according to defined rules before persisting
- **FR-004**: System MUST enforce valid status transitions according to the shipment state machine

**Client (UI)**
- **FR-005**: Users MUST be able to navigate to a shipment creation form from the shipments list
- **FR-006**: System MUST display a form with all required fields for creating a shipment (order selection, carrier, addresses, weight, dimensions, shipping cost, estimated delivery date, items)
- **FR-007**: System MUST validate form inputs on the client before submission
- **FR-008**: System MUST display validation errors clearly next to the relevant fields
- **FR-009**: Users MUST be able to update shipment status from the detail view
- **FR-010**: Users MUST be able to update carrier and tracking number for shipments in "Pending" status
- **FR-011**: System MUST display success notifications after successful create/update operations
- **FR-012**: System MUST display error notifications when operations fail
- **FR-013**: System MUST navigate to shipment detail view after successful creation
- **FR-014**: System MUST refresh data after successful update operations

**Testing**
- **FR-015**: All new UI components MUST have unit tests covering initialization, validation, submission success, and submission error scenarios
- **FR-016**: Backend MUST have integration tests for create and update mutations (already exist)

### Key Entities

- **Shipment**: The primary entity representing a shipment of goods, containing tracking information, addresses, physical properties, and status. Already defined in the domain layer.
- **ShipmentItem**: Child entity representing individual items within a shipment, linked to order details and products.
- **TrackingDetail**: Value object/entity recording status changes with timestamp, location, and description.
- **Order**: Related entity that shipments are associated with; used in the create shipment workflow for order selection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new shipment in under 3 minutes using the UI form
- **SC-002**: Users can update shipment status in under 30 seconds from the detail view
- **SC-003**: 100% of create/update operations that pass client validation complete successfully on the server
- **SC-004**: All validation errors are displayed to users within 200ms of form interaction
- **SC-005**: All new UI components have unit test coverage of at least 80%
- **SC-006**: Zero regressions in existing shipment read functionality after implementation

## Assumptions

- The backend GraphQL mutations for CreateShipment and UpdateShipment already exist and are functional
- The existing shipment list and detail components provide the foundation for navigation
- The codebase follows Angular standalone component patterns with Angular Material for UI
- Existing patterns from order-create and payment-create components should be followed for consistency
- Client-side tests use Jasmine/Karma following existing test patterns in the codebase
- The order selection in create shipment form will load available orders (not cancelled)
- Carriers list will include common carriers: USPS, FedEx, UPS, DHL (and allow custom entry)
- Weight and dimension units default to US standards (pounds, inches) but support metric
- Currency defaults to USD but supports common currencies (EUR, GBP, CAD, AUD)
