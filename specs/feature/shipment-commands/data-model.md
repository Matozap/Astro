# Data Model: Shipment Commands

**Feature**: Shipment Commands
**Date**: 2026-01-21
**Status**: Complete

## Overview

This document defines the TypeScript interfaces and types required for the shipment create and update operations on the Angular frontend. The backend entities already exist; this focuses on client-side models.

---

## Existing Models (Reference)

These models already exist in `client/src/app/shared/models/`:

### shipment.model.ts (existing)
```typescript
export type ShipmentStatus =
  | 'Pending'
  | 'PickedUp'
  | 'Shipped'
  | 'InTransit'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Delayed'
  | 'Failed'
  | 'FailedDelivery'
  | 'Returned';

export interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
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
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string;
}

export interface TrackingDetail {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface ShipmentItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
}
```

### common.model.ts (existing)
```typescript
export interface Money {
  amount: number;
  currency: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Weight {
  value: number;
  unit: 'kg' | 'lb';
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}
```

---

## New Models (To Add to shipment.model.ts)

### CreateShipmentInput

Input type for the createShipment mutation.

```typescript
/**
 * Input for creating a new shipment.
 * Maps to CreateShipmentCommandInput in GraphQL.
 */
export interface CreateShipmentInput {
  orderId: string;
  carrier: string;
  trackingNumber?: string;
  originStreet: string;
  originCity: string;
  originState: string;
  originPostalCode: string;
  originCountry: string;
  destinationStreet: string;
  destinationCity: string;
  destinationState: string;
  destinationPostalCode: string;
  destinationCountry: string;
  weight: number;
  weightUnit: WeightUnit;
  length: number;
  width: number;
  height: number;
  dimensionUnit: DimensionUnit;
  shippingCost: number;
  estimatedDeliveryDate?: string;
  createdBy: string;
  items: CreateShipmentItemInput[];
}

/**
 * Item to include in a new shipment.
 */
export interface CreateShipmentItemInput {
  orderDetailId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
}

/**
 * Weight unit options matching backend enum.
 */
export type WeightUnit = 'KILOGRAMS' | 'POUNDS';

/**
 * Dimension unit options matching backend enum.
 */
export type DimensionUnit = 'CENTIMETERS' | 'INCHES';
```

### UpdateShipmentInput

Input type for the updateShipment mutation.

```typescript
/**
 * Input for updating an existing shipment.
 * Maps to UpdateShipmentCommandInput in GraphQL.
 * All fields except id and modifiedBy are optional.
 */
export interface UpdateShipmentInput {
  id: string;
  carrier?: string;
  trackingNumber?: string;
  status?: ShipmentStatus;
  statusLocation?: string;
  statusNotes?: string;
  modifiedBy: string;
}
```

### Status Transitions Map

```typescript
/**
 * Valid status transitions for the shipment state machine.
 * Used by UI to determine available status options.
 */
export const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  'Pending': ['Shipped'],
  'Shipped': ['InTransit', 'Delayed', 'FailedDelivery'],
  'InTransit': ['OutForDelivery', 'Delayed', 'FailedDelivery'],
  'OutForDelivery': ['Delivered', 'FailedDelivery', 'Delayed'],
  'Delayed': ['InTransit', 'OutForDelivery', 'FailedDelivery'],
  'FailedDelivery': ['Returned', 'InTransit'],
  'Delivered': [],  // Terminal state
  'Returned': [],   // Terminal state
  'PickedUp': ['Shipped', 'InTransit'],  // Mapped for UI compatibility
  'Failed': ['Returned', 'InTransit'],   // Mapped for UI compatibility
};

/**
 * Check if a shipment status is terminal (no further transitions).
 */
export function isTerminalStatus(status: ShipmentStatus): boolean {
  return status === 'Delivered' || status === 'Returned';
}

/**
 * Get available status transitions for current status.
 */
export function getAvailableTransitions(currentStatus: ShipmentStatus): ShipmentStatus[] {
  return SHIPMENT_STATUS_TRANSITIONS[currentStatus] || [];
}
```

### Dialog Data Interfaces

```typescript
/**
 * Data passed to StatusUpdateDialogComponent.
 */
export interface StatusUpdateDialogData {
  shipment: Shipment;
  newStatus: ShipmentStatus;
}

/**
 * Result from StatusUpdateDialogComponent.
 */
export interface StatusUpdateDialogResult {
  status: ShipmentStatus;
  location?: string;
  notes?: string;
}

/**
 * Data passed to ShipmentEditDialogComponent.
 */
export interface ShipmentEditDialogData {
  shipment: Shipment;
}

/**
 * Result from ShipmentEditDialogComponent.
 */
export interface ShipmentEditDialogResult {
  carrier: string;
  trackingNumber?: string;
}
```

### Carrier Options

```typescript
/**
 * Common carrier options for shipment creation.
 */
export const CARRIER_OPTIONS = [
  { value: 'USPS', label: 'USPS' },
  { value: 'FedEx', label: 'FedEx' },
  { value: 'UPS', label: 'UPS' },
  { value: 'DHL', label: 'DHL' },
  { value: 'Other', label: 'Other' },
];

/**
 * Weight unit options for form.
 */
export const WEIGHT_UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: 'POUNDS', label: 'lb' },
  { value: 'KILOGRAMS', label: 'kg' },
];

/**
 * Dimension unit options for form.
 */
export const DIMENSION_UNIT_OPTIONS: { value: DimensionUnit; label: string }[] = [
  { value: 'INCHES', label: 'in' },
  { value: 'CENTIMETERS', label: 'cm' },
];

/**
 * Currency options for shipping cost.
 */
export const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
```

---

## Entity Relationships

```
Order (existing)
├── id: string
├── orderNumber: string
├── customerName: string
├── shippingAddress: Address
└── details: OrderDetail[]

OrderDetail (existing)
├── id: string
├── productId: string
├── productName: string
├── productSku: string
├── quantity: number
└── unitPrice: Money

Shipment (existing)
├── id: string
├── orderId: string → Order.id
├── carrier: string
├── trackingNumber: string
├── status: ShipmentStatus
├── originAddress: Address
├── destinationAddress: Address
├── weight: Weight
├── dimensions: Dimensions
├── shippingCost: Money
├── estimatedDeliveryDate: string
├── actualDeliveryDate: string
├── trackingDetails: TrackingDetail[]
└── items: ShipmentItem[]

ShipmentItem
├── id: string
├── orderDetailId: string → OrderDetail.id (implicit)
├── productId: string → Product.id
├── productName: string
└── quantity: number
```

---

## Validation Rules

### CreateShipmentInput Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| orderId | Required, valid UUID | "Order is required" |
| carrier | Required, max 100 chars | "Carrier is required" / "Carrier max 100 characters" |
| trackingNumber | Optional, 5-50 chars if provided | "Tracking number must be 5-50 characters" |
| originStreet | Required, max 200 chars | "Origin street is required" |
| originCity | Required, max 100 chars | "Origin city is required" |
| originState | Required, max 100 chars | "Origin state is required" |
| originPostalCode | Required, max 20 chars | "Origin postal code is required" |
| originCountry | Required, max 100 chars | "Origin country is required" |
| destinationStreet | Required, max 200 chars | "Destination street is required" |
| destinationCity | Required, max 100 chars | "Destination city is required" |
| destinationState | Required, max 100 chars | "Destination state is required" |
| destinationPostalCode | Required, max 20 chars | "Destination postal code is required" |
| destinationCountry | Required, max 100 chars | "Destination country is required" |
| weight | Required, >= 0 | "Weight is required" / "Weight must be non-negative" |
| weightUnit | Required, enum value | "Weight unit is required" |
| length | Required, >= 0 | "Length is required" |
| width | Required, >= 0 | "Width is required" |
| height | Required, >= 0 | "Height is required" |
| dimensionUnit | Required, enum value | "Dimension unit is required" |
| shippingCost | Required, >= 0 | "Shipping cost is required" |
| estimatedDeliveryDate | Optional, future date | "Estimated delivery date should be in the future" |
| items | Required, at least 1 item | "At least one item is required" |

### UpdateShipmentInput Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| id | Required, valid UUID | "Shipment ID is required" |
| carrier | Optional, max 100 chars if provided | "Carrier max 100 characters" |
| trackingNumber | Optional, 5-100 chars if provided | "Tracking number must be 5-100 characters" |
| status | Optional, valid transition | "Invalid status transition" |
| statusLocation | Optional, max 200 chars | "Location max 200 characters" |
| statusNotes | Optional, max 1000 chars | "Notes max 1000 characters" |
| modifiedBy | Required | "Modified by is required" |

---

## State Transitions Diagram

```
                    ┌───────────┐
                    │  Pending  │
                    └─────┬─────┘
                          │
                          ▼
                    ┌───────────┐
              ┌─────│  Shipped  │─────┐
              │     └─────┬─────┘     │
              │           │           │
              ▼           ▼           ▼
        ┌─────────┐ ┌───────────┐ ┌──────────────┐
        │ Delayed │ │ InTransit │ │ FailedDelivery│
        └────┬────┘ └─────┬─────┘ └───────┬──────┘
             │            │               │
             └────────────┼───────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ OutForDelivery│
                  └───────┬───────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
        ┌─────────┐ ┌───────────┐ ┌──────────────┐
        │ Delayed │ │ Delivered │ │ FailedDelivery│
        └─────────┘ └───────────┘ └───────┬──────┘
                          │               │
                          │               ▼
                          │         ┌──────────┐
                          │         │ Returned │
                          │         └──────────┘
                          ▼
                    (Terminal)
```
