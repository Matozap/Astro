# Implementation Plan: Product Management with Safe Deletion

**Branch**: `feature/ui-commands` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/feature/ui-commands/spec.md`

## Summary

This plan implements comprehensive product management UI capabilities in the Angular admin frontend, including product CRUD operations with intelligent delete/deactivate behavior based on order usage. The system prevents deletion of products referenced in historical orders, offering deactivation instead to maintain data integrity. The implementation includes multi-image management with primary image designation, URL-based cloud storage support (AWS/Azure), and validation to ensure business rules are enforced.

The plan consists of two parallel tracks:
1. **Backend**: Add order-usage validation to DeleteProduct mutation (currently missing)
2. **Frontend**: Build complete product management UI with forms, dialogs, image management, and GraphQL integration

## Technical Context

**Language/Version**: TypeScript 5.6+ / Angular 19.x (Frontend), C# 14.0 / .NET 10.0 (Backend)
**Primary Dependencies**:
- Frontend: Angular Material 19 (M3), Apollo Angular 8.x, RxJS 7.x, standalone components
- Backend: HotChocolate 15.1.11 (GraphQL), MediatR, FluentValidation 12.1.1, EF Core (PostgreSQL)

**Storage**: PostgreSQL via EF Core with code-first migrations (backend only)
**Testing**: Frontend: Jest/Jasmine, Backend: xUnit with Shouldly and NSubstitute
**Target Platform**: Web (Angular SPA served via .NET Aspire AppHost)
**Project Type**: Modular monolith with separate frontend (client/) and backend (server/) modules
**Performance Goals**:
- Product creation/editing forms complete within 3 seconds
- Image management operations complete within 1 second
- Deletion validation completes within 2 seconds

**Constraints**:
- Must maintain Clean Architecture and DDD patterns (per constitution)
- Must follow CQRS with MediatR commands/queries
- Frontend must use standalone components (no NgModule)
- Backend must use code-first EF Core migrations
- Zero historical orders can be affected by product operations

**Scale/Scope**:
- Admin-only features (authenticated users with admin role)
- Expected product catalog: thousands of products
- Expected concurrent admins: 5-10
- Image URLs only (no file uploads in this phase)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Backend Compliance

✅ **Clean Architecture & DDD**:
- Existing Product aggregate properly encapsulates business rules
- New validation logic will be added to DeleteProductCommandHandler (Application layer)
- Repository pattern already implemented for Products and Orders
- No violations - adding validation follows existing patterns

✅ **CQRS Pattern**:
- All existing product mutations use Command pattern with handlers and validators
- New validation will extend DeleteProductCommandHandler
- No new commands/queries needed - only enhancement to existing handler
- No violations

✅ **Unit Test Coverage**:
- DeleteProductCommandHandler currently has basic tests
- Will add unit tests for new order-usage validation logic
- Tests will mock IOrderRepository to verify validation behavior
- No violations - following existing test patterns

✅ **. NET Aspire Platform**:
- Products API already integrated with Aspire AppHost
- No new services being added
- No violations

✅ **Entity Framework Core**:
- Will use existing OrdersDbContext to query OrderDetail records
- No schema changes required (ProductId already exists in OrderDetail)
- No migrations needed for this feature
- No violations

✅ **Modular Monolith Architecture**:
- Product management is within Products module (Products.Domain, Products.Application, Products.Api)
- Order-usage check will query through IOrderRepository interface (proper inter-module communication)
- No direct database access across modules
- No violations

### Frontend Compliance

**Note**: Frontend does not have a constitution, but follows Angular best practices:
- Standalone components (Angular 19 standard)
- Signal-based reactivity
- Feature-based organization (features/products/)
- Shared components for reusable UI (data-table, dialogs)
- Apollo Angular for GraphQL (type-safe generated operations)
- Reactive forms with validation

**Status**: ✅ **ALL CHECKS PASS** - No constitution violations. Implementation follows established patterns.

## Project Structure

### Documentation (this feature)

```text
specs/feature/ui-commands/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (already created)
├── research.md          # Phase 0 output (backend mutations research - generated below)
├── data-model.md        # Phase 1 output (GraphQL schema documentation - generated below)
├── quickstart.md        # Phase 1 output (implementation guide - generated below)
├── contracts/           # Phase 1 output (GraphQL operations - generated below)
│   ├── create-product.graphql
│   ├── update-product.graphql
│   ├── delete-product.graphql
│   ├── add-product-image.graphql
│   ├── remove-product-image.graphql
│   └── check-product-usage.graphql (NEW)
├── checklists/
│   └── requirements.md  # Requirements checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Backend (server/)
server/
├── Astro.Domain/
│   ├── Orders/
│   │   ├── Entities/
│   │   │   └── OrderDetail.cs (EXISTING - contains ProductId reference)
│   │   └── Repositories/
│   │       └── IOrderRepository.cs (EXISTING - will add HasProductOrders method)
│   └── Products/
│       ├── Entities/
│       │   ├── Product.cs (EXISTING)
│       │   └── ProductImage.cs (EXISTING)
│       └── Enums/
│           └── StorageMode.cs (EXISTING - AWS, Azure, Url)
├── Astro.Application/
│   ├── Orders/
│   │   └── Queries/ (may add GetProductUsageQuery if needed)
│   └── Products/
│       ├── Commands/
│       │   ├── CreateProduct/ (EXISTING)
│       │   ├── UpdateProduct/ (EXISTING)
│       │   ├── DeleteProduct/
│       │   │   ├── DeleteProductCommand.cs (EXISTING)
│       │   │   ├── DeleteProductCommandHandler.cs (MODIFY - add validation)
│       │   │   └── DeleteProductCommandHandlerTests.cs (MODIFY - add tests)
│       │   ├── AddProductImage/ (EXISTING)
│       │   └── RemoveProductImage/ (EXISTING)
│       └── Exceptions/
│           └── ProductInUseException.cs (NEW - thrown when product can't be deleted)
├── Astro.Infrastructure/
│   └── Orders/
│       └── Repositories/
│           └── OrderRepository.cs (MODIFY - add HasProductOrders method)
└── Astro.Api/
    └── Products/
        └── GraphQL/
            ├── Mutation.cs (MODIFY - add error handling for ProductInUseException)
            └── ProductInUseError.cs (NEW - GraphQL error type)

# Frontend (client/)
client/src/app/
├── features/
│   └── products/
│       ├── graphql/
│       │   ├── product.queries.ts (EXISTING)
│       │   ├── product.mutations.ts (NEW - create, update, delete, deactivate)
│       │   └── product.fragments.ts (NEW - reusable GraphQL fragments)
│       ├── services/
│       │   └── product.service.ts (MODIFY - replace mock with real GraphQL)
│       ├── products-list/
│       │   ├── products-list.component.ts (MODIFY - add action buttons)
│       │   ├── products-list.component.html (MODIFY - add buttons, integrate dialogs)
│       │   └── products-list.component.scss (EXISTING)
│       ├── product-detail/
│       │   ├── product-detail.component.ts (MODIFY - add edit mode)
│       │   ├── product-detail.component.html (MODIFY - add edit form)
│       │   └── product-detail.component.scss (EXISTING)
│       ├── product-form/ (NEW - shared create/edit form component)
│       │   ├── product-form.component.ts
│       │   ├── product-form.component.html
│       │   ├── product-form.component.scss
│       │   └── product-form.component.spec.ts
│       ├── image-manager/ (NEW - image management component)
│       │   ├── image-manager.component.ts
│       │   ├── image-manager.component.html
│       │   ├── image-manager.component.scss
│       │   └── image-manager.component.spec.ts
│       └── dialogs/ (NEW - confirmation dialogs)
│           ├── delete-confirm-dialog/
│           │   ├── delete-confirm-dialog.component.ts
│           │   ├── delete-confirm-dialog.component.html
│           │   └── delete-confirm-dialog.component.scss
│           └── deactivate-confirm-dialog/
│               ├── deactivate-confirm-dialog.component.ts
│               ├── deactivate-confirm-dialog.component.html
│               └── deactivate-confirm-dialog.component.scss
└── shared/
    ├── models/
    │   └── product.model.ts (EXISTING - may need updates)
    └── components/
        └── data-table/ (EXISTING - already used)

# Tests
e2e/Astro.IntegrationTests/
└── Products/
    ├── ProductTests.cs (MODIFY - add delete validation tests)
    └── Payloads/
        └── DeleteProduct.graphql (EXISTING)

tests/ (Frontend)
└── products/
    ├── product-form.component.spec.ts (NEW)
    ├── image-manager.component.spec.ts (NEW)
    └── product.service.spec.ts (MODIFY)
```

**Structure Decision**: This is a web application with separate frontend (Angular SPA in `client/`) and backend (.NET modular monolith in `server/`). The backend follows Clean Architecture with Domain, Application, Infrastructure, and API layers organized by module (Products, Orders). The frontend follows feature-based organization with standalone components. Both structures are already established and this feature extends them without structural changes.

## Complexity Tracking

> **No violations to justify** - All implementation follows existing patterns and constitution principles.

## Phase 0: Research

**Objective**: Document existing backend mutations and frontend patterns to inform implementation.

### Backend Research

**Existing GraphQL Mutations** (`server/Astro.Api/Products/GraphQL/Mutation.cs`):

1. **CreateProduct**
   - Command: `CreateProductCommand(Name, Description, Price, Sku, StockQuantity, LowStockThreshold, IsActive, CreatedBy, Details)`
   - Returns: `Product`
   - Validation: FluentValidation via `CreateProductCommandValidator`
   - Errors: `ValidationException`

2. **UpdateProduct**
   - Command: `UpdateProductCommand(Id, Name, Description, Price, Sku, StockQuantity, LowStockThreshold, IsActive, ModifiedBy)`
   - Returns: `Product`
   - Validation: FluentValidation via `UpdateProductCommandValidator`
   - Errors: `ValidationException`, `ProductNotFoundException`

3. **DeleteProduct**
   - Command: `DeleteProductCommand(Id)`
   - Returns: `DeleteResponse(Guid Id)`
   - **Current Implementation**: Only checks if product exists, then deletes directly
   - **Missing**: Order-usage validation (this will be added)
   - Errors: `ProductNotFoundException`

4. **UpdateStock**
   - Command: `UpdateStockCommand(ProductId, StockQuantity, ModifiedBy)`
   - Returns: `Product`
   - Validation: FluentValidation
   - Errors: `ValidationException`, `ProductNotFoundException`

5. **AddProductImage**
   - Command: `AddProductImageCommand(ProductId, FileName, Url, StorageMode, IsPrimary, CreatedBy)`
   - Returns: `ProductImage`
   - Validation: FluentValidation via `AddProductImageCommandValidator`
   - Errors: `ValidationException`, `ProductNotFoundException`
   - **Note**: Product domain handles primary image logic (auto-removes previous primary when new one added)

6. **RemoveProductImage**
   - Command: `RemoveProductImageCommand(ProductId, ImageId)`
   - Returns: `DeleteResponse(Guid Id)`
   - Errors: `ProductNotFoundException`

**Order-Product Relationship** (`server/Astro.Domain/Orders/Entities/OrderDetail.cs`):
- OrderDetail contains `ProductId` (Guid) - allows querying if product is used
- Stores snapshot of product data at order time (ProductName, ProductSku, Quantity, UnitPrice)
- No foreign key constraint (intentionally - allows product deletion from DB perspective)
- **Solution**: Query OrderDetail table for ProductId before allowing deletion

**Storage Modes** (`server/Astro.Domain/Products/Enums/StorageMode.cs`):
- Enum: `Aws`, `Azure`, `Url`
- Used in ProductImage to indicate cloud storage provider

### Frontend Research

**Existing Structure** (`client/src/app/features/products/`):

1. **Component Organization**:
   - `products-list/` - List view with data table, filtering, pagination
   - `product-detail/` - Detail view (currently read-only)
   - `services/` - ProductService (currently mock data)
   - `graphql/` - Query definitions (GET_PRODUCTS, GET_PRODUCT_BY_ID)

2. **Current ProductService** (`product.service.ts`):
   - Mock implementation with delay
   - Methods: `getProducts()`, `getProductById()`
   - **Needs**: Replace mock with Apollo GraphQL queries, add mutation methods

3. **GraphQL Integration** (`client/src/app/core/graphql/graphql.provider.ts`):
   - Apollo Angular configured with HttpLink
   - GraphQL endpoint from environment
   - Authentication via sessionStorage token (per CLAUDE.md)
   - Code generation configured via `codegen.ts` (GraphQL Code Generator)

4. **Forms Approach**:
   - Evidence shows ReactiveFormsModule usage in other features (login)
   - Angular Material form components (MatFormField, MatInput, MatSelect)
   - Pattern: Reactive forms with FormBuilder, validators

5. **Dialog System**:
   - Angular Material Dialog (MatDialog) available
   - Evidence of dialogs in other features
   - Pattern: Component-based dialogs with data injection

6. **Validation Patterns**:
   - Frontend: Angular reactive form validators (Validators.required, custom validators)
   - Backend: FluentValidation with GraphQL error mapping
   - Error handling: NotificationService for user feedback

7. **Existing Product UI**:
   - ProductsListComponent: DataTable with columns (SKU, Name, Price, Stock, Status)
   - Filtering: Search by name, filter by active status
   - Pagination: Mat Paginator
   - Row click navigation to detail view
   - Status badges for stock levels (In Stock, Low Stock, Out of Stock)
   - **Missing**: Action buttons (create, edit, delete, deactivate)

8. **Routing** (`client/src/app/app.routes.ts`):
   - `/products` → ProductsListComponent
   - `/products/:id` → ProductDetailComponent
   - Auth guard protecting admin routes

### Key Findings

**Backend**:
- ✅ All required mutations exist EXCEPT order-usage validation in DeleteProduct
- ✅ Product domain correctly handles primary image logic
- ✅ StorageMode enum supports AWS, Azure, and generic URL
- ⚠️ DeleteProductCommandHandler needs enhancement to check OrderDetail records
- ⚠️ Need new ProductInUseException for when deletion is blocked

**Frontend**:
- ✅ Product list/detail components exist with good foundation
- ✅ Apollo Angular fully configured with code generation
- ✅ Angular Material dialogs available
- ✅ Reactive forms pattern established
- ⚠️ ProductService uses mock data - needs real GraphQL integration
- ⚠️ No mutation operations defined yet
- ⚠️ No form components for create/edit
- ⚠️ No image management UI
- ⚠️ No confirmation dialogs

**Integration Points**:
- GraphQL mutations already emit subscriptions (OnProductCreated, OnProductUpdated, etc.)
- Frontend can subscribe to real-time updates if needed (future enhancement)
- Error types properly mapped from backend to GraphQL errors

## Phase 1: Design

**Objective**: Define implementation architecture, data models, and contracts.

### Architecture Decision

**Backend Enhancement**:
1. Add `HasProductOrders(Guid productId)` method to `IOrderRepository` and `OrderRepository`
2. Modify `DeleteProductCommandHandler` to call repository before deletion
3. Create `ProductInUseException` thrown when product has orders
4. Add `ProductInUseError` GraphQL error type to DeleteProduct mutation
5. Update integration tests to cover new validation

**Frontend Implementation**:
1. Create reusable ProductFormComponent for create/edit operations
2. Create ImageManagerComponent for image gallery management
3. Create confirmation dialog components (delete and deactivate)
4. Enhance ProductsListComponent with action buttons
5. Convert ProductDetailComponent to edit mode
6. Replace mock ProductService with Apollo GraphQL operations
7. Generate TypeScript types from GraphQL schema using codegen

**State Management**:
- Use Apollo InMemoryCache for GraphQL data (already configured)
- Refetch queries after mutations to ensure UI consistency
- Use optimistic updates for better UX (optional enhancement)

**Error Handling**:
- Backend: GraphQL errors with typed error classes
- Frontend: Catch Apollo errors, display via NotificationService
- Validation errors: Display inline in forms (Material error messages)

### Data Flow

**Create Product Flow**:
1. User clicks "Create Product" button → Navigate to create form
2. User fills form (name, price, SKU, stock, description, active status)
3. User adds image URLs with primary designation
4. User submits → Call CreateProduct mutation via ProductService
5. On success: Navigate to product list, show success notification
6. On error: Display validation errors inline, show error notification

**Edit Product Flow**:
1. User clicks product row or edit button → Navigate to detail view
2. User clicks "Edit" button → Enable edit mode
3. User modifies fields and/or manages images (add/remove/change primary)
4. User saves → Call UpdateProduct + image mutations
5. On success: Return to view mode, show success notification
6. On error: Display errors, remain in edit mode

**Delete/Deactivate Flow**:
1. User clicks "Delete" or "Deactivate" button (button determined by backend check)
2. System calls backend to check if product is used in orders
3. If used in orders: Show "Deactivate" button
   - User clicks → Show deactivate warning dialog
   - User confirms → Call UpdateProduct mutation (stock=0, isActive=false)
4. If not used: Show "Delete" button
   - User clicks → Show delete confirmation dialog
   - User confirms → Call DeleteProduct mutation
5. On success: Refresh product list, show success notification
6. On error: Show error notification

**Image Management Flow**:
1. User in create/edit form can see image gallery
2. User adds image: Enter URL, select storage mode (AWS/Azure/Other), mark as primary
   - Validation: URL format, exactly one primary
3. User removes image: Click remove icon → Call RemoveProductImage mutation
4. User changes primary: Click "Make Primary" → Updates local state, saved on form submit
5. On submit: Batch image operations (add new, remove deleted, update primary via UpdateProduct)

### GraphQL Contracts

See `specs/feature/ui-commands/contracts/` directory (created below) for full GraphQL operation definitions.

**Key Mutations**:
- `createProduct(command: CreateProductInput!)` → Product
- `updateProduct(command: UpdateProductCommand!)` → Product
- `deleteProduct(command: DeleteProductCommand!)` → DeleteResponse (throws ProductInUseError if used)
- `addProductImage(command: AddProductImageCommand!)` → ProductImage
- `removeProductImage(command: RemoveProductImageCommand!)` → DeleteResponse

**New Query** (for determining delete vs deactivate):
- Frontend can check order usage via DeleteProduct mutation error OR add dedicated query:
- `checkProductUsage(productId: UUID!)` → Boolean (returns true if product in orders)

**Alternative Approach**: Frontend attempts delete, catches ProductInUseError, then offers deactivate. Simpler than separate query.

### UI/UX Design

**Products List View Enhancements**:
- Add "Create Product" button (top right, Angular Material raised button)
- Add action column to table with edit/delete/deactivate icons
- Icons change based on product usage (determined on-demand or cached)

**Product Form Design**:
- Stepper or tabbed interface:
  - Tab 1: Basic Info (Name, Description, SKU, Price, Stock, Low Stock Threshold, Active)
  - Tab 2: Images (Image gallery manager)
- Material form fields with validation
- Save/Cancel buttons
- Loading state during submission

**Image Manager Design**:
- Display images as thumbnail grid
- Each thumbnail shows: image preview (or placeholder if URL invalid), primary badge, remove icon
- "Add Image" button opens dialog or inline form
- Radio button or star icon to designate primary image
- URL input for image location
- Dropdown for storage mode (AWS, Azure, Other)

**Confirmation Dialogs**:
- Delete Dialog: "Are you sure you want to permanently delete this product? This action cannot be undone."
- Deactivate Dialog: "⚠️ This product has been ordered and cannot be deleted. Deactivating will set stock to 0 and hide it from the catalog. Continue?"
- Material Dialog with action buttons (Cancel/Confirm)

## Implementation Phases

### Backend Track

**Phase B1: Add Order Usage Check** (Priority: P1 - Required for frontend delete/deactivate logic)

Files to modify:
1. `server/Astro.Domain/Orders/Repositories/IOrderRepository.cs`
   - Add: `Task<bool> HasProductOrdersAsync(Guid productId, CancellationToken cancellationToken);`

2. `server/Astro.Infrastructure/Orders/Repositories/OrderRepository.cs`
   - Implement: Query OrderDetail table for ProductId existence
   - Return true if any OrderDetail.ProductId matches

3. `server/Astro.Application/Products/Exceptions/ProductInUseException.cs` (NEW)
   - Custom exception: `public class ProductInUseException : Exception`
   - Constructor: Accept ProductId and message

4. `server/Astro.Application/Products/Commands/DeleteProduct/DeleteProductCommandHandler.cs`
   - Inject `IOrderRepository`
   - Before deleting product, call `HasProductOrdersAsync`
   - If true: throw `ProductInUseException`

5. `server/Astro.Api/Products/GraphQL/Mutation.cs`
   - Add `[Error<ProductInUseException>]` to DeleteProduct mutation

6. `server/Astro.Api/Products/GraphQL/ProductInUseError.cs` (NEW - optional)
   - Custom GraphQL error type for better client handling

**Phase B2: Add Unit Tests**

Files to create/modify:
1. `server/Astro.Application/Products/Commands/DeleteProduct/DeleteProductCommandHandlerTests.cs`
   - Test: Delete succeeds when product not in orders
   - Test: Delete throws ProductInUseException when product in orders
   - Test: Exception includes ProductId in message

**Phase B3: Add Integration Test**

Files to modify:
1. `e2e/Astro.IntegrationTests/Products/ProductTests.cs`
   - Add test: Create product → Create order with product → Attempt delete → Verify error
   - Add test: Create product (no orders) → Delete → Verify success

### Frontend Track

**Phase F1: Create GraphQL Operations** (Priority: P1 - Foundation for all UI)

Files to create:
1. `client/src/app/features/products/graphql/product.mutations.ts`
   - Define: CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT, ADD_PRODUCT_IMAGE, REMOVE_PRODUCT_IMAGE

2. `client/src/app/features/products/graphql/product.fragments.ts`
   - Define: ProductBasicFields, ProductDetailFields, ProductImageFields (reusable)

3. Run GraphQL Code Generator:
   - `npm run codegen` (or equivalent) to generate TypeScript types

**Phase F2: Update ProductService** (Priority: P1)

Files to modify:
1. `client/src/app/features/products/services/product.service.ts`
   - Remove mock data
   - Replace with Apollo query/mutation methods
   - Methods:
     - `createProduct(input)` → Observable<Product>
     - `updateProduct(input)` → Observable<Product>
     - `deleteProduct(id)` → Observable<void> (catches ProductInUseError)
     - `addProductImage(input)` → Observable<ProductImage>
     - `removeProductImage(productId, imageId)` → Observable<void>
     - `checkIfProductUsedInOrders(id)` → Observable<boolean> (optional)

**Phase F3: Create Image Manager Component** (Priority: P2)

Files to create:
1. `client/src/app/features/products/image-manager/`
   - `image-manager.component.ts` - Manage image gallery (add/remove/primary)
   - `image-manager.component.html` - Grid layout with thumbnails
   - `image-manager.component.scss` - Styling
   - `image-manager.component.spec.ts` - Unit tests
   - Input: `images: ProductImage[]`
   - Output: `imagesChange: EventEmitter<ProductImage[]>`
   - Features: Add URL, remove image, toggle primary (radio button)

**Phase F4: Create Product Form Component** (Priority: P2)

Files to create:
1. `client/src/app/features/products/product-form/`
   - `product-form.component.ts` - Reactive form for create/edit
   - `product-form.component.html` - Material form layout
   - `product-form.component.scss` - Styling
   - `product-form.component.spec.ts` - Unit tests
   - Input: `product?: Product` (null for create, populated for edit)
   - Output: `save: EventEmitter<ProductFormData>`
   - Embeds: ImageManagerComponent
   - Validation: Required fields, price > 0, stock >= 0, exactly one primary image if images exist

**Phase F5: Create Confirmation Dialogs** (Priority: P3)

Files to create:
1. `client/src/app/features/products/dialogs/delete-confirm-dialog/`
   - `delete-confirm-dialog.component.ts`
   - `delete-confirm-dialog.component.html`
   - `delete-confirm-dialog.component.scss`
   - Data: `{ productName: string }`
   - Returns: boolean (confirmed or cancelled)

2. `client/src/app/features/products/dialogs/deactivate-confirm-dialog/`
   - `deactivate-confirm-dialog.component.ts`
   - `deactivate-confirm-dialog.component.html`
   - `deactivate-confirm-dialog.component.scss`
   - Data: `{ productName: string }`
   - Returns: boolean

**Phase F6: Enhance Products List Component** (Priority: P2)

Files to modify:
1. `client/src/app/features/products/products-list/products-list.component.ts`
   - Add: "Create Product" button handler → Navigate to create form
   - Add: Action column with edit/delete/deactivate buttons
   - Add: `onEdit(product)` → Navigate to edit mode
   - Add: `onDelete(product)` → Check usage, show appropriate dialog, call service
   - Add: `onDeactivate(product)` → Show dialog, call updateProduct with stock=0, isActive=false
   - Inject: MatDialog, Router, ProductService, NotificationService

2. `client/src/app/features/products/products-list/products-list.component.html`
   - Add: "Create Product" button
   - Add: Action column to table template with icon buttons

**Phase F7: Convert Product Detail to Edit Mode** (Priority: P3)

Files to modify:
1. `client/src/app/features/products/product-detail/product-detail.component.ts`
   - Add: Edit mode toggle (view/edit state)
   - Add: Embed ProductFormComponent when in edit mode
   - Add: Save handler → Call ProductService.updateProduct
   - Add: Cancel handler → Return to view mode

2. `client/src/app/features/products/product-detail/product-detail.component.html`
   - Add: Edit button (when in view mode)
   - Add: Conditional rendering (view mode vs ProductFormComponent)

**Phase F8: Create Product Creation Route** (Priority: P2)

Files to create/modify:
1. Create: `client/src/app/features/products/product-create/`
   - `product-create.component.ts` - Wraps ProductFormComponent
   - `product-create.component.html` - Renders form
   - Handler: On save → Call ProductService.createProduct → Navigate to list

2. Modify: `client/src/app/app.routes.ts`
   - Add route: `/products/create` → ProductCreateComponent
   - Ensure auth guard applied

**Phase F9: End-to-End Testing** (Priority: P3)

1. Manual testing checklist:
   - Create product with images
   - Edit product, add/remove images, change primary
   - Delete unused product
   - Attempt delete on product in order (verify deactivate offered)
   - Deactivate product, verify stock set to 0
   - Filter inactive products

2. Optional: Add Cypress/Playwright E2E tests

### Integration Phase

**Phase I1: Connect Frontend to Backend** (After B1 and F2 complete)

1. Update environment configuration with correct GraphQL endpoint
2. Test mutations end-to-end
3. Verify error handling (ProductInUseException → user-friendly message)
4. Verify image operations work with all storage modes

**Phase I2: Polish & Refinement**

1. Loading states for all async operations
2. Optimistic updates for better UX
3. Accessibility review (keyboard navigation, ARIA labels)
4. Responsive design verification
5. Error message consistency

## Risk Analysis

**High Priority Risks**:

1. **Order Usage Check Performance**
   - Risk: OrderDetail table scan could be slow with large order history
   - Mitigation: Add database index on OrderDetail.ProductId if not exists
   - Fallback: Cache product-usage results if needed

2. **Primary Image Logic Complexity**
   - Risk: Frontend and backend disagree on which image is primary
   - Mitigation: Backend Product domain is source of truth; frontend reflects backend state
   - Backend AddImage method already handles primary logic automatically

3. **GraphQL Error Handling**
   - Risk: ProductInUseException not properly caught by frontend
   - Mitigation: Test error scenarios thoroughly; use typed errors in Apollo

**Medium Priority Risks**:

1. **Image URL Validation**
   - Risk: Users enter invalid URLs, images fail to load
   - Mitigation: Basic URL format validation; show placeholder for broken images
   - Out of scope: Deep validation (checking if URL points to actual image)

2. **Concurrent Modifications**
   - Risk: Two admins edit same product simultaneously
   - Mitigation: Rely on backend optimistic concurrency (if implemented); last write wins
   - Future: Add version field to Product for optimistic locking

**Low Priority Risks**:

1. **Large Image Galleries**
   - Risk: Products with many images (>50) may slow down UI
   - Mitigation: Unlikely in practice; can add pagination to image manager if needed

## Testing Strategy

**Backend Tests**:
- Unit tests for DeleteProductCommandHandler (verify validation logic)
- Integration tests for DeleteProduct mutation (E2E workflow)
- Test coverage: Order usage check, exception handling, happy path deletion

**Frontend Tests**:
- Unit tests for ProductService (mock Apollo)
- Component tests for ProductFormComponent (reactive form validation)
- Component tests for ImageManagerComponent (add/remove/primary logic)
- Dialog component tests
- E2E tests (optional): Full user workflows

**Manual Testing Checklist**:
- Create product: All fields, multiple images, primary designation
- Edit product: Modify all fields, image management (add, remove, change primary)
- Delete product: Unused product → success
- Delete product: Used in order → blocked, deactivate offered
- Deactivate product: Stock set to 0, isActive = false, hidden from customer catalog
- Reactivate product: Set stock > 0 and isActive = true
- Validation: Required fields, price/stock constraints
- Error handling: Backend errors displayed clearly
- Loading states: Spinners during async operations
- Navigation: Proper routing between list/detail/create

## Deployment Checklist

- [ ] Backend: EF Core migrations (none required for this feature)
- [ ] Backend: Unit tests passing
- [ ] Backend: Integration tests passing
- [ ] Frontend: Build succeeds (ng build --prod)
- [ ] Frontend: Unit tests passing
- [ ] GraphQL schema updated (verify via introspection)
- [ ] Environment configurations correct (GraphQL endpoint)
- [ ] Manual testing completed
- [ ] Accessibility review passed
- [ ] Documentation updated (this plan, quickstart guide)
- [ ] Code review approved
- [ ] Deployed to staging environment
- [ ] Smoke tests in staging
- [ ] Deployed to production

## Follow-Up Enhancements (Out of Scope)

- Bulk operations (bulk delete, bulk deactivate)
- Product versioning/change history
- Soft delete implementation
- Image upload functionality (currently URL-only)
- Image optimization and thumbnail generation
- Real-time collaboration indicators (who else is editing)
- Optimistic concurrency control with version fields
- Advanced image validation (check if URL points to actual image)
- Product categories/taxonomies
- Product variants
- CSV import/export
