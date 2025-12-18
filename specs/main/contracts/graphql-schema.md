# GraphQL Schema Contracts

**Date**: 2025-12-14
**Technology**: HotChocolate v15.1.11

## Overview

Astro exposes a GraphQL API for each module. Each module has its own GraphQL endpoint
with queries, mutations, and subscriptions.

---

## Products API

**Endpoint**: `/graphql` (Products.Api)

### Types

```graphql
type Product {
  id: UUID!
  name: String!
  description: String
  price: Decimal!
  sku: String!
  stockQuantity: Int!
  lowStockThreshold: Int!
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime
  createdBy: String!
  modifiedBy: String
  details: [ProductDetail!]!
  images: [ProductImage!]!
}

type ProductDetail {
  id: UUID!
  key: String!
  value: String!
}

type ProductImage {
  id: UUID!
  fileName: String!
  url: String!
  storageMode: StorageMode!
  isPrimary: Boolean!
}

enum StorageMode {
  FILE_SYSTEM
  AZURE
  AWS
}
```

### Queries

```graphql
type Query {
  """
  Get all products with optional filtering, sorting, and pagination
  """
  products(
    where: ProductFilterInput
    order: [ProductSortInput!]
    first: Int
    after: String
    last: Int
    before: String
  ): ProductsConnection

  """
  Get a single product by ID
  """
  productById(id: UUID!): Product
}

input ProductFilterInput {
  and: [ProductFilterInput!]
  or: [ProductFilterInput!]
  id: UuidOperationFilterInput
  name: StringOperationFilterInput
  sku: StringOperationFilterInput
  price: DecimalOperationFilterInput
  isActive: BooleanOperationFilterInput
  stockQuantity: IntOperationFilterInput
}

input ProductSortInput {
  name: SortEnumType
  price: SortEnumType
  createdAt: SortEnumType
  stockQuantity: SortEnumType
}
```

### Mutations

```graphql
type Mutation {
  """
  Create a new product
  """
  createProduct(input: CreateProductInput!): CreateProductPayload!

  """
  Update an existing product
  """
  updateProduct(input: UpdateProductInput!): UpdateProductPayload!

  """
  Delete a product
  """
  deleteProduct(input: DeleteProductInput!): DeleteProductPayload!

  """
  Update product stock quantity
  """
  updateStock(input: UpdateStockInput!): UpdateStockPayload!

  """
  Add an image to a product
  """
  addProductImage(input: AddProductImageInput!): AddProductImagePayload!

  """
  Remove an image from a product
  """
  removeProductImage(input: RemoveProductImageInput!): RemoveProductImagePayload!
}

input CreateProductInput {
  name: String!
  description: String
  price: Decimal!
  sku: String!
  stockQuantity: Int!
  lowStockThreshold: Int
  isActive: Boolean
  details: [CreateProductDetailInput!]
}

input CreateProductDetailInput {
  key: String!
  value: String!
}

input UpdateProductInput {
  id: UUID!
  name: String
  description: String
  price: Decimal
  sku: String
  lowStockThreshold: Int
  isActive: Boolean
}

input DeleteProductInput {
  id: UUID!
}

input UpdateStockInput {
  productId: UUID!
  quantity: Int!
}

input AddProductImageInput {
  productId: UUID!
  fileName: String!
  url: String!
  storageMode: StorageMode!
  isPrimary: Boolean
}

input RemoveProductImageInput {
  productId: UUID!
  imageId: UUID!
}
```

### Subscriptions

```graphql
type Subscription {
  """
  Subscribe to product created events
  """
  onProductCreated: Product!

  """
  Subscribe to product updated events
  """
  onProductUpdated: Product!

  """
  Subscribe to product deleted events
  """
  onProductDeleted: UUID!

  """
  Subscribe to stock changes
  """
  onStockChanged: StockChangeEvent!
}

type StockChangeEvent {
  productId: UUID!
  previousQuantity: Int!
  newQuantity: Int!
  changedAt: DateTime!
}
```

---

## Orders API

**Endpoint**: `/graphql` (Orders.Api)

### Types

```graphql
type Order {
  id: UUID!
  orderNumber: String!
  customerName: String!
  customerEmail: String!
  shippingAddress: String!
  status: OrderStatus!
  totalAmount: Decimal!
  notes: String
  createdAt: DateTime!
  updatedAt: DateTime
  createdBy: String!
  modifiedBy: String
  details: [OrderDetail!]!
}

type OrderDetail {
  id: UUID!
  productId: UUID!
  productName: String!
  productSku: String!
  quantity: Int!
  unitPrice: Decimal!
  lineTotal: Decimal!
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

type ProductCache {
  productId: UUID!
  name: String!
  sku: String!
  price: Decimal!
  stockQuantity: Int!
  isActive: Boolean!
  lastUpdated: DateTime!
}
```

### Queries

```graphql
type Query {
  """
  Get all orders with optional filtering, sorting, and pagination
  """
  orders(
    where: OrderFilterInput
    order: [OrderSortInput!]
    first: Int
    after: String
    last: Int
    before: String
  ): OrdersConnection

  """
  Get a single order by ID
  """
  orderById(id: UUID!): Order

  """
  Get available products from cache (for order creation)
  """
  availableProducts(
    where: ProductCacheFilterInput
    first: Int
    after: String
  ): ProductCacheConnection
}

input OrderFilterInput {
  and: [OrderFilterInput!]
  or: [OrderFilterInput!]
  id: UuidOperationFilterInput
  orderNumber: StringOperationFilterInput
  customerName: StringOperationFilterInput
  customerEmail: StringOperationFilterInput
  status: OrderStatusOperationFilterInput
  totalAmount: DecimalOperationFilterInput
  createdAt: DateTimeOperationFilterInput
}

input OrderSortInput {
  orderNumber: SortEnumType
  customerName: SortEnumType
  totalAmount: SortEnumType
  status: SortEnumType
  createdAt: SortEnumType
}

input ProductCacheFilterInput {
  productId: UuidOperationFilterInput
  name: StringOperationFilterInput
  sku: StringOperationFilterInput
  isActive: BooleanOperationFilterInput
}
```

### Mutations

```graphql
type Mutation {
  """
  Create a new order
  """
  createOrder(input: CreateOrderInput!): CreateOrderPayload!

  """
  Cancel an existing order
  """
  cancelOrder(input: CancelOrderInput!): CancelOrderPayload!

  """
  Update order status
  """
  updateOrderStatus(input: UpdateOrderStatusInput!): UpdateOrderStatusPayload!

  """
  Update order details (before confirmation)
  """
  updateOrder(input: UpdateOrderInput!): UpdateOrderPayload!
}

input CreateOrderInput {
  customerName: String!
  customerEmail: String!
  shippingAddress: String!
  notes: String
  details: [CreateOrderDetailInput!]!
}

input CreateOrderDetailInput {
  productId: UUID!
  quantity: Int!
}

input CancelOrderInput {
  orderId: UUID!
  reason: String
}

input UpdateOrderStatusInput {
  orderId: UUID!
  newStatus: OrderStatus!
}

input UpdateOrderInput {
  orderId: UUID!
  customerName: String
  customerEmail: String
  shippingAddress: String
  notes: String
}
```

### Subscriptions

```graphql
type Subscription {
  """
  Subscribe to order created events
  """
  onOrderCreated: Order!

  """
  Subscribe to order status changes
  """
  onOrderStatusChanged: OrderStatusChangeEvent!
}

type OrderStatusChangeEvent {
  orderId: UUID!
  orderNumber: String!
  previousStatus: OrderStatus!
  newStatus: OrderStatus!
  changedAt: DateTime!
}
```

---

## Error Handling

All mutations return payload types that include potential errors:

```graphql
type CreateProductPayload {
  product: Product
  errors: [CreateProductError!]
}

union CreateProductError = ValidationError | DuplicateSkuError

type ValidationError implements Error {
  message: String!
  field: String!
}

type DuplicateSkuError implements Error {
  message: String!
  sku: String!
}
```

---

## Pagination

Both APIs use Relay-style cursor pagination:

```graphql
type ProductsConnection {
  edges: [ProductEdge!]!
  nodes: [Product!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type ProductEdge {
  cursor: String!
  node: Product!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```
