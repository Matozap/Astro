# Research: Product Management Backend Analysis

**Date**: 2025-12-31
**Feature**: Product Management with Safe Deletion
**Purpose**: Document existing backend GraphQL API structure and identify gaps

## Executive Summary

The backend already provides comprehensive product management mutations via GraphQL, including:
- ✅ Create, Update, Delete product operations
- ✅ Image management (Add, Remove)
- ✅ Stock management
- ✅ FluentValidation for all commands
- ✅ CQRS pattern with MediatR
- ✅ Clean Architecture compliance

**Critical Gap Identified**: The `DeleteProduct` mutation does NOT validate whether a product has been used in orders. This validation must be added to implement the delete/deactivate business logic.

## Existing GraphQL Mutations

### 1. CreateProduct

**Location**: `server/Astro.Api/Products/GraphQL/Mutation.cs:27-36`

**Signature**:
```csharp
public async Task<Product> CreateProduct(
    CreateProductCommand command,
    [Service] IMediator mediator,
    [Service] ITopicEventSender eventSender,
    CancellationToken cancellationToken)
```

**Command** (`server/Astro.Application/Products/Commands/CreateProduct/CreateProductCommand.cs`):
```csharp
public sealed record CreateProductCommand(
    string Name,
    string? Description,
    decimal Price,
    string Sku,
    int StockQuantity,
    int LowStockThreshold,
    bool IsActive,
    string CreatedBy,
    List<CreateProductDetailDto>? Details) : IRequest<Product>;
```

**Validation** (`CreateProductCommandValidator.cs`):
- Name: Required, max 200 chars
- SKU: Required, max 50 chars
- Price: Must be > 0
- StockQuantity: Must be >= 0
- LowStockThreshold: Must be >= 0

**Returns**: `Product` entity

**Errors**: `ValidationException`

**Notes**:
- Images are NOT created via this command (separate AddProductImage mutation)
- ProductDetail entities created if Details provided
- Fires subscription: `OnProductCreated`

---

### 2. UpdateProduct

**Location**: `server/Astro.Api/Products/GraphQL/Mutation.cs:43-52`

**Command** (`server/Astro.Application/Products/Commands/UpdateProduct/UpdateProductCommand.cs`):
```csharp
public sealed record UpdateProductCommand(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    string Sku,
    int StockQuantity,
    int LowStockThreshold,
    bool IsActive,
    string ModifiedBy) : IRequest<Product>;
```

**Validation** (`UpdateProductCommandValidator.cs`):
- Same rules as CreateProduct
- Additionally validates Id is not empty

**Returns**: `Product` entity

**Errors**: `ValidationException`, `ProductNotFoundException`

**Notes**:
- Updating images requires separate AddProductImage/RemoveProductImage calls
- Can be used to deactivate (IsActive = false) or set stock to 0
- Fires subscription: `OnProductUpdated`

---

### 3. DeleteProduct ⚠️

**Location**: `server/Astro.Api/Products/GraphQL/Mutation.cs:58-67`

**Command** (`server/Astro.Application/Products/Commands/DeleteProduct/DeleteProductCommand.cs`):
```csharp
public sealed record DeleteProductCommand(Guid Id) : IRequest;
```

**Handler** (`DeleteProductCommandHandler.cs`):
```csharp
public async Task Handle(DeleteProductCommand request, CancellationToken cancellationToken)
{
    var product = await _repository.GetByIdAsync(request.Id, cancellationToken)
        ?? throw new ProductNotFoundException(request.Id);

    await _repository.DeleteAsync(product, cancellationToken);
}
```

**Returns**: `DeleteResponse(Guid Id)`

**Errors**: `ProductNotFoundException`

**⚠️ MISSING VALIDATION**:
- Does NOT check if product is referenced in OrderDetail
- Allows deletion of products used in historical orders
- **Required Enhancement**: Add order-usage check before deletion

**Notes**:
- Hard delete (permanent removal from database)
- Fires subscription: `OnProductDeleted`

---

### 4. UpdateStock

**Location**: `server/Astro.Api/Products/GraphQL/Mutation.cs:74-83`

**Command** (`server/Astro.Application/Products/Commands/UpdateStock/UpdateStockCommand.cs`):
```csharp
public sealed record UpdateStockCommand(
    Guid ProductId,
    int StockQuantity,
    string ModifiedBy) : IRequest<Product>;
```

**Validation**:
- ProductId: Not empty
- StockQuantity: Must be >= 0

**Returns**: `Product` entity

**Errors**: `ValidationException`, `ProductNotFoundException`

**Notes**:
- Convenience mutation for stock-only updates
- Alternative to UpdateProduct when only stock changes
- Fires subscription: `OnStockUpdated`

---

### 5. AddProductImage

**Location**: `server/Astro.Api/Products/GraphQL/Mutation.cs:90-99`

**Command** (`server/Astro.Application/Products/Commands/AddProductImage/AddProductImageCommand.cs`):
```csharp
public sealed record AddProductImageCommand(
    Guid ProductId,
    string FileName,
    string Url,
    StorageMode StorageMode,
    bool IsPrimary,
    string CreatedBy) : IRequest<ProductImage>;
```

**Validation** (`AddProductImageCommandValidator.cs`):
- ProductId: Not empty
- FileName: Required, max 255 chars
- Url: Required, max 2000 chars, must be valid URL
- IsPrimary: Boolean (no validation)
- StorageMode: Must be valid enum (Aws, Azure, Url)

**Returns**: `ProductImage` entity

**Errors**: `ValidationException`, `ProductNotFoundException`

**Important Domain Logic** (`server/Astro.Domain/Products/Entities/Product.cs:AddImage`):
```csharp
public void AddImage(ProductImage image)
{
    if (image.IsPrimary)
    {
        // Remove primary flag from existing primary image
        var existingPrimary = _images.FirstOrDefault(i => i.IsPrimary);
        existingPrimary?.SetNotPrimary();
    }
    _images.Add(image);
}
```

**Notes**:
- Product domain automatically handles primary image logic
- Only one image can be primary at a time
- Adding new primary image removes previous primary designation
- Fires subscription: `OnProductImageAdded`

---

### 6. RemoveProductImage

**Location**: `server/Astro.Api/Products/GraphQL/Mutation.cs:105-114`

**Command** (`server/Astro.Application/Products/Commands/RemoveProductImage/RemoveProductImageCommand.cs`):
```csharp
public sealed record RemoveProductImageCommand(
    Guid ProductId,
    Guid ImageId) : IRequest;
```

**Handler**:
- Fetches product
- Removes image from product's image collection
- Persists changes

**Returns**: `DeleteResponse(Guid ImageId)`

**Errors**: `ProductNotFoundException`

**Notes**:
- Does NOT validate if removing the last or primary image
- Frontend should handle this validation
- Fires subscription: `OnProductImageRemoved`

---

## Order-Product Relationship Analysis

### OrderDetail Entity

**Location**: `server/Astro.Domain/Orders/Entities/OrderDetail.cs`

```csharp
public class OrderDetail : Entity
{
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = null!;
    public string ProductSku { get; private set; } = null!;
    public int Quantity { get; private set; }
    public Money UnitPrice { get; private set; } = null!;
    public Money LineTotal => UnitPrice.Multiply(Quantity);
}
```

**Key Findings**:
- OrderDetail stores `ProductId` (Guid reference)
- Also stores snapshot: ProductName, ProductSku, UnitPrice
- **No foreign key constraint** (by design - allows product deletion at DB level)
- **Business logic should prevent deletion** when OrderDetail.ProductId exists

**Implication**:
- Can query OrderDetail table to check if product has been ordered
- Query: `SELECT COUNT(*) FROM OrderDetails WHERE ProductId = @productId`
- If count > 0, product is "in use" and should not be deleted

### Proposed Solution

**Add to IOrderRepository** (`server/Astro.Domain/Orders/Repositories/IOrderRepository.cs`):
```csharp
Task<bool> HasProductOrdersAsync(Guid productId, CancellationToken cancellationToken);
```

**Implement in OrderRepository** (`server/Astro.Infrastructure/Orders/Repositories/OrderRepository.cs`):
```csharp
public async Task<bool> HasProductOrdersAsync(Guid productId, CancellationToken cancellationToken)
{
    return await _context.Set<OrderDetail>()
        .AnyAsync(od => od.ProductId == productId, cancellationToken);
}
```

**Update DeleteProductCommandHandler**:
```csharp
public async Task Handle(DeleteProductCommand request, CancellationToken cancellationToken)
{
    var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken)
        ?? throw new ProductNotFoundException(request.Id);

    // NEW: Check if product is used in orders
    var isUsedInOrders = await _orderRepository.HasProductOrdersAsync(request.Id, cancellationToken);
    if (isUsedInOrders)
    {
        throw new ProductInUseException(request.Id,
            $"Cannot delete product {request.Id} because it has been used in one or more orders.");
    }

    await _productRepository.DeleteAsync(product, cancellationToken);
}
```

**Create ProductInUseException**:
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

**Update GraphQL Mutation**:
```csharp
[Error<ProductNotFoundException>]
[Error<ProductInUseException>]  // NEW
public async Task<DeleteResponse> DeleteProduct(...)
```

---

## Storage Modes

**Location**: `server/Astro.Domain/Products/Enums/StorageMode.cs`

```csharp
public enum StorageMode
{
    Aws = 1,
    Azure = 2,
    Url = 3
}
```

**Usage**:
- ProductImage.StorageMode indicates cloud storage provider
- Frontend can display this info or use for provider-specific logic
- Validation ensures only valid enum values accepted

**Note**: Specification says "AWS or Azure doesn't really matter, just needs to be a URL"
- StorageMode is informational only
- Url variant covers generic cloud storage
- No provider-specific validation (e.g., checking AWS S3 URL format)

---

## GraphQL Error Handling

**Pattern Observed**:

All mutations use `[Error<TException>]` attributes:
```csharp
[Error<ValidationException>]
[Error<ProductNotFoundException>]
public async Task<Product> UpdateProduct(...)
```

**HotChocolate Behavior**:
- Exceptions with `[Error<T>]` are mapped to GraphQL errors
- Error types exposed in GraphQL schema
- Clients can handle specific error types

**Implications for Frontend**:
- Apollo Angular can catch typed errors
- ProductInUseException will be exposed as GraphQL error
- Frontend can check error type and show appropriate UI (deactivate option)

---

## GraphQL Subscriptions

**Location**: `server/Astro.Api/Products/GraphQL/Subscription.cs`

**Subscriptions Available**:
- `OnProductCreated` - Fires when product created
- `OnProductUpdated` - Fires when product updated
- `OnProductDeleted` - Fires when product deleted
- `OnStockUpdated` - Fires when stock updated
- `OnProductImageAdded` - Fires when image added
- `OnProductImageRemoved` - Fires when image removed

**Current Frontend Usage**: Not used (out of scope for this feature)

**Future Enhancement**: Frontend could subscribe to real-time product updates for collaborative editing

---

## Testing Infrastructure

### Integration Tests

**Location**: `e2e/Astro.IntegrationTests/Products/ProductTests.cs`

**Existing Tests**:
- CreateProduct mutation
- UpdateProduct mutation
- GetProducts query
- AddProductImage mutation

**GraphQL Payloads**: `e2e/Astro.IntegrationTests/Products/Payloads/*.graphql`
- CreateProduct.graphql
- UpdateProduct.graphql
- GetProducts.graphql
- AddProductImage.graphql

**Required New Tests**:
1. DeleteProduct when product has no orders (success)
2. DeleteProduct when product in orders (ProductInUseException)
3. Deactivate product (UpdateProduct with IsActive=false, StockQuantity=0)

---

## Performance Considerations

### Order Usage Check

**Query**:
```sql
SELECT EXISTS(SELECT 1 FROM OrderDetails WHERE ProductId = @productId)
```

**Performance**:
- Requires index on `OrderDetails.ProductId` for fast lookup
- Likely already indexed (foreign key column)
- Should complete in < 10ms even with millions of orders

**Recommendation**:
- Verify index exists: `CREATE INDEX IX_OrderDetails_ProductId ON OrderDetails(ProductId)`
- If performance becomes issue, can cache product-usage flag on Product entity
- For MVP, simple query is sufficient

---

## Summary of Required Backend Changes

1. ✅ **IOrderRepository Interface**
   - Add: `Task<bool> HasProductOrdersAsync(Guid productId, CancellationToken cancellationToken)`

2. ✅ **OrderRepository Implementation**
   - Implement: Query OrderDetail for ProductId existence

3. ✅ **ProductInUseException**
   - Create: New exception class in `Astro.Application/Products/Exceptions/`

4. ✅ **DeleteProductCommandHandler**
   - Modify: Inject IOrderRepository, check before delete, throw exception if used

5. ✅ **ProductMutation (GraphQL)**
   - Modify: Add `[Error<ProductInUseException>]` to DeleteProduct

6. ✅ **Unit Tests**
   - Add: Tests for DeleteProductCommandHandler with order usage scenarios

7. ✅ **Integration Tests**
   - Add: E2E tests for delete validation

8. 🔍 **Database Index** (Verify)
   - Ensure: Index on OrderDetails.ProductId exists

---

## Conclusion

The backend provides a solid foundation for product management with Clean Architecture and CQRS patterns. The only missing piece is order-usage validation in the delete operation. This can be implemented cleanly by:

1. Adding a repository method to check order usage
2. Throwing a specific exception when deletion is blocked
3. Exposing the exception as a GraphQL error

The frontend can then catch this error and offer the deactivate operation as an alternative, fulfilling the specification requirement that "a product cannot be deleted if already used in an order."

All other required mutations (Create, Update, Image Management) are fully implemented and production-ready.
