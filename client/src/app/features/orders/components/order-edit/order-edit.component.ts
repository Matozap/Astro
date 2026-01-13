import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Order } from '../../../../shared/models/order.model';

@Component({
  selector: 'app-order-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './order-edit.component.html',
  styleUrl: './order-edit.component.scss',
})
export class OrderEditComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  orderForm!: FormGroup;
  isLoading = signal(true);
  isSubmitting = signal(false);
  order = signal<Order | null>(null);
  orderId = '';

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.orderId) {
      this.initializeForm();
      this.loadOrder();
    } else {
      this.notificationService.error('Order ID is required');
      this.router.navigate(['/orders']);
    }
  }

  private initializeForm(): void {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.maxLength(200)]],
      customerEmail: ['', [Validators.required, Validators.email, Validators.maxLength(320)]],
      street: ['', [Validators.required, Validators.maxLength(200)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      state: ['', [Validators.required, Validators.maxLength(100)]],
      postalCode: ['', [Validators.required, Validators.maxLength(20)]],
      country: ['', [Validators.required, Validators.maxLength(100)]],
      notes: ['', [Validators.maxLength(1000)]],
    });
  }

  private loadOrder(): void {
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.isLoading.set(false);
        if (order) {
          this.order.set(order);
          this.populateForm(order);
        } else {
          this.notificationService.error('Order not found');
          this.router.navigate(['/orders']);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error loading order:', error);
        this.notificationService.error('Failed to load order');
        this.router.navigate(['/orders']);
      },
    });
  }

  private populateForm(order: Order): void {
    this.orderForm.patchValue({
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      street: order.shippingAddress.street,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      notes: order.notes || '',
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      Object.keys(this.orderForm.controls).forEach(key => {
        this.orderForm.get(key)?.markAsTouched();
      });
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);

    const currentUser = this.authService.currentUser();
    const modifiedBy = currentUser?.email || 'system';

    const formValue = this.orderForm.value;
    const updateCommand = {
      id: this.orderId,
      customerName: formValue.customerName,
      customerEmail: formValue.customerEmail,
      street: formValue.street,
      city: formValue.city,
      state: formValue.state,
      postalCode: formValue.postalCode,
      country: formValue.country,
      notes: formValue.notes || undefined,
      modifiedBy,
    };

    this.orderService.updateOrder(updateCommand).subscribe({
      next: (updatedOrder) => {
        this.isSubmitting.set(false);
        this.notificationService.success('Order updated successfully');
        this.router.navigate(['/orders', updatedOrder.id]);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error updating order:', error);

        let errorMessage = 'Failed to update order';
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const gqlError = error.graphQLErrors[0];
          errorMessage = gqlError.message;

          // Handle validation errors
          if (gqlError.extensions?.validationErrors) {
            const validationErrors = gqlError.extensions.validationErrors as Array<{field: string, message: string}>;
            errorMessage = validationErrors.map(e => e.message).join(', ');
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.notificationService.error(errorMessage);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/orders', this.orderId]);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.orderForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      customerName: 'Customer name',
      customerEmail: 'Customer email',
      street: 'Street address',
      city: 'City',
      state: 'State',
      postalCode: 'Postal code',
      country: 'Country',
      notes: 'Notes',
    };
    return labels[fieldName] || fieldName;
  }
}
