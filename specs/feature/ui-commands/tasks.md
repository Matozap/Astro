# Tasks: Remove Mocked Data - Use API for Product Data

**Branch**: `feature/ui-commands` | **Date**: 2026-01-01
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Context**: User request to remove mocked data from client (UI) and use the API instead

## Overview

This task list focuses specifically on replacing the mock data in the Angular frontend with real GraphQL API calls. The ProductService currently has mock data arrays for `getProducts()` and `getProductById()` methods that need to be replaced with Apollo GraphQL queries.

**Current State**:
- GraphQL queries already exist: `GET_PRODUCTS`, `GET_PRODUCT_BY_ID` in `product.queries.ts`
- GraphQL mutations already implemented: create, update, delete, add/remove image
- ProductService methods `getProducts()` and `getProductById()` still use `MOCK_PRODUCTS` array
- Backend API is ready and functional

**Total Tasks**: 14
**Parallel Opportunities**: 6 tasks can run in parallel
**Estimated Effort**: 2-4 hours

## Phase 1: Setup & Verification

**Goal**: Verify backend API is running and accessible before making changes.

- [x] T001 Verify backend API is running via `dotnet run --project server/Astro.AppHost` from repo root
- [x] T002 [P] Verify GraphQL endpoint accessible via browser at configured URL (check `client/src/environments/environment.ts`)
- [x] T003 [P] Verify existing GraphQL queries work by testing GET_PRODUCTS in GraphQL playground or Apollo DevTools

---

## Phase 2: ProductService Query Refactoring

**Goal**: Replace mock data implementations with real GraphQL API calls.

**Independent Test**: Load products list page → Verify products loaded from API (not mock data) → Verify pagination, filtering, and sorting work correctly.

### Update getProducts Method

- [x] T004 Remove MOCK_PRODUCTS array from client/src/app/features/products/services/product.service.ts
- [x] T005 Replace mock implementation in getProducts method with Apollo query using GET_PRODUCTS in client/src/app/features/products/services/product.service.ts
- [x] T006 Update getProducts to properly map GraphQL pagination response (pageInfo, totalCount) to PaginatedResult interface in product.service.ts
- [x] T007 Handle GraphQL filtering variables (where: ProductFilterInput) mapping in getProducts method
- [x] T008 Handle GraphQL sorting variables (order: ProductSortInput) mapping in getProducts method

### Update getProductById Method

- [x] T009 Replace mock implementation in getProductById method with Apollo query using GET_PRODUCT_BY_ID in client/src/app/features/products/services/product.service.ts
- [x] T010 Add proper null handling for productById query response when product not found

---

## Phase 3: Component Verification & Adjustments

**Goal**: Ensure components work correctly with real API data.

- [x] T011 [P] Verify products-list.component.ts works correctly with real API (check data binding, loading states)
- [x] T012 [P] Verify product-detail.component.ts works correctly with real API data (check all fields populated)
- [x] T013 [P] Verify error handling displays properly when API calls fail (check NotificationService integration)

---

## Phase 4: Final Verification

**Goal**: Complete end-to-end validation with real API.

- [x] T014 Manual E2E test: Load products list → Verify products from database displayed → Navigate to product detail → Verify all fields populated from API → Test filtering → Test pagination → Test sorting

---

## Dependencies & Execution Order

### Task Dependencies

```
Phase 1 (Verification)
    ↓
Phase 2 (ProductService Refactoring)
    T004 (remove mock) → T005-T010 (implement API calls)
    ↓
Phase 3 (Component Verification) - All [P] tasks can run in parallel
    ↓
Phase 4 (Final Verification)
```

### Parallel Opportunities

**Within Phase 1**:
- T002 (verify endpoint) and T003 (test queries) can run in parallel

**Within Phase 3**:
- T011, T012, T013 can all run in parallel (different concerns, different files)

---

## Implementation Notes

### Current getProducts Mock Implementation (to be replaced)

```typescript
// REMOVE THIS:
const MOCK_PRODUCTS: Product[] = [...];

getProducts(pagination, filters, sort): Observable<PaginatedResult<Product>> {
  return of(MOCK_PRODUCTS).pipe(delay(500), ...);  // Mock
}
```

### Target getProducts Implementation (with API)

```typescript
getProducts(
  pagination: PaginationParams,
  filters?: ProductFilterInput,
  sort?: ProductSortInput
): Observable<PaginatedResult<Product>> {
  this._loading.set(true);

  return this.apollo
    .watchQuery<{ products: ProductConnection }>({
      query: GET_PRODUCTS,
      variables: {
        first: pagination.pageSize,
        after: pagination.page > 0 ? this.encodeCursor(pagination.page * pagination.pageSize) : null,
        where: filters || null,
        order: sort ? [sort] : null,
      },
      fetchPolicy: 'cache-and-network',
    })
    .valueChanges.pipe(
      map((result) => {
        this._loading.set(false);
        const { nodes, pageInfo, totalCount } = result.data.products;
        return {
          items: nodes,
          totalCount,
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPages: Math.ceil(totalCount / pagination.pageSize),
          hasNextPage: pageInfo.hasNextPage,
          hasPreviousPage: pageInfo.hasPreviousPage,
        };
      }),
      catchError((error) => {
        this._loading.set(false);
        throw error;
      })
    );
}
```

### Current getProductById Mock Implementation (to be replaced)

```typescript
// REMOVE THIS:
getProductById(id: string): Observable<Product | null> {
  return of(MOCK_PRODUCTS.find((p) => p.id === id) || null).pipe(delay(300), ...);  // Mock
}
```

### Target getProductById Implementation (with API)

```typescript
getProductById(id: string): Observable<Product | null> {
  this._loading.set(true);

  return this.apollo
    .watchQuery<{ productById: Product | null }>({
      query: GET_PRODUCT_BY_ID,
      variables: { id },
      fetchPolicy: 'cache-and-network',
    })
    .valueChanges.pipe(
      map((result) => {
        this._loading.set(false);
        return result.data.productById;
      }),
      catchError((error) => {
        this._loading.set(false);
        throw error;
      })
    );
}
```

---

## Task Summary

**Total Tasks**: 14
**Parallelizable Tasks**: 6 (marked with [P])
**Breakdown**:
- Setup/Verification: 3 tasks
- ProductService Refactoring: 7 tasks
- Component Verification: 3 tasks
- Final Verification: 1 task

**Key Changes**:
1. Remove `MOCK_PRODUCTS` array from product.service.ts
2. Replace `getProducts()` mock with Apollo `GET_PRODUCTS` query
3. Replace `getProductById()` mock with Apollo `GET_PRODUCT_BY_ID` query
4. Handle pagination cursor-based approach used by HotChocolate
5. Verify all components work with real API data

---

## Notes

- The GraphQL queries (`GET_PRODUCTS`, `GET_PRODUCT_BY_ID`) already exist in `product.queries.ts`
- HotChocolate uses cursor-based pagination; may need to handle cursor encoding for page offset
- Apollo `watchQuery` with `cache-and-network` fetch policy ensures fresh data while providing cache benefits
- Error handling already integrated via `catchError` pattern used in mutation methods
- Loading signal pattern already established in service and works with real API calls
