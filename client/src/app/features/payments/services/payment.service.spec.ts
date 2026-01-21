import { TestBed } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { PaymentService } from './payment.service';
import { CREATE_PAYMENT, UPDATE_PAYMENT_STATUS } from '../graphql/payment.mutations';
import { GET_PAYMENTS } from '../graphql/payment.queries';
import { Payment, PaymentStatus } from '../../../shared/models/payment.model';

describe('PaymentService', () => {
  let service: PaymentService;
  let controller: ApolloTestingController;

  const mockPayment: Payment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    orderId: '223e4567-e89b-12d3-a456-426614174001',
    status: 'PENDING' as PaymentStatus,
    amount: {
      amount: 299.99,
      currency: 'USD',
    },
    paymentMethod: 'Credit Card',
    transactionId: null,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    order: {
      id: '223e4567-e89b-12d3-a456-426614174001',
      orderNumber: 'ORD-2026-001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      shippingAddress: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA',
      },
      status: 'PENDING',
      totalAmount: {
        amount: 299.99,
        currency: 'USD',
      },
      notes: null,
      details: [],
      itemCount: 1,
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
      createdBy: 'admin@astro.com',
      modifiedBy: 'admin@astro.com',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [PaymentService],
    });
    service = TestBed.inject(PaymentService);
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

  describe('createPayment', () => {
    const createInput = {
      orderId: '223e4567-e89b-12d3-a456-426614174001',
      amount: 299.99,
      currency: 'USD',
      paymentMethod: 'Credit Card',
    };

    it('should set loading to true when creating a payment', (done) => {
      service.createPayment(createInput).subscribe();
      expect(service.loading()).toBeTrue();

      const op = controller.expectOne(CREATE_PAYMENT);
      op.flush({ data: { createPayment: { payment: mockPayment } } });

      const refetchOp = controller.expectOne(GET_PAYMENTS);
      refetchOp.flush({
        data: {
          payments: {
            nodes: [mockPayment],
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

    it('should create a payment successfully', (done) => {
      service.createPayment(createInput).subscribe({
        next: (payment) => {
          expect(payment).toEqual(mockPayment);
          expect(payment.status).toBe('PENDING');
          expect(service.loading()).toBeFalse();
          done();
        },
        error: () => {
          fail('createPayment should have succeeded');
          done();
        },
      });

      const op = controller.expectOne(CREATE_PAYMENT);
      expect(op.operation.variables['command']).toEqual(createInput);

      op.flush({
        data: { createPayment: { payment: mockPayment } },
      });

      // Handle refetch query
      const refetchOp = controller.expectOne(GET_PAYMENTS);
      refetchOp.flush({
        data: {
          payments: {
            nodes: [mockPayment],
            pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
            totalCount: 1,
          },
        },
      });
    });

    it('should refetch payments after creating', (done) => {
      service.createPayment(createInput).subscribe({
        next: () => {
          done();
        },
      });

      const createOp = controller.expectOne(CREATE_PAYMENT);
      createOp.flush({
        data: { createPayment: { payment: mockPayment } },
      });

      // Verify refetch query is triggered
      const refetchOp = controller.expectOne(GET_PAYMENTS);
      expect(refetchOp).toBeDefined();
      refetchOp.flush({
        data: {
          payments: {
            nodes: [mockPayment],
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

    it('should handle errors when creating a payment', (done) => {
      service.createPayment(createInput).subscribe({
        next: () => {
          fail('createPayment should have failed');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CREATE_PAYMENT);
      op.graphqlErrors([{ message: 'Order not found' }]);
    });

    it('should throw error when no data is returned', (done) => {
      service.createPayment(createInput).subscribe({
        next: () => {
          fail('createPayment should have thrown error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('No data returned from createPayment mutation');
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CREATE_PAYMENT);
      op.flush({ data: {} });

      const refetchOp = controller.expectOne(GET_PAYMENTS);
      refetchOp.flush({
        data: {
          payments: {
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

    it('should handle validation errors for invalid amount', (done) => {
      const invalidInput = { ...createInput, amount: -10 };

      service.createPayment(invalidInput).subscribe({
        next: () => {
          fail('createPayment should have failed validation');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CREATE_PAYMENT);
      op.graphqlErrors([{
        message: 'Validation error',
        extensions: {
          code: 'VALIDATION_ERROR',
          validationErrors: [
            { propertyName: 'Amount', errorMessage: 'Amount must be greater than 0' },
          ],
        },
      }]);
    });
  });

  describe('updatePaymentStatus', () => {
    const paymentId = '123e4567-e89b-12d3-a456-426614174000';

    const updatedPaymentSuccessful: Payment = {
      ...mockPayment,
      status: 'SUCCESSFUL' as PaymentStatus,
      transactionId: 'TXN-12345',
      updatedAt: '2026-01-15T11:00:00Z',
    };

    const updatedPaymentFailed: Payment = {
      ...mockPayment,
      status: 'FAILED' as PaymentStatus,
      updatedAt: '2026-01-15T11:00:00Z',
    };

    it('should set loading to true when updating payment status', (done) => {
      service.updatePaymentStatus(paymentId, 'SUCCESSFUL').subscribe();
      expect(service.loading()).toBeTrue();

      const op = controller.expectOne(UPDATE_PAYMENT_STATUS);
      op.flush({ data: { updatePaymentStatus: { payment: updatedPaymentSuccessful } } });
      done();
    });

    it('should update payment status to Successful', (done) => {
      service.updatePaymentStatus(paymentId, 'SUCCESSFUL').subscribe({
        next: (payment) => {
          expect(payment).toEqual(updatedPaymentSuccessful);
          expect(payment.status).toBe('SUCCESSFUL');
          expect(service.loading()).toBeFalse();
          done();
        },
        error: () => {
          fail('updatePaymentStatus should have succeeded');
          done();
        },
      });

      const op = controller.expectOne(UPDATE_PAYMENT_STATUS);
      expect(op.operation.variables['command']).toEqual({
        paymentId,
        newStatus: 'SUCCESSFUL',
      });

      op.flush({
        data: { updatePaymentStatus: { payment: updatedPaymentSuccessful } },
      });
    });

    it('should update payment status to Failed', (done) => {
      service.updatePaymentStatus(paymentId, 'FAILED').subscribe({
        next: (payment) => {
          expect(payment).toEqual(updatedPaymentFailed);
          expect(payment.status).toBe('FAILED');
          expect(service.loading()).toBeFalse();
          done();
        },
        error: () => {
          fail('updatePaymentStatus should have succeeded');
          done();
        },
      });

      const op = controller.expectOne(UPDATE_PAYMENT_STATUS);
      expect(op.operation.variables['command']).toEqual({
        paymentId,
        newStatus: 'FAILED',
      });

      op.flush({
        data: { updatePaymentStatus: { payment: updatedPaymentFailed } },
      });
    });

    it('should handle errors when updating payment status', (done) => {
      service.updatePaymentStatus(paymentId, 'SUCCESSFUL').subscribe({
        next: () => {
          fail('updatePaymentStatus should have failed');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(UPDATE_PAYMENT_STATUS);
      op.graphqlErrors([{ message: 'Payment not found' }]);
    });

    it('should throw error when no data is returned', (done) => {
      service.updatePaymentStatus(paymentId, 'SUCCESSFUL').subscribe({
        next: () => {
          fail('updatePaymentStatus should have thrown error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('No data returned from updatePaymentStatus mutation');
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(UPDATE_PAYMENT_STATUS);
      op.flush({ data: {} });
    });

    it('should handle invalid status transition errors', (done) => {
      // Simulating trying to update an already successful payment
      service.updatePaymentStatus(paymentId, 'FAILED').subscribe({
        next: () => {
          fail('updatePaymentStatus should have failed for invalid transition');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(UPDATE_PAYMENT_STATUS);
      op.graphqlErrors([{
        message: 'Invalid status transition',
        extensions: {
          code: 'INVALID_OPERATION',
          details: 'Cannot transition from Successful to Failed',
        },
      }]);
    });
  });
});
