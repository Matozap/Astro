import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Order, OrderFilterInput, OrderSortInput, OrderStatus } from '../../../shared/models/order.model';
import { PaginatedResult, PaginationParams } from '../../../shared/models/table.model';

// Mock data for development
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'John Smith',
    customerEmail: 'john.smith@example.com',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
    status: 'Delivered',
    totalAmount: { amount: 299.99, currency: 'USD' },
    notes: null,
    details: [
      {
        id: '1',
        productId: '1',
        productName: 'Wireless Bluetooth Headphones',
        quantity: 2,
        unitPrice: { amount: 149.99, currency: 'USD' },
        lineTotal: { amount: 299.98, currency: 'USD' },
      },
    ],
    itemCount: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    createdBy: 'system',
    modifiedBy: 'admin',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@example.com',
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'USA',
    },
    status: 'Shipped',
    totalAmount: { amount: 549.99, currency: 'USD' },
    notes: 'Please leave at door',
    details: [
      {
        id: '2',
        productId: '2',
        productName: 'Smart Watch Pro',
        quantity: 1,
        unitPrice: { amount: 299.99, currency: 'USD' },
        lineTotal: { amount: 299.99, currency: 'USD' },
      },
      {
        id: '3',
        productId: '5',
        productName: 'Mechanical Keyboard RGB',
        quantity: 1,
        unitPrice: { amount: 129.99, currency: 'USD' },
        lineTotal: { amount: 129.99, currency: 'USD' },
      },
    ],
    itemCount: 2,
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerName: 'Michael Brown',
    customerEmail: 'michael.b@example.com',
    shippingAddress: {
      street: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA',
    },
    status: 'Processing',
    totalAmount: { amount: 89.99, currency: 'USD' },
    notes: null,
    details: [
      {
        id: '4',
        productId: '8',
        productName: 'Webcam HD 1080p',
        quantity: 1,
        unitPrice: { amount: 89.99, currency: 'USD' },
        lineTotal: { amount: 89.99, currency: 'USD' },
      },
    ],
    itemCount: 1,
    createdAt: '2024-01-17T08:15:00Z',
    updatedAt: '2024-01-17T08:15:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerName: 'Emily Davis',
    customerEmail: 'emily.d@example.com',
    shippingAddress: {
      street: '321 Elm St',
      city: 'Houston',
      state: 'TX',
      postalCode: '77001',
      country: 'USA',
    },
    status: 'Pending',
    totalAmount: { amount: 449.99, currency: 'USD' },
    notes: 'Gift wrapping requested',
    details: [
      {
        id: '5',
        productId: '7',
        productName: 'Monitor 27" 4K',
        quantity: 1,
        unitPrice: { amount: 449.99, currency: 'USD' },
        lineTotal: { amount: 449.99, currency: 'USD' },
      },
    ],
    itemCount: 1,
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customerName: 'David Wilson',
    customerEmail: 'david.w@example.com',
    shippingAddress: {
      street: '654 Maple Dr',
      city: 'Phoenix',
      state: 'AZ',
      postalCode: '85001',
      country: 'USA',
    },
    status: 'Cancelled',
    totalAmount: { amount: 79.99, currency: 'USD' },
    notes: 'Customer requested cancellation',
    details: [
      {
        id: '6',
        productId: '4',
        productName: 'Laptop Stand Adjustable',
        quantity: 1,
        unitPrice: { amount: 79.99, currency: 'USD' },
        lineTotal: { amount: 79.99, currency: 'USD' },
      },
    ],
    itemCount: 1,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T10:30:00Z',
    createdBy: 'system',
    modifiedBy: 'admin',
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    customerName: 'Lisa Martinez',
    customerEmail: 'lisa.m@example.com',
    shippingAddress: {
      street: '987 Cedar Ln',
      city: 'Philadelphia',
      state: 'PA',
      postalCode: '19101',
      country: 'USA',
    },
    status: 'Confirmed',
    totalAmount: { amount: 199.97, currency: 'USD' },
    notes: null,
    details: [
      {
        id: '7',
        productId: '3',
        productName: 'USB-C Charging Cable 2m',
        quantity: 3,
        unitPrice: { amount: 19.99, currency: 'USD' },
        lineTotal: { amount: 59.97, currency: 'USD' },
      },
      {
        id: '8',
        productId: '6',
        productName: 'Wireless Mouse Ergonomic',
        quantity: 1,
        unitPrice: { amount: 49.99, currency: 'USD' },
        lineTotal: { amount: 49.99, currency: 'USD' },
      },
    ],
    itemCount: 4,
    createdAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-18T17:00:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
  {
    id: '7',
    orderNumber: 'ORD-2024-007',
    customerName: 'Robert Taylor',
    customerEmail: 'robert.t@example.com',
    shippingAddress: {
      street: '147 Birch Blvd',
      city: 'San Antonio',
      state: 'TX',
      postalCode: '78201',
      country: 'USA',
    },
    status: 'Refunded',
    totalAmount: { amount: 129.99, currency: 'USD' },
    notes: 'Defective product returned',
    details: [
      {
        id: '9',
        productId: '5',
        productName: 'Mechanical Keyboard RGB',
        quantity: 1,
        unitPrice: { amount: 129.99, currency: 'USD' },
        lineTotal: { amount: 129.99, currency: 'USD' },
      },
    ],
    itemCount: 1,
    createdAt: '2024-01-10T13:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    createdBy: 'system',
    modifiedBy: 'admin',
  },
  {
    id: '8',
    orderNumber: 'ORD-2024-008',
    customerName: 'Jennifer Anderson',
    customerEmail: 'jennifer.a@example.com',
    shippingAddress: {
      street: '258 Walnut Way',
      city: 'San Diego',
      state: 'CA',
      postalCode: '92101',
      country: 'USA',
    },
    status: 'Delivered',
    totalAmount: { amount: 349.98, currency: 'USD' },
    notes: null,
    details: [
      {
        id: '10',
        productId: '1',
        productName: 'Wireless Bluetooth Headphones',
        quantity: 1,
        unitPrice: { amount: 149.99, currency: 'USD' },
        lineTotal: { amount: 149.99, currency: 'USD' },
      },
      {
        id: '11',
        productId: '6',
        productName: 'Wireless Mouse Ergonomic',
        quantity: 4,
        unitPrice: { amount: 49.99, currency: 'USD' },
        lineTotal: { amount: 199.96, currency: 'USD' },
      },
    ],
    itemCount: 5,
    createdAt: '2024-01-12T10:30:00Z',
    updatedAt: '2024-01-16T15:00:00Z',
    createdBy: 'system',
    modifiedBy: 'system',
  },
];

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apollo = inject(Apollo);

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  getOrders(
    pagination: PaginationParams,
    filters?: OrderFilterInput,
    sort?: OrderSortInput
  ): Observable<PaginatedResult<Order>> {
    this._loading.set(true);

    // Mock implementation - TODO: Replace with GraphQL query
    return of(MOCK_ORDERS).pipe(
      delay(500),
      map((orders) => {
        let filtered = [...orders];

        // Apply search filter
        if (filters?.orderNumber?.contains) {
          const searchTerm = filters.orderNumber.contains.toLowerCase();
          filtered = filtered.filter(
            (o) =>
              o.orderNumber.toLowerCase().includes(searchTerm) ||
              o.customerName.toLowerCase().includes(searchTerm) ||
              o.customerEmail.toLowerCase().includes(searchTerm)
          );
        }

        // Apply status filter
        if (filters?.status?.eq) {
          filtered = filtered.filter((o) => o.status === filters.status?.eq);
        }

        if (filters?.status?.in && filters.status.in.length > 0) {
          filtered = filtered.filter((o) => filters.status?.in?.includes(o.status));
        }

        // Apply sorting (default: newest first)
        filtered.sort((a, b) => {
          if (sort) {
            const sortKey = Object.keys(sort)[0] as keyof Order;
            const sortDir = Object.values(sort)[0] as 'ASC' | 'DESC';
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal === undefined || bVal === undefined) return 0;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              return sortDir === 'ASC'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return sortDir === 'ASC' ? aVal - bVal : bVal - aVal;
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

  getOrderById(id: string): Observable<Order | null> {
    this._loading.set(true);

    return of(MOCK_ORDERS.find((o) => o.id === id) || null).pipe(
      delay(300),
      map((order) => {
        this._loading.set(false);
        return order;
      })
    );
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order | null> {
    this._loading.set(true);

    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
    }

    return of(order || null).pipe(
      delay(300),
      map((updatedOrder) => {
        this._loading.set(false);
        return updatedOrder;
      })
    );
  }
}
