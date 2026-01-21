import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaymentService } from '../services/payment.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  Payment,
  PaymentStatus,
  PAYMENT_STATUS_LABELS,
  canUpdatePaymentStatus,
  getAvailablePaymentStatuses,
} from '../../../shared/models/payment.model';
import { StatusConfirmDialogComponent, StatusConfirmDialogData } from '../dialogs/status-confirm-dialog/status-confirm-dialog.component';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './payment-detail.component.html',
  styleUrl: './payment-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  payment = signal<Payment | null>(null);
  loading = signal(true);
  updatingStatus = signal(false);

  ngOnInit(): void {
    const paymentId = this.route.snapshot.paramMap.get('id');
    if (paymentId) {
      this.loadPayment(paymentId);
    } else {
      this.loading.set(false);
    }
  }

  private loadPayment(id: string): void {
    this.loading.set(true);
    this.paymentService.getPaymentById(id).subscribe((payment) => {
      this.payment.set(payment);
      this.loading.set(false);
    });
  }

  goBack(): void {
    this.router.navigate(['/payments']);
  }

  goToOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusLabel(status: PaymentStatus): string {
    return PAYMENT_STATUS_LABELS[status] || status;
  }

  getStatusVariant(status: PaymentStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (status) {
      case 'SUCCESSFUL':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  }

  getMethodIcon(method: string | null): string {
    if (!method) return 'payment';

    const methodLower = method.toLowerCase();
    if (methodLower.includes('credit') || methodLower.includes('debit')) {
      return 'credit_card';
    }
    if (methodLower.includes('paypal')) {
      return 'account_balance_wallet';
    }
    if (methodLower.includes('bank')) {
      return 'account_balance';
    }
    if (methodLower.includes('apple')) {
      return 'phone_iphone';
    }
    if (methodLower.includes('google')) {
      return 'g_mobiledata';
    }
    return 'payment';
  }

  /**
   * Check if the current payment status can be updated
   */
  canUpdateStatus(): boolean {
    const currentPayment = this.payment();
    if (!currentPayment) return false;
    return canUpdatePaymentStatus(currentPayment.status);
  }

  /**
   * Get available status options for the current payment
   */
  getAvailableStatuses(): PaymentStatus[] {
    const currentPayment = this.payment();
    if (!currentPayment) return [];
    return getAvailablePaymentStatuses(currentPayment.status);
  }

  /**
   * Get icon for a status option
   */
  getStatusIcon(status: PaymentStatus): string {
    return status === 'SUCCESSFUL' ? 'check_circle' : 'cancel';
  }

  /**
   * Handle status update selection from dropdown menu
   */
  onStatusUpdate(newStatus: PaymentStatus): void {
    const currentPayment = this.payment();
    if (!currentPayment) return;

    const dialogData: StatusConfirmDialogData = {
      currentStatus: currentPayment.status,
      newStatus,
      transactionId: currentPayment.transactionId,
      amount: currentPayment.amount,
    };

    const dialogRef = this.dialog.open(StatusConfirmDialogComponent, {
      data: dialogData,
      width: '480px',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.updateStatus(newStatus);
      }
    });
  }

  /**
   * Execute the status update
   */
  private updateStatus(newStatus: PaymentStatus): void {
    const currentPayment = this.payment();
    if (!currentPayment) return;

    this.updatingStatus.set(true);

    this.paymentService.updatePaymentStatus(currentPayment.id, newStatus).subscribe({
      next: (updatedPayment) => {
        this.payment.set(updatedPayment);
        this.updatingStatus.set(false);
        this.notificationService.success(`Payment marked as ${this.getStatusLabel(newStatus)}`);
      },
      error: (error) => {
        this.updatingStatus.set(false);
        console.error('Error updating payment status:', error);

        let errorMessage = 'Failed to update payment status';
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          errorMessage = error.graphQLErrors[0].message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.notificationService.error(errorMessage);
      },
    });
  }
}
