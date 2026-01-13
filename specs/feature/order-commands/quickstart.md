# Quickstart: Order Management Commands

**Feature**: Order Management Commands
**Date**: 2026-01-07
**Purpose**: Developer setup guide for implementing order create/edit/cancel functionality

## Overview

This feature adds UI components for creating, editing, and cancelling orders by connecting to existing backend GraphQL mutations. The backend already has the necessary infrastructure (mutations, commands, handlers, domain logic), so the primary work is frontend development and adding missing tests.

## Prerequisites

### Backend Requirements

- .NET 10.0 SDK installed
- PostgreSQL database running (via .NET Aspire)
- Backend solution builds successfully
- Existing Orders domain, application, and API layers verified

### Frontend Requirements

- Node.js 20+ and npm installed
- Angular CLI 19.x installed (`npm install -g @angular/cli@19`)
- Frontend project builds successfully (`npm install && ng build`)

### Development Tools

- IDE: Visual Studio 2022 (backend) or Visual Studio Code (both)
- GraphQL client: Banana Cake Pop or GraphQL Playground
- Browser: Chrome, Firefox, or Edge with DevTools

## Setup Steps

### 1. Clone and Build

```bash
# Navigate to repository root
cd D:\Local\src\Matozap\Astro

# Restore backend packages
cd server
dotnet restore
dotnet build

# Restore frontend packages
cd ../client
npm install
npm run build
```

### 2. Start Development Environment

```bash
# Option 1: Use .NET Aspire AppHost (recommended)
cd server/Astro.AppHost
dotnet run

# This will start:
# - Backend API (GraphQL endpoint)
# - PostgreSQL database
# - Frontend dev server
# - Aspire dashboard (http://localhost:15888)

# Option 2: Start separately
# Terminal 1 - Backend
cd server/Astro.Api
dotnet run

# Terminal 2 - Frontend
cd client
ng serve
```

### 3. Verify Existing Backend

Open GraphQL endpoint (typically `http://localhost:5000/graphql`) and verify mutations exist:

```graphql
mutation TestCreateOrder {
  createOrder(input: {
    customerName: "Test Customer"
    customerEmail: "test@example.com"
    shippingAddress: {
      street: "123 Main St"
      city: "Anytown"
      state: "CA"
      postalCode: "12345"
      country: "USA"
    }
    details: [
      { productId: "some-product-guid", quantity: 2 }
    ]
    createdBy: "test-user"
  }) {
    id
    orderNumber
    status
    totalAmount
  }
}
```

**Expected Result**: Order created with status PENDING and generated order number.

If mutation doesn't exist or fails, check:
- `server/Astro.Api/Orders/GraphQL/Mutation.cs` - CreateOrder method
- `server/Astro.Application/Orders/Commands/CreateOrder/` - Command, handler, validator
- Database has Products seeded (needed for testing)

### 4. Review Existing Frontend Code

Navigate to `client/src/app/features/orders/` and review:

- **orders-list.component.ts**: Paginated orders list (needs "Create Order" button)
- **order-detail.component.ts**: Order details view (needs "Edit" and "Cancel" buttons)
- **order.service.ts**: GraphQL service (needs create, update, cancel methods)
- **order.queries.ts**: GraphQL operations (needs mutation definitions)

### 5. Run Existing Tests

```bash
# Backend tests
cd server/Astro.Tests
dotnet test

# Frontend tests
cd client
ng test
```

**Expected Backend Results**:
- CreateOrderCommandHandlerTests: Pass
- OrderTests (domain): Pass
- Other tests: Verify UpdateOrder and CancelOrder handler tests exist

**Expected Frontend Results**:
- Product tests: Pass
- Orders tests: Currently minimal or missing (will be added in this feature)

## Development Workflow

### Backend Development (if needed)

1. **Verify/Create Command Validators**:
   ```bash
   # Check if validators exist
   ls server/Astro.Application/Orders/Commands/*/

   # Expected files:
   # - CreateOrderCommandValidator.cs
   # - UpdateOrderCommandValidator.cs
   # - CancelOrderCommandValidator.cs
   ```

2. **Add Missing Tests**:
   ```bash
   # Create test files if missing
   cd server/Astro.Tests/Orders/Application

   # Create UpdateOrderCommandHandlerTests.cs
   # Create CancelOrderCommandHandlerTests.cs
   # Create validator tests
   ```

3. **Run Tests After Changes**:
   ```bash
   cd server/Astro.Tests
   dotnet test --filter "FullyQualifiedName~Orders"
   ```

### Frontend Development

1. **Generate New Components**:
   ```bash
   cd client/src/app/features/orders

   # Create order-create component
   ng generate component components/order-create --standalone

   # Create order-edit component
   ng generate component components/order-edit --standalone

   # Create cancel-order-dialog component
   ng generate component components/cancel-order-dialog --standalone
   ```

2. **Add GraphQL Mutations**:
   Edit `client/src/app/features/orders/graphql/order.queries.ts`:
   ```typescript
   import { gql } from '@apollo/client/core';

   export const CREATE_ORDER = gql`
     mutation CreateOrder($input: CreateOrderCommandInput!) {
       createOrder(input: $input) {
         id
         orderNumber
         customerName
         # ... all fields
       }
     }
   `;

   // Add UPDATE_ORDER and CANCEL_ORDER mutations
   ```

3. **Update Order Service**:
   Edit `client/src/app/features/orders/services/order.service.ts`:
   ```typescript
   createOrder(input: CreateOrderCommandInput): Observable<Order> {
     return this.apollo.mutate<{ createOrder: Order }>({
       mutation: CREATE_ORDER,
       variables: { input }
     }).pipe(
       map(result => result.data!.createOrder)
     );
   }

   // Add updateOrder() and cancelOrder() methods
   ```

4. **Implement Components**:
   - Build forms with Angular Reactive Forms
   - Use Angular Material components
   - Add validation and error handling
   - Implement navigation on success

5. **Add Routes**:
   Edit `client/src/app/app.routes.ts`:
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

6. **Create Unit Tests**:
   For each component, create `.spec.ts` file:
   ```typescript
   describe('OrderCreateComponent', () => {
     let component: OrderCreateComponent;
     let fixture: ComponentFixture<OrderCreateComponent>;
     let orderService: jasmine.SpyObj<OrderService>;

     beforeEach(async () => {
       const orderServiceSpy = jasmine.createSpyObj('OrderService', ['createOrder']);

       await TestBed.configureTestingModule({
         imports: [OrderCreateComponent],
         providers: [
           { provide: OrderService, useValue: orderServiceSpy }
         ]
       }).compileComponents();

       orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
     });

     // Add test cases
   });
   ```

7. **Run Tests**:
   ```bash
   cd client
   ng test --include='**/orders/**/*.spec.ts'
   ```

## Testing the Feature

### Manual Testing Checklist

**Create Order Flow**:
1. Navigate to `/orders`
2. Click "Create Order" button
3. Fill in customer name, email, shipping address
4. Add at least one product with quantity
5. Click "Create Order"
6. Verify redirect to order detail page
7. Verify order appears in orders list

**Edit Order Flow**:
1. Navigate to existing order in "Pending" or "Confirmed" status
2. Click "Edit Order" button
3. Modify customer name or shipping address
4. Click "Save"
5. Verify updates reflected in order detail
6. Verify "Edit Order" button hidden for terminal statuses

**Cancel Order Flow**:
1. Navigate to existing order in non-terminal status
2. Click "Cancel Order" button
3. Enter cancellation reason in dialog
4. Click "Confirm"
5. Verify order status changes to "Cancelled"
6. Verify "Cancel Order" button hidden for terminal statuses

### Automated Testing

Run full test suite before committing:

```bash
# Backend tests
cd server/Astro.Tests
dotnet test

# Frontend tests
cd client
ng test --watch=false --code-coverage

# Check coverage
open client/coverage/index.html
```

**Coverage Goals**:
- Backend command handlers: 90%+
- Backend validators: 100%
- Frontend components: 80%+
- Frontend services: 90%+

## Common Issues and Solutions

### Backend Issues

**Issue**: CreateOrder mutation fails with "Product not found"
**Solution**: Seed products in database. Check `server/Astro.Infrastructure/Data/Seed.cs`

**Issue**: Validation errors not returned properly
**Solution**: Verify FluentValidation validators exist and MediatR pipeline behavior configured

**Issue**: Tests fail with "DbContext disposed"
**Solution**: Mock IUnitOfWork and IOrderRepository correctly, don't use real DbContext in unit tests

### Frontend Issues

**Issue**: GraphQL mutation returns 400 Bad Request
**Solution**: Check input variable types match schema exactly. Verify GraphQL endpoint URL correct.

**Issue**: Apollo cache not updating after mutation
**Solution**: Add `refetchQueries: ['GetOrders']` to mutation options or use cache update function

**Issue**: Form validation not working
**Solution**: Verify reactive forms setup, validators added to form controls, error handling in template

**Issue**: Material components not rendering
**Solution**: Import Material modules in component, verify Angular Material installed correctly

## Architecture Decisions

### Why Reactive Forms?
Better testability, type safety, and form state management than template-driven forms.

### Why Apollo GraphQL?
Already integrated, provides caching, optimistic UI, and error handling out of the box.

### Why No Schema Changes?
Entities already exist with all required fields. No new data model needed.

### Why Verify Existing Mutations First?
Codebase exploration found mutations exist. Reusing them reduces risk and maintains consistency.

## Next Steps

After completing this quickstart:

1. Review `data-model.md` for entity relationships and validation rules
2. Review `contracts/mutations.graphql` for GraphQL schema
3. Review `contracts/typescript-types.ts` for TypeScript type definitions
4. Proceed to `/speckit.tasks` to generate implementation tasks
5. Follow task breakdown to implement feature incrementally

## Resources

- **GraphQL Playground**: `http://localhost:5000/graphql`
- **Aspire Dashboard**: `http://localhost:15888`
- **Frontend Dev Server**: `http://localhost:4200`
- **HotChocolate Docs**: https://chillicream.com/docs/hotchocolate
- **Angular Material Docs**: https://material.angular.io/
- **Apollo Angular Docs**: https://apollo-angular.com/

## Support

If you encounter issues:

1. Check console logs (browser DevTools and terminal)
2. Verify all prerequisites met
3. Review existing code patterns in products feature
4. Check GraphQL schema matches contracts
5. Ensure database seeded with test data

For architecture questions, refer to `.specify/memory/constitution.md` for project principles and standards.
