import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
import { Order, OrderStatus } from '../../../shared/models/order.model';

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

  order = signal<Order | null>(null);
  loading = signal(true);

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
    this.orderService.getOrderById(id).subscribe((order) => {
      this.order.set(order);
      this.loading.set(false);
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getStatusVariant(status: OrderStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
      case 'Refunded':
        return 'error';
      case 'Confirmed':
      case 'Shipped':
        return 'info';
      case 'Processing':
      default:
        return 'default';
    }
  }

  canUpdateStatus(): boolean {
    const order = this.order();
    if (!order) return false;
    return !['Delivered', 'Cancelled', 'Refunded'].includes(order.status);
  }

  getAvailableStatuses(): OrderStatus[] {
    const order = this.order();
    if (!order) return [];

    // Define valid status transitions
    const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
      'Pending': ['Confirmed', 'Cancelled'],
      'Confirmed': ['Processing', 'Cancelled'],
      'Processing': ['Shipped', 'Cancelled'],
      'Shipped': ['Delivered'],
      'Delivered': [],
      'Cancelled': [],
      'Refunded': [],
    };

    return statusTransitions[order.status] || [];
  }

  updateStatus(newStatus: OrderStatus): void {
    const order = this.order();
    if (!order) return;

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe((updatedOrder) => {
      if (updatedOrder) {
        this.order.set(updatedOrder);
      }
    });
  }
}
