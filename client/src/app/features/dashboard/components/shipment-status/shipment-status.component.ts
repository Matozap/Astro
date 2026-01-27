import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService, ShipmentStatusData } from '../../services/dashboard.service';
import { ShipmentStatus } from '../../../../shared/models/shipment.model';
import {
  SHIPMENT_STATUS_CONFIG,
  DEFAULT_STATUS_COLOR,
  DEFAULT_STATUS_ICON,
} from '../../../../shared/constants';

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
    return (
      SHIPMENT_STATUS_CONFIG[status] || {
        color: DEFAULT_STATUS_COLOR,
        icon: DEFAULT_STATUS_ICON,
        label: status,
      }
    );
  }

  getPercentage(count: number): number {
    const total = this.totalShipments();
    return total > 0 ? (count / total) * 100 : 0;
  }
}
