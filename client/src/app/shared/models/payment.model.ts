import { Money, DateTimeFilterInput } from './common.model';
import { Order } from './order.model';

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
  Pending: 'warning',
  Successful: 'success',
  Failed: 'error',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  Pending: 'Pending',
  Successful: 'Successful',
  Failed: 'Failed',
};
