import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Shipment, ShipmentFilterInput, ShipmentSortInput, ShipmentStatus } from '../../../shared/models/shipment.model';
import { PaginatedResult, PaginationParams } from '../../../shared/models/table.model';

// Mock data for development
const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: '1',
    orderId: '1',
    trackingNumber: 'TRK-2024-001-USPS',
    carrier: 'USPS',
    status: 'Delivered',
    originAddress: { street: '100 Warehouse Way', city: 'Memphis', state: 'TN', postalCode: '38118', country: 'USA' },
    destinationAddress: { street: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
    weight: { value: 0.5, unit: 'kg' },
    dimensions: { length: 10, width: 8, height: 4, unit: 'in' },
    shippingCost: { amount: 12.99, currency: 'USD' },
    estimatedDeliveryDate: '2024-01-18T00:00:00Z',
    actualDeliveryDate: '2024-01-18T14:30:00Z',
    trackingDetails: [
      { id: '1', timestamp: '2024-01-15T10:00:00Z', location: 'Memphis, TN', status: 'Picked Up', description: 'Package picked up from warehouse' },
      { id: '2', timestamp: '2024-01-16T06:00:00Z', location: 'Chicago, IL', status: 'In Transit', description: 'Package in transit to destination' },
      { id: '3', timestamp: '2024-01-17T14:00:00Z', location: 'New York, NY', status: 'Out for Delivery', description: 'Package out for delivery' },
      { id: '4', timestamp: '2024-01-18T14:30:00Z', location: 'New York, NY', status: 'Delivered', description: 'Package delivered to recipient' },
    ],
    items: [{ id: '1', productId: '1', productName: 'Wireless Bluetooth Headphones', quantity: 2 }],
    itemCount: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
  {
    id: '2',
    orderId: '2',
    trackingNumber: 'TRK-2024-002-FEDEX',
    carrier: 'FedEx',
    status: 'InTransit',
    originAddress: { street: '100 Warehouse Way', city: 'Memphis', state: 'TN', postalCode: '38118', country: 'USA' },
    destinationAddress: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'USA' },
    weight: { value: 1.2, unit: 'kg' },
    dimensions: { length: 14, width: 10, height: 6, unit: 'in' },
    shippingCost: { amount: 18.99, currency: 'USD' },
    estimatedDeliveryDate: '2024-01-20T00:00:00Z',
    actualDeliveryDate: null,
    trackingDetails: [
      { id: '5', timestamp: '2024-01-16T11:30:00Z', location: 'Memphis, TN', status: 'Picked Up', description: 'Package picked up from warehouse' },
      { id: '6', timestamp: '2024-01-17T08:00:00Z', location: 'Dallas, TX', status: 'In Transit', description: 'Package at sorting facility' },
      { id: '7', timestamp: '2024-01-18T12:00:00Z', location: 'Phoenix, AZ', status: 'In Transit', description: 'Package in transit' },
    ],
    items: [
      { id: '2', productId: '2', productName: 'Smart Watch Pro', quantity: 1 },
      { id: '3', productId: '5', productName: 'Mechanical Keyboard RGB', quantity: 1 },
    ],
    itemCount: 2,
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
  {
    id: '3',
    orderId: '3',
    trackingNumber: 'TRK-2024-003-UPS',
    carrier: 'UPS',
    status: 'Pending',
    originAddress: { street: '100 Warehouse Way', city: 'Memphis', state: 'TN', postalCode: '38118', country: 'USA' },
    destinationAddress: { street: '789 Pine Rd', city: 'Chicago', state: 'IL', postalCode: '60601', country: 'USA' },
    weight: { value: 0.3, unit: 'kg' },
    dimensions: { length: 8, width: 6, height: 3, unit: 'in' },
    shippingCost: { amount: 8.99, currency: 'USD' },
    estimatedDeliveryDate: '2024-01-22T00:00:00Z',
    actualDeliveryDate: null,
    trackingDetails: [],
    items: [{ id: '4', productId: '8', productName: 'Webcam HD 1080p', quantity: 1 }],
    itemCount: 1,
    createdAt: '2024-01-17T08:15:00Z',
    updatedAt: '2024-01-17T08:15:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
  {
    id: '4',
    orderId: '6',
    trackingNumber: 'TRK-2024-004-DHL',
    carrier: 'DHL',
    status: 'OutForDelivery',
    originAddress: { street: '100 Warehouse Way', city: 'Memphis', state: 'TN', postalCode: '38118', country: 'USA' },
    destinationAddress: { street: '987 Cedar Ln', city: 'Philadelphia', state: 'PA', postalCode: '19101', country: 'USA' },
    weight: { value: 0.8, unit: 'kg' },
    dimensions: { length: 12, width: 10, height: 5, unit: 'in' },
    shippingCost: { amount: 15.99, currency: 'USD' },
    estimatedDeliveryDate: '2024-01-19T00:00:00Z',
    actualDeliveryDate: null,
    trackingDetails: [
      { id: '8', timestamp: '2024-01-18T16:50:00Z', location: 'Memphis, TN', status: 'Picked Up', description: 'Package picked up' },
      { id: '9', timestamp: '2024-01-19T06:00:00Z', location: 'Philadelphia, PA', status: 'Out for Delivery', description: 'Package out for delivery' },
    ],
    items: [
      { id: '5', productId: '3', productName: 'USB-C Charging Cable 2m', quantity: 3 },
      { id: '6', productId: '6', productName: 'Wireless Mouse Ergonomic', quantity: 1 },
    ],
    itemCount: 4,
    createdAt: '2024-01-18T16:50:00Z',
    updatedAt: '2024-01-19T06:00:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
  {
    id: '5',
    orderId: '8',
    trackingNumber: 'TRK-2024-005-USPS',
    carrier: 'USPS',
    status: 'Delivered',
    originAddress: { street: '100 Warehouse Way', city: 'Memphis', state: 'TN', postalCode: '38118', country: 'USA' },
    destinationAddress: { street: '258 Walnut Way', city: 'San Diego', state: 'CA', postalCode: '92101', country: 'USA' },
    weight: { value: 1.5, unit: 'kg' },
    dimensions: { length: 16, width: 12, height: 8, unit: 'in' },
    shippingCost: { amount: 22.99, currency: 'USD' },
    estimatedDeliveryDate: '2024-01-16T00:00:00Z',
    actualDeliveryDate: '2024-01-16T15:00:00Z',
    trackingDetails: [
      { id: '10', timestamp: '2024-01-12T10:35:00Z', location: 'Memphis, TN', status: 'Picked Up', description: 'Package picked up' },
      { id: '11', timestamp: '2024-01-13T08:00:00Z', location: 'Albuquerque, NM', status: 'In Transit', description: 'Package in transit' },
      { id: '12', timestamp: '2024-01-15T10:00:00Z', location: 'San Diego, CA', status: 'Out for Delivery', description: 'Package out for delivery' },
      { id: '13', timestamp: '2024-01-16T15:00:00Z', location: 'San Diego, CA', status: 'Delivered', description: 'Package delivered' },
    ],
    items: [
      { id: '7', productId: '1', productName: 'Wireless Bluetooth Headphones', quantity: 1 },
      { id: '8', productId: '6', productName: 'Wireless Mouse Ergonomic', quantity: 4 },
    ],
    itemCount: 5,
    createdAt: '2024-01-12T10:35:00Z',
    updatedAt: '2024-01-16T15:00:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
  {
    id: '6',
    orderId: '7',
    trackingNumber: 'TRK-2024-006-FEDEX',
    carrier: 'FedEx',
    status: 'Returned',
    originAddress: { street: '100 Warehouse Way', city: 'Memphis', state: 'TN', postalCode: '38118', country: 'USA' },
    destinationAddress: { street: '147 Birch Blvd', city: 'San Antonio', state: 'TX', postalCode: '78201', country: 'USA' },
    weight: { value: 0.6, unit: 'kg' },
    dimensions: { length: 14, width: 12, height: 4, unit: 'in' },
    shippingCost: { amount: 14.99, currency: 'USD' },
    estimatedDeliveryDate: '2024-01-13T00:00:00Z',
    actualDeliveryDate: null,
    trackingDetails: [
      { id: '14', timestamp: '2024-01-10T13:05:00Z', location: 'Memphis, TN', status: 'Picked Up', description: 'Package picked up' },
      { id: '15', timestamp: '2024-01-11T10:00:00Z', location: 'Dallas, TX', status: 'In Transit', description: 'Package in transit' },
      { id: '16', timestamp: '2024-01-12T14:00:00Z', location: 'San Antonio, TX', status: 'Failed Delivery', description: 'Delivery failed - customer not available' },
      { id: '17', timestamp: '2024-01-14T09:00:00Z', location: 'San Antonio, TX', status: 'Returned', description: 'Package being returned to sender' },
    ],
    items: [{ id: '9', productId: '5', productName: 'Mechanical Keyboard RGB', quantity: 1 }],
    itemCount: 1,
    createdAt: '2024-01-10T13:05:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
  {
    id: '7',
    orderId: '4',
    trackingNumber: 'TRK-2024-007-UPS',
    carrier: 'UPS',
    status: 'Delayed',
    originAddress: { street: '100 Warehouse Way', city: 'Memphis', state: 'TN', postalCode: '38118', country: 'USA' },
    destinationAddress: { street: '321 Elm St', city: 'Houston', state: 'TX', postalCode: '77001', country: 'USA' },
    weight: { value: 4.5, unit: 'kg' },
    dimensions: { length: 24, width: 18, height: 12, unit: 'in' },
    shippingCost: { amount: 35.99, currency: 'USD' },
    estimatedDeliveryDate: '2024-01-20T00:00:00Z',
    actualDeliveryDate: null,
    trackingDetails: [
      { id: '18', timestamp: '2024-01-18T14:05:00Z', location: 'Memphis, TN', status: 'Picked Up', description: 'Package picked up' },
      { id: '19', timestamp: '2024-01-19T08:00:00Z', location: 'Little Rock, AR', status: 'In Transit', description: 'Package in transit' },
      { id: '20', timestamp: '2024-01-19T18:00:00Z', location: 'Little Rock, AR', status: 'Delayed', description: 'Package delayed due to weather conditions' },
    ],
    items: [{ id: '10', productId: '7', productName: 'Monitor 27" 4K', quantity: 1 }],
    itemCount: 1,
    createdAt: '2024-01-18T14:05:00Z',
    updatedAt: '2024-01-19T18:00:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
];

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {
  private readonly apollo = inject(Apollo);

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  getShipments(
    pagination: PaginationParams,
    filters?: ShipmentFilterInput,
    sort?: ShipmentSortInput
  ): Observable<PaginatedResult<Shipment>> {
    this._loading.set(true);

    // Mock implementation - TODO: Replace with GraphQL query
    return of(MOCK_SHIPMENTS).pipe(
      delay(500),
      map((shipments) => {
        let filtered = [...shipments];

        // Apply tracking number filter
        if (filters?.trackingNumber?.contains) {
          const term = filters.trackingNumber.contains.toLowerCase();
          filtered = filtered.filter((s) => s.trackingNumber.toLowerCase().includes(term));
        }

        // Apply carrier filter
        if (filters?.carrier?.eq) {
          filtered = filtered.filter((s) => s.carrier === filters.carrier?.eq);
        }

        // Apply status filter
        if (filters?.status?.eq) {
          filtered = filtered.filter((s) => s.status === filters.status?.eq);
        }

        if (filters?.status?.in && filters.status.in.length > 0) {
          filtered = filtered.filter((s) => filters.status?.in?.includes(s.status));
        }

        // Apply sorting (default: newest first)
        filtered.sort((a, b) => {
          if (sort) {
            const sortKey = Object.keys(sort)[0] as keyof Shipment;
            const sortDir = Object.values(sort)[0] as 'ASC' | 'DESC';
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal === undefined || aVal === null || bVal === undefined || bVal === null) return 0;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              return sortDir === 'ASC'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            }
            return 0;
          }
          // Default sort by createdAt DESC
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        const totalCount = filtered.length;
        const startIndex = pagination.page * pagination.pageSize;
        const paginated = filtered.slice(startIndex, startIndex + pagination.pageSize);

        this._loading.set(false);

        return {
          items: paginated,
          totalCount,
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPages: Math.ceil(totalCount / pagination.pageSize),
          hasNextPage: startIndex + pagination.pageSize < totalCount,
          hasPreviousPage: pagination.page > 0,
        };
      })
    );
  }

  getShipmentById(id: string): Observable<Shipment | null> {
    this._loading.set(true);

    return of(MOCK_SHIPMENTS.find((s) => s.id === id) || null).pipe(
      delay(300),
      map((shipment) => {
        this._loading.set(false);
        return shipment;
      })
    );
  }
}
