import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService } from '../../services/dashboard.service';
import { RevenueDataPoint } from '../../../../shared/models/dashboard.model';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule,
    NgxEchartsDirective,
  ],
  providers: [provideEcharts()],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenueChartComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  loading = signal(true);
  chartOption = signal<EChartsOption>({});
  viewMode = signal<'revenue' | 'orders'>('revenue');

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.dashboardService.getRevenueData().subscribe({
      next: (data) => {
        this.updateChart(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onViewModeChange(mode: 'revenue' | 'orders'): void {
    this.viewMode.set(mode);
    this.dashboardService.getRevenueData().subscribe((data) => {
      this.updateChart(data);
    });
  }

  private updateChart(data: RevenueDataPoint[]): void {
    const isRevenue = this.viewMode() === 'revenue';

    const option: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(37, 37, 58, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#e0e0e0',
        },
        formatter: (params: any) => {
          const param = params[0];
          const value = isRevenue
            ? `$${param.value.toLocaleString()}`
            : param.value.toLocaleString();
          return `<strong>${param.name}</strong><br/>${isRevenue ? 'Revenue' : 'Orders'}: ${value}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map((d) => this.formatMonth(d.date)),
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 11,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 11,
          formatter: (value: number) => {
            if (isRevenue) {
              return value >= 1000 ? `$${value / 1000}k` : `$${value}`;
            }
            return value.toString();
          },
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
      series: [
        {
          name: isRevenue ? 'Revenue' : 'Orders',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: data.map((d) => (isRevenue ? d.revenue.amount : d.orders)),
          lineStyle: {
            width: 3,
            color: isRevenue ? '#abc7ff' : '#81c784',
          },
          itemStyle: {
            color: isRevenue ? '#abc7ff' : '#81c784',
            borderColor: '#25253a',
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: isRevenue ? 'rgba(171, 199, 255, 0.3)' : 'rgba(129, 199, 132, 0.3)',
                },
                {
                  offset: 1,
                  color: isRevenue ? 'rgba(171, 199, 255, 0.0)' : 'rgba(129, 199, 132, 0.0)',
                },
              ],
            },
          },
        },
      ],
    };

    this.chartOption.set(option);
  }

  private formatMonth(date: string): string {
    const [year, month] = date.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(month, 10) - 1];
  }
}
