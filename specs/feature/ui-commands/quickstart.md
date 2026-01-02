# Quickstart: Implementing Product Management UI

**Date**: 2025-12-31
**Feature**: Product Management with Safe Deletion
**Audience**: Developers implementing the feature

## Prerequisites

- ✅ Backend GraphQL API running (Astro.Api)
- ✅ Angular 19 development environment configured
- ✅ Apollo Angular and GraphQL Code Generator installed
- ✅ Authenticated admin user (session token in sessionStorage)

## Implementation Sequence

Follow this order to minimize blockers and enable parallel work:

### Phase 1: Backend Foundation (Required First)

**Timeline**: 1-2 days
**Who**: Backend developer

1. **Add Order Usage Check**
   - Location: `server/Astro.Domain/Orders/Repositories/IOrderRepository.cs`
   - Add method: `Task<bool> HasProductOrdersAsync(Guid productId, CancellationToken cancellationToken);`

2. **Implement Repository Method**
   - Location: `server/Astro.Infrastructure/Orders/Repositories/OrderRepository.cs`
   - Query: `_context.Set<OrderDetail>().AnyAsync(od => od.ProductId == productId, cancellationToken)`

3. **Create ProductInUseException**
   - Location: `server/Astro.Application/Products/Exceptions/ProductInUseException.cs`
   ```csharp
   public class ProductInUseException : Exception
   {
       public Guid ProductId { get; }

       public ProductInUseException(Guid productId, string message) : base(message)
       {
           ProductId = productId;
       }
   }
   ```

4. **Update DeleteProductCommandHandler**
   - Location: `server/Astro.Application/Products/Commands/DeleteProduct/DeleteProductCommandHandler.cs`
   - Inject `IOrderRepository`
   - Add check before deletion:
   ```csharp
   var isUsedInOrders = await _orderRepository.HasProductOrdersAsync(request.Id, cancellationToken);
   if (isUsedInOrders)
   {
       throw new ProductInUseException(request.Id,
           $"Cannot delete product {request.Id} because it has been used in orders.");
   }
   ```

5. **Update GraphQL Mutation**
   - Location: `server/Astro.Api/Products/GraphQL/Mutation.cs`
   - Add error attribute: `[Error<ProductInUseException>]`

6. **Write Unit Tests**
   - Location: `server/Astro.Application/Products/Commands/DeleteProduct/DeleteProductCommandHandlerTests.cs`
   - Test scenarios:
     - Delete succeeds when no orders exist
     - Delete throws ProductInUseException when orders exist
     - Exception message contains product ID

7. **Run Tests & Verify**
   ```bash
   dotnet test
   ```

**Deliverable**: Backend enforces delete validation. Frontend can now safely call DeleteProduct mutation.

---

### Phase 2: Frontend GraphQL Setup (Can Start in Parallel)

**Timeline**: 1 day
**Who**: Frontend developer

1. **Create GraphQL Mutation Definitions**
   - Location: `client/src/app/features/products/graphql/product.mutations.ts`
   - See: `specs/feature/ui-commands/contracts/` for full mutation definitions
   - Create mutations: CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT, ADD_PRODUCT_IMAGE, REMOVE_PRODUCT_IMAGE

2. **Create GraphQL Fragments**
   - Location: `client/src/app/features/products/graphql/product.fragments.ts`
   ```graphql
   fragment ProductBasicFields on Product {
     id
     sku
     name
     description
     price { amount currency }
     stockQuantity
     lowStockThreshold
     isActive
     isLowStock
     createdAt
     updatedAt
   }

   fragment ProductImageFields on ProductImage {
     id
     url
     fileName
     alt Text
     isPrimary
     storageMode
     createdAt
   }
   ```

3. **Generate TypeScript Types**
   ```bash
   cd client
   npm run codegen
   ```

4. **Update ProductService**
   - Location: `client/src/app/features/products/services/product.service.ts`
   - Replace mock implementation with Apollo mutations
   - Add methods:
     - `createProduct(input: CreateProductCommandInput)`
     - `updateProduct(input: UpdateProductCommandInput)`
     - `deleteProduct(id: string)` - catches ProductInUseException
     - `addProductImage(input: AddProductImageCommandInput)`
     - `removeProductImage(productId: string, imageId: string)`

   **Example**:
   ```typescript
   createProduct(input: CreateProductCommandInput): Observable<Product> {
     this._loading.set(true);
     return this.apollo.mutate<{ createProduct: Product }>({
       mutation: CREATE_PRODUCT,
       variables: { command: input },
       refetchQueries: [{ query: GET_PRODUCTS }],
     }).pipe(
       map(result => {
         this._loading.set(false);
         if (!result.data) throw new Error('No data returned');
         return result.data.createProduct;
       }),
       catchError(error => {
         this._loading.set(false);
         throw error;
       })
     );
   }
   ```

**Deliverable**: ProductService ready to perform all CRUD operations via GraphQL.

---

### Phase 3: Image Management Component

**Timeline**: 1-2 days
**Who**: Frontend developer

1. **Create Component**
   ```bash
   cd client/src/app/features/products
   ng generate component image-manager --standalone
   ```

2. **Implement Image Manager**
   - Location: `image-manager/image-manager.component.ts`
   - Inputs: `@Input() images: ProductImage[] = [];`
   - Outputs: `@Output() imagesChange = new EventEmitter<ProductImage[]>();`
   - Features:
     - Display image thumbnails in grid
     - Add image (URL input + storage mode dropdown)
     - Remove image (trash icon)
     - Set primary (radio button or star icon)
     - Validate exactly one primary image

3. **Template**
   - Grid layout (Angular Material Card or custom CSS Grid)
   - Each image card shows:
     - `<img>` tag with URL (or placeholder if broken)
     - Primary badge ("Primary" chip or star icon)
     - Remove button (MatIconButton with delete icon)
     - Radio button to designate as primary
   - "Add Image" button opens dialog or inline form

4. **Validation**
   - Ensure at least one image is primary (if images exist)
   - URL format validation (basic regex)
   - Prevent removing last primary image without replacement

**Deliverable**: Reusable image management component.

---

### Phase 4: Product Form Component

**Timeline**: 2 days
**Who**: Frontend developer

1. **Create Component**
   ```bash
   ng generate component product-form --standalone
   ```

2. **Build Reactive Form**
   - Location: `product-form/product-form.component.ts`
   - FormBuilder with FormGroup:
   ```typescript
   this.productForm = this.fb.group({
     name: ['', [Validators.required, Validators.maxLength(200)]],
     description: [''],
     sku: ['', [Validators.required, Validators.maxLength(50)]],
     price: [0, [Validators.required, Validators.min(0.01)]],
     stockQuantity: [0, [Validators.required, Validators.min(0)]],
     lowStockThreshold: [0, [Validators.required, Validators.min(0)]],
     isActive: [true, Validators.required],
   });
   ```

3. **Embed Image Manager**
   - Add `<app-image-manager>` component
   - Two-way binding for images array
   - Handle image changes (add/remove) in form state

4. **Inputs/Outputs**
   - Input: `@Input() product?: Product;` (null for create, populated for edit)
   - Output: `@Output() save = new EventEmitter<ProductFormValue>();`
   - Output: `@Output() cancel = new EventEmitter<void>();`

5. **Template**
   - Material form fields (MatFormField + MatInput)
   - Save and Cancel buttons
   - Error messages for validation
   - Loading spinner during submission

6. **Handle Save**
   - Emit form value + images to parent component
   - Parent calls ProductService.createProduct or updateProduct
   - Handle image operations (batch add/remove via separate mutations)

**Deliverable**: Reusable form for create/edit operations.

---

### Phase 5: Confirmation Dialogs

**Timeline**: Half day
**Who**: Frontend developer

1. **Create Delete Confirmation Dialog**
   ```bash
   mkdir -p dialogs/delete-confirm-dialog
   ng generate component dialogs/delete-confirm-dialog --standalone
   ```

2. **Template**:
   ```html
   <h2 mat-dialog-title>Delete Product</h2>
   <mat-dialog-content>
     <p>Are you sure you want to permanently delete <strong>{{data.productName}}</strong>?</p>
     <p>This action cannot be undone.</p>
   </mat-dialog-content>
   <mat-dialog-actions>
     <button mat-button (click)="onCancel()">Cancel</button>
     <button mat-raised-button color="warn" (click)="onConfirm()">Delete</button>
   </mat-dialog-actions>
   ```

3. **Component**:
   ```typescript
   constructor(@Inject(MAT_DIALOG_DATA) public data: { productName: string }) {}

   onConfirm() {
     this.dialogRef.close(true);
   }

   onCancel() {
     this.dialogRef.close(false);
   }
   ```

4. **Create Deactivate Confirmation Dialog**
   - Similar structure
   - Different message: "⚠️ This product has been ordered and cannot be deleted. Deactivating will set stock to 0 and hide it from the catalog. Continue?"
   - Button: "Deactivate" instead of "Delete"

**Deliverable**: Reusable confirmation dialogs.

---

### Phase 6: Products List Enhancements

**Timeline**: 1 day
**Who**: Frontend developer

1. **Add Action Buttons**
   - Location: `products-list/products-list.component.html`
   - Add action column to table:
   ```html
   <ng-container matColumnDef="actions">
     <th mat-header-cell *matHeaderCellDef>Actions</th>
     <td mat-cell *matCellDef="let product">
       <button mat-icon-button (click)="onEdit(product); $event.stopPropagation()">
         <mat-icon>edit</mat-icon>
       </button>
       <button mat-icon-button color="warn"
               (click)="onDeleteOrDeactivate(product); $event.stopPropagation()">
         <mat-icon>delete</mat-icon>
       </button>
     </td>
   </ng-container>
   ```

2. **Add Create Button**
   - Top right of card:
   ```html
   <button mat-raised-button color="primary" (click)="onCreate()">
     <mat-icon>add</mat-icon> Create Product
   </button>
   ```

3. **Implement Handlers**
   - Location: `products-list.component.ts`
   ```typescript
   onCreate() {
     this.router.navigate(['/products/create']);
   }

   onEdit(product: Product) {
     this.router.navigate(['/products', product.id, 'edit']);
   }

   async onDeleteOrDeactivate(product: Product) {
     try {
       const confirmed = await this.showDeleteDialog(product.name);
       if (!confirmed) return;

       await firstValueFrom(this.productService.deleteProduct(product.id));
       this.notificationService.success('Product deleted successfully');
       this.loadProducts();
     } catch (error: any) {
       if (error.graphQLErrors?.some((e: any) => e.extensions?.code === 'PRODUCT_IN_USE')) {
         const deactivate = await this.showDeactivateDialog(product.name);
         if (deactivate) {
           await this.deactivateProduct(product);
         }
       } else {
         this.notificationService.error('Failed to delete product');
       }
     }
   }

   private async deactivateProduct(product: Product) {
     const input: UpdateProductCommandInput = {
       ...product,
       stockQuantity: 0,
       isActive: false,
       modifiedBy: 'current-user' // Get from auth service
     };

     await firstValueFrom(this.productService.updateProduct(input));
     this.notificationService.success('Product deactivated');
     this.loadProducts();
   }
   ```

**Deliverable**: Enhanced product list with full CRUD actions.

---

### Phase 7: Product Detail Edit Mode

**Timeline**: 1 day
**Who**: Frontend developer

1. **Add Edit Mode Toggle**
   - Location: `product-detail/product-detail.component.ts`
   ```typescript
   editMode = signal(false);

   toggleEditMode() {
     this.editMode.update(val => !val);
   }

   onSave(formValue: ProductFormValue) {
     // Call ProductService.updateProduct
     // Handle image operations
     // Toggle back to view mode
   }
   ```

2. **Update Template**
   - Location: `product-detail/product-detail.component.html`
   ```html
   <div *ngIf="!editMode()">
     <!-- Read-only view -->
     <button mat-raised-button (click)="toggleEditMode()">Edit</button>
     <!-- Display product details -->
   </div>

   <div *ngIf="editMode()">
     <app-product-form
       [product]="product()"
       (save)="onSave($event)"
       (cancel)="toggleEditMode()">
     </app-product-form>
   </div>
   ```

3. **Handle Save**
   ```typescript
   async onSave(formValue: ProductFormValue) {
     try {
       const input: UpdateProductCommandInput = {
         id: this.product()!.id,
         ...formValue,
         modifiedBy: 'current-user'
       };

       const updated = await firstValueFrom(this.productService.updateProduct(input));

       // Handle image operations (add new, remove deleted)
       await this.syncImages(formValue.images);

       this.product.set(updated);
       this.editMode.set(false);
       this.notificationService.success('Product updated');
     } catch (error) {
       this.notificationService.error('Failed to update product');
     }
   }

   private async syncImages(images: ProductImage[]) {
     const current = this.product()!.images;
     const added = images.filter(img => !img.id);  // New images
     const removed = current.filter(img => !images.find(i => i.id === img.id));  // Deleted

     // Add new images
     for (const img of added) {
       await firstValueFrom(this.productService.addProductImage({
         productId: this.product()!.id,
         ...img,
         createdBy: 'current-user'
       }));
     }

     // Remove deleted images
     for (const img of removed) {
       await firstValueFrom(this.productService.removeProductImage(
         this.product()!.id,
         img.id
       ));
     }
   }
   ```

**Deliverable**: Product detail page with edit capability.

---

### Phase 8: Product Create Page

**Timeline**: Half day
**Who**: Frontend developer

1. **Create Component**
   ```bash
   ng generate component product-create --standalone
   ```

2. **Template**
   ```html
   <h1>Create Product</h1>
   <app-product-form
     (save)="onCreate($event)"
     (cancel)="onCancel()">
   </app-product-form>
   ```

3. **Component**
   ```typescript
   async onCreate(formValue: ProductFormValue) {
     try {
       const input: CreateProductCommandInput = {
         ...formValue,
         createdBy: 'current-user'
       };

       const product = await firstValueFrom(this.productService.createProduct(input));

       // Add images
       for (const img of formValue.images) {
         await firstValueFrom(this.productService.addProductImage({
           productId: product.id,
           ...img,
           createdBy: 'current-user'
         }));
       }

       this.notificationService.success('Product created');
       this.router.navigate(['/products', product.id]);
     } catch (error) {
       this.notificationService.error('Failed to create product');
     }
   }

   onCancel() {
     this.router.navigate(['/products']);
   }
   ```

4. **Add Route**
   - Location: `client/src/app/app.routes.ts`
   ```typescript
   {
     path: 'products/create',
     component: ProductCreateComponent,
     canActivate: [authGuard]
   }
   ```

**Deliverable**: Product creation workflow.

---

## Testing Checklist

### Backend Tests

```bash
# Run unit tests
cd server
dotnet test Astro.Application.Tests

# Run integration tests
dotnet test e2e/Astro.IntegrationTests
```

**Verify**:
- [ ] Delete succeeds when product not in orders
- [ ] Delete throws ProductInUseException when product in orders
- [ ] Exception is mapped to GraphQL error

### Frontend Tests

```bash
cd client
npm run test
```

**Verify**:
- [ ] ProductService methods call correct GraphQL operations
- [ ] Image Manager validates primary image constraint
- [ ] Product Form validates required fields
- [ ] Dialogs return correct values

### Manual E2E Testing

1. **Create Product**
   - [ ] Navigate to /products/create
   - [ ] Fill all required fields
   - [ ] Add multiple images, designate one as primary
   - [ ] Submit → Verify product created
   - [ ] Check product appears in list

2. **Edit Product**
   - [ ] Click product row → Detail view
   - [ ] Click "Edit" button
   - [ ] Modify fields
   - [ ] Add new image, remove existing image, change primary
   - [ ] Save → Verify changes persisted

3. **Delete Product (Unused)**
   - [ ] Create product (don't add to any order)
   - [ ] Click delete icon
   - [ ] Confirm dialog → Verify product deleted
   - [ ] Check product removed from list

4. **Delete Product (Used in Order)**
   - [ ] Create product
   - [ ] Create order with this product (via Orders module)
   - [ ] Attempt to delete product
   - [ ] Verify "ProductInUse" error caught
   - [ ] Verify deactivate dialog shown
   - [ ] Confirm deactivate → Verify stock=0, isActive=false

5. **Deactivate Product Manually**
   - [ ] Edit product
   - [ ] Set isActive = false and/or stock = 0
   - [ ] Save → Verify product deactivated
   - [ ] Apply inactive filter → Verify product appears in inactive list

6. **Reactivate Product**
   - [ ] Edit inactive product
   - [ ] Set stock > 0 and isActive = true
   - [ ] Save → Verify product reactivated

## Troubleshooting

### GraphQL Errors Not Caught

**Problem**: ProductInUseException not detected in frontend.

**Solution**:
```typescript
// Check error structure
error.graphQLErrors?.some(e => {
  console.log('Error code:', e.extensions?.code);
  return e.extensions?.code === 'PRODUCT_IN_USE';
});
```

### Images Not Displaying

**Problem**: Image URLs broken or not loading.

**Solution**:
- Verify URL format in backend validation
- Use placeholder image for broken URLs:
```html
<img [src]="image.url"
     (error)="$event.target.src='/assets/placeholder.png'"
     alt="Product image">
```

### Primary Image Not Updating

**Problem**: Multiple images showing as primary or none showing as primary.

**Solution**:
- Backend handles primary logic automatically in `Product.AddImage()`
- Ensure frontend reflects backend state after mutations
- Refetch product after image operations

### Validation Errors Not Displaying

**Problem**: Form validation errors not showing.

**Solution**:
- Ensure MatFormField wraps MatInput
- Add `<mat-error>` elements:
```html
<mat-form-field>
  <mat-label>Name</mat-label>
  <input matInput formControlName="name">
  <mat-error *ngIf="productForm.get('name')?.hasError('required')">
    Name is required
  </mat-error>
</mat-form-field>
```

## Quick Reference

**GraphQL Endpoint**: Check `client/src/environments/environment.ts`

**Auth Token**: Stored in `sessionStorage.getItem('authToken')`

**Key Files**:
- Backend mutations: `server/Astro.Api/Products/GraphQL/Mutation.cs`
- Frontend service: `client/src/app/features/products/services/product.service.ts`
- GraphQL operations: `client/src/app/features/products/graphql/product.mutations.ts`

**Useful Commands**:
```bash
# Regenerate GraphQL types
cd client && npm run codegen

# Run backend
cd server && dotnet run --project Astro.AppHost

# Run frontend
cd client && npm start

# Run tests
dotnet test  # Backend
npm test     # Frontend
```

## Next Steps

After completing implementation:
1. Run full test suite (backend + frontend)
2. Perform manual E2E testing (see checklist above)
3. Review accessibility (keyboard navigation, ARIA labels)
4. Code review
5. Deploy to staging
6. Run smoke tests in staging
7. Deploy to production

For detailed implementation plans, see [plan.md](./plan.md).
