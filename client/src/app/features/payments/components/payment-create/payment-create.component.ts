import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { OrderService } from '../../../orders/services/order.service';
import { Order } from '../../../../shared/models/order.model';
import { PAYMENT_METHOD_OPTIONS, CreatePaymentInput } from '../../../../shared/models/payment.model';

/**
 * Type representing the form value from the payment create form.
 */
export interface PaymentFormValue {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-payment-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
  ],
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.scss',
})
export class PaymentCreateComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly orderService = inject(OrderService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  paymentForm!: FormGroup;
  isSubmitting = signal(false);
  loadingOrders = signal(true);

  private orders$ = new BehaviorSubject<Order[]>([]);
  filteredOrders$!: Observable<Order[]>;
  selectedOrder = signal<Order | null>(null);

  orderSearchControl = new FormControl<string | Order>('');

  paymentMethodOptions = PAYMENT_METHOD_OPTIONS;
  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  // Query param support for US3
  private returnUrl: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.loadOrders();
    this.setupOrderSearch();
    this.checkQueryParams();
  }

  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', [Validators.required]],
      paymentMethod: ['', [Validators.required]],
    });
  }

  private loadOrders(): void {
    this.loadingOrders.set(true);
    // Load orders that can have payments (not cancelled/refunded)
    this.orderService.getOrders({ page: 0, pageSize: 50 }).subscribe({
      next: (result) => {
        // Filter orders that are eligible for payment (not CANCELLED)
        const eligibleOrders = result.items.filter(
          (o) => o.status !== 'CANCELLED'
        );
        this.orders$.next(eligibleOrders);
        this.loadingOrders.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.notificationService.error('Failed to load orders');
        this.loadingOrders.set(false);
      },
    });
  }

  private setupOrderSearch(): void {
    this.filteredOrders$ = combineLatest([
      this.orders$,
      this.orderSearchControl.valueChanges.pipe(startWith('')),
    ]).pipe(map(([orders, searchValue]) => this._filterOrders(orders, searchValue ?? '')));
  }

  private _filterOrders(orders: Order[], value: string | Order | null): Order[] {
    // Handle when value is an Order object (after selection)
    if (!value || typeof value !== 'string') {
      return orders;
    }
    const filterValue = value.toLowerCase();
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(filterValue) ||
        order.customerName.toLowerCase().includes(filterValue) ||
        order.customerEmail.toLowerCase().includes(filterValue)
    );
  }

  displayOrder(order: Order | string | null): string {
    if (!order) return '';
    if (typeof order === 'string') return order;
    return `${order.orderNumber} - ${order.customerName}`;
  }

  onOrderSelected(order: Order): void {
    this.selectedOrder.set(order);
    // Pre-fill amount with order total if not already set
    const currentAmount = this.paymentForm.get('amount')?.value;
    if (!currentAmount && order.totalAmount) {
      this.paymentForm.patchValue({
        amount: order.totalAmount.amount,
        currency: order.totalAmount.currency || 'USD',
      });
    }
  }

  /**
   * Check for query parameters (used by US3 - create from order context)
   */
  private checkQueryParams(): void {
    const params = this.route.snapshot.queryParams;

    this.returnUrl = params['returnUrl'] || null;

    if (params['orderId']) {
      // Wait for orders to load, then pre-select
      this.orders$.subscribe((orders) => {
        const order = orders.find((o) => o.id === params['orderId']);
        if (order) {
          this.orderSearchControl.setValue(order);
          this.selectedOrder.set(order);

          // Pre-fill amount if provided
          if (params['amount']) {
            this.paymentForm.patchValue({
              amount: parseFloat(params['amount']),
            });
          } else if (order.totalAmount) {
            this.paymentForm.patchValue({
              amount: order.totalAmount.amount,
              currency: order.totalAmount.currency || 'USD',
            });
          }
        }
      });
    }
  }

  onSubmit(): void {
    const selectedOrder = this.selectedOrder();

    if (!selectedOrder) {
      this.notificationService.error('Please select an order');
      return;
    }

    if (this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach((key) => {
        this.paymentForm.get(key)?.markAsTouched();
      });
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.paymentForm.value;
    const createInput: CreatePaymentInput = {
      orderId: selectedOrder.id,
      amount: formValue.amount,
      currency: formValue.currency,
      paymentMethod: formValue.paymentMethod,
    };

    this.paymentService.createPayment(createInput).subscribe({
      next: (createdPayment) => {
        this.isSubmitting.set(false);
        this.notificationService.success('Payment created successfully');

        // Navigate to return URL if provided, otherwise to payments list
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.router.navigate(['/payments', createdPayment.id]);
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error creating payment:', error);

        let errorMessage = 'Failed to create payment';
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const gqlError = error.graphQLErrors[0];
          errorMessage = gqlError.message;

          // Handle validation errors
          if (gqlError.extensions?.validationErrors) {
            const validationErrors = gqlError.extensions.validationErrors as Array<{
              propertyName: string;
              errorMessage: string;
            }>;
            errorMessage = validationErrors.map((e) => e.errorMessage).join(', ');
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.notificationService.error(errorMessage);
      },
    });
  }

  onCancel(): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.router.navigate(['/payments']);
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.paymentForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('min')) {
      return 'Amount must be greater than 0';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      amount: 'Amount',
      currency: 'Currency',
      paymentMethod: 'Payment method',
    };
    return labels[fieldName] || fieldName;
  }
}
