import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ShipmentsListComponent } from './shipments-list.component';
import { ShipmentService } from '../services/shipment.service';
import { Shipment, ShipmentStatus } from '../../../shared/models/shipment.model';
import { PaginatedResult } from '../../../shared/models/table.model';

describe('ShipmentsListComponent', () => {
  let component: ShipmentsListComponent;
  let fixture: ComponentFixture<ShipmentsListComponent>;
  let mockShipmentService: jasmine.SpyObj<ShipmentService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockShipment: Shipment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    orderId: '223e4567-e89b-12d3-a456-426614174001',
    trackingNumber: 'TRACK123456',
    carrier: 'FedEx',
    status: 'PENDING' as ShipmentStatus,
    originAddress: {
      street: '100 Warehouse Ave',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA',
    },
    destinationAddress: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
    },
    weight: { value: 2.5, unit: 'lb' },
    dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
    shippingCost: { amount: 15.99, currency: 'USD' },
    estimatedDeliveryDate: '2026-01-25T00:00:00Z',
    actualDeliveryDate: null,
    trackingDetails: [],
    items: [
      {
        id: 'item-001',
        productId: 'prod-001',
        productName: 'Test Product',
        quantity: 2,
      },
    ],
    itemCount: 2,
    createdAt: '2026-01-21T10:00:00Z',
    updatedAt: '2026-01-21T10:00:00Z',
    createdBy: 'admin@astro.com',
    modifiedBy: 'admin@astro.com',
  };

  const mockShipmentsResult: PaginatedResult<Shipment> = {
    items: [mockShipment],
    totalCount: 1,
    page: 0,
    pageSize: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  beforeEach(async () => {
    mockShipmentService = jasmine.createSpyObj('ShipmentService', ['getShipments'], {
      loading: signal(false),
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ShipmentsListComponent, NoopAnimationsModule],
      providers: [
        { provide: ShipmentService, useValue: mockShipmentService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  describe('initialization', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipments.and.returnValue(of(mockShipmentsResult));
      fixture = TestBed.createComponent(ShipmentsListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load shipments on init', () => {
      expect(mockShipmentService.getShipments).toHaveBeenCalled();
    });

    it('should initialize with default page settings', () => {
      expect(component.pageIndex).toBe(0);
      expect(component.pageSize).toBe(10);
    });

    it('should have no filters initially', () => {
      expect(component.searchTerm).toBe('');
      expect(component.statusFilter).toBeNull();
      expect(component.carrierFilter).toBeNull();
    });
  });

  describe('Create Shipment button', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipments.and.returnValue(of(mockShipmentsResult));
      fixture = TestBed.createComponent(ShipmentsListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should have onCreateShipment method', () => {
      expect(component.onCreateShipment).toBeDefined();
    });

    it('should navigate to create page when onCreateShipment is called', () => {
      component.onCreateShipment();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/shipments/create']);
    });
  });

  describe('row click navigation', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipments.and.returnValue(of(mockShipmentsResult));
      fixture = TestBed.createComponent(ShipmentsListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should navigate to shipment detail on row click', () => {
      component.onRowClick(mockShipment);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/shipments', mockShipment.id]);
    });
  });

  describe('filtering', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipments.and.returnValue(of(mockShipmentsResult));
      fixture = TestBed.createComponent(ShipmentsListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should reload shipments on status filter change', fakeAsync(() => {
      mockShipmentService.getShipments.calls.reset();
      component.statusFilter = 'PENDING';
      component.onStatusFilterChange();
      tick();

      expect(mockShipmentService.getShipments).toHaveBeenCalled();
      expect(component.pageIndex).toBe(0);
    }));

    it('should reload shipments on carrier filter change', fakeAsync(() => {
      mockShipmentService.getShipments.calls.reset();
      component.carrierFilter = 'FedEx';
      component.onCarrierFilterChange();
      tick();

      expect(mockShipmentService.getShipments).toHaveBeenCalled();
      expect(component.pageIndex).toBe(0);
    }));

    it('should clear all filters', fakeAsync(() => {
      component.searchTerm = 'test';
      component.statusFilter = 'PENDING';
      component.carrierFilter = 'FedEx';
      component.pageIndex = 2;

      mockShipmentService.getShipments.calls.reset();
      component.clearFilters();
      tick();

      expect(component.searchTerm).toBe('');
      expect(component.statusFilter).toBeNull();
      expect(component.carrierFilter).toBeNull();
      expect(component.pageIndex).toBe(0);
      expect(mockShipmentService.getShipments).toHaveBeenCalled();
    }));
  });

  describe('pagination', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipments.and.returnValue(of(mockShipmentsResult));
      fixture = TestBed.createComponent(ShipmentsListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should update pagination on page change', fakeAsync(() => {
      mockShipmentService.getShipments.calls.reset();
      component.onPageChange({ pageIndex: 2, pageSize: 20, length: 100 });
      tick();

      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(20);
      expect(mockShipmentService.getShipments).toHaveBeenCalled();
    }));
  });

  describe('status helpers', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipments.and.returnValue(of(mockShipmentsResult));
      fixture = TestBed.createComponent(ShipmentsListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should return correct status label', () => {
      expect(component.getStatusLabel('PENDING')).toBe('Pending');
      expect(component.getStatusLabel('IN_TRANSIT')).toBe('In Transit');
      expect(component.getStatusLabel('OUT_FOR_DELIVERY')).toBe('Out for Delivery');
      expect(component.getStatusLabel('DELIVERED')).toBe('Delivered');
    });

    it('should return correct status variant', () => {
      expect(component.getStatusVariant('DELIVERED')).toBe('success');
      expect(component.getStatusVariant('PENDING')).toBe('warning');
      expect(component.getStatusVariant('DELAYED')).toBe('warning');
      expect(component.getStatusVariant('FAILED_DELIVERY')).toBe('error');
      expect(component.getStatusVariant('RETURNED')).toBe('error');
      expect(component.getStatusVariant('SHIPPED')).toBe('info');
      expect(component.getStatusVariant('IN_TRANSIT')).toBe('info');
    });

    it('should return correct carrier icon', () => {
      expect(component.getCarrierIcon('USPS')).toBe('local_post_office');
      expect(component.getCarrierIcon('FedEx')).toBe('local_shipping');
      expect(component.getCarrierIcon('UPS')).toBe('local_shipping');
      expect(component.getCarrierIcon('Other')).toBe('inventory_2');
    });

    it('should check overdue status correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      // Not overdue if delivered
      expect(component.isOverdue(pastDate.toISOString(), 'DELIVERED')).toBeFalse();
      expect(component.isOverdue(pastDate.toISOString(), 'RETURNED')).toBeFalse();

      // Overdue if past date and not delivered
      expect(component.isOverdue(pastDate.toISOString(), 'IN_TRANSIT')).toBeTrue();

      // Not overdue if future date
      expect(component.isOverdue(futureDate.toISOString(), 'IN_TRANSIT')).toBeFalse();
    });
  });
});
