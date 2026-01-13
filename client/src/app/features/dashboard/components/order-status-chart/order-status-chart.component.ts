import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService } from '../../services/dashboard.service';
import { OrderStatusDistribution } from '../../../../shared/models/dashboard.model';
import { OrderStatus } from '../../../../shared/models/order.model';

@Component({
  selector: 'app-order-status-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    NgxEchartsDirective,
  ],
  providers: [provideEcharts()],
  templateUrl: './order-status-chart.component.html',
  styleUrl: './order-status-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusChartComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  loading = signal(true);
  chartOption = signal<EChartsOption>({});
  statusData = signal<OrderStatusDistribution[]>([]);

  private readonly statusColors: Record<OrderStatus, string> = {
    'PENDING': '#ffb74d',
    'CONFIRMED': '#4fc3f7',
    'PROCESSING': '#abc7ff',
    'SHIPPED': '#ba68c8',
    'DELIVERED': '#81c784',
    'CANCELLED': '#e57373',
    'REFUNDED': '#90a4ae',
  };

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.dashboardService.getOrderStatusDistribution().subscribe({
      next: (data) => {
        this.statusData.set(data);
        this.updateChart(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private updateChart(data: OrderStatusDistribution[]): void {
    const option: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(37, 37, 58, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#e0e0e0',
        },
        formatter: (params: any) => {
          return `<strong>${params.name}</strong><br/>
                  Orders: ${params.value}<br/>
                  Percentage: ${params.percent}%`;
        },
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: 'Order Status',
          type: 'pie',
          radius: ['55%', '80%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#25253a',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#e0e0e0',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((d) => ({
            value: d.count,
            name: this.formatStatus(d.status),
            itemStyle: {
              color: this.statusColors[d.status] || '#90a4ae',
            },
          })),
        },
      ],
    };

    this.chartOption.set(option);
  }

  formatStatus(status: OrderStatus): string {
    // Convert SCREAMING_SNAKE_CASE to Title Case
    return status
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  getStatusColor(status: OrderStatus): string {
    return this.statusColors[status] || '#90a4ae';
  }
}
