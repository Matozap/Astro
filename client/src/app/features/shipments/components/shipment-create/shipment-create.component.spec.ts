import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, Subject } from 'rxjs';
import { ShipmentCreateComponent } from './shipment-create.component';
import { ShipmentService } from '../../services/shipment.service';
import { OrderService } from '../../../orders/services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Shipment, ShipmentStatus } from '../../../../shared/models/shipment.model';
import { Order, OrderDetail } from '../../../../shared/models/order.model';
import { PaginatedResult } from '../../../../shared/models/table.model';

describe('ShipmentCreateComponent', () => {
  let component: ShipmentCreateComponent;
  let fixture: ComponentFixture<ShipmentCreateComponent>;
  let mockShipmentService: jasmine.SpyObj<ShipmentService>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockOrderDetail: OrderDetail = {
    id: 'detail-001',
    productId: 'prod-001',
    productName: 'Test Product',
    productSku: 'SKU-001',
    quantity: 5,
    unitPrice: { amount: 29.99, currency: 'USD' },
    lineTotal: { amount: 149.95, currency: 'USD' },
  };

  const mockOrder: Order = {
    id: '223e4567-e89b-12d3-a456-426614174001',
    orderNumber: 'ORD-2026-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    shippingAddress: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
    },
    status: 'PENDING',
    totalAmount: {
      amount: 299.99,
      currency: 'USD',
    },
    notes: null,
    details: [mockOrderDetail],
    itemCount: 1,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
    createdBy: 'admin@astro.com',
    modifiedBy: '',
  };

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

  const mockOrdersResult: PaginatedResult<Order> = {
    items: [mockOrder],
    totalCount: 1,
    page: 0,
    pageSize: 100,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  beforeEach(async () => {
    mockShipmentService = jasmine.createSpyObj('ShipmentService', ['createShipment']);
    mockOrderService = jasmine.createSpyObj('OrderService', ['getOrders']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ShipmentCreateComponent, NoopAnimationsModule],
      providers: [
        { provide: ShipmentService, useValue: mockShipmentService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  describe('initialization', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(ShipmentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load orders on init', () => {
      expect(mockOrderService.getOrders).toHaveBeenCalled();
    });

    it('should have form initialized with default values', () => {
      expect(component.shipmentForm.get('carrier')?.value).toBe('');
      expect(component.shipmentForm.get('weightUnit')?.value).toBe('POUNDS');
      expect(component.shipmentForm.get('dimensionUnit')?.value).toBe('INCHES');
      expect(component.shipmentForm.get('currency')?.value).toBe('USD');
      expect(component.shipmentForm.get('originCountry')?.value).toBe('USA');
      expect(component.shipmentForm.get('destinationCountry')?.value).toBe('USA');
    });

    it('should not be submitting initially', () => {
      expect(component.isSubmitting()).toBeFalse();
    });

    it('should have no selected order initially', () => {
      expect(component.selectedOrder()).toBeNull();
    });

    it('should have no selected items initially', () => {
      expect(component.selectedItems().length).toBe(0);
    });
  });

  describe('form validation', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(ShipmentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should require carrier', () => {
      const control = component.shipmentForm.get('carrier');
      control?.setValue('');
      expect(control?.valid).toBeFalse();
      expect(control?.hasError('required')).toBeTrue();
    });

    it('should require origin address fields', () => {
      const fields = ['originStreet', 'originCity', 'originState', 'originPostalCode', 'originCountry'];
      fields.forEach((field) => {
        const control = component.shipmentForm.get(field);
        control?.setValue('');
        expect(control?.valid).withContext(`${field} should be invalid when empty`).toBeFalse();
        expect(control?.hasError('required')).withContext(`${field} should have required error`).toBeTrue();
      });
    });

    it('should require destination address fields', () => {
      const fields = ['destinationStreet', 'destinationCity', 'destinationState', 'destinationPostalCode', 'destinationCountry'];
      fields.forEach((field) => {
        const control = component.shipmentForm.get(field);
        control?.setValue('');
        expect(control?.valid).withContext(`${field} should be invalid when empty`).toBeFalse();
        expect(control?.hasError('required')).withContext(`${field} should have required error`).toBeTrue();
      });
    });

    it('should require weight to be non-negative', () => {
      const control = component.shipmentForm.get('weight');
      control?.setValue(-1);
      expect(control?.valid).toBeFalse();
      expect(control?.hasError('min')).toBeTrue();

      control?.setValue(0);
      expect(control?.valid).toBeTrue();

      control?.setValue(0.1);
      expect(control?.valid).toBeTrue();
    });

    it('should require dimensions to be positive', () => {
      const dimensionFields = ['length', 'width', 'height'];
      dimensionFields.forEach((field) => {
        const control = component.shipmentForm.get(field);
        control?.setValue(-1);
        expect(control?.valid).withContext(`${field} should be invalid when negative`).toBeFalse();
        expect(control?.hasError('min')).withContext(`${field} should have min error`).toBeTrue();
      });
    });

    it('should require shipping cost to be positive', () => {
      const control = component.shipmentForm.get('shippingCost');
      control?.setValue(-1);
      expect(control?.valid).toBeFalse();
      expect(control?.hasError('min')).toBeTrue();

      control?.setValue(0.01);
      expect(control?.valid).toBeTrue();
    });

    it('should validate tracking number length', () => {
      const control = component.shipmentForm.get('trackingNumber');

      // Too short
      control?.setValue('abc');
      expect(control?.valid).toBeFalse();
      expect(control?.hasError('minlength')).toBeTrue();

      // Valid length
      control?.setValue('TRACK12345');
      expect(control?.valid).toBeTrue();
    });
  });

  describe('order selection', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(ShipmentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should set selected order when order is selected', () => {
      component.onOrderSelected(mockOrder);
      expect(component.selectedOrder()).toEqual(mockOrder);
    });

    it('should clear selected items when order changes', () => {
      component.selectedItems.set([
        {
          orderDetailId: 'old-detail',
          productId: 'old-prod',
          productName: 'Old Product',
          productSku: 'OLD-SKU',
          quantity: 1,
        },
      ]);

      component.onOrderSelected(mockOrder);
      expect(component.selectedItems().length).toBe(0);
    });

    it('should auto-populate destination address from order shipping address', () => {
      component.onOrderSelected(mockOrder);

      expect(component.shipmentForm.get('destinationStreet')?.value).toBe('123 Main St');
      expect(component.shipmentForm.get('destinationCity')?.value).toBe('Springfield');
      expect(component.shipmentForm.get('destinationState')?.value).toBe('IL');
      expect(component.shipmentForm.get('destinationPostalCode')?.value).toBe('62701');
      expect(component.shipmentForm.get('destinationCountry')?.value).toBe('USA');
    });

    it('should display order correctly', () => {
      expect(component.displayOrder(mockOrder)).toBe('ORD-2026-001 - John Doe');
      expect(component.displayOrder(null)).toBe('');
      expect(component.displayOrder('')).toBe('');
    });

    it('should return order details from selected order', () => {
      component.onOrderSelected(mockOrder);
      expect(component.getOrderDetails()).toEqual(mockOrder.details);
    });
  });

  describe('item management', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(ShipmentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      component.onOrderSelected(mockOrder);
    }));

    it('should add item to selection', () => {
      component.addItem(mockOrderDetail);

      const selectedItems = component.selectedItems();
      expect(selectedItems.length).toBe(1);
      expect(selectedItems[0].orderDetailId).toBe(mockOrderDetail.id);
      expect(selectedItems[0].productName).toBe('Test Product');
      expect(selectedItems[0].quantity).toBe(1);
    });

    it('should increment quantity when adding same item', () => {
      component.addItem(mockOrderDetail);
      component.addItem(mockOrderDetail);

      const selectedItems = component.selectedItems();
      expect(selectedItems.length).toBe(1);
      expect(selectedItems[0].quantity).toBe(2);
    });

    it('should not exceed available quantity', () => {
      // Add item up to max quantity
      for (let i = 0; i < mockOrderDetail.quantity + 2; i++) {
        component.addItem(mockOrderDetail);
      }

      const selectedItems = component.selectedItems();
      expect(selectedItems[0].quantity).toBe(mockOrderDetail.quantity);
    });

    it('should decrement item quantity', () => {
      component.addItem(mockOrderDetail);
      component.addItem(mockOrderDetail);
      component.decrementItem(mockOrderDetail);

      expect(component.selectedItems()[0].quantity).toBe(1);
    });

    it('should remove item when decrementing to zero', () => {
      component.addItem(mockOrderDetail);
      component.decrementItem(mockOrderDetail);

      expect(component.selectedItems().length).toBe(0);
    });

    it('should remove item by id', () => {
      component.addItem(mockOrderDetail);
      component.removeItem(mockOrderDetail.id);

      expect(component.selectedItems().length).toBe(0);
    });

    it('should add all items from order', () => {
      component.addAllItems();

      const selectedItems = component.selectedItems();
      expect(selectedItems.length).toBe(1);
      expect(selectedItems[0].quantity).toBe(mockOrderDetail.quantity);
    });

    it('should clear all items', () => {
      component.addAllItems();
      component.clearAllItems();

      expect(component.selectedItems().length).toBe(0);
    });

    it('should check if item is selected', () => {
      expect(component.isItemSelected(mockOrderDetail)).toBeFalse();

      component.addItem(mockOrderDetail);
      expect(component.isItemSelected(mockOrderDetail)).toBeTrue();
    });

    it('should get item quantity', () => {
      expect(component.getItemQuantity(mockOrderDetail)).toBe(0);

      component.addItem(mockOrderDetail);
      expect(component.getItemQuantity(mockOrderDetail)).toBe(1);

      component.addItem(mockOrderDetail);
      expect(component.getItemQuantity(mockOrderDetail)).toBe(2);
    });
  });

  describe('submission success', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      mockShipmentService.createShipment.and.returnValue(of(mockShipment));

      fixture = TestBed.createComponent(ShipmentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      // Set up valid form and selection
      component.onOrderSelected(mockOrder);
      component.addItem(mockOrderDetail);
      component.shipmentForm.patchValue({
        carrier: 'FedEx',
        trackingNumber: 'TRACK123456',
        originStreet: '100 Warehouse Ave',
        originCity: 'Chicago',
        originState: 'IL',
        originPostalCode: '60601',
        originCountry: 'USA',
        weight: 2.5,
        weightUnit: 'POUNDS',
        length: 10,
        width: 8,
        height: 6,
        dimensionUnit: 'INCHES',
        shippingCost: 15.99,
        currency: 'USD',
      });
    }));

    it('should create shipment successfully', fakeAsync(() => {
      component.onSubmit();
      tick();

      expect(mockShipmentService.createShipment).toHaveBeenCalled();
      expect(mockNotificationService.success).toHaveBeenCalledWith('Shipment created successfully');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/shipments', mockShipment.id]);
    }));

    it('should include all form data in create input', fakeAsync(() => {
      component.onSubmit();
      tick();

      const createCall = mockShipmentService.createShipment.calls.mostRecent();
      const input = createCall.args[0];

      expect(input.orderId).toBe(mockOrder.id);
      expect(input.carrier).toBe('FedEx');
      expect(input.trackingNumber).toBe('TRACK123456');
      expect(input.originStreet).toBe('100 Warehouse Ave');
      expect(input.originCity).toBe('Chicago');
      expect(input.destinationStreet).toBe('123 Main St');
      expect(input.weight).toBe(2.5);
      expect(input.weightUnit).toBe('POUNDS');
      expect(input.items.length).toBe(1);
    }));

    it('should show loading state while submitting', fakeAsync(() => {
      const shipmentSubject = new Subject<Shipment>();
      mockShipmentService.createShipment.and.returnValue(shipmentSubject.asObservable());

      component.onSubmit();

      expect(component.isSubmitting()).toBeTrue();

      shipmentSubject.next(mockShipment);
      shipmentSubject.complete();
      tick();

      expect(component.isSubmitting()).toBeFalse();
    }));
  });

  describe('submission error', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));

      fixture = TestBed.createComponent(ShipmentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      // Set up valid form and selection
      component.onOrderSelected(mockOrder);
      component.addItem(mockOrderDetail);
      component.shipmentForm.patchValue({
        carrier: 'FedEx',
        originStreet: '100 Warehouse Ave',
        originCity: 'Chicago',
        originState: 'IL',
        originPostalCode: '60601',
        originCountry: 'USA',
        weight: 2.5,
        weightUnit: 'POUNDS',
        length: 10,
        width: 8,
        height: 6,
        dimensionUnit: 'INCHES',
        shippingCost: 15.99,
      });
    }));

    it('should handle GraphQL errors', fakeAsync(() => {
      const graphQLError = {
        graphQLErrors: [{ message: 'Order not found' }],
      };
      mockShipmentService.createShipment.and.returnValue(throwError(() => graphQLError));

      component.onSubmit();
      tick();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Order not found');
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should handle validation errors', fakeAsync(() => {
      const validationError = {
        graphQLErrors: [
          {
            message: 'Validation error',
            extensions: {
              validationErrors: [
                { propertyName: 'Items', errorMessage: 'At least one item is required' },
              ],
            },
          },
        ],
      };
      mockShipmentService.createShipment.and.returnValue(throwError(() => validationError));

      component.onSubmit();
      tick();

      expect(mockNotificationService.error).toHaveBeenCalledWith('At least one item is required');
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should handle generic errors', fakeAsync(() => {
      const genericError = new Error('Network error');
      mockShipmentService.createShipment.and.returnValue(throwError(() => genericError));

      component.onSubmit();
      tick();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Network error');
      expect(component.isSubmitting()).toBeFalse();
    }));

    it('should not submit without selected order', fakeAsync(() => {
      component['selectedOrder'].set(null);
      component.onSubmit();
      tick();

      expect(mockShipmentService.createShipment).not.toHaveBeenCalled();
      expect(mockNotificationService.error).toHaveBeenCalledWith('Please select an order');
    }));

    it('should not submit without selected items', fakeAsync(() => {
      component.clearAllItems();
      component.onSubmit();
      tick();

      expect(mockShipmentService.createShipment).not.toHaveBeenCalled();
      expect(mockNotificationService.error).toHaveBeenCalledWith('Please add at least one item to the shipment');
    }));

    it('should not submit with invalid form', fakeAsync(() => {
      component.shipmentForm.patchValue({
        carrier: '',
        originStreet: '',
      });
      component.onSubmit();
      tick();

      expect(mockShipmentService.createShipment).not.toHaveBeenCalled();
      expect(mockNotificationService.error).toHaveBeenCalledWith('Please fill in all required fields');
    }));
  });

  describe('cancel navigation', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(ShipmentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should navigate to shipments list on cancel', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/shipments']);
    });
  });

  describe('error messages', () => {
    beforeEach(fakeAsync(() => {
      mockOrderService.getOrders.and.returnValue(of(mockOrdersResult));
      fixture = TestBed.createComponent(ShipmentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should return correct error message for required fields', () => {
      component.shipmentForm.get('carrier')?.setValue('');
      component.shipmentForm.get('carrier')?.markAsTouched();
      expect(component.getErrorMessage('carrier')).toBe('Carrier is required');
    });

    it('should return correct error message for min validation', () => {
      component.shipmentForm.get('weight')?.setValue(-1);
      component.shipmentForm.get('weight')?.markAsTouched();
      expect(component.getErrorMessage('weight')).toBe('Weight must be a positive number');
    });

    it('should return correct error message for minlength validation', () => {
      component.shipmentForm.get('trackingNumber')?.setValue('abc');
      component.shipmentForm.get('trackingNumber')?.markAsTouched();
      expect(component.getErrorMessage('trackingNumber')).toBe('Tracking number is too short');
    });

    it('should return correct error message for maxlength validation', () => {
      component.shipmentForm.get('carrier')?.setValue('a'.repeat(150));
      component.shipmentForm.get('carrier')?.markAsTouched();
      expect(component.getErrorMessage('carrier')).toBe('Carrier is too long');
    });
  });

  describe('order filtering', () => {
    it('should filter out cancelled orders', fakeAsync(() => {
      const cancelledOrder: Order = {
        ...mockOrder,
        id: 'cancelled-order',
        status: 'CANCELLED',
      };

      const mixedOrdersResult: PaginatedResult<Order> = {
        items: [mockOrder, cancelledOrder],
        totalCount: 2,
        page: 0,
        pageSize: 100,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockOrderService.getOrders.and.returnValue(of(mixedOrdersResult));

      fixture = TestBed.createComponent(ShipmentCreateComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      // The filtered orders should only contain the valid order
      component['filteredOrders$'].subscribe((orders) => {
        expect(orders.length).toBe(1);
        expect(orders[0].id).toBe(mockOrder.id);
      });
      tick();
    }));
  });
});
