# Data Model: Payment Commands

**Feature**: Payment Commands
**Date**: 2026-01-15

## Overview

This document defines the TypeScript interfaces and types for the payment commands feature. These extend the existing payment model to support create and status update operations.

---

## Existing Types (No Changes Required)

### Payment Entity
**Location**: `client/src/app/shared/models/payment.model.ts`

```typescript
export type PaymentStatus = 'Pending' | 'Successful' | 'Failed';

export interface Payment {
  id: string;
  orderId: string;
  status: PaymentStatus;
  amount: Money;
  paymentMethod: string | null;
  transactionId: string | null;
  order?: Order;
  createdAt: string;
  updatedAt: string;
}
```

### Supporting Types
**Location**: `client/src/app/shared/models/common.model.ts`

```typescript
export interface Money {
  amount: number;
  currency: string;
}
```

---

## New Types (To Be Added)

### Create Payment Input
**Location**: `client/src/app/shared/models/payment.model.ts`

```typescript
/**
 * Input type for creating a new payment via GraphQL mutation.
 * Maps to CreatePaymentCommandInput in the backend schema.
 */
export interface CreatePaymentInput {
  /** The ID of the order this payment is for */
  orderId: string;
  /** The payment amount (must be > 0) */
  amount: number;
  /** Currency code (defaults to USD) */
  currency?: string;
  /** Payment method (e.g., "Credit Card", "PayPal") */
  paymentMethod?: string;
}
```

### Update Payment Status Input
**Location**: `client/src/app/shared/models/payment.model.ts`

```typescript
/**
 * Input type for updating payment status via GraphQL mutation.
 * Maps to UpdatePaymentStatusCommandInput in the backend schema.
 */
export interface UpdatePaymentStatusInput {
  /** The ID of the payment to update */
  paymentId: string;
  /** The new status (must be a valid transition) */
  newStatus: PaymentStatus;
}
```

### Payment Form Value
**Location**: `client/src/app/features/payments/components/payment-create/payment-create.component.ts`

```typescript
/**
 * Type representing the form value from the payment create form.
 */
export interface PaymentFormValue {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}
```

### Status Confirm Dialog Data
**Location**: `client/src/app/features/payments/dialogs/status-confirm-dialog/status-confirm-dialog.component.ts`

```typescript
/**
 * Data passed to the status confirmation dialog.
 */
export interface StatusConfirmDialogData {
  /** Current payment status */
  currentStatus: PaymentStatus;
  /** Target status to transition to */
  newStatus: PaymentStatus;
  /** Transaction ID for display (if available) */
  transactionId: string | null;
  /** Payment amount for display */
  amount: Money;
}
```

---

## Status Transition Constants

### Payment Status Transitions
**Location**: `client/src/app/shared/models/payment.model.ts`

```typescript
/**
 * Defines valid status transitions for payments.
 * Payments can only transition from Pending to Successful or Failed.
 * Terminal states (Successful, Failed) cannot transition further.
 */
export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  'Pending': ['Successful', 'Failed'],
  'Successful': [],  // Terminal state
  'Failed': [],      // Terminal state
};

/**
 * Checks if a payment status can be updated (is not terminal).
 */
export function canUpdatePaymentStatus(status: PaymentStatus): boolean {
  return PAYMENT_STATUS_TRANSITIONS[status].length > 0;
}

/**
 * Gets available target statuses for a given current status.
 */
export function getAvailablePaymentStatuses(currentStatus: PaymentStatus): PaymentStatus[] {
  return PAYMENT_STATUS_TRANSITIONS[currentStatus];
}
```

### Payment Method Options
**Location**: `client/src/app/shared/models/payment.model.ts`

```typescript
/**
 * Available payment method options for the create form.
 */
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'Credit Card', label: 'Credit Card', icon: 'credit_card' },
  { value: 'Debit Card', label: 'Debit Card', icon: 'credit_card' },
  { value: 'PayPal', label: 'PayPal', icon: 'account_balance_wallet' },
  { value: 'Bank Transfer', label: 'Bank Transfer', icon: 'account_balance' },
  { value: 'Cash', label: 'Cash', icon: 'payments' },
  { value: 'Other', label: 'Other', icon: 'more_horiz' },
] as const;

export type PaymentMethod = typeof PAYMENT_METHOD_OPTIONS[number]['value'];
```

---

## GraphQL Response Types

### Create Payment Response
```typescript
interface CreatePaymentResponse {
  createPayment: {
    payment: Payment;
  };
}
```

### Update Payment Status Response
```typescript
interface UpdatePaymentStatusResponse {
  updatePaymentStatus: {
    payment: Payment;
  };
}
```

---

## Validation Rules

### Create Payment Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| orderId | Required, valid UUID | "Order is required" |
| amount | Required, > 0 | "Amount must be greater than 0" |
| currency | Required, 3 chars | "Currency is required" |
| paymentMethod | Required | "Payment method is required" |

### Update Status Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| paymentId | Required, valid UUID | "Payment ID is required" |
| newStatus | Valid transition | "Invalid status transition" |

---

## Entity Relationships

```
┌─────────────┐       ┌─────────────┐
│   Order     │───────│   Payment   │
│             │  1:N  │             │
│ id          │       │ id          │
│ orderNumber │       │ orderId     │
│ customerName│       │ status      │
│ totalAmount │       │ amount      │
└─────────────┘       │ paymentMethod│
                      │ transactionId│
                      └─────────────┘
```

- One Order can have many Payments
- Each Payment belongs to exactly one Order
- Payment.orderId is a required foreign key reference
