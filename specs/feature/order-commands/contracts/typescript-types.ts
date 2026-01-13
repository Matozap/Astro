// TypeScript Type Definitions for Order Management Commands
// Feature: Order Management Commands
// Date: 2026-01-07
// Generated from GraphQL schema - to be used with Apollo Angular codegen

/**
 * Order status enumeration
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

/**
 * Terminal statuses that cannot be edited
 */
export const TERMINAL_STATUSES: OrderStatus[] = [
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED
];

/**
 * Valid status transitions
 */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: []
};

/**
 * Input for creating a new order
 */
export interface CreateOrderCommandInput {
  customerName: string;
  customerEmail: string;
  shippingAddress: AddressInput;
  notes?: string | null;
  details: OrderDetailInput[];
  createdBy: string;
}

/**
 * Input for updating an existing order
 */
export interface UpdateOrderCommandInput {
  orderId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  shippingAddress?: AddressInput | null;
  notes?: string | null;
  modifiedBy: string;
}

/**
 * Input for cancelling an order
 */
export interface CancelOrderCommandInput {
  orderId: string;
  reason: string;
  cancelledBy: string;
}

/**
 * Input for updating order status
 */
export interface UpdateOrderStatusCommandInput {
  orderId: string;
  newStatus: OrderStatus;
  modifiedBy: string;
}

/**
 * Input for a single order line item
 */
export interface OrderDetailInput {
  productId: string;
  quantity: number;
}

/**
 * Input for shipping address
 */
export interface AddressInput {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Order entity
 */
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: Address;
  status: OrderStatus;
  totalAmount: number;
  notes?: string | null;
  details: OrderDetail[];
  itemCount: number;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  createdBy: string;
  modifiedBy?: string | null;
}

/**
 * Order line item
 */
export interface OrderDetail {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/**
 * Shipping address
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Order not found error
 */
export interface OrderNotFoundError {
  orderId: string;
  message: string;
}

/**
 * Business rule violation error
 */
export interface BusinessRuleViolationError {
  rule: string;
  message: string;
}

/**
 * Mutation response wrapper
 */
export interface MutationResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
      validationErrors?: ValidationError[];
    };
  }>;
}

/**
 * Create order mutation response
 */
export type CreateOrderResponse = MutationResponse<{ createOrder: Order }>;

/**
 * Update order mutation response
 */
export type UpdateOrderResponse = MutationResponse<{ updateOrder: Order }>;

/**
 * Cancel order mutation response
 */
export type CancelOrderResponse = MutationResponse<{ cancelOrder: Order }>;

/**
 * Update order status mutation response
 */
export type UpdateOrderStatusResponse = MutationResponse<{ updateOrderStatus: Order }>;

/**
 * Helper functions
 */

/**
 * Check if order status is terminal
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Check if status transition is valid
 */
export function canTransitionTo(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
  return STATUS_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false;
}

/**
 * Get valid next statuses for current status
 */
export function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[currentStatus] ?? [];
}

/**
 * Check if order can be edited (not in terminal status)
 */
export function canEditOrder(order: Order): boolean {
  return !isTerminalStatus(order.status);
}

/**
 * Check if order can be cancelled (not in terminal status)
 */
export function canCancelOrder(order: Order): boolean {
  return !isTerminalStatus(order.status);
}

/**
 * Format order total as currency
 */
export function formatOrderTotal(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate order total from line items
 */
export function calculateOrderTotal(details: OrderDetail[]): number {
  return details.reduce((sum, detail) => sum + detail.lineTotal, 0);
}
