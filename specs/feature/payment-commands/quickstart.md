# Quickstart: Payment Commands

**Feature**: Payment Commands
**Date**: 2026-01-15

## Overview

This guide provides step-by-step instructions for implementing the payment commands feature. The backend is already complete - this focuses on Angular frontend implementation.

---

## Prerequisites

- [ ] Existing `client/src/app/features/payments/` module structure
- [ ] Backend mutations verified working (GraphQL Playground test)
- [ ] Familiarity with existing products/orders patterns

---

## Implementation Steps

### Step 1: Add GraphQL Mutations

**File**: `client/src/app/features/payments/graphql/payment.mutations.ts` (new)

```typescript
import { gql } from 'apollo-angular';

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($command: CreatePaymentCommandInput!) {
    createPayment(input: { command: $command }) {
      payment {
        id
        orderId
        status
        amount { amount currency }
        paymentMethod
        transactionId
        createdAt
        updatedAt
        order {
          id
          orderNumber
          customerName
          totalAmount { amount currency }
        }
      }
    }
  }
`;

export const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdatePaymentStatus($command: UpdatePaymentStatusCommandInput!) {
    updatePaymentStatus(input: { command: $command }) {
      payment {
        id
        orderId
        status
        amount { amount currency }
        paymentMethod
        transactionId
        createdAt
        updatedAt
      }
    }
  }
`;
```

---

### Step 2: Extend Payment Model Types

**File**: `client/src/app/shared/models/payment.model.ts` (add to existing)

```typescript
// Add to existing file:

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
}

export interface UpdatePaymentStatusInput {
  paymentId: string;
  newStatus: PaymentStatus;
}

export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  'Pending': ['Successful', 'Failed'],
  'Successful': [],
  'Failed': [],
};

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'Credit Card', label: 'Credit Card', icon: 'credit_card' },
  { value: 'Debit Card', label: 'Debit Card', icon: 'credit_card' },
  { value: 'PayPal', label: 'PayPal', icon: 'account_balance_wallet' },
  { value: 'Bank Transfer', label: 'Bank Transfer', icon: 'account_balance' },
  { value: 'Cash', label: 'Cash', icon: 'payments' },
  { value: 'Other', label: 'Other', icon: 'more_horiz' },
] as const;
```

---

### Step 3: Extend Payment Service

**File**: `client/src/app/features/payments/services/payment.service.ts` (add methods)

```typescript
import { CREATE_PAYMENT, UPDATE_PAYMENT_STATUS } from '../graphql/payment.mutations';
import { CreatePaymentInput, UpdatePaymentStatusInput } from '../../../shared/models/payment.model';

// Add these methods to existing PaymentService class:

createPayment(input: CreatePaymentInput): Observable<Payment> {
  this._loading.set(true);
  return this.apollo
    .mutate<{ createPayment: { payment: Payment } }>({
      mutation: CREATE_PAYMENT,
      variables: { command: input },
      refetchQueries: [{ query: GET_PAYMENTS }],
    })
    .pipe(
      map((result) => {
        this._loading.set(false);
        if (!result.data?.createPayment?.payment) {
          throw new Error('No data returned from createPayment mutation');
        }
        return result.data.createPayment.payment;
      }),
      catchError((error) => {
        this._loading.set(false);
        throw error;
      })
    );
}

updatePaymentStatus(paymentId: string, newStatus: PaymentStatus): Observable<Payment> {
  this._loading.set(true);
  return this.apollo
    .mutate<{ updatePaymentStatus: { payment: Payment } }>({
      mutation: UPDATE_PAYMENT_STATUS,
      variables: { command: { paymentId, newStatus } },
    })
    .pipe(
      map((result) => {
        this._loading.set(false);
        if (!result.data?.updatePaymentStatus?.payment) {
          throw new Error('No data returned from updatePaymentStatus mutation');
        }
        return result.data.updatePaymentStatus.payment;
      }),
      catchError((error) => {
        this._loading.set(false);
        throw error;
      })
    );
}
```

---

### Step 4: Create Status Confirm Dialog

**File**: `client/src/app/features/payments/dialogs/status-confirm-dialog/status-confirm-dialog.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { PaymentStatus, Money, PAYMENT_STATUS_LABELS } from '../../../../shared/models/payment.model';

export interface StatusConfirmDialogData {
  currentStatus: PaymentStatus;
  newStatus: PaymentStatus;
  transactionId: string | null;
  amount: Money;
}

@Component({
  selector: 'app-status-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, CurrencyPipe],
  template: `
    <h2 mat-dialog-title>
      <mat-icon [color]="data.newStatus === 'Successful' ? 'primary' : 'warn'">
        {{ data.newStatus === 'Successful' ? 'check_circle' : 'cancel' }}
      </mat-icon>
      Update Payment Status
    </h2>
    <mat-dialog-content>
      <p class="info-text">
        Are you sure you want to mark this payment as <strong>{{ getStatusLabel(data.newStatus) }}</strong>?
      </p>
      <div class="payment-info">
        <p><strong>Amount:</strong> {{ data.amount.amount | currency:data.amount.currency }}</p>
        @if (data.transactionId) {
          <p><strong>Transaction ID:</strong> {{ data.transactionId }}</p>
        }
      </div>
      <p class="consequence-text">
        <mat-icon>info</mat-icon>
        This action cannot be undone. The payment status will be permanently changed.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button [color]="data.newStatus === 'Successful' ? 'primary' : 'warn'" (click)="onConfirm()">
        <mat-icon>{{ data.newStatus === 'Successful' ? 'check' : 'close' }}</mat-icon>
        Mark as {{ getStatusLabel(data.newStatus) }}
      </button>
    </mat-dialog-actions>
  `,
})
export class StatusConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<StatusConfirmDialogComponent>);
  readonly data = inject<StatusConfirmDialogData>(MAT_DIALOG_DATA);

  getStatusLabel(status: PaymentStatus): string {
    return PAYMENT_STATUS_LABELS[status];
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
```

---

### Step 5: Create Payment Create Component

**File**: `client/src/app/features/payments/components/payment-create/payment-create.component.ts`

```typescript
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../../orders/services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PAYMENT_METHOD_OPTIONS } from '../../../../shared/models/payment.model';

@Component({
  selector: 'app-payment-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.scss',
})
export class PaymentCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly paymentService = inject(PaymentService);
  private readonly orderService = inject(OrderService);
  private readonly notificationService = inject(NotificationService);

  paymentForm!: FormGroup;
  isSubmitting = signal(false);
  orders = signal<Array<{ id: string; orderNumber: string; customerName: string; totalAmount: number }>>([]);

  readonly paymentMethods = PAYMENT_METHOD_OPTIONS;
  readonly currencies = ['USD', 'EUR', 'GBP'];

  ngOnInit(): void {
    this.initForm();
    this.loadOrders();
    this.checkQueryParams();
  }

  private initForm(): void {
    this.paymentForm = this.fb.group({
      orderId: ['', [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', [Validators.required]],
      paymentMethod: ['', [Validators.required]],
    });
  }

  private loadOrders(): void {
    // Load orders for autocomplete
    this.orderService.getOrders({ page: 0, pageSize: 100 }).subscribe({
      next: (result) => {
        this.orders.set(result.items.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          totalAmount: o.totalAmount.amount,
        })));
      },
    });
  }

  private checkQueryParams(): void {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    const amount = this.route.snapshot.queryParamMap.get('amount');

    if (orderId) {
      this.paymentForm.patchValue({ orderId });
    }
    if (amount) {
      this.paymentForm.patchValue({ amount: parseFloat(amount) });
    }
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.paymentForm.value;

    this.paymentService.createPayment({
      orderId: formValue.orderId,
      amount: formValue.amount,
      currency: formValue.currency,
      paymentMethod: formValue.paymentMethod,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.success('Payment created successfully');
        this.router.navigate(['/payments']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        let errorMessage = 'Failed to create payment';
        if (error.graphQLErrors?.length > 0) {
          errorMessage = error.graphQLErrors[0].message;
        }
        this.notificationService.error(errorMessage);
      },
    });
  }

  onCancel(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigate([returnUrl || '/payments']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.paymentForm.get(fieldName);
    if (control?.hasError('required')) return `${fieldName} is required`;
    if (control?.hasError('min')) return 'Amount must be greater than 0';
    return '';
  }
}
```

---

### Step 6: Update Payment Detail Component

**File**: `client/src/app/features/payments/payment-detail/payment-detail.component.ts` (modify existing)

Add these to the existing component:

```typescript
// Add imports:
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { StatusConfirmDialogComponent } from '../dialogs/status-confirm-dialog/status-confirm-dialog.component';
import { PAYMENT_STATUS_TRANSITIONS, PAYMENT_STATUS_LABELS } from '../../../shared/models/payment.model';

// Add to imports array:
// MatMenuModule,

// Add properties:
updatingStatus = signal(false);

// Add methods:
canUpdateStatus(): boolean {
  const payment = this.payment();
  if (!payment) return false;
  return PAYMENT_STATUS_TRANSITIONS[payment.status].length > 0;
}

getAvailableStatuses(): PaymentStatus[] {
  const payment = this.payment();
  if (!payment) return [];
  return PAYMENT_STATUS_TRANSITIONS[payment.status];
}

getStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status];
}

onStatusUpdate(newStatus: PaymentStatus): void {
  const payment = this.payment();
  if (!payment) return;

  const dialogRef = this.dialog.open(StatusConfirmDialogComponent, {
    width: '450px',
    data: {
      currentStatus: payment.status,
      newStatus,
      transactionId: payment.transactionId,
      amount: payment.amount,
    },
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (confirmed) {
      this.updateStatus(newStatus);
    }
  });
}

private updateStatus(newStatus: PaymentStatus): void {
  const payment = this.payment();
  if (!payment) return;

  this.updatingStatus.set(true);
  this.paymentService.updatePaymentStatus(payment.id, newStatus).subscribe({
    next: (updated) => {
      this.updatingStatus.set(false);
      this.payment.set({ ...payment, ...updated });
      this.notificationService.success(`Payment marked as ${this.getStatusLabel(newStatus)}`);
    },
    error: (error) => {
      this.updatingStatus.set(false);
      let errorMessage = 'Failed to update payment status';
      if (error.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      }
      this.notificationService.error(errorMessage);
    },
  });
}
```

---

### Step 7: Update Payments List Component

**File**: `client/src/app/features/payments/payments-list/payments-list.component.ts` (modify existing)

Add "Create Payment" button in header:

```typescript
// Add to template (header-actions):
<button mat-raised-button color="primary" routerLink="/payments/create">
  <mat-icon>add</mat-icon>
  Create Payment
</button>

// Add import:
import { RouterLink } from '@angular/router';
// Add RouterLink to imports array
```

---

### Step 8: Update Routes

**File**: `client/src/app/features/payments/payments.routes.ts` (modify existing)

```typescript
import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./payments-list/payments-list.component')
      .then(m => m.PaymentsListComponent),
  },
  {
    path: 'create',
    loadComponent: () => import('./components/payment-create/payment-create.component')
      .then(m => m.PaymentCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./payment-detail/payment-detail.component')
      .then(m => m.PaymentDetailComponent),
  },
];
```

---

## Testing Checklist

### Unit Tests Required

- [ ] `payment.service.spec.ts` - createPayment, updatePaymentStatus methods
- [ ] `payment-create.component.spec.ts` - form validation, submission, cancel
- [ ] `status-confirm-dialog.component.spec.ts` - confirm/cancel actions
- [ ] `payments-list.component.spec.ts` - create button navigation
- [ ] `payment-detail.component.spec.ts` - status menu, update flow

### Manual Testing

- [ ] Create payment from payments list
- [ ] Create payment from order detail (pre-filled)
- [ ] Update status Pending → Successful
- [ ] Update status Pending → Failed
- [ ] Verify terminal states hide status menu
- [ ] Verify error handling for invalid operations

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `graphql/payment.mutations.ts` | Create | GraphQL mutation definitions |
| `models/payment.model.ts` | Modify | Add input types and constants |
| `services/payment.service.ts` | Modify | Add mutation methods |
| `dialogs/status-confirm-dialog/*` | Create | Confirmation dialog component |
| `components/payment-create/*` | Create | Payment creation page |
| `payment-detail/payment-detail.component.ts` | Modify | Add status update UI |
| `payments-list/payments-list.component.ts` | Modify | Add create button |
| `payments.routes.ts` | Modify | Add create route |
