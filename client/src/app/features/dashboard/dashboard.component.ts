import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricCardComponent, MetricCardVariant } from '../../shared/components/metric-card/metric-card.component';
import { RevenueChartComponent } from './components/revenue-chart/revenue-chart.component';
import { OrderStatusChartComponent } from './components/order-status-chart/order-status-chart.component';
import { RecentOrdersComponent } from './components/recent-orders/recent-orders.component';
import { ShipmentStatusComponent } from './components/shipment-status/shipment-status.component';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MetricCardComponent,
    RevenueChartComponent,
    OrderStatusChartComponent,
    RecentOrdersComponent,
    ShipmentStatusComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly loading = this.dashboardService.loading;
  readonly metricCards = this.dashboardService.metricCards;

  ngOnInit(): void {
    this.dashboardService.loadDashboardMetrics().subscribe();
  }

  asVariant(variant: string): MetricCardVariant {
    return variant as MetricCardVariant;
  }
}
