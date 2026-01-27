import { Component, OnInit, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  order = signal<Order | null>(null);
  loading = signal(true);
  updatingStatus = signal(false);

  displayedColumns = ['productName', 'quantity', 'unitPrice', 'lineTotal'];

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.loading.set(false);
    }
  }

  private loadOrder(id: string): void {
    this.loading.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        console.log('Loaded order:', order);
        console.log('Order status:', order?.status);
        this.order.set(order);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.loading.set(false);
        this.notificationService.error('Failed to load order');
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getStatusVariant(status: OrderStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'CONFIRMED':
      case 'SHIPPED':
        return 'info';
      case 'PROCESSING':
      default:
        return 'default';
    }
  }

  canUpdateStatus(): boolean {
    const order = this.order();
    if (!order) return false;
    return !['DELIVERED', 'CANCELLED'].includes(order.status);
  }

  getAvailableStatuses(): OrderStatus[] {
    const order = this.order();
    if (!order) return [];

    // Define valid status transitions
    const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': [],
      'CANCELLED': [],
    };

    const availableStatuses = statusTransitions[order.status] || [];
    console.log('Current status:', order.status, 'Available statuses:', availableStatuses);
    return availableStatuses;
  }

  getStatusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] || status;
  }

  updateStatus(newStatus: OrderStatus): void {
    console.log('updateStatus called with:', newStatus);
    const order = this.order();
    if (!order) {
      console.log('No order found');
      return;
    }

    const currentUser = this.authService.currentUser();
    const modifiedBy = currentUser?.email || 'admin';

    console.log('Calling orderService.updateOrderStatus with:', order.id, newStatus, modifiedBy);
    this.updatingStatus.set(true);

    this.orderService.updateOrderStatus(order.id, newStatus, modifiedBy).subscribe({
      next: (updatedOrder) => {
        this.updatingStatus.set(false);
        if (updatedOrder) {
          // Merge updated fields into existing order to preserve all data
          this.order.set({ ...order, ...updatedOrder });
          this.notificationService.success(`Order status updated to ${this.getStatusLabel(newStatus)}`);
          this.cdr.markForCheck();
        }
      },
      error: (error) => {
        this.updatingStatus.set(false);
        console.error('Error updating order status:', error);

        let errorMessage = 'Failed to update order status';
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const gqlError = error.graphQLErrors[0];
          errorMessage = gqlError.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.notificationService.error(errorMessage);
        this.cdr.markForCheck();
      },
    });
  }
}
