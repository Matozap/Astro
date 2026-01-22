import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError, delay } from 'rxjs';
import { ShipmentDetailComponent } from './shipment-detail.component';
import { ShipmentService } from '../services/shipment.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  Shipment,
  ShipmentStatus,
  StatusUpdateDialogResult,
  ShipmentEditDialogResult,
} from '../../../shared/models/shipment.model';

describe('ShipmentDetailComponent', () => {
  let component: ShipmentDetailComponent;
  let fixture: ComponentFixture<ShipmentDetailComponent>;
  let mockShipmentService: jasmine.SpyObj<ShipmentService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockShipment: Shipment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    orderId: '223e4567-e89b-12d3-a456-426614174001',
    trackingNumber: 'TRACK123456',
    carrier: 'FedEx',
    status: 'Pending' as ShipmentStatus,
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

  const mockDeliveredShipment: Shipment = {
    ...mockShipment,
    status: 'Delivered' as ShipmentStatus,
    actualDeliveryDate: '2026-01-24T14:30:00Z',
  };

  beforeEach(async () => {
    mockShipmentService = jasmine.createSpyObj('ShipmentService', [
      'getShipmentById',
      'updateShipment',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [ShipmentDetailComponent, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: mockShipment.id }),
            },
          },
        },
        { provide: ShipmentService, useValue: mockShipmentService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();
  });

  describe('initialization', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load shipment on init', () => {
      expect(mockShipmentService.getShipmentById).toHaveBeenCalledWith(mockShipment.id);
      expect(component.shipment()).toEqual(mockShipment);
    });

    it('should not be loading after shipment is loaded', () => {
      expect(component.loading()).toBeFalse();
    });
  });

  describe('navigation', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should navigate back to shipments list', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/shipments']);
    });
  });

  describe('status helpers', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should return correct status label', () => {
      expect(component.getStatusLabel('Pending')).toBe('Pending');
      expect(component.getStatusLabel('InTransit')).toBe('In Transit');
      expect(component.getStatusLabel('OutForDelivery')).toBe('Out for Delivery');
    });

    it('should return correct status variant', () => {
      expect(component.getStatusVariant('Delivered')).toBe('success');
      expect(component.getStatusVariant('Pending')).toBe('warning');
      expect(component.getStatusVariant('Failed')).toBe('error');
      expect(component.getStatusVariant('InTransit')).toBe('info');
    });
  });

  describe('canUpdateStatus', () => {
    it('should return true for non-terminal status', fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.canUpdateStatus()).toBeTrue();
    }));

    it('should return false for Delivered status', fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockDeliveredShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.canUpdateStatus()).toBeFalse();
    }));

    it('should return false for Returned status', fakeAsync(() => {
      const returnedShipment = { ...mockShipment, status: 'Returned' as ShipmentStatus };
      mockShipmentService.getShipmentById.and.returnValue(of(returnedShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.canUpdateStatus()).toBeFalse();
    }));

    it('should return false when no shipment is loaded', fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(null as unknown as Shipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.canUpdateStatus()).toBeFalse();
    }));
  });

  describe('getAvailableStatuses', () => {
    it('should return available transitions for Pending status', fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      const statuses = component.getAvailableStatuses();
      expect(statuses).toContain('Shipped');
    }));

    it('should return empty array for terminal status', fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockDeliveredShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      const statuses = component.getAvailableStatuses();
      expect(statuses.length).toBe(0);
    }));
  });

  describe('openStatusDialog', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should open dialog with correct data', () => {
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      } as MatDialogRef<unknown>;
      mockDialog.open.and.returnValue(mockDialogRef);

      component.openStatusDialog('Shipped');

      expect(mockDialog.open).toHaveBeenCalled();
      const dialogCall = mockDialog.open.calls.mostRecent();
      expect(dialogCall.args[1]?.data).toEqual({
        shipment: mockShipment,
        newStatus: 'Shipped',
      });
    });

    it('should call updateStatus when dialog returns result', fakeAsync(() => {
      const dialogResult: StatusUpdateDialogResult = {
        status: 'Shipped',
        location: 'Chicago, IL',
        notes: 'Package picked up',
      };

      const mockDialogRef = {
        afterClosed: () => of(dialogResult),
      } as MatDialogRef<unknown>;
      mockDialog.open.and.returnValue(mockDialogRef);

      const updatedShipment = { ...mockShipment, status: 'Shipped' as ShipmentStatus };
      mockShipmentService.updateShipment.and.returnValue(of(updatedShipment));

      component.openStatusDialog('Shipped');
      tick();

      expect(mockShipmentService.updateShipment).toHaveBeenCalled();
    }));

    it('should not call updateStatus when dialog is cancelled', fakeAsync(() => {
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      } as MatDialogRef<unknown>;
      mockDialog.open.and.returnValue(mockDialogRef);

      component.openStatusDialog('Shipped');
      tick();

      expect(mockShipmentService.updateShipment).not.toHaveBeenCalled();
    }));
  });

  describe('updateStatus', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should update shipment status successfully', fakeAsync(() => {
      const dialogResult: StatusUpdateDialogResult = {
        status: 'Shipped',
        location: 'Chicago, IL',
        notes: 'Package picked up',
      };

      const updatedShipment: Shipment = {
        ...mockShipment,
        status: 'Shipped',
        trackingDetails: [
          {
            id: 'td-001',
            timestamp: '2026-01-21T12:00:00Z',
            location: 'Chicago, IL',
            status: 'Shipped',
            notes: 'Package picked up',
          },
        ],
      };
      mockShipmentService.updateShipment.and.returnValue(of(updatedShipment));

      component.updateStatus(dialogResult);
      tick();

      expect(mockShipmentService.updateShipment).toHaveBeenCalledWith({
        id: mockShipment.id,
        status: 'Shipped',
        statusLocation: 'Chicago, IL',
        statusNotes: 'Package picked up',
        modifiedBy: 'current-user@astro.com',
      });
      expect(component.shipment()).toEqual(updatedShipment);
      expect(mockNotificationService.success).toHaveBeenCalledWith('Status updated to Shipped');
      expect(component.updating()).toBeFalse();
    }));

    it('should handle GraphQL errors', fakeAsync(() => {
      const dialogResult: StatusUpdateDialogResult = {
        status: 'Shipped',
      };

      const graphQLError = {
        graphQLErrors: [{ message: 'Invalid status transition' }],
      };
      mockShipmentService.updateShipment.and.returnValue(throwError(() => graphQLError));

      component.updateStatus(dialogResult);
      tick();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Invalid status transition');
      expect(component.updating()).toBeFalse();
    }));

    it('should handle generic errors', fakeAsync(() => {
      const dialogResult: StatusUpdateDialogResult = {
        status: 'Shipped',
      };

      const genericError = new Error('Network error');
      mockShipmentService.updateShipment.and.returnValue(throwError(() => genericError));

      component.updateStatus(dialogResult);
      tick();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Network error');
      expect(component.updating()).toBeFalse();
    }));

    it('should set updating state while updating', fakeAsync(() => {
      const dialogResult: StatusUpdateDialogResult = {
        status: 'Shipped',
      };

      const updatedShipment = { ...mockShipment, status: 'Shipped' as ShipmentStatus };
      // Use delay to make the observable async so we can check the updating state
      mockShipmentService.updateShipment.and.returnValue(of(updatedShipment).pipe(delay(100)));

      component.updateStatus(dialogResult);

      // Should be updating immediately after call
      expect(component.updating()).toBeTrue();

      tick(100);

      // Should not be updating after completion
      expect(component.updating()).toBeFalse();
    }));
  });

  describe('overdue check', () => {
    it('should return false for delivered shipment', fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockDeliveredShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.isOverdue()).toBeFalse();
    }));

    it('should return true for past due non-delivered shipment', fakeAsync(() => {
      const pastDueShipment = {
        ...mockShipment,
        estimatedDeliveryDate: '2020-01-01T00:00:00Z',
      };
      mockShipmentService.getShipmentById.and.returnValue(of(pastDueShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.isOverdue()).toBeTrue();
    }));

    it('should return false for future delivery date', fakeAsync(() => {
      const futureShipment = {
        ...mockShipment,
        estimatedDeliveryDate: '2030-01-01T00:00:00Z',
      };
      mockShipmentService.getShipmentById.and.returnValue(of(futureShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.isOverdue()).toBeFalse();
    }));
  });

  // User Story 3 - Edit functionality tests
  describe('canEditShipment', () => {
    it('should return true for Pending status', fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.canEditShipment()).toBeTrue();
    }));

    it('should return false for Shipped status', fakeAsync(() => {
      const shippedShipment = { ...mockShipment, status: 'Shipped' as ShipmentStatus };
      mockShipmentService.getShipmentById.and.returnValue(of(shippedShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.canEditShipment()).toBeFalse();
    }));

    it('should return false for Delivered status', fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockDeliveredShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.canEditShipment()).toBeFalse();
    }));

    it('should return false when no shipment is loaded', fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(null as unknown as Shipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.canEditShipment()).toBeFalse();
    }));
  });

  describe('openEditDialog', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should open edit dialog with correct data', () => {
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      } as MatDialogRef<unknown>;
      mockDialog.open.and.returnValue(mockDialogRef);

      component.openEditDialog();

      expect(mockDialog.open).toHaveBeenCalled();
      const dialogCall = mockDialog.open.calls.mostRecent();
      expect(dialogCall.args[1]?.data).toEqual({
        shipment: mockShipment,
      });
    });

    it('should call saveEditChanges when dialog returns result', fakeAsync(() => {
      const dialogResult: ShipmentEditDialogResult = {
        carrier: 'UPS',
        trackingNumber: 'UPS123456789',
      };

      const mockDialogRef = {
        afterClosed: () => of(dialogResult),
      } as MatDialogRef<unknown>;
      mockDialog.open.and.returnValue(mockDialogRef);

      const updatedShipment = {
        ...mockShipment,
        carrier: 'UPS',
        trackingNumber: 'UPS123456789',
      };
      mockShipmentService.updateShipment.and.returnValue(of(updatedShipment));

      component.openEditDialog();
      tick();

      expect(mockShipmentService.updateShipment).toHaveBeenCalled();
    }));

    it('should not call saveEditChanges when dialog is cancelled', fakeAsync(() => {
      const mockDialogRef = {
        afterClosed: () => of(undefined),
      } as MatDialogRef<unknown>;
      mockDialog.open.and.returnValue(mockDialogRef);

      component.openEditDialog();
      tick();

      expect(mockShipmentService.updateShipment).not.toHaveBeenCalled();
    }));
  });

  describe('saveEditChanges', () => {
    beforeEach(fakeAsync(() => {
      mockShipmentService.getShipmentById.and.returnValue(of(mockShipment));
      fixture = TestBed.createComponent(ShipmentDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should update shipment details successfully', fakeAsync(() => {
      const editResult: ShipmentEditDialogResult = {
        carrier: 'UPS',
        trackingNumber: 'UPS123456789',
      };

      const updatedShipment: Shipment = {
        ...mockShipment,
        carrier: 'UPS',
        trackingNumber: 'UPS123456789',
        updatedAt: '2026-01-21T15:00:00Z',
      };
      mockShipmentService.updateShipment.and.returnValue(of(updatedShipment));

      component.saveEditChanges(editResult);
      tick();

      expect(mockShipmentService.updateShipment).toHaveBeenCalledWith({
        id: mockShipment.id,
        carrier: 'UPS',
        trackingNumber: 'UPS123456789',
        modifiedBy: 'current-user@astro.com',
      });
      expect(component.shipment()).toEqual(updatedShipment);
      expect(mockNotificationService.success).toHaveBeenCalledWith(
        'Shipment details updated successfully'
      );
      expect(component.updating()).toBeFalse();
    }));

    it('should handle GraphQL errors', fakeAsync(() => {
      const editResult: ShipmentEditDialogResult = {
        carrier: 'UPS',
      };

      const graphQLError = {
        graphQLErrors: [{ message: 'Cannot update non-pending shipment' }],
      };
      mockShipmentService.updateShipment.and.returnValue(throwError(() => graphQLError));

      component.saveEditChanges(editResult);
      tick();

      expect(mockNotificationService.error).toHaveBeenCalledWith(
        'Cannot update non-pending shipment'
      );
      expect(component.updating()).toBeFalse();
    }));

    it('should handle generic errors', fakeAsync(() => {
      const editResult: ShipmentEditDialogResult = {
        carrier: 'UPS',
      };

      const genericError = new Error('Network error');
      mockShipmentService.updateShipment.and.returnValue(throwError(() => genericError));

      component.saveEditChanges(editResult);
      tick();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Network error');
      expect(component.updating()).toBeFalse();
    }));

    it('should set updating state while saving', fakeAsync(() => {
      const editResult: ShipmentEditDialogResult = {
        carrier: 'UPS',
      };

      const updatedShipment = { ...mockShipment, carrier: 'UPS' };
      // Use delay to make the observable async so we can check the updating state
      mockShipmentService.updateShipment.and.returnValue(of(updatedShipment).pipe(delay(100)));

      component.saveEditChanges(editResult);

      // Should be updating immediately after call
      expect(component.updating()).toBeTrue();

      tick(100);

      // Should not be updating after completion
      expect(component.updating()).toBeFalse();
    }));
  });
});
