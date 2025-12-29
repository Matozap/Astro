import { Money, Address, StringFilterInput, DateTimeFilterInput } from './common.model';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: Address;
  status: OrderStatus;
  totalAmount: Money;
  total?: Money;
  notes: string | null;
  details: OrderDetail[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string;
}

export interface OrderDetail {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
}

// GraphQL input types
export interface OrderFilterInput {
  orderNumber?: StringFilterInput;
  customerName?: StringFilterInput;
  customerEmail?: StringFilterInput;
  status?: { eq?: OrderStatus; in?: OrderStatus[] };
  createdAt?: DateTimeFilterInput;
}

export interface OrderSortInput {
  orderNumber?: 'ASC' | 'DESC';
  customerName?: 'ASC' | 'DESC';
  status?: 'ASC' | 'DESC';
  totalAmount?: 'ASC' | 'DESC';
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  shippingAddress: Address;
  notes?: string;
  items: { productId: string; quantity: number }[];
}

export interface UpdateOrderStatusInput {
  id: string;
  status: OrderStatus;
}

// Order status display helpers
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: 'warning',
  Confirmed: 'info',
  Processing: 'primary',
  Shipped: 'primary',
  Delivered: 'success',
  Cancelled: 'error',
  Refunded: 'secondary',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Processing: 'Processing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
  Refunded: 'Refunded',
};
