# Data Model: Angular Frontend Application

**Feature**: 001-angular-frontend | **Date**: 2025-12-21

This document defines the TypeScript interfaces and models for the Angular frontend, mapping to the existing GraphQL API schema.

---

## Core Value Objects

### Money
```typescript
interface Money {
  amount: number;
  currency: string;
}
```

### Address
```typescript
interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
```

### Weight
```typescript
interface Weight {
  value: number;
  unit: 'kg' | 'lb';
}
```

### Dimensions
```typescript
interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}
```

---

## Entity Models

### Product

```typescript
interface Product {
  id: string;                    // UUID
  name: string;
  description: string | null;
  price: Money;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isLowStock: boolean;           // Computed field
  details: ProductDetail[];
  images: ProductImage[];
  createdAt: string;             // ISO DateTime
  updatedAt: string;
  createdBy: string;
  modifiedBy: string;
}

interface ProductDetail {
  id: string;
  key: string;
  value: string;
}

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  storageMode: 'Url' | 'Base64';
}
```

**Validation Rules**:
- `name`: Required, max 200 characters
- `sku`: Required, unique, alphanumeric with dashes
- `price.amount`: Required, >= 0
- `stockQuantity`: Required, >= 0
- `lowStockThreshold`: Required, >= 0

---

### Order

```typescript
interface Order {
  id: string;                    // UUID
  orderNumber: string;           // Human-readable (e.g., "ORD-2024-001")
  customerName: string;
  customerEmail: string;
  shippingAddress: Address;
  status: OrderStatus;
  totalAmount: Money;            // Computed from line items
  notes: string | null;
  details: OrderDetail[];
  itemCount: number;             // Computed field
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string;
}

interface OrderDetail {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;              // Computed: quantity * unitPrice
}

type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';
```

**State Machine**:
```
Pending → Confirmed → Processing → Shipped → Delivered
  └─────────────→ Cancelled (from Pending, Confirmed, Processing)
```

**Validation Rules**:
- `customerName`: Required, max 100 characters
- `customerEmail`: Required, valid email format
- `shippingAddress`: All fields required
- `details`: At least one order detail required

---

### Payment

```typescript
interface Payment {
  id: string;                    // UUID
  orderId: string;
  status: PaymentStatus;
  amount: Money;
  paymentMethod: string | null;
  transactionId: string | null;
  order?: Order;                 // Navigation property
  createdAt: string;
  updatedAt: string;
}

type PaymentStatus =
  | 'Pending'
  | 'Successful'
  | 'Failed';
```

**State Machine**:
```
Pending → Successful
      └→ Failed
```

---

### Shipment

```typescript
interface Shipment {
  id: string;                    // UUID
  orderId: string;
  trackingNumber: string;        // Auto-generated
  carrier: string;
  status: ShipmentStatus;
  originAddress: Address;
  destinationAddress: Address;
  weight: Weight | null;
  dimensions: Dimensions | null;
  shippingCost: Money;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  trackingDetails: TrackingDetail[];
  items: ShipmentItem[];
  itemCount: number;             // Computed
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string;
}

interface TrackingDetail {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

interface ShipmentItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
}

type ShipmentStatus =
  | 'Pending'
  | 'Shipped'
  | 'InTransit'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Delayed'
  | 'FailedDelivery'
  | 'Returned';
```

**State Machine**:
```
Pending → Shipped → InTransit → OutForDelivery → Delivered
                         ↓ (can retry)        ↑
                      Delayed ←──────────→ FailedDelivery
                         └────────────→ Returned (terminal)
```

---

## Authentication Models

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: User;
  expiresAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
```

**Note**: Authentication models are frontend-only until backend implements auth.

---

## Dashboard Models

### Dashboard Metrics

```typescript
interface DashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;

  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;

  totalRevenue: Money;
  monthlyRevenue: Money;
  revenueGrowth: number;         // Percentage

  totalPayments: number;
  pendingPayments: number;
  successfulPayments: number;
  failedPayments: number;

  totalShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  delayedShipments: number;
}

interface RevenueDataPoint {
  month: string;                 // e.g., "Jan", "Feb"
  year: number;
  revenue: number;
  profit: number;
}

interface MetricCard {
  title: string;
  value: number | string;
  change: number;                // Percentage change
  changeDirection: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}
```

---

## Table/List Models

### Pagination

```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
}

interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### Filtering & Sorting

```typescript
interface FilterParams {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
  value: unknown;
}

interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

interface TableState {
  pagination: PaginationParams;
  filters: FilterParams[];
  sort: SortParams | null;
  searchTerm: string;
}
```

---

## GraphQL Input Types

### Product Inputs

```typescript
interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  details?: { key: string; value: string }[];
}

interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  isActive?: boolean;
  details?: { key: string; value: string }[];
}

interface UpdateStockInput {
  id: string;
  quantity: number;
  lowStockThreshold?: number;
}
```

### Order Inputs

```typescript
interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  shippingAddress: Address;
  notes?: string;
  items: { productId: string; quantity: number }[];
}

interface UpdateOrderStatusInput {
  id: string;
  status: OrderStatus;
}
```

### Filter Input Types (GraphQL)

```typescript
interface ProductFilterInput {
  name?: StringFilterInput;
  sku?: StringFilterInput;
  isActive?: boolean;
  isLowStock?: boolean;
  price?: DecimalFilterInput;
}

interface OrderFilterInput {
  orderNumber?: StringFilterInput;
  customerName?: StringFilterInput;
  customerEmail?: StringFilterInput;
  status?: OrderStatusFilterInput;
  createdAt?: DateTimeFilterInput;
}

interface ShipmentFilterInput {
  trackingNumber?: StringFilterInput;
  carrier?: StringFilterInput;
  status?: ShipmentStatusFilterInput;
  createdAt?: DateTimeFilterInput;
}

// Generic filter types
interface StringFilterInput {
  eq?: string;
  neq?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  in?: string[];
}

interface DecimalFilterInput {
  eq?: number;
  neq?: number;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
}

interface DateTimeFilterInput {
  eq?: string;
  neq?: string;
  gt?: string;
  gte?: string;
  lt?: string;
  lte?: string;
}
```

---

## UI State Models

```typescript
interface LayoutState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  currentRoute: string;
}

interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

interface NotificationState {
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
```

---

## Entity Relationships

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Product   │◄────│ OrderDetail │────►│    Order    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               │ 1:1
                                               ▼
                                        ┌─────────────┐
                                        │   Payment   │
                                        └─────────────┘
                                               │
                                               │ 1:N
                                               ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ShipmentItem │────►│  Shipment   │
                    └─────────────┘     └─────────────┘
```

---

## File Organization

```
client/src/app/shared/models/
├── index.ts                    # Barrel export
├── product.model.ts            # Product, ProductDetail, ProductImage
├── order.model.ts              # Order, OrderDetail, OrderStatus
├── payment.model.ts            # Payment, PaymentStatus
├── shipment.model.ts           # Shipment, TrackingDetail, ShipmentItem, ShipmentStatus
├── auth.model.ts               # User, LoginCredentials, AuthResult, AuthState
├── dashboard.model.ts          # DashboardMetrics, RevenueDataPoint, MetricCard
├── common.model.ts             # Money, Address, Weight, Dimensions
├── table.model.ts              # PaginationParams, FilterParams, SortParams, TableState
└── graphql-inputs.model.ts     # All GraphQL input types
```
