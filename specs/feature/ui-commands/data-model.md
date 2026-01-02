# Data Model: Product Management GraphQL Schema

**Date**: 2025-12-31
**Feature**: Product Management with Safe Deletion
**Purpose**: Document GraphQL types, inputs, and operations for product management

## GraphQL Types

### Product

**Description**: Aggregate root representing a product in the catalog.

```graphql
type Product {
  id: UUID!
  sku: String!
  name: String!
  description: String
  price: Money!
  stockQuantity: Int!
  lowStockThreshold: Int!
  isActive: Boolean!
  isLowStock: Boolean!  # Computed: stockQuantity <= lowStockThreshold

  # Related entities
  images: [ProductImage!]!
  details: [ProductDetail!]!

  # Audit fields
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: String!
  modifiedBy: String
}
```

**Field Descriptions**:
- `id`: Unique identifier (GUID)
- `sku`: Stock Keeping Unit, unique identifier for inventory
- `name`: Product display name
- `description`: Optional detailed description
- `price`: Product price with currency (Money value object)
- `stockQuantity`: Current available stock
- `lowStockThreshold`: Quantity threshold for low-stock warnings
- `isActive`: Whether product is active in catalog (false = deactivated)
- `isLowStock`: Computed field (true if stockQuantity <= lowStockThreshold)
- `images`: Collection of product images
- `details`: Collection of key-value product attributes
- `createdAt/updatedAt`: Timestamps
- `createdBy/modifiedBy`: User identifiers for audit trail

---

### ProductImage

**Description**: Entity representing an image associated with a product.

```graphql
type ProductImage {
  id: UUID!
  productId: UUID!
  fileName: String!
  url: String!
  altText: String
  storageMode: StorageMode!
  isPrimary: Boolean!

  # Audit fields
  createdAt: DateTime!
  createdBy: String!
}
```

**Field Descriptions**:
- `id`: Unique identifier for the image
- `productId`: Parent product reference
- `fileName`: Original or display filename
- `url`: Full URL to the image (AWS S3, Azure Blob, or other)
- `altText`: Alternative text for accessibility (optional)
- `storageMode`: Cloud storage provider (Aws, Azure, Url)
- `isPrimary`: Whether this is the primary/featured image
- `createdAt/createdBy`: Audit trail

**Business Rules**:
- Only ONE image per product can have `isPrimary = true`
- Backend automatically removes primary flag from previous primary when new one is added
- Frontend should enforce one primary image in UI

---

### ProductDetail

**Description**: Key-value entity for additional product attributes.

```graphql
type ProductDetail {
  id: UUID!
  productId: UUID!
  key: String!
  value: String!
}
```

**Field Descriptions**:
- `key`: Attribute name (e.g., "Brand", "Material", "Dimensions")
- `value`: Attribute value

**Note**: Product details are outside the scope of UI commands feature but shown for completeness.

---

### Money

**Description**: Value object representing monetary amount with currency.

```graphql
type Money {
  amount: Decimal!
  currency: String!
}
```

**Example**:
```json
{
  "amount": 149.99,
  "currency": "USD"
}
```

---

### StorageMode

**Description**: Enum indicating cloud storage provider for product images.

```graphql
enum StorageMode {
  AWS      # Amazon S3
  AZURE    # Azure Blob Storage
  URL      # Generic URL (other providers or public URLs)
}
```

**Usage**:
- Informational only - no provider-specific validation
- Frontend can display storage provider icon/label
- URL variant covers all other cloud storage providers

---

### DeleteResponse

**Description**: Standard response for delete operations.

```graphql
type DeleteResponse {
  id: UUID!
}
```

**Field Descriptions**:
- `id`: ID of the deleted entity

---

## Input Types

### CreateProductCommand

**Description**: Input for creating a new product.

```graphql
input CreateProductCommand {
  name: String!
  description: String
  price: Decimal!
  sku: String!
  stockQuantity: Int!
  lowStockThreshold: Int!
  isActive: Boolean!
  createdBy: String!
  details: [CreateProductDetailDto!]
}

input CreateProductDetailDto {
  key: String!
  value: String!
}
```

**Validation Rules**:
- `name`: Required, max 200 characters
- `sku`: Required, max 50 characters, must be unique
- `price`: Required, must be > 0
- `stockQuantity`: Required, must be >= 0
- `lowStockThreshold`: Required, must be >= 0
- `isActive`: Required
- `createdBy`: Required

**Note**: Images are added separately via `AddProductImageCommand` after product creation.

---

### UpdateProductCommand

**Description**: Input for updating an existing product.

```graphql
input UpdateProductCommand {
  id: UUID!
  name: String!
  description: String
  price: Decimal!
  sku: String!
  stockQuantity: Int!
  lowStockThreshold: Int!
  isActive: Boolean!
  modifiedBy: String!
}
```

**Validation Rules**: Same as CreateProduct, plus:
- `id`: Required, must be non-empty GUID, must exist

**Usage for Deactivation**:
```graphql
mutation DeactivateProduct {
  updateProduct(command: {
    id: "..."
    # ... copy existing fields ...
    stockQuantity: 0
    isActive: false
    modifiedBy: "admin@example.com"
  }) {
    id
    isActive
    stockQuantity
  }
}
```

---

### DeleteProductCommand

**Description**: Input for deleting a product.

```graphql
input DeleteProductCommand {
  id: UUID!
}
```

**Validation Rules**:
- `id`: Required, must be non-empty GUID

**Business Logic** (Backend):
- Checks if product exists (throws `ProductNotFoundException` if not)
- Checks if product is used in orders (throws `ProductInUseException` if used)
- Only deletes if product has never been ordered

---

### AddProductImageCommand

**Description**: Input for adding an image to a product.

```graphql
input AddProductImageCommand {
  productId: UUID!
  fileName: String!
  url: String!
  storageMode: StorageMode!
  isPrimary: Boolean!
  createdBy: String!
}
```

**Validation Rules**:
- `productId`: Required, must exist
- `fileName`: Required, max 255 characters
- `url`: Required, max 2000 characters, must be valid URL format
- `storageMode`: Required, must be valid enum value
- `isPrimary`: Required

**Business Logic**:
- If `isPrimary = true`, backend automatically removes primary flag from existing primary image
- Ensures only one primary image per product at all times

---

### RemoveProductImageCommand

**Description**: Input for removing an image from a product.

```graphql
input RemoveProductImageCommand {
  productId: UUID!
  imageId: UUID!
}
```

**Validation Rules**:
- `productId`: Required
- `imageId`: Required, must exist

**Frontend Responsibility**:
- Should prevent removal of last image if business rules require at least one image
- Should warn user if removing primary image

---

### UpdateStockCommand

**Description**: Input for updating only the stock quantity of a product.

```graphql
input UpdateStockCommand {
  productId: UUID!
  stockQuantity: Int!
  modifiedBy: String!
}
```

**Validation Rules**:
- `productId`: Required, must exist
- `stockQuantity`: Required, must be >= 0

**Note**: Convenience mutation when only stock changes (alternative to UpdateProduct).

---

## GraphQL Queries

### products

**Description**: Retrieve paginated list of products with filtering and sorting.

```graphql
query GetProducts(
  $first: Int
  $after: String
  $where: ProductFilterInput
  $order: [ProductSortInput!]
) {
  products(first: $first, after: $after, where: $where, order: $order) {
    nodes {
      id
      sku
      name
      description
      price { amount currency }
      stockQuantity
      isActive
      createdAt
      updatedAt
      images {
        id
        url
        isPrimary
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

**Parameters**:
- `first`: Number of items to fetch (pagination)
- `after`: Cursor for pagination
- `where`: Filter criteria
- `order`: Sorting options

**ProductFilterInput**:
```graphql
input ProductFilterInput {
  name: StringOperationFilterInput
  sku: StringOperationFilterInput
  isActive: BooleanOperationFilterInput
  stockQuantity: IntOperationFilterInput
  # Additional filters available...
}

input StringOperationFilterInput {
  eq: String
  neq: String
  contains: String
  startsWith: String
  endsWith: String
}

input BooleanOperationFilterInput {
  eq: Boolean
  neq: Boolean
}
```

**ProductSortInput**:
```graphql
input ProductSortInput {
  name: SortEnumType
  sku: SortEnumType
  price: SortEnumType
  stockQuantity: SortEnumType
  createdAt: SortEnumType
}

enum SortEnumType {
  ASC
  DESC
}
```

---

### productById

**Description**: Retrieve a single product by ID.

```graphql
query GetProductById($id: UUID!) {
  productById(id: $id) {
    id
    sku
    name
    description
    price { amount currency }
    stockQuantity
    lowStockThreshold
    isActive
    createdAt
    updatedAt
    createdBy
    modifiedBy
    images {
      id
      url
      altText
      isPrimary
      storageMode
      fileName
      createdAt
      createdBy
    }
    details {
      id
      key
      value
    }
  }
}
```

**Parameters**:
- `id`: Product UUID

**Returns**: `Product` or `null` if not found

---

## GraphQL Mutations

### createProduct

```graphql
mutation CreateProduct($command: CreateProductCommand!) {
  createProduct(command: $command) {
    id
    sku
    name
    price { amount currency }
    stockQuantity
    isActive
    createdAt
  }
}
```

**Possible Errors**:
- `ValidationException` - Invalid input (field validation failures)

---

### updateProduct

```graphql
mutation UpdateProduct($command: UpdateProductCommand!) {
  updateProduct(command: $command) {
    id
    name
    price { amount currency }
    stockQuantity
    isActive
    updatedAt
    modifiedBy
  }
}
```

**Possible Errors**:
- `ValidationException` - Invalid input
- `ProductNotFoundException` - Product ID not found

---

### deleteProduct

```graphql
mutation DeleteProduct($command: DeleteProductCommand!) {
  deleteProduct(command: $command) {
    id
  }
}
```

**Possible Errors**:
- `ProductNotFoundException` - Product ID not found
- `ProductInUseException` - Product is referenced in orders (NEW)

**Error Handling (Frontend)**:
```typescript
try {
  await this.productService.deleteProduct(productId);
} catch (error) {
  if (error.graphQLErrors?.some(e => e.extensions?.code === 'PRODUCT_IN_USE')) {
    // Show deactivate dialog instead
    this.showDeactivateDialog(product);
  } else {
    // Show generic error
    this.notificationService.error('Failed to delete product');
  }
}
```

---

### addProductImage

```graphql
mutation AddProductImage($command: AddProductImageCommand!) {
  addProductImage(command: $command) {
    id
    productId
    url
    fileName
    isPrimary
    storageMode
    createdAt
  }
}
```

**Possible Errors**:
- `ValidationException` - Invalid URL, missing required fields
- `ProductNotFoundException` - Product ID not found

---

### removeProductImage

```graphql
mutation RemoveProductImage($command: RemoveProductImageCommand!) {
  removeProductImage(command: $command) {
    id
  }
}
```

**Possible Errors**:
- `ProductNotFoundException` - Product or image ID not found

---

### updateStock

```graphql
mutation UpdateStock($command: UpdateStockCommand!) {
  updateStock(command: $command) {
    id
    stockQuantity
    isLowStock
    updatedAt
  }
}
```

**Possible Errors**:
- `ValidationException` - Invalid stock quantity
- `ProductNotFoundException` - Product ID not found

---

## GraphQL Error Types

### ValidationException

**Structure**:
```json
{
  "errors": [
    {
      "message": "Validation failed",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "details": {
          "Name": ["Name is required."],
          "Price": ["Price must be greater than 0."]
        }
      }
    }
  ]
}
```

---

### ProductNotFoundException

**Structure**:
```json
{
  "errors": [
    {
      "message": "Product with ID '...' was not found.",
      "extensions": {
        "code": "PRODUCT_NOT_FOUND",
        "productId": "..."
      }
    }
  ]
}
```

---

### ProductInUseException (NEW)

**Structure**:
```json
{
  "errors": [
    {
      "message": "Cannot delete product '...' because it has been used in one or more orders.",
      "extensions": {
        "code": "PRODUCT_IN_USE",
        "productId": "..."
      }
    }
  ]
}
```

**Frontend Handling**:
- Check for `error.extensions.code === 'PRODUCT_IN_USE'`
- Display deactivate option instead of showing error
- Show user-friendly message: "This product cannot be deleted because it has been ordered. Would you like to deactivate it instead?"

---

## Relationship Diagram

```
Product (Aggregate Root)
├── ProductImage (1:N)
│   ├── id, url, fileName, isPrimary, storageMode
│   └── Constraint: Only ONE isPrimary = true
├── ProductDetail (1:N)
│   └── key, value pairs
└── OrderDetail (1:N via ProductId reference)
    └── Snapshot: ProductName, ProductSku, UnitPrice
    └── Used for: Delete validation (if exists, prevent delete)

Order
└── OrderDetail (1:N)
    └── ProductId (soft reference to Product)
```

**Key Relationships**:
- Product → ProductImage: One-to-many, cascade delete
- Product → ProductDetail: One-to-many, cascade delete
- Product → OrderDetail: One-to-many (soft reference), NO cascade delete
- OrderDetail stores ProductId for order history, but doesn't prevent Product table deletion
- **Business logic** prevents deletion if OrderDetail records exist

---

## Frontend TypeScript Types (Generated via GraphQL Code Generator)

**Example generated types**:

```typescript
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: Money;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isLowStock: boolean;
  images: ProductImage[];
  details: ProductDetail[];
  createdAt: string;  // ISO 8601 datetime
  updatedAt: string;
  createdBy: string;
  modifiedBy?: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  fileName: string;
  url: string;
  altText?: string | null;
  storageMode: StorageMode;
  isPrimary: boolean;
  createdAt: string;
  createdBy: string;
}

export enum StorageMode {
  AWS = 'AWS',
  AZURE = 'AZURE',
  URL = 'URL'
}

export interface CreateProductCommandInput {
  name: string;
  description?: string | null;
  price: number;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdBy: string;
  details?: CreateProductDetailDtoInput[] | null;
}

export interface AddProductImageCommandInput {
  productId: string;
  fileName: string;
  url: string;
  storageMode: StorageMode;
  isPrimary: boolean;
  createdBy: string;
}
```

---

## Summary

This data model provides comprehensive product management capabilities with:
- ✅ Full CRUD operations via GraphQL mutations
- ✅ Multi-image support with primary designation
- ✅ Cloud-agnostic image storage (AWS, Azure, generic URLs)
- ✅ Order-usage validation for safe deletion
- ✅ Deactivation workflow via UpdateProduct
- ✅ Rich filtering and sorting for product lists
- ✅ Strong typing with GraphQL schema
- ✅ Proper error handling with typed exceptions

All types align with backend domain model (Clean Architecture + DDD) and support the UI requirements defined in the specification.
