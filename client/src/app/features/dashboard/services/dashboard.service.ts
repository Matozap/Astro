import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Apollo } from 'apollo-angular';
import {
  DashboardMetrics,
  MetricCard,
  RevenueDataPoint,
  OrderStatusDistribution,
} from '../../../shared/models/dashboard.model';
import { Order, OrderStatus } from '../../../shared/models/order.model';
import { ShipmentStatus } from '../../../shared/models/shipment.model';

// Mock data for development - will be replaced with GraphQL queries
const MOCK_METRICS: DashboardMetrics = {
  totalRevenue: { amount: 284592.5, currency: 'USD' },
  revenueChange: 12.5,
  monthlyRevenue: { amount: 45800, currency: 'USD' },
  revenueGrowth: 8.3,
  totalOrders: 1284,
  ordersChange: 8.3,
  pendingOrders: 45,
  processingOrders: 52,
  completedOrders: 1150,
  cancelledOrders: 37,
  totalProducts: 456,
  activeProducts: 420,
  lowStockProducts: 23,
  pendingShipments: 42,
  shipmentsChange: -5.2,
  totalShipments: 1100,
  inTransitShipments: 89,
  deliveredShipments: 950,
  delayedShipments: 19,
  totalPayments: 1284,
  pendingPayments: 12,
  successfulPayments: 1250,
  failedPayments: 22,
};

const MOCK_REVENUE_DATA: RevenueDataPoint[] = [
  { date: '2024-01', revenue: { amount: 18500, currency: 'USD' }, orders: 98 },
  { date: '2024-02', revenue: { amount: 22300, currency: 'USD' }, orders: 112 },
  { date: '2024-03', revenue: { amount: 19800, currency: 'USD' }, orders: 105 },
  { date: '2024-04', revenue: { amount: 25600, currency: 'USD' }, orders: 134 },
  { date: '2024-05', revenue: { amount: 28900, currency: 'USD' }, orders: 148 },
  { date: '2024-06', revenue: { amount: 32400, currency: 'USD' }, orders: 165 },
  { date: '2024-07', revenue: { amount: 29800, currency: 'USD' }, orders: 152 },
  { date: '2024-08', revenue: { amount: 35200, currency: 'USD' }, orders: 178 },
  { date: '2024-09', revenue: { amount: 31500, currency: 'USD' }, orders: 162 },
  { date: '2024-10', revenue: { amount: 38700, currency: 'USD' }, orders: 195 },
  { date: '2024-11', revenue: { amount: 42100, currency: 'USD' }, orders: 212 },
  { date: '2024-12', revenue: { amount: 45800, currency: 'USD' }, orders: 231 },
];

const MOCK_ORDER_STATUS: OrderStatusDistribution[] = [
  { status: 'PENDING', count: 45, percentage: 15 },
  { status: 'CONFIRMED', count: 78, percentage: 26 },
  { status: 'PROCESSING', count: 52, percentage: 17.3 },
  { status: 'SHIPPED', count: 89, percentage: 29.7 },
  { status: 'DELIVERED', count: 36, percentage: 12 },
];

const MOCK_RECENT_ORDERS: Partial<Order>[] = [
  {
    id: 'ORD-001',
    customerName: 'John Smith',
    status: 'PENDING',
    total: { amount: 299.99, currency: 'USD' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ORD-002',
    customerName: 'Sarah Johnson',
    status: 'PROCESSING',
    total: { amount: 549.5, currency: 'USD' },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'ORD-003',
    customerName: 'Mike Wilson',
    status: 'SHIPPED',
    total: { amount: 129.0, currency: 'USD' },
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'ORD-004',
    customerName: 'Emily Brown',
    status: 'CONFIRMED',
    total: { amount: 899.99, currency: 'USD' },
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 'ORD-005',
    customerName: 'David Lee',
    status: 'DELIVERED',
    total: { amount: 199.0, currency: 'USD' },
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
];

interface ShipmentStatusData {
  status: ShipmentStatus;
  count: number;
}

const MOCK_SHIPMENT_STATUS: ShipmentStatusData[] = [
  { status: 'PENDING', count: 12 },
  { status: 'PICKED_UP', count: 8 },
  { status: 'IN_TRANSIT', count: 25 },
  { status: 'OUT_FOR_DELIVERY', count: 15 },
  { status: 'DELIVERED', count: 156 },
];

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
        change: 2.1,
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

    // Mock implementation
    return of(MOCK_METRICS).pipe(
      delay(800),
      map((metrics) => {
        this._metrics.set(metrics);
        this._loading.set(false);
        return metrics;
      })
    );
  }

  getRevenueData(): Observable<RevenueDataPoint[]> {
    return of(MOCK_REVENUE_DATA).pipe(delay(600));
  }

  getOrderStatusDistribution(): Observable<OrderStatusDistribution[]> {
    return of(MOCK_ORDER_STATUS).pipe(delay(500));
  }

  getRecentOrders(): Observable<Partial<Order>[]> {
    return of(MOCK_RECENT_ORDERS).pipe(delay(700));
  }

  getShipmentStatusData(): Observable<ShipmentStatusData[]> {
    return of(MOCK_SHIPMENT_STATUS).pipe(delay(550));
  }
}
