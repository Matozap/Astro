import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { PaymentStatus, PAYMENT_STATUS_LABELS, Money } from '../../../../shared/models/payment.model';

/**
 * Data passed to the status confirmation dialog.
 */
export interface StatusConfirmDialogData {
  /** Current payment status */
  currentStatus: PaymentStatus;
  /** Target status to transition to */
  newStatus: PaymentStatus;
  /** Transaction ID for display (if available) */
  transactionId: string | null;
  /** Payment amount for display */
  amount: Money;
}

@Component({
  selector: 'app-status-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, CurrencyPipe],
  templateUrl: './status-confirm-dialog.component.html',
  styleUrl: './status-confirm-dialog.component.scss',
})
export class StatusConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<StatusConfirmDialogComponent>);
  readonly data = inject<StatusConfirmDialogData>(MAT_DIALOG_DATA);

  getStatusLabel(status: PaymentStatus): string {
    return PAYMENT_STATUS_LABELS[status] || status;
  }

  getStatusIcon(): string {
    return this.data.newStatus === 'SUCCESSFUL' ? 'check_circle' : 'cancel';
  }

  getStatusColor(): string {
    return this.data.newStatus === 'SUCCESSFUL' ? 'primary' : 'warn';
  }

  getWarningText(): string {
    if (this.data.newStatus === 'SUCCESSFUL') {
      return 'This will mark the payment as completed. The status cannot be changed after this action.';
    } else {
      return 'This will mark the payment as failed. The status cannot be changed after this action.';
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
