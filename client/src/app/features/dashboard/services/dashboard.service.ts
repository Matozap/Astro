import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, map, catchError, of, forkJoin } from 'rxjs';
import { Apollo } from 'apollo-angular';
import {
  DashboardMetrics,
  MetricCard,
  RevenueDataPoint,
  OrderStatusDistribution,
} from '../../../shared/models/dashboard.model';
import { Order, OrderStatus } from '../../../shared/models/order.model';
import { ShipmentStatus } from '../../../shared/models/shipment.model';
import {
  GET_DASHBOARD_METRICS,
  GET_REVENUE_DATA,
  GET_ORDER_STATUS_DISTRIBUTION,
  GET_RECENT_ORDERS,
  GET_SHIPMENT_STATUS_DISTRIBUTION,
} from '../graphql/dashboard.queries';

export interface ShipmentStatusData {
  status: ShipmentStatus;
  count: number;
}

interface DashboardMetricsResponse {
  orders: { totalCount: number };
  pendingOrders: { totalCount: number };
  processingOrders: { totalCount: number };
  completedOrders: { totalCount: number };
  cancelledOrders: { totalCount: number };
  products: { totalCount: number };
  activeProducts: { totalCount: number };
  payments: { totalCount: number };
  pendingPayments: { totalCount: number };
  successfulPayments: { totalCount: number };
  failedPayments: { totalCount: number };
  shipments: { totalCount: number };
  pendingShipments: { totalCount: number };
  inTransitShipments: { totalCount: number };
  deliveredShipments: { totalCount: number };
}

interface RevenueDataResponse {
  orders: {
    nodes: Array<{
      id: string;
      totalAmount: { amount: number; currency: string };
      createdAt: string;
    }>;
    totalCount: number;
  };
}

interface OrderStatusDistributionResponse {
  pendingOrders: { totalCount: number };
  confirmedOrders: { totalCount: number };
  processingOrders: { totalCount: number };
  shippedOrders: { totalCount: number };
  deliveredOrders: { totalCount: number };
  cancelledOrders: { totalCount: number };
}

interface RecentOrdersResponse {
  orders: {
    nodes: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      status: OrderStatus;
      totalAmount: { amount: number; currency: string };
      createdAt: string;
    }>;
  };
}

interface ShipmentStatusDistributionResponse {
  pendingShipments: { totalCount: number };
  shippedShipments: { totalCount: number };
  inTransitShipments: { totalCount: number };
  outForDeliveryShipments: { totalCount: number };
  deliveredShipments: { totalCount: number };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apollo = inject(Apollo);

  private readonly _loading = signal(false);
  private readonly _metrics = signal<DashboardMetrics | null>(null);
  private readonly _error = signal<string | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly metrics = this._metrics.asReadonly();
  readonly error = this._error.asReadonly();

  readonly metricCards = computed<MetricCard[]>(() => {
    const m = this._metrics();
    if (!m) return [];

    return [
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: this.formatCurrency(m.totalRevenue.amount),
        icon: 'attach_money',
        change: m.revenueChange,
        variant: 'primary',
      },
      {
        id: 'orders',
        title: 'Total Orders',
        value: m.totalOrders.toLocaleString(),
        icon: 'receipt_long',
        change: m.ordersChange,
        variant: 'success',
      },
      {
        id: 'products',
        title: 'Active Products',
        value: m.activeProducts.toLocaleString(),
        icon: 'inventory_2',
        change: 0,
        variant: 'info',
      },
      {
        id: 'shipments',
        title: 'Pending Shipments',
        value: m.pendingShipments.toLocaleString(),
        icon: 'local_shipping',
        change: m.shipmentsChange,
        variant: 'warning',
      },
    ];
  });

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  loadDashboardMetrics(): Observable<DashboardMetrics> {
    this._loading.set(true);
    this._error.set(null);

    return forkJoin({
      metrics: this.apollo
        .query<DashboardMetricsResponse>({
          query: GET_DASHBOARD_METRICS,
          fetchPolicy: 'network-only',
        })
        .pipe(map((result) => result.data)),
      revenue: this.apollo
        .query<RevenueDataResponse>({
          query: GET_REVENUE_DATA,
          fetchPolicy: 'network-only',
        })
        .pipe(map((result) => result.data)),
    }).pipe(
      map(({ metrics, revenue }) => {
        const totalRevenue = this.calculateTotalRevenue(revenue?.orders.nodes ?? []);
        const dashboardMetrics = this.mapToDashboardMetrics(metrics!, totalRevenue);
        this._metrics.set(dashboardMetrics);
        this._loading.set(false);
        return dashboardMetrics;
      }),
      catchError((error) => {
        this._error.set(error.message || 'Failed to load dashboard metrics');
        this._loading.set(false);
        throw error;
      })
    );
  }

  private calculateTotalRevenue(
    orders: Array<{ totalAmount: { amount: number; currency: string } }>
  ): number {
    return orders.reduce((sum, order) => sum + order.totalAmount.amount, 0);
  }

  private mapToDashboardMetrics(
    response: DashboardMetricsResponse,
    totalRevenue: number
  ): DashboardMetrics {
    const delayedShipments =
      response.shipments.totalCount -
      response.pendingShipments.totalCount -
      response.inTransitShipments.totalCount -
      response.deliveredShipments.totalCount;

    return {
      totalRevenue: { amount: totalRevenue, currency: 'USD' },
      revenueChange: 0, // Would need historical data to calculate
      monthlyRevenue: { amount: totalRevenue / 12, currency: 'USD' }, // Simplified
      revenueGrowth: 0, // Would need historical data to calculate

      totalOrders: response.orders.totalCount,
      ordersChange: 0, // Would need historical data to calculate
      pendingOrders: response.pendingOrders.totalCount,
      processingOrders: response.processingOrders.totalCount,
      completedOrders: response.completedOrders.totalCount,
      cancelledOrders: response.cancelledOrders.totalCount,

      totalProducts: response.products.totalCount,
      activeProducts: response.activeProducts.totalCount,
      lowStockProducts: 0, // Would need to add this query

      totalPayments: response.payments.totalCount,
      pendingPayments: response.pendingPayments.totalCount,
      successfulPayments: response.successfulPayments.totalCount,
      failedPayments: response.failedPayments.totalCount,

      totalShipments: response.shipments.totalCount,
      pendingShipments: response.pendingShipments.totalCount,
      shipmentsChange: 0, // Would need historical data to calculate
      inTransitShipments: response.inTransitShipments.totalCount,
      deliveredShipments: response.deliveredShipments.totalCount,
      delayedShipments: Math.max(0, delayedShipments),
    };
  }

  getRevenueData(): Observable<RevenueDataPoint[]> {
    return this.apollo
      .query<RevenueDataResponse>({
        query: GET_REVENUE_DATA,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => this.aggregateRevenueByMonth(result.data?.orders.nodes ?? [])),
        catchError(() => of([]))
      );
  }

  private aggregateRevenueByMonth(
    orders: Array<{
      id: string;
      totalAmount: { amount: number; currency: string };
      createdAt: string;
    }>
  ): RevenueDataPoint[] {
    const monthlyData = new Map<string, { revenue: number; orders: number; currency: string }>();

    for (const order of orders) {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const existing = monthlyData.get(monthKey) || {
        revenue: 0,
        orders: 0,
        currency: order.totalAmount.currency,
      };
      existing.revenue += order.totalAmount.amount;
      existing.orders += 1;
      monthlyData.set(monthKey, existing);
    }

    // Sort by date and return last 12 months
    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([date, data]) => ({
        date,
        revenue: { amount: data.revenue, currency: data.currency },
        orders: data.orders,
      }));
  }

  getOrderStatusDistribution(): Observable<OrderStatusDistribution[]> {
    return this.apollo
      .query<OrderStatusDistributionResponse>({
        query: GET_ORDER_STATUS_DISTRIBUTION,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => this.mapToOrderStatusDistribution(result.data!)),
        catchError(() => of([]))
      );
  }

  private mapToOrderStatusDistribution(
    response: OrderStatusDistributionResponse
  ): OrderStatusDistribution[] {
    const statusCounts: Array<{ status: OrderStatus; count: number }> = [
      { status: 'PENDING', count: response.pendingOrders.totalCount },
      { status: 'CONFIRMED', count: response.confirmedOrders.totalCount },
      { status: 'PROCESSING', count: response.processingOrders.totalCount },
      { status: 'SHIPPED', count: response.shippedOrders.totalCount },
      { status: 'DELIVERED', count: response.deliveredOrders.totalCount },
      { status: 'CANCELLED', count: response.cancelledOrders.totalCount },
    ];

    // Filter out statuses with zero count
    const nonZeroStatuses = statusCounts.filter((s) => s.count > 0);
    const total = nonZeroStatuses.reduce((sum, s) => sum + s.count, 0);

    return nonZeroStatuses.map((s) => ({
      status: s.status,
      count: s.count,
      percentage: total > 0 ? Math.round((s.count / total) * 1000) / 10 : 0,
    }));
  }

  getRecentOrders(): Observable<Partial<Order>[]> {
    return this.apollo
      .query<RecentOrdersResponse>({
        query: GET_RECENT_ORDERS,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) =>
          (result.data?.orders.nodes ?? []).map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            status: order.status,
            total: order.totalAmount,
            createdAt: order.createdAt,
          }))
        ),
        catchError(() => of([]))
      );
  }

  getShipmentStatusData(): Observable<ShipmentStatusData[]> {
    return this.apollo
      .query<ShipmentStatusDistributionResponse>({
        query: GET_SHIPMENT_STATUS_DISTRIBUTION,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => this.mapToShipmentStatusData(result.data!)),
        catchError(() => of([]))
      );
  }

  private mapToShipmentStatusData(
    response: ShipmentStatusDistributionResponse
  ): ShipmentStatusData[] {
    const statusData: ShipmentStatusData[] = [
      { status: 'PENDING', count: response.pendingShipments.totalCount },
      { status: 'SHIPPED', count: response.shippedShipments.totalCount },
      { status: 'IN_TRANSIT', count: response.inTransitShipments.totalCount },
      { status: 'OUT_FOR_DELIVERY', count: response.outForDeliveryShipments.totalCount },
      { status: 'DELIVERED', count: response.deliveredShipments.totalCount },
    ];

    // Filter out statuses with zero count
    return statusData.filter((s) => s.count > 0);
  }
}
