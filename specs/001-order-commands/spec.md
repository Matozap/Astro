# Feature Specification: Order Management Commands

**Feature Branch**: `feature/order-commands`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "At the moment the orders view is read only so I want to be able to create, edit and cancel orders but we need to consider this: Do not create a new git branch - The backend (server) should already have mutations for such operations but if not, lets create them along with seeding changes, the proper unit and integrations tests - Create client (UI) unit tests for all the new operations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create New Order (Priority: P1)

An administrator needs to create a new order in the system, entering customer information, shipping address, and selecting products with quantities. This enables manual order entry for phone orders, walk-in customers, or correction of orders that were not captured through the standard checkout flow.

**Why this priority**: Creating orders is the most fundamental operation - without it, the system cannot capture new business transactions. This is the core value proposition of making orders writable.

**Independent Test**: Can be fully tested by navigating to orders page, clicking "Create Order", filling in customer details and product line items, submitting the form, and verifying the order appears in the orders list with correct details and a "Pending" status.

**Acceptance Scenarios**:

1. **Given** I am on the orders list page, **When** I click "Create Order" button, **Then** I see a form to enter customer information, shipping address, and order line items
2. **Given** I fill in all required fields (customer name, email, shipping address, at least one product with quantity), **When** I submit the form, **Then** the order is created with status "Pending" and I am redirected to the order detail page showing the new order
3. **Given** I am filling the create order form, **When** I select a product that has insufficient stock, **Then** I see an error message indicating the product is out of stock and cannot add it to the order
4. **Given** I am filling the create order form with multiple products, **When** I submit, **Then** the order total is automatically calculated from all line items and displayed correctly
5. **Given** I leave required fields empty, **When** I try to submit, **Then** I see validation errors highlighting the missing fields

---

### User Story 2 - Edit Existing Order (Priority: P2)

An administrator needs to modify an existing order's details such as customer information, shipping address, or notes. This handles cases where customer provides updated information or corrections are needed before the order is processed.

**Why this priority**: Editing is important for data accuracy but less critical than creating orders. Orders can be created first and edited later if needed.

**Independent Test**: Can be fully tested by opening an existing order in "Pending" or "Confirmed" status, clicking "Edit Order", modifying customer name or shipping address, saving changes, and verifying the updated information displays correctly in the order detail view.

**Acceptance Scenarios**:

1. **Given** I am viewing an order in "Pending" or "Confirmed" status, **When** I click "Edit Order" button, **Then** I see a form pre-filled with the current order details
2. **Given** I modify the customer name and shipping address, **When** I save the changes, **Then** the order is updated with new information and I see a success confirmation
3. **Given** I am viewing an order in "Shipped", "Delivered", "Cancelled", or "Refunded" status, **When** I look for edit options, **Then** I do not see an "Edit Order" button (terminal statuses cannot be edited)
4. **Given** I am editing an order and change the shipping address, **When** I save, **Then** the updated address is reflected immediately in the order details
5. **Given** I try to edit an order but don't change any values, **When** I save, **Then** the system accepts the save without errors

---

### User Story 3 - Cancel Order (Priority: P3)

An administrator needs to cancel an order at customer request or due to inability to fulfill. The cancellation should record a reason and update the order status appropriately.

**Why this priority**: Cancellation is important for order lifecycle management but happens less frequently than creating or editing orders. It's a supporting operation rather than core functionality.

**Independent Test**: Can be fully tested by opening an order in non-terminal status, clicking "Cancel Order", entering a cancellation reason, confirming, and verifying the order status changes to "Cancelled" and the reason is recorded.

**Acceptance Scenarios**:

1. **Given** I am viewing an order in "Pending", "Confirmed", "Processing", or "Shipped" status, **When** I click "Cancel Order" button, **Then** I see a confirmation dialog asking for a cancellation reason
2. **Given** I enter a cancellation reason and confirm, **When** the cancellation is processed, **Then** the order status changes to "Cancelled" and the reason is displayed
3. **Given** I am viewing an order in "Delivered", "Cancelled", or "Refunded" status, **When** I look for cancel options, **Then** I do not see a "Cancel Order" button (cannot cancel terminal statuses)
4. **Given** I click "Cancel Order" but then decide not to cancel, **When** I click "Abort" or close the dialog, **Then** the order remains unchanged
5. **Given** I attempt to cancel an order without entering a reason, **When** I try to confirm, **Then** I see a validation error requiring a cancellation reason

---

### Edge Cases

- What happens when creating an order with products that go out of stock between selecting them and submitting the form?
- How does the system handle concurrent edits to the same order by multiple administrators?
- What happens if the network fails during order creation or update?
- How does the system handle very long customer names, addresses, or notes that exceed typical lengths?
- What happens when cancelling an order that has associated payments or shipments?
- How does the system handle creating an order with zero quantity for a product?
- What happens when editing an order changes that would make previously valid data invalid?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a user interface to create new orders with customer name, email, shipping address, optional notes, and one or more order line items (product, quantity)
- **FR-002**: System MUST validate all required fields before allowing order creation (customer name, email format, shipping address components, at least one product with quantity > 0)
- **FR-003**: System MUST check product availability and stock levels before allowing order creation
- **FR-004**: System MUST automatically calculate order total from line items (quantity × unit price) and display it to the user
- **FR-005**: System MUST generate a unique order number for each new order
- **FR-006**: System MUST set newly created orders to "Pending" status by default
- **FR-007**: System MUST provide a user interface to edit existing orders in non-terminal statuses (Pending, Confirmed, Processing, Shipped)
- **FR-008**: System MUST allow editing of customer name, email, shipping address, and notes
- **FR-009**: System MUST prevent editing of orders in terminal statuses (Delivered, Cancelled, Refunded)
- **FR-010**: System MUST track who modified the order and when
- **FR-011**: System MUST provide a user interface to cancel orders in non-terminal statuses
- **FR-012**: System MUST require a cancellation reason when cancelling an order
- **FR-013**: System MUST change order status to "Cancelled" when cancellation is confirmed
- **FR-014**: System MUST prevent cancellation of orders in terminal statuses (Delivered, Cancelled, Refunded)
- **FR-015**: System MUST display clear success and error messages for all operations
- **FR-016**: System MUST validate business rules (stock availability, status transitions) on the backend
- **FR-017**: System MUST have backend mutations for CreateOrder, UpdateOrder, and CancelOrder operations (or create them if missing)
- **FR-018**: System MUST have comprehensive backend unit tests for all command handlers
- **FR-019**: System MUST have integration tests for all mutations
- **FR-020**: System MUST have frontend unit tests for all new UI components and operations
- **FR-021**: System MUST update the orders list view automatically after creating, editing, or cancelling an order
- **FR-022**: System MUST maintain data integrity when creating orders (atomically create order and line items)
- **FR-023**: System MUST prevent creating orders with duplicate order numbers
- **FR-024**: System MUST handle validation errors gracefully and display them to users in the UI

### Key Entities

- **Order**: Represents a customer order with properties including order number, customer information (name, email), shipping address, status, total amount, notes, creation and modification timestamps, and who created/modified it. Contains a collection of order line items.
- **OrderDetail**: Represents a line item within an order, containing product information (ID, name, SKU), quantity, unit price, and calculated line total. Multiple order details belong to one order.
- **OrderStatus**: Enumeration of valid order states (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded) with business rules governing valid transitions between states.
- **Product**: Referenced entity when creating orders - provides product information, stock levels, and pricing used to build order line items.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create a complete new order with customer information and products in under 3 minutes
- **SC-002**: Order creation validates all business rules (stock availability, required fields) and prevents invalid orders from being saved
- **SC-003**: Administrators can edit existing order details and see changes reflected immediately upon saving
- **SC-004**: Order editing is prevented for terminal statuses (Delivered, Cancelled, Refunded) with clear messaging
- **SC-005**: Administrators can cancel orders with a reason and see status change to "Cancelled" immediately
- **SC-006**: All backend mutations (CreateOrder, UpdateOrder, CancelOrder) have unit test coverage of at least 90%
- **SC-007**: All frontend components for order operations have unit tests covering happy paths and error scenarios
- **SC-008**: Integration tests verify end-to-end order creation, editing, and cancellation workflows
- **SC-009**: Form validation provides clear, actionable error messages for all validation failures
- **SC-010**: The orders list view updates automatically after any order operation without requiring manual refresh

## Assumptions

- The backend GraphQL layer already has mutations for CreateOrder, UpdateOrder, and CancelOrder based on codebase exploration (if missing, they will be implemented as part of this feature)
- The backend domain layer has Order aggregate methods for Create, UpdateCustomerInfo, UpdateShippingAddress, and Cancel operations
- The backend application layer has CQRS command handlers for CreateOrderCommand, UpdateOrderCommand, and CancelOrderCommand
- Product stock management is already implemented and will be integrated with order creation
- The frontend uses Angular 19 with standalone components and Apollo GraphQL client
- The frontend follows existing patterns for forms, validation, and service layer architecture
- Authentication and authorization are already in place - this feature does not address who can perform these operations
- The UI will follow Material Design 3 patterns consistent with the existing Angular Material implementation
- Order line items cannot be modified after order creation (only customer info and shipping address can be edited)
- The system operates in a single currency (no multi-currency support needed)
- Email validation follows standard RFC 5322 format
- Shipping addresses are stored as structured data (not free text)

## Dependencies

- Existing Orders GraphQL API (queries, mutations, subscriptions)
- Existing Order domain model and business rules
- Existing Product domain model for stock validation
- Existing Angular orders module and routing
- Apollo GraphQL client configuration
- Angular Material components library
- Backend testing infrastructure (xUnit, NSubstitute, Shouldly)
- Frontend testing infrastructure (Jasmine, Karma)

## Out of Scope

- Modifying order line items after order creation (adding/removing/changing products)
- Bulk order operations (creating/editing/cancelling multiple orders at once)
- Order duplication/cloning functionality
- Advanced search and filtering for products when creating orders
- Real-time collaborative editing warnings
- Order approval workflows
- Integration with external order management systems
- Email notifications for order operations
- Audit trail/history view for order changes
- Permission-based restrictions on who can create/edit/cancel orders (assumes all authenticated users can perform all operations)
- Product stock adjustment after order cancellation (out of scope for this feature)
- Payment handling or refund processing
