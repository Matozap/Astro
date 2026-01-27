import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService } from '../../services/dashboard.service';
import { OrderStatusDistribution } from '../../../../shared/models/dashboard.model';
import { OrderStatus } from '../../../../shared/models/order.model';
import {
  CHART_COLORS,
  TOOLTIP_COLORS,
  ORDER_STATUS_COLORS,
  DEFAULT_STATUS_COLOR,
} from '../../../../shared/constants';

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
      backgroundColor: CHART_COLORS.BACKGROUND_TRANSPARENT,
      tooltip: {
        trigger: 'item',
        backgroundColor: TOOLTIP_COLORS.BACKGROUND,
        borderColor: TOOLTIP_COLORS.BORDER,
        textStyle: {
          color: TOOLTIP_COLORS.TEXT,
        },
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; percent: number };
          return `<strong>${p.name}</strong><br/>
                  Orders: ${p.value}<br/>
                  Percentage: ${p.percent}%`;
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
            borderColor: CHART_COLORS.BACKGROUND_DARK,
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
              color: CHART_COLORS.TEXT_PRIMARY,
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
              color: ORDER_STATUS_COLORS[d.status] || DEFAULT_STATUS_COLOR,
            },
          })),
        },
      ],
    };

    this.chartOption.set(option);
  }

  formatStatus(status: OrderStatus): string {
    return status
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  getStatusColor(status: OrderStatus): string {
    return ORDER_STATUS_COLORS[status] || DEFAULT_STATUS_COLOR;
  }
}
