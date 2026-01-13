# Research: Order Management Commands

**Feature**: Order Management Commands
**Date**: 2026-01-07
**Purpose**: Document technology decisions, patterns, and best practices for implementing order create/edit/cancel functionality

## Backend Research

### Decision 1: Verify Existing Mutations

**Decision**: Use existing CreateOrder, UpdateOrder, and CancelOrder GraphQL mutations

**Rationale**:
- Codebase exploration confirmed these mutations exist in `server/Astro.Api/Orders/GraphQL/Mutation.cs`
- Mutations already follow HotChocolate 15.1.11 patterns and integrate with CQRS via MediatR
- CreateOrder, UpdateOrder, UpdateOrderStatus, and CancelOrder methods are implemented
- All mutations publish to GraphQL subscriptions for real-time updates
- Reusing existing infrastructure reduces implementation risk and maintains consistency

**Alternatives Considered**:
- **Create new mutations**: Rejected because existing mutations already implement required functionality with proper validation and error handling
- **Modify mutation signatures**: Rejected because existing signatures match feature requirements and changing them would break existing consumers

**Implementation Notes**:
- Verify CreateOrderCommand accepts all required fields (customer info, shipping address, order details)
- Verify UpdateOrderCommand allows updating customer name, email, shipping address, and notes
- Verify CancelOrderCommand accepts reason parameter
- Check validators for completeness against FR-002 validation requirements

### Decision 2: Command Validation Strategy

**Decision**: Use FluentValidation validators for all commands with comprehensive rules

**Rationale**:
- FluentValidation 12.1.1 already integrated in the codebase
- Provides declarative validation rules that are easy to test and maintain
- Validators execute before command handlers via MediatR pipeline behavior
- Supports complex validation scenarios (async validation, custom rules, conditional validation)
- Clear error messages can be returned to frontend for user feedback

**Alternatives Considered**:
- **Data annotations**: Rejected because FluentValidation is more expressive and easier to test
- **Manual validation in handlers**: Rejected because it violates separation of concerns and makes testing harder
- **Frontend-only validation**: Rejected because backend must validate for security and data integrity

**Validation Rules to Implement**:
- Customer name: Required, max 200 characters
- Email: Required, valid email format (RFC 5322)
- Shipping address: All components required (street, city, state, postal code, country)
- Order details: At least one item required
- Product quantity: Must be > 0
- Product availability: Check product exists and is active
- Stock levels: Async validation against Product repository
- Order status: Validate transitions for UpdateOrder (cannot update terminal statuses)
- Cancellation reason: Required for CancelOrder, max 500 characters

### Decision 3: Unit Testing Approach

**Decision**: Follow existing test patterns using xUnit, NSubstitute, and Shouldly

**Rationale**:
- Consistent with existing backend test infrastructure
- NSubstitute provides clean mocking syntax for dependencies
- Shouldly provides expressive assertions that read like English
- Tests exist for CreateOrderCommandHandler demonstrating the pattern
- Pattern: Mock dependencies → Setup → Execute → Assert with Shouldly → Verify

**Test Coverage Requirements**:
- Command handlers: Happy path, validation failures, business rule violations, exceptions
- Validators: All validation rules (individual and combinations)
- Domain methods: Order.Create(), Order.UpdateCustomerInfo(), Order.UpdateShippingAddress(), Order.Cancel()
- Edge cases: Concurrent updates, stock depletion during order creation, invalid state transitions

**Test Organization**:
```
Astro.Tests/Orders/
├── Application/
│   ├── CreateOrderCommandHandlerTests.cs
│   ├── CreateOrderCommandValidatorTests.cs
│   ├── UpdateOrderCommandHandlerTests.cs
│   ├── UpdateOrderCommandValidatorTests.cs
│   ├── CancelOrderCommandHandlerTests.cs
│   └── CancelOrderCommandValidatorTests.cs
└── Domain/
    └── OrderTests.cs
```

### Decision 4: Error Handling Strategy

**Decision**: Use domain exceptions with GraphQL error propagation

**Rationale**:
- Existing codebase uses custom exceptions (OrderNotFoundException, ProductNotAvailableException, InsufficientStockException)
- HotChocolate automatically maps exceptions to GraphQL errors
- Provides structured error information to frontend (error codes, messages, extensions)
- Maintains Clean Architecture by keeping domain exceptions in Domain layer

**Error Types**:
- **Validation Errors**: FluentValidation returns structured validation failures
- **Business Rule Violations**: Domain throws InvalidOperationException with clear messages
- **Not Found**: Throw OrderNotFoundException or ProductNotFoundException
- **Concurrency**: Handle optimistic concurrency exceptions from EF Core

**Frontend Error Handling**:
- Apollo GraphQL client provides error objects in mutation responses
- Display user-friendly error messages based on error codes
- Show field-level validation errors in forms
- Global error handling for network failures and unexpected errors

## Frontend Research

### Decision 5: Angular Form Strategy

**Decision**: Use Angular Reactive Forms with FormBuilder and custom validators

**Rationale**:
- Reactive Forms provide better testability than template-driven forms
- FormBuilder reduces boilerplate for complex forms
- Custom validators can implement business logic (e.g., at least one product required)
- Form state management (dirty, touched, valid) works well with Material Design patterns
- Easy integration with Apollo GraphQL for async validation (stock checks)

**Form Structure**:
- **CreateOrderForm**: Customer info group, shipping address group, order items FormArray
- **EditOrderForm**: Similar structure but with pre-populated values and read-only order number
- **CancelOrderDialog**: Simple form with reason textarea and required validator

**Validation Approach**:
- Synchronous validators for format validation (email, required fields)
- Async validators for backend validation (product availability, stock levels)
- Display validation errors using Angular Material form field error messages
- Disable submit button when form invalid

### Decision 6: Angular Material Component Selection

**Decision**: Use Material Design 3 components from Angular Material 19.x

**Rationale**:
- Already integrated in the codebase (used in existing orders-list and order-detail components)
- Provides consistent UI/UX with existing application
- M3 components include updated typography, color system, and accessibility
- Form components: mat-form-field, mat-input, mat-select, mat-autocomplete (for product search)
- Layout: mat-card for form containers, mat-stepper optional for multi-step create
- Dialogs: mat-dialog for cancel confirmation with mat-dialog-actions

**Component Choices**:
- **Customer Info**: mat-form-field with mat-input for name and email
- **Shipping Address**: mat-form-field with mat-input for each address component
- **Product Selection**: mat-autocomplete for product search, mat-table for selected products
- **Quantity**: mat-form-field with mat-input type="number" and +/- buttons
- **Notes**: mat-form-field with textarea
- **Actions**: mat-raised-button (primary) for submit, mat-button for cancel
- **Cancel Dialog**: mat-dialog with mat-form-field (textarea) and mat-dialog-actions

### Decision 7: Apollo GraphQL Integration

**Decision**: Use Apollo Angular 13.0 with typed GraphQL operations

**Rationale**:
- Already configured in the application (used by existing order.service.ts)
- Provides type safety with generated TypeScript types from GraphQL schema
- Apollo Client handles caching, optimistic UI, error handling, and loading states
- Mutations return typed response with data and errors
- InMemoryCache automatically updates queries after mutations

**GraphQL Patterns**:
- Define mutations in `order.queries.ts` using `gql` tag
- Use Apollo Angular service's `mutate()` method in order.service
- Leverage Apollo cache updates to refresh orders list after create/edit/cancel
- Use `optimisticResponse` for immediate UI feedback on mutations
- Handle GraphQL errors via Apollo error policies

**Mutation Structure**:
```graphql
mutation CreateOrder($input: CreateOrderCommandInput!) {
  createOrder(input: $input) {
    id
    orderNumber
    customerName
    # ... all order fields
  }
}

mutation UpdateOrder($input: UpdateOrderCommandInput!) {
  updateOrder(input: $input) {
    id
    customerName
    # ... updated fields
  }
}

mutation CancelOrder($input: CancelOrderCommandInput!) {
  cancelOrder(input: $input) {
    id
    status
    # ... relevant fields
  }
}
```

### Decision 8: Component Architecture

**Decision**: Standalone components with signal-based reactive state

**Rationale**:
- Angular 19 recommends standalone components (existing components use this pattern)
- Signals provide fine-grained reactivity and better performance than Zone.js
- Simplifies testing by reducing module configuration overhead
- Component composition via inputs/outputs promotes reusability

**Component Breakdown**:
- **order-create.component**: Full-page form component with routing
- **order-edit.component**: Full-page form component with routing
- **cancel-order-dialog.component**: Dialog component invoked from order-detail
- **order-detail.component**: Add "Edit Order" and "Cancel Order" buttons based on status
- **orders-list.component**: Add "Create Order" button in toolbar

**State Management**:
- Use Angular signals for reactive state (loading, error, order data)
- OrderService encapsulates all backend communication
- Components remain presentational, delegating business logic to service layer

### Decision 9: Frontend Unit Testing Strategy

**Decision**: Use Jasmine/Karma with TestBed and spy objects

**Rationale**:
- Default Angular testing framework (Jasmine + Karma)
- Existing products components demonstrate the pattern
- TestBed configures component dependencies for isolated testing
- Spy objects mock services (Apollo GraphQL, OrderService)
- fakeAsync and tick() for testing async operations

**Test Coverage Requirements**:
- Component behavior: Button clicks, form validation, error display, success messages
- Service methods: GraphQL mutations called with correct parameters, error handling
- Form validation: Required fields, email format, at least one product
- User flows: Create order → redirect to detail, Edit order → save → display updates
- Edge cases: Network failures, validation errors, concurrent updates

**Test Organization**:
```
client/src/app/features/orders/
├── components/
│   ├── order-create/
│   │   └── order-create.component.spec.ts
│   ├── order-edit/
│   │   └── order-edit.component.spec.ts
│   └── cancel-order-dialog/
│       └── cancel-order-dialog.component.spec.ts
├── order-detail/
│   └── order-detail.component.spec.ts
├── orders-list/
│   └── orders-list.component.spec.ts
└── services/
    └── order.service.spec.ts
```

### Decision 10: Routing Strategy

**Decision**: Add /orders/create and /orders/:id/edit routes with route guards

**Rationale**:
- Consistent with existing routing patterns (/orders, /orders/:id)
- Separate routes for create and edit provide clear navigation
- Route parameters (:id) pass order ID to edit component
- ActivatedRoute provides access to route parameters for data loading
- Guards prevent unauthorized access (can be added later if needed)

**Routes to Add**:
```typescript
{
  path: 'orders',
  children: [
    { path: '', component: OrdersListComponent },
    { path: 'create', component: OrderCreateComponent },
    { path: ':id', component: OrderDetailComponent },
    { path: ':id/edit', component: OrderEditComponent }
  ]
}
```

**Navigation Flows**:
- Orders list → Click "Create Order" → /orders/create
- Order detail → Click "Edit Order" → /orders/:id/edit
- Create success → Navigate to /orders/:id (new order detail)
- Edit success → Navigate to /orders/:id (updated order detail)
- Cancel → Navigate back to previous page

## Integration Considerations

### GraphQL Schema Alignment

- Backend GraphQL schema must expose all required input types
- Frontend TypeScript types generated from schema ensure type safety
- Input types: CreateOrderCommandInput, UpdateOrderCommandInput, CancelOrderCommandInput
- Response types: Order with all fields defined in data-model.md

### Cache Update Strategy

- After createOrder mutation: Apollo cache automatically adds to orders list
- After updateOrder mutation: Apollo cache updates existing order in cache
- After cancelOrder mutation: Apollo cache updates order status
- Use `refetchQueries` if automatic cache updates don't cover all cases
- Optimistic updates for immediate UI feedback before server response

### Error Message Mapping

- Backend validation errors map to form field errors
- Backend business rule violations display as toast/snackbar messages
- Network errors trigger global error handler
- GraphQL error extensions provide additional context (error codes, field paths)

## Summary

All technical decisions align with existing codebase patterns and constitutional principles:

- **Backend**: Reuse existing GraphQL mutations, CQRS commands, FluentValidation validators, and xUnit test patterns
- **Frontend**: Angular Reactive Forms, Material Design 3 components, Apollo GraphQL, standalone components with signals, Jasmine/Karma tests
- **Integration**: GraphQL schema as contract, Apollo cache management, structured error handling

No new technologies introduced. Implementation focuses on building UI components, adding missing backend tests, and wiring frontend to existing backend infrastructure.

**Next Steps**: Proceed to Phase 1 (data-model.md, contracts, quickstart.md)
