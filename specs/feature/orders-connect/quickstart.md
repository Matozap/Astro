# Quickstart: Connect Orders UI to Backend

**Date**: 2026-01-03
**Feature**: Connect Orders UI to Backend
**Branch**: `feature/orders-connect`

## Overview

This guide provides step-by-step instructions for implementing the Orders-to-Backend connection. The feature replaces mock data in the Angular Orders service with real GraphQL API calls.

## Prerequisites

1. Backend server running with Orders GraphQL API enabled
2. Angular client configured with Apollo Angular
3. Familiarity with the Products feature implementation (reference pattern)

## Implementation Steps

### Step 1: Update GraphQL Queries

**File**: `client/src/app/features/orders/graphql/order.queries.ts`

Change from offset-based to cursor-based pagination:

```typescript
// Before (offset-based)
export const GET_ORDERS = gql`
  query GetOrders($skip: Int, $take: Int, ...) {
    orders(skip: $skip, take: $take, ...) { ... }
  }
`;

// After (cursor-based)
export const GET_ORDERS = gql`
  query GetOrders($first: Int, $after: String, ...) {
    orders(first: $first, after: $after, ...) { ... }
  }
`;
```

### Step 2: Update Order Model

**File**: `client/src/app/shared/models/order.model.ts`

Add missing `productSku` field to `OrderDetail` interface:

```typescript
export interface OrderDetail {
  id: string;
  productId: string;
  productName: string;
  productSku: string;  // ADD THIS
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
}
```

### Step 3: Update Order Service

**File**: `client/src/app/features/orders/services/order.service.ts`

Follow the pattern from `product.service.ts`:

1. Remove all mock data (MOCK_ORDERS array)
2. Add `OrderConnection` interface
3. Add cursor storage for pagination
4. Replace mock Observable with Apollo query calls
5. Implement error handling with catchError

Key changes:
- `getOrders()`: Use Apollo query with cursor pagination
- `getOrderById()`: Use Apollo query with filter
- `updateOrderStatus()`: Use Apollo mutation

### Step 4: Update Mutation Query

**File**: `client/src/app/features/orders/graphql/order.queries.ts`

Verify the mutation matches backend expectations:

```typescript
export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($command: UpdateOrderStatusCommandInput!) {
    updateOrderStatus(command: $command) {
      id
      orderNumber
      status
      updatedAt
      modifiedBy
    }
  }
`;
```

### Step 5: Verify Component Compatibility

Components should work without changes since they consume the service:

- `orders-list.component.ts` - Uses `orderService.getOrders()`
- `order-detail.component.ts` - Uses `orderService.getOrderById()`

### Step 6: Add Error Handling

Ensure error messages are displayed to users:

```typescript
// In service
catchError((error) => {
  this._loading.set(false);
  throw error;
})

// In component
this.orderService.getOrders(...).subscribe({
  next: (result) => { ... },
  error: (err) => { this.showError(err); }
});
```

## Testing Checklist

- [ ] Orders list loads from backend
- [ ] Pagination works correctly (next/previous pages)
- [ ] Search filters work (order number, customer name, email)
- [ ] Status filter works
- [ ] Sorting works (click column headers)
- [ ] Order detail view loads correctly
- [ ] Status update mutation works
- [ ] Error states display correctly
- [ ] Loading states display correctly
- [ ] Empty state displays when no orders

## Common Issues

### Issue: "Cannot read property 'nodes' of undefined"
**Solution**: Check that the GraphQL query field names match the backend schema exactly.

### Issue: Pagination not working
**Solution**: Verify cursor storage logic and that `after` parameter is being sent correctly.

### Issue: Status update fails
**Solution**: Check that the mutation input type name matches backend (may be `UpdateOrderStatusCommandInput` or `UpdateOrderStatusInput`).

## Reference Files

| Purpose | File |
|---------|------|
| Reference implementation | `client/src/app/features/products/services/product.service.ts` |
| GraphQL queries | `client/src/app/features/products/graphql/product.queries.ts` |
| Backend GraphQL | `server/Astro.Api/Orders/GraphQL/Query.cs` |
| Backend Mutation | `server/Astro.Api/Orders/GraphQL/Mutation.cs` |
