import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService } from '../../services/dashboard.service';
import { ShipmentStatus } from '../../../../shared/models/shipment.model';

interface ShipmentStatusData {
  status: ShipmentStatus;
  count: number;
}

@Component({
  selector: 'app-shipment-status',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './shipment-status.component.html',
  styleUrl: './shipment-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentStatusComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  loading = signal(true);
  statusData = signal<ShipmentStatusData[]>([]);
  totalShipments = signal(0);

  private readonly statusConfig: Record<ShipmentStatus, { color: string; icon: string; label: string }> = {
    'PENDING': { color: '#ffb74d', icon: 'schedule', label: 'Pending' },
    'PICKED_UP': { color: '#4fc3f7', icon: 'inventory', label: 'Picked Up' },
    'SHIPPED': { color: '#4fc3f7', icon: 'inventory', label: 'Shipped' },
    'IN_TRANSIT': { color: '#abc7ff', icon: 'local_shipping', label: 'In Transit' },
    'OUT_FOR_DELIVERY': { color: '#ba68c8', icon: 'delivery_dining', label: 'Out for Delivery' },
    'DELIVERED': { color: '#81c784', icon: 'check_circle', label: 'Delivered' },
    'DELAYED': { color: '#ffb74d', icon: 'warning', label: 'Delayed' },
    'FAILED': { color: '#e57373', icon: 'error', label: 'Failed' },
    'FAILED_DELIVERY': { color: '#e57373', icon: 'error', label: 'Failed Delivery' },
    'RETURNED': { color: '#90a4ae', icon: 'keyboard_return', label: 'Returned' },
  };

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.dashboardService.getShipmentStatusData().subscribe({
      next: (data) => {
        this.statusData.set(data);
        this.totalShipments.set(data.reduce((sum, d) => sum + d.count, 0));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getStatusConfig(status: ShipmentStatus): { color: string; icon: string; label: string } {
    return this.statusConfig[status] || { color: '#90a4ae', icon: 'help', label: status };
  }

  getPercentage(count: number): number {
    const total = this.totalShipments();
    return total > 0 ? (count / total) * 100 : 0;
  }
}
