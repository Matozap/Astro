import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import {
  GET_DASHBOARD_METRICS,
  GET_REVENUE_DATA,
  GET_ORDER_STATUS_DISTRIBUTION,
  GET_RECENT_ORDERS,
  GET_SHIPMENT_STATUS_DISTRIBUTION,
} from '../graphql/dashboard.queries';

describe('DashboardService', () => {
  let service: DashboardService;
  let apolloController: ApolloTestingController;

  const mockDashboardMetricsResponse = {
    orders: { totalCount: 100 },
    pendingOrders: { totalCount: 10 },
    processingOrders: { totalCount: 15 },
    completedOrders: { totalCount: 60 },
    cancelledOrders: { totalCount: 5 },
    products: { totalCount: 50 },
    activeProducts: { totalCount: 45 },
    payments: { totalCount: 100 },
    pendingPayments: { totalCount: 5 },
    successfulPayments: { totalCount: 90 },
    failedPayments: { totalCount: 5 },
    shipments: { totalCount: 80 },
    pendingShipments: { totalCount: 10 },
    inTransitShipments: { totalCount: 20 },
    deliveredShipments: { totalCount: 50 },
  };

  const mockRevenueDataResponse = {
    orders: {
      nodes: [
        {
          id: '1',
          totalAmount: { amount: 1000, currency: 'USD' },
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          totalAmount: { amount: 2000, currency: 'USD' },
          createdAt: '2024-01-20T10:00:00Z',
        },
        {
          id: '3',
          totalAmount: { amount: 1500, currency: 'USD' },
          createdAt: '2024-02-10T10:00:00Z',
        },
      ],
      totalCount: 3,
    },
  };

  const mockOrderStatusDistributionResponse = {
    pendingOrders: { totalCount: 10 },
    confirmedOrders: { totalCount: 20 },
    processingOrders: { totalCount: 15 },
    shippedOrders: { totalCount: 25 },
    deliveredOrders: { totalCount: 30 },
    cancelledOrders: { totalCount: 0 },
  };

  const mockRecentOrdersResponse = {
    orders: {
      nodes: [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          status: 'PENDING',
          totalAmount: { amount: 299.99, currency: 'USD' },
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          customerName: 'Jane Smith',
          status: 'PROCESSING',
          totalAmount: { amount: 499.99, currency: 'USD' },
          createdAt: '2024-01-14T10:00:00Z',
        },
      ],
    },
  };

  const mockShipmentStatusDistributionResponse = {
    pendingShipments: { totalCount: 5 },
    shippedShipments: { totalCount: 3 },
    inTransitShipments: { totalCount: 10 },
    outForDeliveryShipments: { totalCount: 2 },
    deliveredShipments: { totalCount: 30 },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [DashboardService],
    });
    service = TestBed.inject(DashboardService);
    apolloController = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    apolloController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have loading as false initially', () => {
      expect(service.loading()).toBeFalse();
    });

    it('should have metrics as null initially', () => {
      expect(service.metrics()).toBeNull();
    });

    it('should have error as null initially', () => {
      expect(service.error()).toBeNull();
    });

    it('should have empty metric cards initially', () => {
      expect(service.metricCards()).toEqual([]);
    });
  });

  describe('loadDashboardMetrics', () => {
    it('should set loading to true when called', () => {
      service.loadDashboardMetrics().subscribe();
      expect(service.loading()).toBeTrue();

      const metricsOp = apolloController.expectOne(GET_DASHBOARD_METRICS);
      const revenueOp = apolloController.expectOne(GET_REVENUE_DATA);
      metricsOp.flush({ data: mockDashboardMetricsResponse });
      revenueOp.flush({ data: mockRevenueDataResponse });
    });

    it('should load metrics and set loading to false', fakeAsync(() => {
      service.loadDashboardMetrics().subscribe();

      const metricsOp = apolloController.expectOne(GET_DASHBOARD_METRICS);
      const revenueOp = apolloController.expectOne(GET_REVENUE_DATA);
      metricsOp.flush({ data: mockDashboardMetricsResponse });
      revenueOp.flush({ data: mockRevenueDataResponse });
      tick();

      expect(service.loading()).toBeFalse();
      expect(service.metrics()).not.toBeNull();
    }));

    it('should return metrics with totalRevenue', fakeAsync(() => {
      let result: unknown;
      service.loadDashboardMetrics().subscribe((m) => (result = m));

      const metricsOp = apolloController.expectOne(GET_DASHBOARD_METRICS);
      const revenueOp = apolloController.expectOne(GET_REVENUE_DATA);
      metricsOp.flush({ data: mockDashboardMetricsResponse });
      revenueOp.flush({ data: mockRevenueDataResponse });
      tick();

      const metrics = result as { totalRevenue: { amount: number } };
      expect(metrics.totalRevenue).toBeDefined();
      expect(metrics.totalRevenue.amount).toBe(4500); // 1000 + 2000 + 1500
    }));

    it('should compute metric cards after loading', fakeAsync(() => {
      service.loadDashboardMetrics().subscribe();

      const metricsOp = apolloController.expectOne(GET_DASHBOARD_METRICS);
      const revenueOp = apolloController.expectOne(GET_REVENUE_DATA);
      metricsOp.flush({ data: mockDashboardMetricsResponse });
      revenueOp.flush({ data: mockRevenueDataResponse });
      tick();

      const cards = service.metricCards();
      expect(cards.length).toBe(4);
      expect(cards[0].id).toBe('revenue');
      expect(cards[1].id).toBe('orders');
      expect(cards[2].id).toBe('products');
      expect(cards[3].id).toBe('shipments');
    }));

    it('should set error on failure', fakeAsync(() => {
      service.loadDashboardMetrics().subscribe({
        error: () => {
          // Expected error
        },
      });

      const metricsOp = apolloController.expectOne(GET_DASHBOARD_METRICS);
      const revenueOp = apolloController.expectOne(GET_REVENUE_DATA);
      metricsOp.networkError(new Error('Network error'));
      revenueOp.flush({ data: mockRevenueDataResponse });
      tick();

      expect(service.loading()).toBeFalse();
      expect(service.error()).not.toBeNull();
    }));
  });

  describe('getRevenueData', () => {
    it('should return revenue data points aggregated by month', fakeAsync(() => {
      let result: unknown[] = [];
      service.getRevenueData().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_REVENUE_DATA);
      op.flush({ data: mockRevenueDataResponse });
      tick();

      expect(result.length).toBe(2); // Two unique months
      const dataPoints = result as Array<{
        date: string;
        revenue: { amount: number };
        orders: number;
      }>;
      expect(dataPoints[0].date).toBe('2024-01');
      expect(dataPoints[0].revenue.amount).toBe(3000); // 1000 + 2000
      expect(dataPoints[0].orders).toBe(2);
      expect(dataPoints[1].date).toBe('2024-02');
      expect(dataPoints[1].revenue.amount).toBe(1500);
      expect(dataPoints[1].orders).toBe(1);
    }));

    it('should return empty array on error', fakeAsync(() => {
      let result: unknown[] = [];
      service.getRevenueData().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_REVENUE_DATA);
      op.networkError(new Error('Network error'));
      tick();

      expect(result).toEqual([]);
    }));
  });

  describe('getOrderStatusDistribution', () => {
    it('should return order status distribution', fakeAsync(() => {
      let result: unknown[] = [];
      service.getOrderStatusDistribution().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_ORDER_STATUS_DISTRIBUTION);
      op.flush({ data: mockOrderStatusDistributionResponse });
      tick();

      expect(result.length).toBe(5); // Only non-zero statuses
      const distribution = result as Array<{ status: string; count: number; percentage: number }>;
      expect(distribution[0].status).toBe('PENDING');
      expect(distribution[0].count).toBe(10);
    }));

    it('should filter out zero count statuses', fakeAsync(() => {
      let result: unknown[] = [];
      service.getOrderStatusDistribution().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_ORDER_STATUS_DISTRIBUTION);
      op.flush({ data: mockOrderStatusDistributionResponse });
      tick();

      const distribution = result as Array<{ status: string }>;
      const statuses = distribution.map((d) => d.status);
      expect(statuses).not.toContain('CANCELLED');
    }));

    it('should calculate correct percentages', fakeAsync(() => {
      let result: unknown[] = [];
      service.getOrderStatusDistribution().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_ORDER_STATUS_DISTRIBUTION);
      op.flush({ data: mockOrderStatusDistributionResponse });
      tick();

      const distribution = result as Array<{ percentage: number }>;
      const totalPercentage = distribution.reduce((sum, d) => sum + d.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 0);
    }));

    it('should return empty array on error', fakeAsync(() => {
      let result: unknown[] = [];
      service.getOrderStatusDistribution().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_ORDER_STATUS_DISTRIBUTION);
      op.networkError(new Error('Network error'));
      tick();

      expect(result).toEqual([]);
    }));
  });

  describe('getRecentOrders', () => {
    it('should return recent orders', fakeAsync(() => {
      let result: unknown[] = [];
      service.getRecentOrders().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_RECENT_ORDERS);
      op.flush({ data: mockRecentOrdersResponse });
      tick();

      expect(result.length).toBe(2);
      const orders = result as Array<{ id: string; customerName: string; status: string }>;
      expect(orders[0].id).toBe('order-1');
      expect(orders[0].customerName).toBe('John Doe');
      expect(orders[0].status).toBe('PENDING');
    }));

    it('should map order fields correctly', fakeAsync(() => {
      let result: unknown[] = [];
      service.getRecentOrders().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_RECENT_ORDERS);
      op.flush({ data: mockRecentOrdersResponse });
      tick();

      const orders = result as Array<{
        id: string;
        orderNumber: string;
        total: { amount: number };
        createdAt: string;
      }>;
      expect(orders[0].orderNumber).toBe('ORD-001');
      expect(orders[0].total.amount).toBe(299.99);
      expect(orders[0].createdAt).toBe('2024-01-15T10:00:00Z');
    }));

    it('should return empty array on error', fakeAsync(() => {
      let result: unknown[] = [];
      service.getRecentOrders().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_RECENT_ORDERS);
      op.networkError(new Error('Network error'));
      tick();

      expect(result).toEqual([]);
    }));
  });

  describe('getShipmentStatusData', () => {
    it('should return shipment status data', fakeAsync(() => {
      let result: unknown[] = [];
      service.getShipmentStatusData().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_SHIPMENT_STATUS_DISTRIBUTION);
      op.flush({ data: mockShipmentStatusDistributionResponse });
      tick();

      expect(result.length).toBe(5);
      const statusData = result as Array<{ status: string; count: number }>;
      expect(statusData[0].status).toBe('PENDING');
      expect(statusData[0].count).toBe(5);
    }));

    it('should filter out zero count statuses', fakeAsync(() => {
      const responseWithZeros = {
        pendingShipments: { totalCount: 5 },
        shippedShipments: { totalCount: 0 },
        inTransitShipments: { totalCount: 10 },
        outForDeliveryShipments: { totalCount: 0 },
        deliveredShipments: { totalCount: 30 },
      };

      let result: unknown[] = [];
      service.getShipmentStatusData().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_SHIPMENT_STATUS_DISTRIBUTION);
      op.flush({ data: responseWithZeros });
      tick();

      expect(result.length).toBe(3);
      const statusData = result as Array<{ status: string }>;
      const statuses = statusData.map((d) => d.status);
      expect(statuses).not.toContain('SHIPPED');
      expect(statuses).not.toContain('OUT_FOR_DELIVERY');
    }));

    it('should return empty array on error', fakeAsync(() => {
      let result: unknown[] = [];
      service.getShipmentStatusData().subscribe((data) => (result = data));

      const op = apolloController.expectOne(GET_SHIPMENT_STATUS_DISTRIBUTION);
      op.networkError(new Error('Network error'));
      tick();

      expect(result).toEqual([]);
    }));
  });

  describe('metricCards computed signal', () => {
    it('should return correct revenue card', fakeAsync(() => {
      service.loadDashboardMetrics().subscribe();

      const metricsOp = apolloController.expectOne(GET_DASHBOARD_METRICS);
      const revenueOp = apolloController.expectOne(GET_REVENUE_DATA);
      metricsOp.flush({ data: mockDashboardMetricsResponse });
      revenueOp.flush({ data: mockRevenueDataResponse });
      tick();

      const cards = service.metricCards();
      const revenueCard = cards.find((c) => c.id === 'revenue');
      expect(revenueCard).toBeDefined();
      expect(revenueCard!.title).toBe('Total Revenue');
      expect(revenueCard!.icon).toBe('attach_money');
      expect(revenueCard!.variant).toBe('primary');
    }));

    it('should return correct orders card', fakeAsync(() => {
      service.loadDashboardMetrics().subscribe();

      const metricsOp = apolloController.expectOne(GET_DASHBOARD_METRICS);
      const revenueOp = apolloController.expectOne(GET_REVENUE_DATA);
      metricsOp.flush({ data: mockDashboardMetricsResponse });
      revenueOp.flush({ data: mockRevenueDataResponse });
      tick();

      const cards = service.metricCards();
      const ordersCard = cards.find((c) => c.id === 'orders');
      expect(ordersCard).toBeDefined();
      expect(ordersCard!.title).toBe('Total Orders');
      expect(ordersCard!.value).toBe('100');
    }));

    it('should return correct products card', fakeAsync(() => {
      service.loadDashboardMetrics().subscribe();

      const metricsOp = apolloController.expectOne(GET_DASHBOARD_METRICS);
      const revenueOp = apolloController.expectOne(GET_REVENUE_DATA);
      metricsOp.flush({ data: mockDashboardMetricsResponse });
      revenueOp.flush({ data: mockRevenueDataResponse });
      tick();

      const cards = service.metricCards();
      const productsCard = cards.find((c) => c.id === 'products');
      expect(productsCard).toBeDefined();
      expect(productsCard!.title).toBe('Active Products');
      expect(productsCard!.value).toBe('45');
    }));

    it('should return correct shipments card', fakeAsync(() => {
      service.loadDashboardMetrics().subscribe();

      const metricsOp = apolloController.expectOne(GET_DASHBOARD_METRICS);
      const revenueOp = apolloController.expectOne(GET_REVENUE_DATA);
      metricsOp.flush({ data: mockDashboardMetricsResponse });
      revenueOp.flush({ data: mockRevenueDataResponse });
      tick();

      const cards = service.metricCards();
      const shipmentsCard = cards.find((c) => c.id === 'shipments');
      expect(shipmentsCard).toBeDefined();
      expect(shipmentsCard!.title).toBe('Pending Shipments');
      expect(shipmentsCard!.value).toBe('10');
    }));
  });
});
