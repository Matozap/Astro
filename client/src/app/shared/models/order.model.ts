import { Money, Address, StringFilterInput, DateTimeFilterInput } from './common.model';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

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
  productSku: string;
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
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'primary',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
  REFUNDED: 'secondary',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};
