import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { ShipmentService } from '../../services/shipment.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { OrderService } from '../../../orders/services/order.service';
import { Order, OrderDetail } from '../../../../shared/models/order.model';
import {
  CreateShipmentInput,
  CreateShipmentItemInput,
  CARRIER_OPTIONS,
  WEIGHT_UNIT_OPTIONS,
  DIMENSION_UNIT_OPTIONS,
  CURRENCY_OPTIONS,
  WeightUnit,
  DimensionUnit,
} from '../../../../shared/models/shipment.model';

@Component({
  selector: 'app-shipment-create',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    CurrencyPipe,
  ],
  templateUrl: './shipment-create.component.html',
  styleUrl: './shipment-create.component.scss',
})
export class ShipmentCreateComponent implements OnInit {
  private readonly shipmentService = inject(ShipmentService);
  private readonly orderService = inject(OrderService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  shipmentForm!: FormGroup;
  isSubmitting = signal(false);
  loadingOrders = signal(true);

  private orders$ = new BehaviorSubject<Order[]>([]);
  filteredOrders$!: Observable<Order[]>;
  selectedOrder = signal<Order | null>(null);
  selectedItems = signal<CreateShipmentItemInput[]>([]);

  orderSearchControl = new FormControl<string | Order>('');

  carrierOptions = CARRIER_OPTIONS;
  weightUnitOptions = WEIGHT_UNIT_OPTIONS;
  dimensionUnitOptions = DIMENSION_UNIT_OPTIONS;
  currencies = CURRENCY_OPTIONS;

  displayedColumns = ['productName', 'productSku', 'quantity', 'actions'];

  ngOnInit(): void {
    this.initializeForm();
    this.loadOrders();
    this.setupOrderSearch();
  }

  private initializeForm(): void {
    this.shipmentForm = this.fb.group({
      // Carrier Info
      carrier: ['', [Validators.required, Validators.maxLength(100)]],
      trackingNumber: ['', [Validators.minLength(5), Validators.maxLength(50)]],

      // Origin Address
      originStreet: ['', [Validators.required, Validators.maxLength(200)]],
      originCity: ['', [Validators.required, Validators.maxLength(100)]],
      originState: ['', [Validators.required, Validators.maxLength(100)]],
      originPostalCode: ['', [Validators.required, Validators.maxLength(20)]],
      originCountry: ['USA', [Validators.required, Validators.maxLength(100)]],

      // Destination Address
      destinationStreet: ['', [Validators.required, Validators.maxLength(200)]],
      destinationCity: ['', [Validators.required, Validators.maxLength(100)]],
      destinationState: ['', [Validators.required, Validators.maxLength(100)]],
      destinationPostalCode: ['', [Validators.required, Validators.maxLength(20)]],
      destinationCountry: ['USA', [Validators.required, Validators.maxLength(100)]],

      // Package Details
      weight: [null, [Validators.required, Validators.min(0)]],
      weightUnit: ['POUNDS' as WeightUnit, [Validators.required]],
      length: [null, [Validators.required, Validators.min(0)]],
      width: [null, [Validators.required, Validators.min(0)]],
      height: [null, [Validators.required, Validators.min(0)]],
      dimensionUnit: ['INCHES' as DimensionUnit, [Validators.required]],

      // Cost & Delivery
      shippingCost: [null, [Validators.required, Validators.min(0)]],
      currency: ['USD', [Validators.required]],
      estimatedDeliveryDate: [null],
    });
  }

  private loadOrders(): void {
    this.loadingOrders.set(true);
    this.orderService.getOrders({ page: 0, pageSize: 100 }).subscribe({
      next: (result) => {
        // Filter orders eligible for shipment (not CANCELLED)
        const eligibleOrders = result.items.filter((o) => o.status !== 'CANCELLED');
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
    if (!value || typeof value !== 'string') {
      return orders;
    }
    const filterValue = value.toLowerCase();
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(filterValue) ||
        order.customerName.toLowerCase().includes(filterValue)
    );
  }

  displayOrder(order: Order | string | null): string {
    if (!order) return '';
    if (typeof order === 'string') return order;
    return `${order.orderNumber} - ${order.customerName}`;
  }

  onOrderSelected(order: Order): void {
    this.selectedOrder.set(order);
    this.selectedItems.set([]);

    // Auto-populate destination address from order shipping address
    if (order.shippingAddress) {
      this.shipmentForm.patchValue({
        destinationStreet: order.shippingAddress.street,
        destinationCity: order.shippingAddress.city,
        destinationState: order.shippingAddress.state,
        destinationPostalCode: order.shippingAddress.postalCode,
        destinationCountry: order.shippingAddress.country,
      });
    }
  }

  getOrderDetails(): OrderDetail[] {
    return this.selectedOrder()?.details || [];
  }

  isItemSelected(detail: OrderDetail): boolean {
    return this.selectedItems().some((item) => item.orderDetailId === detail.id);
  }

  getItemQuantity(detail: OrderDetail): number {
    const item = this.selectedItems().find((i) => i.orderDetailId === detail.id);
    return item?.quantity || 0;
  }

  addItem(detail: OrderDetail): void {
    const existing = this.selectedItems().find((item) => item.orderDetailId === detail.id);

    if (existing) {
      // Increment quantity up to max available
      if (existing.quantity < detail.quantity) {
        this.selectedItems.update((items) =>
          items.map((item) =>
            item.orderDetailId === detail.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      }
    } else {
      // Add new item
      this.selectedItems.update((items) => [
        ...items,
        {
          orderDetailId: detail.id,
          productId: detail.productId,
          productName: detail.productName,
          productSku: detail.productSku,
          quantity: 1,
        },
      ]);
    }
  }

  removeItem(orderDetailId: string): void {
    this.selectedItems.update((items) => items.filter((item) => item.orderDetailId !== orderDetailId));
  }

  decrementItem(detail: OrderDetail): void {
    const existing = this.selectedItems().find((item) => item.orderDetailId === detail.id);
    if (existing && existing.quantity > 1) {
      this.selectedItems.update((items) =>
        items.map((item) =>
          item.orderDetailId === detail.id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    } else if (existing) {
      this.removeItem(detail.id);
    }
  }

  addAllItems(): void {
    const order = this.selectedOrder();
    if (!order) return;

    const allItems: CreateShipmentItemInput[] = order.details.map((detail) => ({
      orderDetailId: detail.id,
      productId: detail.productId,
      productName: detail.productName,
      productSku: detail.productSku,
      quantity: detail.quantity,
    }));
    this.selectedItems.set(allItems);
  }

  clearAllItems(): void {
    this.selectedItems.set([]);
  }

  onSubmit(): void {
    const selectedOrder = this.selectedOrder();
    const items = this.selectedItems();

    if (!selectedOrder) {
      this.notificationService.error('Please select an order');
      return;
    }

    if (items.length === 0) {
      this.notificationService.error('Please add at least one item to the shipment');
      return;
    }

    if (this.shipmentForm.invalid) {
      Object.keys(this.shipmentForm.controls).forEach((key) => {
        this.shipmentForm.get(key)?.markAsTouched();
      });
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.shipmentForm.value;
    const createInput: CreateShipmentInput = {
      orderId: selectedOrder.id,
      carrier: formValue.carrier,
      trackingNumber: formValue.trackingNumber || undefined,
      originStreet: formValue.originStreet,
      originCity: formValue.originCity,
      originState: formValue.originState,
      originPostalCode: formValue.originPostalCode,
      originCountry: formValue.originCountry,
      destinationStreet: formValue.destinationStreet,
      destinationCity: formValue.destinationCity,
      destinationState: formValue.destinationState,
      destinationPostalCode: formValue.destinationPostalCode,
      destinationCountry: formValue.destinationCountry,
      weight: formValue.weight,
      weightUnit: formValue.weightUnit,
      length: formValue.length,
      width: formValue.width,
      height: formValue.height,
      dimensionUnit: formValue.dimensionUnit,
      shippingCost: formValue.shippingCost,
      estimatedDeliveryDate: formValue.estimatedDeliveryDate
        ? new Date(formValue.estimatedDeliveryDate).toISOString()
        : undefined,
      createdBy: 'current-user@astro.com', // TODO: Get from auth service
      items: items,
    };

    this.shipmentService.createShipment(createInput).subscribe({
      next: (createdShipment) => {
        this.isSubmitting.set(false);
        this.notificationService.success('Shipment created successfully');
        this.router.navigate(['/shipments', createdShipment.id]);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error creating shipment:', error);

        let errorMessage = 'Failed to create shipment';
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const gqlError = error.graphQLErrors[0];
          errorMessage = gqlError.message;

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
    this.router.navigate(['/shipments']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.shipmentForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be a positive number`;
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} is too short`;
    }
    if (control?.hasError('maxlength')) {
      return `${this.getFieldLabel(fieldName)} is too long`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      carrier: 'Carrier',
      trackingNumber: 'Tracking number',
      originStreet: 'Origin street',
      originCity: 'Origin city',
      originState: 'Origin state',
      originPostalCode: 'Origin postal code',
      originCountry: 'Origin country',
      destinationStreet: 'Destination street',
      destinationCity: 'Destination city',
      destinationState: 'Destination state',
      destinationPostalCode: 'Destination postal code',
      destinationCountry: 'Destination country',
      weight: 'Weight',
      length: 'Length',
      width: 'Width',
      height: 'Height',
      shippingCost: 'Shipping cost',
    };
    return labels[fieldName] || fieldName;
  }
}
