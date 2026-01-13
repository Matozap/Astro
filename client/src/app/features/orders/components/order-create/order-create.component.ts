import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, BehaviorSubject, combineLatest, map, startWith, tap } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProductService } from '../../../products/services/product.service';
import { Product } from '../../../../shared/models/product.model';

interface OrderLineItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

@Component({
  selector: 'app-order-create',
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.scss',
})
export class OrderCreateComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  orderForm!: FormGroup;
  isSubmitting = signal(false);
  loadingProducts = signal(true);

  private products$ = new BehaviorSubject<Product[]>([]);
  filteredProducts$!: Observable<Product[]>;
  selectedProducts: OrderLineItem[] = [];
  orderTotal = signal(0);

  productSearchControl = this.fb.control('');

  ngOnInit(): void {
    this.initializeForm();
    this.loadProducts();
    this.setupProductSearch();
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

  private loadProducts(): void {
    this.loadingProducts.set(true);
    // Load active products for selection (max 20 per request)
    this.productService.getProducts({ page: 0, pageSize: 20 }).subscribe({
      next: (result) => {
        const activeProducts = result.items.filter(p => p.isActive);
        this.products$.next(activeProducts.length > 0 ? activeProducts : result.items);
        this.loadingProducts.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notificationService.error('Failed to load products');
        this.loadingProducts.set(false);
      },
    });
  }

  private setupProductSearch(): void {
    // Combine products stream with search input to filter
    this.filteredProducts$ = combineLatest([
      this.products$,
      this.productSearchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([products, searchValue]) => this._filterProducts(products, searchValue ?? ''))
    );
  }

  private _filterProducts(products: Product[], value: string | Product): Product[] {
    // Handle when value is a Product object (after selection)
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    if (!filterValue) {
      return products;
    }
    return products.filter(product =>
      product.name.toLowerCase().includes(filterValue) ||
      product.sku.toLowerCase().includes(filterValue)
    );
  }

  displayProduct(product: Product | string): string {
    if (!product) return '';
    if (typeof product === 'string') return product;
    return `${product.name} (${product.sku})`;
  }

  onProductSelected(product: Product): void {
    // Check if product already added
    const existingIndex = this.selectedProducts.findIndex(p => p.productId === product.id);

    if (existingIndex >= 0) {
      // Increment quantity
      this.selectedProducts[existingIndex].quantity++;
      this.selectedProducts[existingIndex].lineTotal =
        this.selectedProducts[existingIndex].quantity * this.selectedProducts[existingIndex].unitPrice;
    } else {
      // Add new product
      this.selectedProducts.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: 1,
        unitPrice: product.price.amount,
        lineTotal: product.price.amount,
      });
    }

    this.calculateTotal();
    this.productSearchControl.setValue('');
  }

  onQuantityChange(index: number, quantity: number): void {
    if (quantity > 0) {
      this.selectedProducts[index].quantity = quantity;
      this.selectedProducts[index].lineTotal =
        quantity * this.selectedProducts[index].unitPrice;
      this.calculateTotal();
    }
  }

  removeProduct(index: number): void {
    this.selectedProducts.splice(index, 1);
    this.calculateTotal();
  }

  private calculateTotal(): void {
    const total = this.selectedProducts.reduce((sum, item) => sum + item.lineTotal, 0);
    this.orderTotal.set(total);
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      Object.keys(this.orderForm.controls).forEach(key => {
        this.orderForm.get(key)?.markAsTouched();
      });
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    if (this.selectedProducts.length === 0) {
      this.notificationService.error('Please add at least one product to the order');
      return;
    }

    this.isSubmitting.set(true);

    const currentUser = this.authService.currentUser();
    const createdBy = currentUser?.email || 'system';

    const formValue = this.orderForm.value;
    const createCommand = {
      customerName: formValue.customerName,
      customerEmail: formValue.customerEmail,
      street: formValue.street,
      city: formValue.city,
      state: formValue.state,
      postalCode: formValue.postalCode,
      country: formValue.country,
      notes: formValue.notes || undefined,
      orderDetails: this.selectedProducts.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
      })),
      createdBy,
    };

    this.orderService.createOrder(createCommand).subscribe({
      next: (createdOrder) => {
        this.isSubmitting.set(false);
        this.notificationService.success('Order created successfully');
        this.router.navigate(['/orders', createdOrder.id]);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error creating order:', error);

        let errorMessage = 'Failed to create order';
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
    this.router.navigate(['/orders']);
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
