# Research: Connect Orders UI to Backend

**Date**: 2026-01-03
**Feature**: Connect Orders UI to Backend
**Branch**: `feature/orders-connect`

## Research Summary

This feature requires connecting the Angular Orders UI to the existing backend GraphQL API. The backend is fully implemented and the frontend has GraphQL queries already defined. The main work is replacing mock data in the OrderService with real Apollo GraphQL calls.

## Key Findings

### 1. Backend API Analysis

**Decision**: Use the existing backend GraphQL Orders API as-is - no backend changes required.

**Rationale**: The backend Orders module is complete with:
- GraphQL Query: `GetOrders` with pagination, filtering, and sorting via HotChocolate
- GraphQL Mutations: `CreateOrder`, `UpdateOrder`, `UpdateOrderStatus`, `CancelOrder`
- GraphQL Subscriptions: Real-time order events

**Alternatives Considered**:
- Creating a new simplified endpoint: Rejected because existing endpoint provides all needed functionality
- Modifying backend types: Rejected because existing types match frontend requirements

### 2. Frontend GraphQL Query Compatibility

**Decision**: Modify existing `order.queries.ts` to use cursor-based pagination (currently uses skip/take offset pagination).

**Rationale**:
- The products feature uses cursor-based pagination (`first`/`after` parameters)
- The current order queries use offset pagination (`skip`/`take` parameters)
- For consistency and proper pagination behavior, orders should match products pattern

**Changes Required**:
```graphql
# Current (offset-based):
query GetOrders($skip: Int, $take: Int, $where: OrderFilterInput, $order: [OrderSortInput!])

# Target (cursor-based, matches products):
query GetOrders($first: Int, $after: String, $where: OrderFilterInput, $order: [OrderSortInput!])
```

### 3. Data Model Alignment

**Decision**: Use existing frontend Order model with minor field name normalization.

**Rationale**: Comparison of backend vs frontend models:

| Field | Backend | Frontend | Status |
|-------|---------|----------|--------|
| id | Guid | string | COMPATIBLE |
| orderNumber | OrderNumber.Value (string) | string | COMPATIBLE |
| customerName | string | string | COMPATIBLE |
| customerEmail | Email.Value (string) | string | COMPATIBLE |
| shippingAddress | Address (value object) | Address | COMPATIBLE |
| status | OrderStatus (enum) | OrderStatus (type) | COMPATIBLE |
| totalAmount | Money (value object) | Money | COMPATIBLE |
| notes | string? | string \| null | COMPATIBLE |
| details | OrderDetail[] | OrderDetail[] | COMPATIBLE |
| itemCount | computed (sum of details.quantity) | number | COMPATIBLE |
| createdAt | DateTimeOffset | string (ISO) | COMPATIBLE |
| updatedAt | DateTimeOffset? | string | COMPATIBLE |
| createdBy | string | string | COMPATIBLE |
| modifiedBy | string? | string | COMPATIBLE |

### 4. OrderDetail Model Alignment

| Field | Backend | Frontend | Status |
|-------|---------|----------|--------|
| id | Guid | string | COMPATIBLE |
| productId | Guid | string | COMPATIBLE |
| productName | string | string | COMPATIBLE |
| productSku | string | NOT IN FRONTEND | ADD TO MODEL |
| quantity | int | number | COMPATIBLE |
| unitPrice | Money | Money | COMPATIBLE |
| lineTotal | Money (computed) | Money | COMPATIBLE |

**Note**: Backend includes `productSku` which frontend model lacks. This field should be added to the frontend model for completeness.

### 5. Pattern Reference: Product Service Implementation

**Decision**: Follow the exact pattern from `product.service.ts` for consistency.

**Key Patterns to Replicate**:
1. **Connection Type Interface**: Define `OrderConnection` matching `ProductConnection`
2. **Cursor Storage**: Use `Map<number, string>` for storing page cursors
3. **Query Execution**: Use `apollo.query()` with `fetchPolicy: 'network-only'`
4. **Error Handling**: Wrap with `catchError()` and set `_loading` signal to false
5. **Response Mapping**: Map GraphQL connection response to `PaginatedResult`

### 6. Update Order Status Mutation

**Decision**: Use `UpdateOrderStatusCommand` which requires `OrderId`, `NewStatus`, and `ModifiedBy`.

**Rationale**: The existing frontend mutation structure aligns with backend:
```graphql
mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
  updateOrderStatus(input: $input) {
    order { id, status, updatedAt }
    errors { ... on Error { message } }
  }
}
```

**Note**: The backend mutation takes `UpdateOrderStatusCommand` not `UpdateOrderStatusInput`. The GraphQL layer may auto-generate the input type. Need to verify exact input type name.

### 7. Order Query for Single Order

**Decision**: Use `GetOrderById` query with `order(id: UUID!)` resolver.

**Current Query Analysis**:
```graphql
query GetOrderById($id: UUID!) {
  order(id: $id) { ... }
}
```

**Backend Check Required**: Verify if `order(id:)` resolver exists or if we need to use `orders(where: {id: {eq: $id}})` pattern like products.

## Implementation Decisions Summary

| Decision | Choice | Justification |
|----------|--------|---------------|
| Pagination Style | Cursor-based | Consistency with products feature |
| Query Pattern | Direct Apollo calls | Matches existing product service |
| Error Handling | catchError + loading signal | Consistent UX pattern |
| Status Updates | GraphQL mutation | Already defined and compatible |
| Single Order Query | Verify backend resolver | May need filter-based approach |

## Open Items

1. **Verify Single Order Resolver**: Check if backend has direct `order(id:)` resolver or needs filter approach
2. **Verify Mutation Input Type**: Confirm exact name of update status input type
3. **Add productSku to Frontend Model**: Update `OrderDetail` interface

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Query incompatibility | Low | Medium | Backend API verified, minor adjustments if needed |
| Pagination cursor issues | Low | Low | Pattern proven in products feature |
| Status transition errors | Low | Medium | Backend validates state machine, frontend displays errors |
