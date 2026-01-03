# Data Model: Connect Orders UI to Backend

**Date**: 2026-01-03
**Feature**: Connect Orders UI to Backend
**Branch**: `feature/orders-connect`

## Overview

This document describes the data models used in the frontend for the Orders feature. No new entities are created - this feature connects existing frontend models to the backend GraphQL API.

## Entities

### Order (Frontend Model)

The Order entity represents a customer order in the Angular frontend.

**Location**: `client/src/app/shared/models/order.model.ts`

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| id | string | Unique identifier (UUID) | Backend |
| orderNumber | string | Human-readable order number (e.g., "ORD-2024-001") | Backend |
| customerName | string | Customer's full name | Backend |
| customerEmail | string | Customer's email address | Backend |
| shippingAddress | Address | Shipping address value object | Backend |
| status | OrderStatus | Current order status | Backend |
| totalAmount | Money | Total order amount | Backend |
| total | Money (optional) | Alias for totalAmount (legacy) | Backend |
| notes | string \| null | Order notes | Backend |
| details | OrderDetail[] | Line items | Backend |
| itemCount | number | Total item count (computed) | Backend |
| createdAt | string | ISO 8601 timestamp | Backend |
| updatedAt | string | ISO 8601 timestamp | Backend |
| createdBy | string | User who created the order | Backend |
| modifiedBy | string | User who last modified | Backend |

### OrderDetail (Frontend Model)

The OrderDetail entity represents a line item within an order.

**Location**: `client/src/app/shared/models/order.model.ts`

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| id | string | Unique identifier (UUID) | Backend |
| productId | string | Reference to product | Backend |
| productName | string | Product name snapshot | Backend |
| productSku | string | Product SKU snapshot (NEW) | Backend |
| quantity | number | Quantity ordered | Backend |
| unitPrice | Money | Unit price at order time | Backend |
| lineTotal | Money | Computed line total | Backend |

### OrderStatus (Enumeration)

| Value | Description |
|-------|-------------|
| Pending | Order placed, awaiting confirmation |
| Confirmed | Order confirmed |
| Processing | Order being prepared |
| Shipped | Order shipped |
| Delivered | Order delivered |
| Cancelled | Order cancelled |
| Refunded | Order refunded |

### Supporting Types

#### Address

| Field | Type |
|-------|------|
| street | string |
| city | string |
| state | string |
| postalCode | string |
| country | string |

#### Money

| Field | Type |
|-------|------|
| amount | number |
| currency | string |

## GraphQL Response Types

### OrderConnection (NEW - for cursor-based pagination)

```typescript
interface OrderConnection {
  nodes: Order[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}
```

## Model Changes Required

### 1. Add productSku to OrderDetail

The backend includes `productSku` in OrderDetail which should be added to the frontend model for completeness:

```typescript
// In order.model.ts - OrderDetail interface
productSku: string;  // ADD THIS FIELD
```

### 2. Add OrderConnection Type

Define the GraphQL connection type for cursor-based pagination in the order service:

```typescript
interface OrderConnection {
  nodes: Order[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}
```

## Validation Rules

All validation is handled by the backend. The frontend should:

1. Display validation errors from GraphQL response
2. Prevent empty form submissions where applicable
3. Show appropriate UI states for loading/error conditions

## State Transitions

Order status follows a state machine defined in the backend:

```
Pending → Confirmed → Processing → Shipped → Delivered
    ↓          ↓           ↓          ↓
    └──────────┴───────────┴──────────┴──→ Cancelled

Delivered → Refunded
```

The frontend does not enforce these transitions - validation is handled server-side. Invalid transitions result in GraphQL errors that should be displayed to the user.
