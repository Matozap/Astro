import { Money, Address, Weight, Dimensions, StringFilterInput, DateTimeFilterInput } from './common.model';

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

// GraphQL input types
export interface ShipmentFilterInput {
  trackingNumber?: StringFilterInput;
  carrier?: StringFilterInput;
  status?: { eq?: ShipmentStatus; in?: ShipmentStatus[] };
  orderId?: { eq?: string };
  createdAt?: DateTimeFilterInput;
}

export interface ShipmentSortInput {
  trackingNumber?: 'ASC' | 'DESC';
  carrier?: 'ASC' | 'DESC';
  status?: 'ASC' | 'DESC';
  estimatedDeliveryDate?: 'ASC' | 'DESC';
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
}

// Shipment status display helpers
export const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  Pending: 'warning',
  PickedUp: 'info',
  Shipped: 'info',
  InTransit: 'primary',
  OutForDelivery: 'primary',
  Delivered: 'success',
  Delayed: 'warning',
  Failed: 'error',
  FailedDelivery: 'error',
  Returned: 'error',
};

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  Pending: 'Pending',
  PickedUp: 'Picked Up',
  Shipped: 'Shipped',
  InTransit: 'In Transit',
  OutForDelivery: 'Out for Delivery',
  Delivered: 'Delivered',
  Delayed: 'Delayed',
  Failed: 'Failed',
  FailedDelivery: 'Failed Delivery',
  Returned: 'Returned',
};
