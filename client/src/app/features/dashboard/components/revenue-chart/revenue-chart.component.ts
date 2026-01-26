import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardService } from '../../services/dashboard.service';
import { RevenueDataPoint } from '../../../../shared/models/dashboard.model';
import { CHART_COLORS, TOOLTIP_COLORS } from '../../../../shared/constants';

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
  hasData = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.dashboardService.getRevenueData().subscribe({
      next: (data) => {
        this.hasData.set(data.length > 0);
        this.updateChart(data);
        this.loading.set(false);
      },
      error: () => {
        this.hasData.set(false);
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
    const chartColor = isRevenue ? CHART_COLORS.PRIMARY : CHART_COLORS.SUCCESS;
    const chartColorLight = isRevenue ? CHART_COLORS.PRIMARY_LIGHT : CHART_COLORS.SUCCESS_LIGHT;
    const chartColorTransparent = isRevenue
      ? CHART_COLORS.PRIMARY_TRANSPARENT
      : CHART_COLORS.SUCCESS_TRANSPARENT;

    const option: EChartsOption = {
      backgroundColor: CHART_COLORS.BACKGROUND_TRANSPARENT,
      tooltip: {
        trigger: 'axis',
        backgroundColor: TOOLTIP_COLORS.BACKGROUND,
        borderColor: TOOLTIP_COLORS.BORDER,
        textStyle: {
          color: TOOLTIP_COLORS.TEXT,
        },
        formatter: (params: unknown) => {
          const param = (params as Array<{ name: string; value: number }>)[0];
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
            color: CHART_COLORS.BORDER_LIGHT,
          },
        },
        axisLabel: {
          color: CHART_COLORS.TEXT_SECONDARY,
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
          color: CHART_COLORS.TEXT_SECONDARY,
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
            color: CHART_COLORS.BORDER_SUBTLE,
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
            color: chartColor,
          },
          itemStyle: {
            color: chartColor,
            borderColor: CHART_COLORS.BACKGROUND_DARK,
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
                  color: chartColorLight,
                },
                {
                  offset: 1,
                  color: chartColorTransparent,
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
    const [, month] = date.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(month, 10) - 1];
  }
}
