import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface DeactivateConfirmDialogData {
  productName: string;
  productSku: string;
}

@Component({
  selector: 'app-deactivate-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './deactivate-confirm-dialog.component.html',
  styleUrl: './deactivate-confirm-dialog.component.scss'
})
export class DeactivateConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DeactivateConfirmDialogComponent>);
  readonly data = inject<DeactivateConfirmDialogData>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
