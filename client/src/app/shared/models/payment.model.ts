import { Money, DateTimeFilterInput } from './common.model';
import { Order } from './order.model';

// Re-export Money for components that import from this module
export type { Money };

// Note: GraphQL returns enum values in UPPERCASE by default in HotChocolate
export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

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

// GraphQL input types
export interface PaymentFilterInput {
  orderId?: { eq?: string };
  status?: { eq?: PaymentStatus; in?: PaymentStatus[] };
  createdAt?: DateTimeFilterInput;
}

export interface PaymentSortInput {
  status?: 'ASC' | 'DESC';
  amount?: 'ASC' | 'DESC';
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
}

// Payment status display helpers
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'warning',
  SUCCESSFUL: 'success',
  FAILED: 'error',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  SUCCESSFUL: 'Successful',
  FAILED: 'Failed',
};

// Command input types for mutations
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

export interface UpdatePaymentStatusInput {
  /** The ID of the payment to update */
  paymentId: string;
  /** The new status (must be a valid transition) */
  newStatus: PaymentStatus;
}

/**
 * Defines valid status transitions for payments.
 * Payments can only transition from PENDING to SUCCESSFUL or FAILED.
 * Terminal states (SUCCESSFUL, FAILED) cannot transition further.
 */
export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  'PENDING': ['SUCCESSFUL', 'FAILED'],
  'SUCCESSFUL': [],  // Terminal state
  'FAILED': [],      // Terminal state
};

/**
 * Checks if a payment status can be updated (is not terminal).
 */
export function canUpdatePaymentStatus(status: PaymentStatus): boolean {
  const transitions = PAYMENT_STATUS_TRANSITIONS[status];
  return transitions ? transitions.length > 0 : false;
}

/**
 * Gets available target statuses for a given current status.
 */
export function getAvailablePaymentStatuses(currentStatus: PaymentStatus): PaymentStatus[] {
  return PAYMENT_STATUS_TRANSITIONS[currentStatus] || [];
}

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
