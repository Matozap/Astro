import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { DashboardService } from '../../services/dashboard.service';
import { Order, OrderStatus } from '../../../../shared/models/order.model';

@Component({
  selector: 'app-recent-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    CurrencyPipe,
  ],
  templateUrl: './recent-orders.component.html',
  styleUrl: './recent-orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentOrdersComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  loading = signal(true);
  orders = signal<Partial<Order>[]>([]);
  displayedColumns = ['id', 'customer', 'status', 'total', 'date'];

  private readonly statusConfig: Record<OrderStatus, { color: string; icon: string }> = {
    'PENDING': { color: '#ffb74d', icon: 'schedule' },
    'CONFIRMED': { color: '#4fc3f7', icon: 'check_circle' },
    'PROCESSING': { color: '#abc7ff', icon: 'autorenew' },
    'SHIPPED': { color: '#ba68c8', icon: 'local_shipping' },
    'DELIVERED': { color: '#81c784', icon: 'done_all' },
    'CANCELLED': { color: '#e57373', icon: 'cancel' },
    'REFUNDED': { color: '#90a4ae', icon: 'replay' },
  };

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.dashboardService.getRecentOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getStatusColor(status: OrderStatus): string {
    return this.statusConfig[status]?.color || '#90a4ae';
  }

  getStatusIcon(status: OrderStatus): string {
    return this.statusConfig[status]?.icon || 'help';
  }

  formatStatus(status: OrderStatus): string {
    // Convert SCREAMING_SNAKE_CASE to Title Case
    return status
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  }
}
