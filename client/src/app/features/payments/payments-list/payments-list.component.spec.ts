import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { PaymentsListComponent } from './payments-list.component';
import { PaymentService } from '../services/payment.service';
import { Payment, PaymentStatus } from '../../../shared/models/payment.model';
import { PaginatedResult } from '../../../shared/models/table.model';

describe('PaymentsListComponent', () => {
  let component: PaymentsListComponent;
  let fixture: ComponentFixture<PaymentsListComponent>;
  let mockPaymentService: jasmine.SpyObj<PaymentService>;

  const mockPayment: Payment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    orderId: '223e4567-e89b-12d3-a456-426614174001',
    status: 'PENDING' as PaymentStatus,
    amount: {
      amount: 299.99,
      currency: 'USD',
    },
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-12345',
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
      modifiedBy: '',
    },
  };

  const mockPaymentsResult: PaginatedResult<Payment> = {
    items: [mockPayment],
    totalCount: 1,
    page: 0,
    pageSize: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  beforeEach(async () => {
    mockPaymentService = jasmine.createSpyObj('PaymentService', ['getPayments'], {
      loading: signal(false),
    });

    mockPaymentService.getPayments.and.returnValue(of(mockPaymentsResult));

    await TestBed.configureTestingModule({
      imports: [
        PaymentsListComponent,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([
          { path: 'payments/create', component: PaymentsListComponent },
        ]),
      ],
      providers: [
        { provide: PaymentService, useValue: mockPaymentService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Create Payment button', () => {
    it('should display Create Payment button in header', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const createButton = fixture.debugElement.query(
        By.css('.header-actions button[routerLink="/payments/create"]')
      );

      expect(createButton).toBeTruthy();
      expect(createButton.nativeElement.textContent).toContain('Create Payment');
    }));

    it('should have correct routerLink to /payments/create', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const createButton = fixture.debugElement.query(
        By.css('.header-actions button')
      );

      expect(createButton).toBeTruthy();
      expect(createButton.attributes['routerLink']).toBe('/payments/create');
    }));

    it('should have add icon in Create Payment button', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const createButton = fixture.debugElement.query(
        By.css('.header-actions button')
      );
      const icon = createButton?.query(By.css('mat-icon'));

      expect(icon).toBeTruthy();
      expect(icon.nativeElement.textContent.trim()).toBe('add');
    }));

    it('should be a raised button with primary color', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      const createButton = fixture.debugElement.query(
        By.css('.header-actions button')
      );

      expect(createButton.attributes['mat-raised-button']).toBeDefined();
      expect(createButton.attributes['color']).toBe('primary');
    }));
  });

  describe('status variant', () => {
    it('should return success for Successful status', () => {
      expect(component.getStatusVariant('SUCCESSFUL')).toBe('success');
    });

    it('should return warning for Pending status', () => {
      expect(component.getStatusVariant('PENDING')).toBe('warning');
    });

    it('should return error for Failed status', () => {
      expect(component.getStatusVariant('FAILED')).toBe('error');
    });
  });

  describe('method icon', () => {
    it('should return credit_card for credit card', () => {
      expect(component.getMethodIcon('Credit Card')).toBe('credit_card');
    });

    it('should return credit_card for debit card', () => {
      expect(component.getMethodIcon('Debit Card')).toBe('credit_card');
    });

    it('should return account_balance_wallet for paypal', () => {
      expect(component.getMethodIcon('PayPal')).toBe('account_balance_wallet');
    });

    it('should return account_balance for bank transfer', () => {
      expect(component.getMethodIcon('Bank Transfer')).toBe('account_balance');
    });

    it('should return payment for unknown method', () => {
      expect(component.getMethodIcon('Unknown')).toBe('payment');
    });

    it('should return payment for null', () => {
      expect(component.getMethodIcon(null)).toBe('payment');
    });
  });

  describe('loading payments', () => {
    it('should load payments on init', () => {
      expect(mockPaymentService.getPayments).toHaveBeenCalled();
    });

    it('should update payments signal with loaded data', fakeAsync(() => {
      tick();
      expect(component.payments()).toEqual([mockPayment]);
      expect(component.totalCount()).toBe(1);
    }));
  });
});
