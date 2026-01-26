import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, BehaviorSubject, Subject } from 'rxjs';
import { PaymentCreateComponent } from './payment-create.component';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../../orders/services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Payment, PaymentStatus } from '../../../../shared/models/payment.model';
import { Order } from '../../../../shared/models/order.model';
import { PaginatedResult } from '../../../../shared/models/table.model';

describe('PaymentCreateComponent', () => {
  let component: PaymentCreateComponent;
  let fixture: ComponentFixture<PaymentCreateComponent>;
  let mockPaymentService: jasmine.SpyObj<PaymentService>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockOrder: Order = {
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
    modifiedBy: '',
  };

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
  };

  const mockOrdersResult: PaginatedResult<Order> = {
    items: [mockOrder],
    totalCount: 1,
    page: 0,
    pageSize: 50,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  let queryParams: Record<string, string> = {};

  beforeEach(async () => {
    mockPaymentService = jasmine.createSpyObj('PaymentService', ['createPayment']);
    mockOrderService = jasmine.createSpyObj('OrderService', ['getOrders']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

    queryParams = {};

    await TestBed.configureTestingModule({
      imports: [PaymentCreateComponent, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: queryParams,
              paramMap: convertToParamMap({}),
            },
          },
        },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  describe('initialization', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load orders on init', () => {
      expect(mockOrderService.getOrders).toHaveBeenCalled();
    });

    it('should have form initialized with default values', () => {
      expect(component.paymentForm.get('amount')?.value).toBeNull();
      expect(component.paymentForm.get('currency')?.value).toBe('USD');
      expect(component.paymentForm.get('paymentMethod')?.value).toBe('');
    });

    it('should not be submitting initially', () => {
      expect(component.isSubmitting()).toBeFalse();
    });
  });

  describe('form validation', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should require amount', () => {
      const control = component.paymentForm.get('amount');
      control?.setValue(null);
      expect(control?.valid).toBeFalse();
      expect(control?.hasError('required')).toBeTrue();
    });

    it('should require amount to be greater than 0', () => {
      const control = component.paymentForm.get('amount');
      control?.setValue(0);
      expect(control?.valid).toBeFalse();
      expect(control?.hasError('min')).toBeTrue();

      control?.setValue(-10);
      expect(control?.valid).toBeFalse();
      expect(control?.hasError('min')).toBeTrue();

      control?.setValue(0.01);
      expect(control?.valid).toBeTrue();
    });

    it('should require currency', () => {
      const control = component.paymentForm.get('currency');
      control?.setValue('');
      expect(control?.valid).toBeFalse();
      expect(control?.hasError('required')).toBeTrue();
    });

    it('should require payment method', () => {
      const control = component.paymentForm.get('paymentMethod');
      control?.setValue('');
      expect(control?.valid).toBeFalse();
      expect(control?.hasError('required')).toBeTrue();
    });

    it('should be valid when all fields are filled', () => {
      component.paymentForm.patchValue({
        amount: 100.00,
        currency: 'USD',
        paymentMethod: 'Credit Card',
      });
      expect(component.paymentForm.valid).toBeTrue();
    });
  });

  describe('order selection', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should set selected order when order is selected', () => {
      component.onOrderSelected(mockOrder);
      expect(component.selectedOrder()).toEqual(mockOrder);
    });

    it('should pre-fill amount when order is selected', () => {
      component.onOrderSelected(mockOrder);
      expect(component.paymentForm.get('amount')?.value).toBe(299.99);
      expect(component.paymentForm.get('currency')?.value).toBe('USD');
    });

    it('should not overwrite amount if already set', () => {
      component.paymentForm.patchValue({ amount: 100.00 });
      component.onOrderSelected(mockOrder);
      expect(component.paymentForm.get('amount')?.value).toBe(100.00);
    });

    it('should display order correctly', () => {
      expect(component.displayOrder(mockOrder)).toBe('ORD-2026-001 - John Doe');
      expect(component.displayOrder(null)).toBe('');
      expect(component.displayOrder('')).toBe('');
    });
  });

  describe('submission success', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      mockPaymentService.createPayment.and.returnValue(of(mockPayment));

      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      // Set up valid form
      component.onOrderSelected(mockOrder);
      component.paymentForm.patchValue({
        amount: 299.99,
        currency: 'USD',
        paymentMethod: 'Credit Card',
      });
    }));

    it('should create payment successfully', fakeAsync(() => {
      component.onSubmit();
      tick();

      expect(mockPaymentService.createPayment).toHaveBeenCalledWith({
        orderId: mockOrder.id,
        amount: 299.99,
        currency: 'USD',
        paymentMethod: 'Credit Card',
      });
      expect(mockNotificationService.success).toHaveBeenCalledWith('Payment created successfully');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/payments', mockPayment.id]);
    }));

    it('should show loading state while submitting', fakeAsync(() => {
      // Use a Subject to control when the observable completes
      const paymentSubject = new Subject<Payment>();
      mockPaymentService.createPayment.and.returnValue(paymentSubject.asObservable());

      component.onSubmit();

      // Loading state should be true while waiting for response
      expect(component.isSubmitting()).toBeTrue();

      // Complete the observable
      paymentSubject.next(mockPayment);
      paymentSubject.complete();
      tick();

      // Loading state should be false after response
      expect(component.isSubmitting()).toBeFalse();
    }));
  });

  describe('submission error', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));

      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      // Set up valid form
      component.onOrderSelected(mockOrder);
      component.paymentForm.patchValue({
        amount: 299.99,
        currency: 'USD',
        paymentMethod: 'Credit Card',
      });
    }));

    it('should handle GraphQL errors', fakeAsync(() => {
      const graphQLError = {
        graphQLErrors: [{ message: 'Order not found' }],
      };
      mockPaymentService.createPayment.and.returnValue(throwError(() => graphQLError));

      component.onSubmit();
      tick();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Order not found');
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should handle validation errors', fakeAsync(() => {
      const validationError = {
        graphQLErrors: [{
          message: 'Validation error',
          extensions: {
            validationErrors: [
              { propertyName: 'Amount', errorMessage: 'Amount must be greater than 0' },
            ],
          },
        }],
      };
      mockPaymentService.createPayment.and.returnValue(throwError(() => validationError));

      component.onSubmit();
      tick();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Amount must be greater than 0');
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should handle generic errors', fakeAsync(() => {
      const genericError = new Error('Network error');
      mockPaymentService.createPayment.and.returnValue(throwError(() => genericError));

      component.onSubmit();
      tick();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Network error');
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should not submit without selected order', fakeAsync(() => {
      component['selectedOrder'].set(null);
      component.onSubmit();
      tick();

      expect(mockPaymentService.createPayment).not.toHaveBeenCalled();
      expect(mockNotificationService.error).toHaveBeenCalledWith('Please select an order');
    }));

    it('should not submit with invalid form', fakeAsync(() => {
      component.paymentForm.patchValue({
        amount: null,
        paymentMethod: '',
      });
      component.onSubmit();
      tick();

      expect(mockPaymentService.createPayment).not.toHaveBeenCalled();
      expect(mockNotificationService.error).toHaveBeenCalledWith('Please fill in all required fields');
    }));
  });

  describe('cancel navigation', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should navigate to payments list on cancel', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/payments']);
    });
  });

  describe('error messages', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should return correct error message for required fields', () => {
      component.paymentForm.get('amount')?.setValue(null);
      component.paymentForm.get('amount')?.markAsTouched();
      expect(component.getErrorMessage('amount')).toBe('Amount is required');
    });

    it('should return correct error message for min validation', () => {
      component.paymentForm.get('amount')?.setValue(-1);
      component.paymentForm.get('amount')?.markAsTouched();
      expect(component.getErrorMessage('amount')).toBe('Amount must be greater than 0');
    });
  });

  describe('query parameter handling (US3)', () => {
    it('should pre-fill form from query params', fakeAsync(async () => {
      // Recreate TestBed with query params
      await TestBed.resetTestingModule();

      mockPaymentService = jasmine.createSpyObj('PaymentService', ['createPayment']);
      mockOrderService = jasmine.createSpyObj('OrderService', ['getOrders']);
      mockNotificationService = jasmine.createSpyObj('NotificationService', ['success', 'error']);
      mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));

      await TestBed.configureTestingModule({
        imports: [PaymentCreateComponent, NoopAnimationsModule],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParams: {
                  orderId: mockOrder.id,
                  amount: '150.00',
                  returnUrl: '/orders/' + mockOrder.id,
                },
                paramMap: convertToParamMap({}),
              },
            },
          },
          { provide: PaymentService, useValue: mockPaymentService },
          { provide: OrderService, useValue: mockOrderService },
          { provide: NotificationService, useValue: mockNotificationService },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      // Check that order is selected and amount is pre-filled
      expect(component.selectedOrder()).toEqual(mockOrder);
      expect(component.paymentForm.get('amount')?.value).toBe(150.00);
    }));

    it('should navigate to returnUrl on cancel when provided', fakeAsync(async () => {
      await TestBed.resetTestingModule();

      mockPaymentService = jasmine.createSpyObj('PaymentService', ['createPayment']);
      mockOrderService = jasmine.createSpyObj('OrderService', ['getOrders']);
      mockNotificationService = jasmine.createSpyObj('NotificationService', ['success', 'error']);
      mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));

      const returnUrl = '/orders/' + mockOrder.id;

      await TestBed.configureTestingModule({
        imports: [PaymentCreateComponent, NoopAnimationsModule],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParams: {
                  orderId: mockOrder.id,
                  returnUrl,
                },
                paramMap: convertToParamMap({}),
              },
            },
          },
          { provide: PaymentService, useValue: mockPaymentService },
          { provide: OrderService, useValue: mockOrderService },
          { provide: NotificationService, useValue: mockNotificationService },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      component.onCancel();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(returnUrl);
    }));

    it('should navigate to returnUrl on successful submission when provided', fakeAsync(async () => {
      await TestBed.resetTestingModule();

      mockPaymentService = jasmine.createSpyObj('PaymentService', ['createPayment']);
      mockOrderService = jasmine.createSpyObj('OrderService', ['getOrders']);
      mockNotificationService = jasmine.createSpyObj('NotificationService', ['success', 'error']);
      mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      mockPaymentService.createPayment.and.returnValue(of(mockPayment));

      const returnUrl = '/orders/' + mockOrder.id;

      await TestBed.configureTestingModule({
        imports: [PaymentCreateComponent, NoopAnimationsModule],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParams: {
                  orderId: mockOrder.id,
                  returnUrl,
                },
                paramMap: convertToParamMap({}),
              },
            },
          },
          { provide: PaymentService, useValue: mockPaymentService },
          { provide: OrderService, useValue: mockOrderService },
          { provide: NotificationService, useValue: mockNotificationService },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      // Fill in remaining required fields
      component.paymentForm.patchValue({
        paymentMethod: 'Credit Card',
      });

      component.onSubmit();
      tick();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(returnUrl);
    }));
  });

  describe('order filtering', () => {
    it('should filter out cancelled and refunded orders', fakeAsync(() => {
      const cancelledOrder: Order = {
        ...mockOrder,
        id: 'cancelled-order',
        status: 'CANCELLED',
      };

      const mixedOrdersResult: PaginatedResult<Order> = {
        items: [mockOrder, cancelledOrder],
        totalCount: 2,
        page: 0,
        pageSize: 50,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockOrderService.getOrders.and.returnValue(of(mixedOrdersResult));

      fixture = TestBed.createComponent(PaymentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      // The filtered orders should only contain the valid order
      component['filteredOrders$'].subscribe((orders) => {
        expect(orders.length).toBe(1);
        expect(orders[0].id).toBe(mockOrder.id);
      });
      tick();
    }));
  });
});
