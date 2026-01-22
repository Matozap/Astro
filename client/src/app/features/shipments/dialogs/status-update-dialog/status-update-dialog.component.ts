import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  StatusUpdateDialogData,
  StatusUpdateDialogResult,
  SHIPMENT_STATUS_LABELS,
} from '../../../../shared/models/shipment.model';

@Component({
  selector: 'app-status-update-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './status-update-dialog.component.html',
  styleUrl: './status-update-dialog.component.scss',
})
export class StatusUpdateDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<StatusUpdateDialogComponent>);
  readonly data = inject<StatusUpdateDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      location: ['', [Validators.maxLength(200)]],
      notes: ['', [Validators.maxLength(500)]],
    });
  }

  get currentStatusLabel(): string {
    return SHIPMENT_STATUS_LABELS[this.data.shipment.status] || this.data.shipment.status;
  }

  get newStatusLabel(): string {
    return SHIPMENT_STATUS_LABELS[this.data.newStatus] || this.data.newStatus;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.form.invalid) {
      return;
    }

    const result: StatusUpdateDialogResult = {
      status: this.data.newStatus,
      location: this.form.value.location || undefined,
      notes: this.form.value.notes || undefined,
    };

    this.dialogRef.close(result);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    return '';
  }
}
