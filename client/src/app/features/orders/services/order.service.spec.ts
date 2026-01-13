import { TestBed } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { OrderService } from './order.service';
import { CREATE_ORDER, UPDATE_ORDER, CANCEL_ORDER, GET_ORDERS, GET_ORDER_BY_ID } from '../graphql/order.queries';
import { Order, OrderStatus } from '../../../shared/models/order.model';

describe('OrderService', () => {
  let service: OrderService;
  let controller: ApolloTestingController;

  const mockOrder: Order = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    orderNumber: 'ORD-2024-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    shippingAddress: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
    },
    status: 'Pending' as OrderStatus,
    totalAmount: {
      amount: 299.99,
      currency: 'USD',
    },
    notes: 'Test order',
    details: [
      {
        id: 'detail-1',
        productId: 'prod-1',
        productName: 'Test Product',
        productSku: 'SKU-001',
        quantity: 2,
        unitPrice: {
          amount: 149.995,
          currency: 'USD',
        },
        lineTotal: {
          amount: 299.99,
          currency: 'USD',
        },
      },
    ],
    itemCount: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin@astro.com',
    modifiedBy: 'admin@astro.com',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [OrderService],
    });
    service = TestBed.inject(OrderService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have loading as false initially', () => {
      expect(service.loading()).toBeFalse();
    });
  });

  describe('createOrder', () => {
    const createCommand = {
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
      notes: 'Test order',
      orderDetails: [
        { productId: 'prod-1', quantity: 2 },
      ],
      createdBy: 'admin@astro.com',
    };

    it('should set loading to true when creating an order', (done) => {
      service.createOrder(createCommand).subscribe();
      expect(service.loading()).toBeTrue();

      const op = controller.expectOne(CREATE_ORDER);
      op.flush({ data: { createOrder: mockOrder } });

      const refetchOp = controller.expectOne(GET_ORDERS);
      refetchOp.flush({
        data: {
          orders: {
            nodes: [mockOrder],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 1,
          },
        },
      });
      done();
    });

    it('should create an order successfully', (done) => {
      service.createOrder(createCommand).subscribe({
        next: (order) => {
          expect(order).toEqual(mockOrder);
          expect(service.loading()).toBeFalse();
          done();
        },
        error: () => {
          fail('createOrder should have succeeded');
          done();
        },
      });

      const op = controller.expectOne(CREATE_ORDER);
      expect(op.operation.variables['command']).toEqual(createCommand);

      op.flush({
        data: { createOrder: mockOrder },
      });
    });

    it('should refetch orders after creating', (done) => {
      service.createOrder(createCommand).subscribe({
        next: () => {
          done();
        },
      });

      const createOp = controller.expectOne(CREATE_ORDER);
      createOp.flush({
        data: { createOrder: mockOrder },
      });

      // Verify refetch query is triggered
      const refetchOp = controller.expectOne(GET_ORDERS);
      expect(refetchOp).toBeDefined();
      refetchOp.flush({
        data: {
          orders: {
            nodes: [mockOrder],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 1,
          },
        },
      });
    });

    it('should handle errors when creating an order', (done) => {
      service.createOrder(createCommand).subscribe({
        next: () => {
          fail('createOrder should have failed');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CREATE_ORDER);
      op.graphqlErrors([{ message: 'Failed to create order' }]);

      // Don't expect refetch on error
    });

    it('should throw error when no data is returned', (done) => {
      service.createOrder(createCommand).subscribe({
        next: () => {
          fail('createOrder should have thrown error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('No data returned from createOrder mutation');
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CREATE_ORDER);
      op.flush({ data: {} });

      const refetchOp = controller.expectOne(GET_ORDERS);
      refetchOp.flush({
        data: {
          orders: {
            nodes: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
        },
      });
    });
  });

  describe('updateOrder', () => {
    const updateCommand = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@example.com',
      notes: 'Updated notes',
      modifiedBy: 'admin@astro.com',
    };

    const updatedOrder: Order = {
      ...mockOrder,
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@example.com',
      notes: 'Updated notes',
      updatedAt: '2024-01-15T11:00:00Z',
      modifiedBy: 'admin@astro.com',
    };

    it('should set loading to true when updating an order', (done) => {
      service.updateOrder(updateCommand).subscribe();
      expect(service.loading()).toBeTrue();

      const op = controller.expectOne(UPDATE_ORDER);
      op.flush({ data: { updateOrder: updatedOrder } });

      const refetchOp = controller.expectOne(GET_ORDER_BY_ID);
      refetchOp.flush({
        data: {
          orders: {
            nodes: [updatedOrder],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 1,
          },
        },
      });
      done();
    });

    it('should update an order successfully', (done) => {
      service.updateOrder(updateCommand).subscribe({
        next: (order) => {
          expect(order).toEqual(updatedOrder);
          expect(service.loading()).toBeFalse();
          done();
        },
        error: () => {
          fail('updateOrder should have succeeded');
          done();
        },
      });

      const op = controller.expectOne(UPDATE_ORDER);
      expect(op.operation.variables['command']).toEqual(updateCommand);

      op.flush({
        data: { updateOrder: updatedOrder },
      });
    });

    it('should refetch order by ID after updating', (done) => {
      service.updateOrder(updateCommand).subscribe({
        next: () => {
          done();
        },
      });

      const updateOp = controller.expectOne(UPDATE_ORDER);
      updateOp.flush({
        data: { updateOrder: updatedOrder },
      });

      // Verify refetch query is triggered
      const refetchOp = controller.expectOne(GET_ORDER_BY_ID);
      expect(refetchOp.operation.variables['id']).toBe(updateCommand.id);
      refetchOp.flush({
        data: {
          orders: {
            nodes: [updatedOrder],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 1,
          },
        },
      });
    });

    it('should handle errors when updating an order', (done) => {
      service.updateOrder(updateCommand).subscribe({
        next: () => {
          fail('updateOrder should have failed');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(UPDATE_ORDER);
      op.graphqlErrors([{ message: 'Failed to update order' }]);

      // Don't expect refetch on error
    });

    it('should throw error when no data is returned', (done) => {
      service.updateOrder(updateCommand).subscribe({
        next: () => {
          fail('updateOrder should have thrown error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('No data returned from updateOrder mutation');
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(UPDATE_ORDER);
      op.flush({ data: {} });

      const refetchOp = controller.expectOne(GET_ORDER_BY_ID);
      refetchOp.flush({
        data: {
          orders: {
            nodes: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
        },
      });
    });
  });

  describe('cancelOrder', () => {
    const orderId = '123e4567-e89b-12d3-a456-426614174000';
    const reason = 'Customer requested cancellation';
    const cancelledBy = 'admin@astro.com';

    const cancelledOrder: Order = {
      ...mockOrder,
      status: 'Cancelled' as OrderStatus,
      notes: `${mockOrder.notes}\nCancellation reason: ${reason}`,
      updatedAt: '2024-01-15T12:00:00Z',
      modifiedBy: cancelledBy,
    };

    it('should set loading to true when cancelling an order', (done) => {
      service.cancelOrder(orderId, reason, cancelledBy).subscribe();
      expect(service.loading()).toBeTrue();

      const op = controller.expectOne(CANCEL_ORDER);
      op.flush({ data: { cancelOrder: cancelledOrder } });

      const refetchOp = controller.expectOne(GET_ORDER_BY_ID);
      refetchOp.flush({
        data: {
          orders: {
            nodes: [cancelledOrder],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 1,
          },
        },
      });
      done();
    });

    it('should cancel an order successfully', (done) => {
      service.cancelOrder(orderId, reason, cancelledBy).subscribe({
        next: (order) => {
          expect(order).toEqual(cancelledOrder);
          expect(order.status).toBe('Cancelled');
          expect(service.loading()).toBeFalse();
          done();
        },
        error: () => {
          fail('cancelOrder should have succeeded');
          done();
        },
      });

      const op = controller.expectOne(CANCEL_ORDER);
      expect(op.operation.variables['command']).toEqual({
        orderId,
        reason,
        cancelledBy,
      });

      op.flush({
        data: { cancelOrder: cancelledOrder },
      });
    });

    it('should refetch order by ID after cancelling', (done) => {
      service.cancelOrder(orderId, reason, cancelledBy).subscribe({
        next: () => {
          done();
        },
      });

      const cancelOp = controller.expectOne(CANCEL_ORDER);
      cancelOp.flush({
        data: { cancelOrder: cancelledOrder },
      });

      // Verify refetch query is triggered
      const refetchOp = controller.expectOne(GET_ORDER_BY_ID);
      expect(refetchOp.operation.variables['id']).toBe(orderId);
      refetchOp.flush({
        data: {
          orders: {
            nodes: [cancelledOrder],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 1,
          },
        },
      });
    });

    it('should handle errors when cancelling an order', (done) => {
      service.cancelOrder(orderId, reason, cancelledBy).subscribe({
        next: () => {
          fail('cancelOrder should have failed');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CANCEL_ORDER);
      op.graphqlErrors([{ message: 'Cannot cancel order in current status' }]);

      // Don't expect refetch on error
    });

    it('should throw error when no data is returned', (done) => {
      service.cancelOrder(orderId, reason, cancelledBy).subscribe({
        next: () => {
          fail('cancelOrder should have thrown error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('No data returned from cancelOrder mutation');
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CANCEL_ORDER);
      op.flush({ data: {} });

      const refetchOp = controller.expectOne(GET_ORDER_BY_ID);
      refetchOp.flush({
        data: {
          orders: {
            nodes: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
        },
      });
    });

    it('should handle validation errors for missing reason', (done) => {
      service.cancelOrder(orderId, '', cancelledBy).subscribe({
        next: () => {
          fail('cancelOrder should have failed validation');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CANCEL_ORDER);
      op.graphqlErrors([{
        message: 'Validation error',
        extensions: {
          code: 'VALIDATION_ERROR',
          validationErrors: [
            { propertyName: 'Reason', errorMessage: 'Cancellation reason is required' },
          ],
        },
      }]);

      // Don't expect refetch on error
    });
  });
});
