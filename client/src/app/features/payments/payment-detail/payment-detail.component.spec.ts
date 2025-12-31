import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { PaymentDetailComponent } from './payment-detail.component';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../../../shared/models/payment.model';

describe('PaymentDetailComponent', () => {
  let component: PaymentDetailComponent;
  let fixture: ComponentFixture<PaymentDetailComponent>;
  let mockPaymentService: jasmine.SpyObj<PaymentService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockPayment: Payment = {
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
  };

  beforeEach(async () => {
    mockPaymentService = jasmine.createSpyObj('PaymentService', ['getPaymentById']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PaymentDetailComponent, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
            },
          },
        },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  describe('with valid payment ID', () => {
    beforeEach(fakeAsync(() => {
      mockPaymentService.getPaymentById.and.returnValue(of(mockPayment));
      fixture = TestBed.createComponent(PaymentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load payment on init', () => {
      expect(mockPaymentService.getPaymentById).toHaveBeenCalledWith('1');
      expect(component.payment()).toEqual(mockPayment);
      expect(component.loading()).toBeFalse();
    });

    it('should navigate back to payments list', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/payments']);
    });

    it('should navigate to order detail', () => {
      component.goToOrder('1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders', '1']);
    });

    it('should return correct status variant for Successful', () => {
      expect(component.getStatusVariant('Successful')).toBe('success');
    });

    it('should return correct status variant for Pending', () => {
      expect(component.getStatusVariant('Pending')).toBe('warning');
    });

    it('should return correct status variant for Failed', () => {
      expect(component.getStatusVariant('Failed')).toBe('error');
    });

    it('should return correct method icon for credit card', () => {
      expect(component.getMethodIcon('Credit Card')).toBe('credit_card');
    });

    it('should return correct method icon for PayPal', () => {
      expect(component.getMethodIcon('PayPal')).toBe('account_balance_wallet');
    });

    it('should return correct method icon for bank transfer', () => {
      expect(component.getMethodIcon('Bank Transfer')).toBe('account_balance');
    });

    it('should return correct method icon for Apple Pay', () => {
      expect(component.getMethodIcon('Apple Pay')).toBe('phone_iphone');
    });

    it('should return default icon for unknown method', () => {
      expect(component.getMethodIcon('Unknown')).toBe('payment');
    });

    it('should return default icon for null method', () => {
      expect(component.getMethodIcon(null)).toBe('payment');
    });
  });

  describe('with no payment ID', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [PaymentDetailComponent, NoopAnimationsModule],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: convertToParamMap({}),
              },
            },
          },
          { provide: PaymentService, useValue: mockPaymentService },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PaymentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should not load payment when no ID provided', () => {
      expect(mockPaymentService.getPaymentById).not.toHaveBeenCalled();
      expect(component.payment()).toBeNull();
      expect(component.loading()).toBeFalse();
    });
  });

  describe('with payment not found', () => {
    beforeEach(fakeAsync(() => {
      mockPaymentService.getPaymentById.and.returnValue(of(null));
      fixture = TestBed.createComponent(PaymentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should handle null payment response', () => {
      expect(component.payment()).toBeNull();
      expect(component.loading()).toBeFalse();
    });
  });
});
