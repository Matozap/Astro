import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ShipmentEditDialogData,
  ShipmentEditDialogResult,
  CARRIER_OPTIONS,
} from '../../../../shared/models/shipment.model';

@Component({
  selector: 'app-shipment-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './shipment-edit-dialog.component.html',
  styleUrl: './shipment-edit-dialog.component.scss',
})
export class ShipmentEditDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ShipmentEditDialogComponent>);
  readonly data = inject<ShipmentEditDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  form: FormGroup;
  carrierOptions = CARRIER_OPTIONS;

  constructor() {
    this.form = this.fb.group({
      carrier: [this.data.shipment.carrier, [Validators.required, Validators.maxLength(100)]],
      trackingNumber: [
        this.data.shipment.trackingNumber,
        [Validators.minLength(5), Validators.maxLength(50)],
      ],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    const result: ShipmentEditDialogResult = {
      carrier: this.form.value.carrier,
      trackingNumber: this.form.value.trackingNumber || undefined,
    };

    this.dialogRef.close(result);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      carrier: 'Carrier',
      trackingNumber: 'Tracking number',
    };
    return labels[fieldName] || fieldName;
  }

  hasChanges(): boolean {
    const formValue = this.form.value;
    return (
      formValue.carrier !== this.data.shipment.carrier ||
      formValue.trackingNumber !== this.data.shipment.trackingNumber
    );
  }
}
