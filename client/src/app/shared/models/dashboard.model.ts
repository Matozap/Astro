import { Money } from './common.model';
import { OrderStatus } from './order.model';

export interface DashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;

  totalOrders: number;
  ordersChange: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;

  totalRevenue: Money;
  revenueChange: number;
  monthlyRevenue: Money;
  revenueGrowth: number;

  totalPayments: number;
  pendingPayments: number;
  successfulPayments: number;
  failedPayments: number;

  totalShipments: number;
  pendingShipments: number;
  shipmentsChange: number;
  inTransitShipments: number;
  deliveredShipments: number;
  delayedShipments: number;
}

export interface RevenueDataPoint {
  date: string;
  month?: string;
  year?: number;
  revenue: Money;
  orders: number;
  profit?: number;
}

export interface OrderStatusDistribution {
  status: OrderStatus;
  count: number;
  percentage: number;
}

export interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  change: number;
  changeDirection?: 'up' | 'down' | 'neutral';
  icon: string;
  variant: string;
  color?: string;
}

// Helper to create metric cards
export function createMetricCard(
  id: string,
  title: string,
  value: number | string,
  previousValue?: number,
  icon: string = 'analytics',
  variant: string = 'primary'
): MetricCard {
  let change = 0;
  let changeDirection: 'up' | 'down' | 'neutral' = 'neutral';

  if (previousValue !== undefined && typeof value === 'number') {
    if (previousValue > 0) {
      change = ((value - previousValue) / previousValue) * 100;
      changeDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    }
  }

  return {
    id,
    title,
    value,
    change: Math.abs(Math.round(change * 10) / 10),
    changeDirection,
    icon,
    variant,
  };
}

// Chart configuration types for ECharts
export interface ChartDataset {
  name: string;
  data: number[];
  type: 'bar' | 'line' | 'pie' | 'area';
  color?: string;
}

export interface ChartConfig {
  title?: string;
  labels: string[];
  datasets: ChartDataset[];
}
