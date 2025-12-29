import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { ApolloTestingModule } from 'apollo-angular/testing';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [DashboardService],
    });
    service = TestBed.inject(DashboardService);
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
    });

    it('should load metrics and set loading to false', fakeAsync(() => {
      service.loadDashboardMetrics().subscribe();
      tick(1000);

      expect(service.loading()).toBeFalse();
      expect(service.metrics()).not.toBeNull();
    }));

    it('should return metrics with totalRevenue', fakeAsync(() => {
      let result: any;
      service.loadDashboardMetrics().subscribe((m) => (result = m));
      tick(1000);

      expect(result.totalRevenue).toBeDefined();
      expect(result.totalRevenue.amount).toBeGreaterThan(0);
    }));

    it('should compute metric cards after loading', fakeAsync(() => {
      service.loadDashboardMetrics().subscribe();
      tick(1000);

      const cards = service.metricCards();
      expect(cards.length).toBe(4);
      expect(cards[0].id).toBe('revenue');
      expect(cards[1].id).toBe('orders');
      expect(cards[2].id).toBe('products');
      expect(cards[3].id).toBe('shipments');
    }));
  });

  describe('getRevenueData', () => {
    it('should return revenue data points', fakeAsync(() => {
      let result: any[];
      service.getRevenueData().subscribe((data) => (result = data));
      tick(1000);

      expect(result!.length).toBeGreaterThan(0);
      expect(result![0].date).toBeDefined();
      expect(result![0].revenue).toBeDefined();
      expect(result![0].orders).toBeDefined();
    }));
  });

  describe('getOrderStatusDistribution', () => {
    it('should return order status distribution', fakeAsync(() => {
      let result: any[];
      service.getOrderStatusDistribution().subscribe((data) => (result = data));
      tick(1000);

      expect(result!.length).toBeGreaterThan(0);
      expect(result![0].status).toBeDefined();
      expect(result![0].count).toBeDefined();
      expect(result![0].percentage).toBeDefined();
    }));
  });

  describe('getRecentOrders', () => {
    it('should return recent orders', fakeAsync(() => {
      let result: any[];
      service.getRecentOrders().subscribe((data) => (result = data));
      tick(1000);

      expect(result!.length).toBeGreaterThan(0);
      expect(result![0].id).toBeDefined();
      expect(result![0].customerName).toBeDefined();
      expect(result![0].status).toBeDefined();
    }));
  });

  describe('getShipmentStatusData', () => {
    it('should return shipment status data', fakeAsync(() => {
      let result: any[];
      service.getShipmentStatusData().subscribe((data) => (result = data));
      tick(1000);

      expect(result!.length).toBeGreaterThan(0);
      expect(result![0].status).toBeDefined();
      expect(result![0].count).toBeDefined();
    }));
  });
});
