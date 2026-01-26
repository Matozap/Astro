import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { DashboardService } from '../../services/dashboard.service';
import { Order, OrderStatus } from '../../../../shared/models/order.model';
import {
  ORDER_STATUS_CONFIG,
  DEFAULT_STATUS_COLOR,
  DEFAULT_STATUS_ICON,
} from '../../../../shared/constants';

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
    return ORDER_STATUS_CONFIG[status]?.color || DEFAULT_STATUS_COLOR;
  }

  getStatusIcon(status: OrderStatus): string {
    return ORDER_STATUS_CONFIG[status]?.icon || DEFAULT_STATUS_ICON;
  }

  formatStatus(status: OrderStatus): string {
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
