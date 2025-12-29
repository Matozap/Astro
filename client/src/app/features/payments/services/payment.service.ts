import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Payment, PaymentFilterInput, PaymentSortInput, PaymentStatus } from '../../../shared/models/payment.model';
import { PaginatedResult, PaginationParams } from '../../../shared/models/table.model';

// Mock data for development
const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1',
    orderId: '1',
    status: 'Successful',
    amount: { amount: 299.99, currency: 'USD' },
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-2024-001-ABC',
    order: {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customerName: 'John Smith',
      customerEmail: 'john.smith@example.com',
      shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
      status: 'Delivered',
      totalAmount: { amount: 299.99, currency: 'USD' },
      notes: null,
      details: [],
      itemCount: 2,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
      createdBy: 'system',
      modifiedBy: 'admin',
    },
    createdAt: '2024-01-15T10:05:00Z',
    updatedAt: '2024-01-15T10:05:00Z',
  },
  {
    id: '2',
    orderId: '2',
    status: 'Successful',
    amount: { amount: 549.99, currency: 'USD' },
    paymentMethod: 'PayPal',
    transactionId: 'TXN-2024-002-DEF',
    order: {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@example.com',
      shippingAddress: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'USA' },
      status: 'Shipped',
      totalAmount: { amount: 549.99, currency: 'USD' },
      notes: null,
      details: [],
      itemCount: 2,
      createdAt: '2024-01-16T11:30:00Z',
      updatedAt: '2024-01-17T09:00:00Z',
      createdBy: 'system',
      modifiedBy: 'system',
    },
    createdAt: '2024-01-16T11:35:00Z',
    updatedAt: '2024-01-16T11:35:00Z',
  },
  {
    id: '3',
    orderId: '3',
    status: 'Pending',
    amount: { amount: 89.99, currency: 'USD' },
    paymentMethod: 'Credit Card',
    transactionId: null,
    order: {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customerName: 'Michael Brown',
      customerEmail: 'michael.b@example.com',
      shippingAddress: { street: '789 Pine Rd', city: 'Chicago', state: 'IL', postalCode: '60601', country: 'USA' },
      status: 'Processing',
      totalAmount: { amount: 89.99, currency: 'USD' },
      notes: null,
      details: [],
      itemCount: 1,
      createdAt: '2024-01-17T08:15:00Z',
      updatedAt: '2024-01-17T08:15:00Z',
      createdBy: 'system',
      modifiedBy: 'system',
    },
    createdAt: '2024-01-17T08:20:00Z',
    updatedAt: '2024-01-17T08:20:00Z',
  },
  {
    id: '4',
    orderId: '4',
    status: 'Pending',
    amount: { amount: 449.99, currency: 'USD' },
    paymentMethod: 'Bank Transfer',
    transactionId: null,
    order: {
      id: '4',
      orderNumber: 'ORD-2024-004',
      customerName: 'Emily Davis',
      customerEmail: 'emily.d@example.com',
      shippingAddress: { street: '321 Elm St', city: 'Houston', state: 'TX', postalCode: '77001', country: 'USA' },
      status: 'Pending',
      totalAmount: { amount: 449.99, currency: 'USD' },
      notes: null,
      details: [],
      itemCount: 1,
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-18T14:00:00Z',
      createdBy: 'system',
      modifiedBy: 'system',
    },
    createdAt: '2024-01-18T14:05:00Z',
    updatedAt: '2024-01-18T14:05:00Z',
  },
  {
    id: '5',
    orderId: '5',
    status: 'Failed',
    amount: { amount: 79.99, currency: 'USD' },
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-2024-005-FAIL',
    order: {
      id: '5',
      orderNumber: 'ORD-2024-005',
      customerName: 'David Wilson',
      customerEmail: 'david.w@example.com',
      shippingAddress: { street: '654 Maple Dr', city: 'Phoenix', state: 'AZ', postalCode: '85001', country: 'USA' },
      status: 'Cancelled',
      totalAmount: { amount: 79.99, currency: 'USD' },
      notes: null,
      details: [],
      itemCount: 1,
      createdAt: '2024-01-14T09:00:00Z',
      updatedAt: '2024-01-14T10:30:00Z',
      createdBy: 'system',
      modifiedBy: 'admin',
    },
    createdAt: '2024-01-14T09:05:00Z',
    updatedAt: '2024-01-14T09:10:00Z',
  },
  {
    id: '6',
    orderId: '6',
    status: 'Successful',
    amount: { amount: 199.97, currency: 'USD' },
    paymentMethod: 'Debit Card',
    transactionId: 'TXN-2024-006-GHI',
    order: {
      id: '6',
      orderNumber: 'ORD-2024-006',
      customerName: 'Lisa Martinez',
      customerEmail: 'lisa.m@example.com',
      shippingAddress: { street: '987 Cedar Ln', city: 'Philadelphia', state: 'PA', postalCode: '19101', country: 'USA' },
      status: 'Confirmed',
      totalAmount: { amount: 199.97, currency: 'USD' },
      notes: null,
      details: [],
      itemCount: 4,
      createdAt: '2024-01-18T16:45:00Z',
      updatedAt: '2024-01-18T17:00:00Z',
      createdBy: 'system',
      modifiedBy: 'system',
    },
    createdAt: '2024-01-18T16:50:00Z',
    updatedAt: '2024-01-18T16:50:00Z',
  },
  {
    id: '7',
    orderId: '7',
    status: 'Successful',
    amount: { amount: 129.99, currency: 'USD' },
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-2024-007-JKL',
    order: {
      id: '7',
      orderNumber: 'ORD-2024-007',
      customerName: 'Robert Taylor',
      customerEmail: 'robert.t@example.com',
      shippingAddress: { street: '147 Birch Blvd', city: 'San Antonio', state: 'TX', postalCode: '78201', country: 'USA' },
      status: 'Refunded',
      totalAmount: { amount: 129.99, currency: 'USD' },
      notes: null,
      details: [],
      itemCount: 1,
      createdAt: '2024-01-10T13:00:00Z',
      updatedAt: '2024-01-15T11:00:00Z',
      createdBy: 'system',
      modifiedBy: 'admin',
    },
    createdAt: '2024-01-10T13:05:00Z',
    updatedAt: '2024-01-10T13:05:00Z',
  },
  {
    id: '8',
    orderId: '8',
    status: 'Successful',
    amount: { amount: 349.98, currency: 'USD' },
    paymentMethod: 'Apple Pay',
    transactionId: 'TXN-2024-008-MNO',
    order: {
      id: '8',
      orderNumber: 'ORD-2024-008',
      customerName: 'Jennifer Anderson',
      customerEmail: 'jennifer.a@example.com',
      shippingAddress: { street: '258 Walnut Way', city: 'San Diego', state: 'CA', postalCode: '92101', country: 'USA' },
      status: 'Delivered',
      totalAmount: { amount: 349.98, currency: 'USD' },
      notes: null,
      details: [],
      itemCount: 5,
      createdAt: '2024-01-12T10:30:00Z',
      updatedAt: '2024-01-16T15:00:00Z',
      createdBy: 'system',
      modifiedBy: 'system',
    },
    createdAt: '2024-01-12T10:35:00Z',
    updatedAt: '2024-01-12T10:35:00Z',
  },
];

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly apollo = inject(Apollo);

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  getPayments(
    pagination: PaginationParams,
    filters?: PaymentFilterInput,
    sort?: PaymentSortInput
  ): Observable<PaginatedResult<Payment>> {
    this._loading.set(true);

    // Mock implementation - TODO: Replace with GraphQL query
    return of(MOCK_PAYMENTS).pipe(
      delay(500),
      map((payments) => {
        let filtered = [...payments];

        // Apply status filter
        if (filters?.status?.eq) {
          filtered = filtered.filter((p) => p.status === filters.status?.eq);
        }

        if (filters?.status?.in && filters.status.in.length > 0) {
          filtered = filtered.filter((p) => filters.status?.in?.includes(p.status));
        }

        // Apply order filter
        if (filters?.orderId?.eq) {
          filtered = filtered.filter((p) => p.orderId === filters.orderId?.eq);
        }

        // Apply sorting (default: newest first)
        filtered.sort((a, b) => {
          if (sort) {
            const sortKey = Object.keys(sort)[0] as keyof Payment;
            const sortDir = Object.values(sort)[0] as 'ASC' | 'DESC';
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal === undefined || bVal === undefined) return 0;
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

  getPaymentById(id: string): Observable<Payment | null> {
    this._loading.set(true);

    return of(MOCK_PAYMENTS.find((p) => p.id === id) || null).pipe(
      delay(300),
      map((payment) => {
        this._loading.set(false);
        return payment;
      })
    );
  }
}
