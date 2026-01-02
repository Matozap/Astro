import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PaymentService } from '../services/payment.service';
import { Payment, PaymentStatus, PAYMENT_STATUS_LABELS } from '../../../shared/models/payment.model';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
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

  payment = signal<Payment | null>(null);
  loading = signal(true);

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
      case 'Successful':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Failed':
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
}
