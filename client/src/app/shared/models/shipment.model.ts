import { Money, Address, Weight, Dimensions, StringFilterInput, DateTimeFilterInput } from './common.model';

export type ShipmentStatus =
  | 'PENDING'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'FAILED_DELIVERY'
  | 'RETURNED';

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
  location: string | null;
  status: string;
  notes: string | null;
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
  PENDING: 'warning',
  SHIPPED: 'info',
  IN_TRANSIT: 'primary',
  OUT_FOR_DELIVERY: 'primary',
  DELIVERED: 'success',
  DELAYED: 'warning',
  FAILED_DELIVERY: 'error',
  RETURNED: 'error',
};

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: 'Pending',
  SHIPPED: 'Shipped',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  DELAYED: 'Delayed',
  FAILED_DELIVERY: 'Failed Delivery',
  RETURNED: 'Returned',
};

// T001: Input types for mutations
export type WeightUnit = 'KILOGRAMS' | 'POUNDS';
export type DimensionUnit = 'CENTIMETERS' | 'INCHES';

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

export interface CreateShipmentItemInput {
  orderDetailId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
}

// T002: Update shipment input type
export interface UpdateShipmentInput {
  id: string;
  carrier?: string;
  trackingNumber?: string;
  status?: ShipmentStatus;
  statusLocation?: string;
  statusNotes?: string;
  modifiedBy: string;
}

// T003: Status transitions for the state machine
export const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING: ['SHIPPED'],
  SHIPPED: ['IN_TRANSIT', 'DELAYED', 'FAILED_DELIVERY'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'DELAYED', 'FAILED_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED_DELIVERY', 'DELAYED'],
  DELAYED: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'FAILED_DELIVERY'],
  FAILED_DELIVERY: ['RETURNED', 'IN_TRANSIT'],
  DELIVERED: [],
  RETURNED: [],
};

export function isTerminalStatus(status: ShipmentStatus): boolean {
  return status === 'DELIVERED' || status === 'RETURNED';
}

export function getAvailableTransitions(currentStatus: ShipmentStatus): ShipmentStatus[] {
  return SHIPMENT_STATUS_TRANSITIONS[currentStatus] || [];
}

// T004: Dialog data interfaces
export interface StatusUpdateDialogData {
  shipment: Shipment;
  newStatus: ShipmentStatus;
}

export interface StatusUpdateDialogResult {
  status: ShipmentStatus;
  location?: string;
  notes?: string;
}

export interface ShipmentEditDialogData {
  shipment: Shipment;
}

export interface ShipmentEditDialogResult {
  carrier: string;
  trackingNumber?: string;
}

// T005: Form option constants
export const CARRIER_OPTIONS = [
  { value: 'USPS', label: 'USPS' },
  { value: 'FedEx', label: 'FedEx' },
  { value: 'UPS', label: 'UPS' },
  { value: 'DHL', label: 'DHL' },
  { value: 'Other', label: 'Other' },
];

export const WEIGHT_UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: 'POUNDS', label: 'lb' },
  { value: 'KILOGRAMS', label: 'kg' },
];

export const DIMENSION_UNIT_OPTIONS: { value: DimensionUnit; label: string }[] = [
  { value: 'INCHES', label: 'in' },
  { value: 'CENTIMETERS', label: 'cm' },
];

export const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
