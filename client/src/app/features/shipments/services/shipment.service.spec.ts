import { TestBed } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { ShipmentService } from './shipment.service';
import { CREATE_SHIPMENT, UPDATE_SHIPMENT } from '../graphql/shipment.mutations';
import { GET_SHIPMENTS } from '../graphql/shipment.queries';
import {
  Shipment,
  ShipmentStatus,
  CreateShipmentInput,
  UpdateShipmentInput,
} from '../../../shared/models/shipment.model';

describe('ShipmentService', () => {
  let service: ShipmentService;
  let controller: ApolloTestingController;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [ShipmentService],
    });
    service = TestBed.inject(ShipmentService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have loading as false initially', () => {
      expect(service.loading()).toBeFalse();
    });
  });

  describe('createShipment', () => {
    const createInput: CreateShipmentInput = {
      orderId: '223e4567-e89b-12d3-a456-426614174001',
      carrier: 'FedEx',
      trackingNumber: 'TRACK123456',
      originStreet: '100 Warehouse Ave',
      originCity: 'Chicago',
      originState: 'IL',
      originPostalCode: '60601',
      originCountry: 'USA',
      destinationStreet: '123 Main St',
      destinationCity: 'Springfield',
      destinationState: 'IL',
      destinationPostalCode: '62701',
      destinationCountry: 'USA',
      weight: 2.5,
      weightUnit: 'POUNDS',
      length: 10,
      width: 8,
      height: 6,
      dimensionUnit: 'INCHES',
      shippingCost: 15.99,
      estimatedDeliveryDate: '2026-01-25T00:00:00Z',
      createdBy: 'admin@astro.com',
      items: [
        {
          orderDetailId: 'detail-001',
          productId: 'prod-001',
          productName: 'Test Product',
          productSku: 'SKU-001',
          quantity: 2,
        },
      ],
    };

    it('should set loading to true when creating a shipment', (done) => {
      service.createShipment(createInput).subscribe();
      expect(service.loading()).toBeTrue();

      const op = controller.expectOne(CREATE_SHIPMENT);
      op.flush({ data: { createShipment: { shipment: mockShipment } } });

      const refetchOp = controller.expectOne(GET_SHIPMENTS);
      refetchOp.flush({
        data: {
          shipments: {
            nodes: [mockShipment],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 1,
          },
        },
      });
      done();
    });

    it('should create a shipment successfully', (done) => {
      service.createShipment(createInput).subscribe({
        next: (shipment) => {
          expect(shipment).toEqual(mockShipment);
          expect(shipment.status).toBe('PENDING');
          expect(service.loading()).toBeFalse();
          done();
        },
        error: () => {
          fail('createShipment should have succeeded');
          done();
        },
      });

      const op = controller.expectOne(CREATE_SHIPMENT);
      expect(op.operation.variables['command']).toEqual(createInput);

      op.flush({
        data: { createShipment: { shipment: mockShipment } },
      });

      const refetchOp = controller.expectOne(GET_SHIPMENTS);
      refetchOp.flush({
        data: {
          shipments: {
            nodes: [mockShipment],
            pageInfo: { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null },
            totalCount: 1,
          },
        },
      });
    });

    it('should handle errors when creating a shipment', (done) => {
      service.createShipment(createInput).subscribe({
        next: () => {
          fail('createShipment should have failed');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CREATE_SHIPMENT);
      op.graphqlErrors([{ message: 'Order not found' }]);
    });

    it('should throw error when no data is returned', (done) => {
      service.createShipment(createInput).subscribe({
        next: () => {
          fail('createShipment should have thrown error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('No data returned from createShipment mutation');
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CREATE_SHIPMENT);
      op.flush({ data: {} });

      const refetchOp = controller.expectOne(GET_SHIPMENTS);
      refetchOp.flush({
        data: {
          shipments: {
            nodes: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
        },
      });
    });

    it('should handle validation errors', (done) => {
      service.createShipment(createInput).subscribe({
        next: () => {
          fail('createShipment should have failed validation');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(CREATE_SHIPMENT);
      op.graphqlErrors([
        {
          message: 'Validation error',
          extensions: {
            code: 'VALIDATION_ERROR',
            validationErrors: [{ propertyName: 'Items', errorMessage: 'At least one item is required' }],
          },
        },
      ]);
    });
  });

  describe('updateShipment', () => {
    const shipmentId = '123e4567-e89b-12d3-a456-426614174000';

    const updatedShipmentShipped: Shipment = {
      ...mockShipment,
      status: 'SHIPPED' as ShipmentStatus,
      trackingDetails: [
        {
          id: 'td-001',
          timestamp: '2026-01-21T12:00:00Z',
          location: 'Chicago, IL',
          status: 'SHIPPED',
          notes: 'Package picked up by carrier',
        },
      ],
      updatedAt: '2026-01-21T12:00:00Z',
    };

    it('should set loading to true when updating a shipment', (done) => {
      const updateInput: UpdateShipmentInput = {
        id: shipmentId,
        status: 'SHIPPED',
        statusLocation: 'Chicago, IL',
        statusNotes: 'Package picked up by carrier',
        modifiedBy: 'admin@astro.com',
      };

      service.updateShipment(updateInput).subscribe();
      expect(service.loading()).toBeTrue();

      const op = controller.expectOne(UPDATE_SHIPMENT);
      op.flush({ data: { updateShipment: { shipment: updatedShipmentShipped } } });
      done();
    });

    it('should update shipment status successfully', (done) => {
      const updateInput: UpdateShipmentInput = {
        id: shipmentId,
        status: 'SHIPPED',
        statusLocation: 'Chicago, IL',
        statusNotes: 'Package picked up by carrier',
        modifiedBy: 'admin@astro.com',
      };

      service.updateShipment(updateInput).subscribe({
        next: (shipment) => {
          expect(shipment).toEqual(updatedShipmentShipped);
          expect(shipment.status).toBe('SHIPPED');
          expect(shipment.trackingDetails.length).toBe(1);
          expect(service.loading()).toBeFalse();
          done();
        },
        error: () => {
          fail('updateShipment should have succeeded');
          done();
        },
      });

      const op = controller.expectOne(UPDATE_SHIPMENT);
      expect(op.operation.variables['command']).toEqual(updateInput);

      op.flush({
        data: { updateShipment: { shipment: updatedShipmentShipped } },
      });
    });

    it('should update carrier and tracking number for Pending shipment', (done) => {
      const updateInput: UpdateShipmentInput = {
        id: shipmentId,
        carrier: 'UPS',
        trackingNumber: 'UPS1234567890',
        modifiedBy: 'admin@astro.com',
      };

      const updatedShipment: Shipment = {
        ...mockShipment,
        carrier: 'UPS',
        trackingNumber: 'UPS1234567890',
        updatedAt: '2026-01-21T11:00:00Z',
      };

      service.updateShipment(updateInput).subscribe({
        next: (shipment) => {
          expect(shipment.carrier).toBe('UPS');
          expect(shipment.trackingNumber).toBe('UPS1234567890');
          expect(service.loading()).toBeFalse();
          done();
        },
        error: () => {
          fail('updateShipment should have succeeded');
          done();
        },
      });

      const op = controller.expectOne(UPDATE_SHIPMENT);
      op.flush({
        data: { updateShipment: { shipment: updatedShipment } },
      });
    });

    it('should handle errors when updating a shipment', (done) => {
      const updateInput: UpdateShipmentInput = {
        id: shipmentId,
        status: 'SHIPPED',
        modifiedBy: 'admin@astro.com',
      };

      service.updateShipment(updateInput).subscribe({
        next: () => {
          fail('updateShipment should have failed');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(UPDATE_SHIPMENT);
      op.graphqlErrors([{ message: 'Shipment not found' }]);
    });

    it('should throw error when no data is returned', (done) => {
      const updateInput: UpdateShipmentInput = {
        id: shipmentId,
        status: 'SHIPPED',
        modifiedBy: 'admin@astro.com',
      };

      service.updateShipment(updateInput).subscribe({
        next: () => {
          fail('updateShipment should have thrown error');
          done();
        },
        error: (error) => {
          expect(error.message).toBe('No data returned from updateShipment mutation');
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(UPDATE_SHIPMENT);
      op.flush({ data: {} });
    });

    it('should handle invalid status transition errors', (done) => {
      const updateInput: UpdateShipmentInput = {
        id: shipmentId,
        status: 'DELIVERED',
        modifiedBy: 'admin@astro.com',
      };

      service.updateShipment(updateInput).subscribe({
        next: () => {
          fail('updateShipment should have failed for invalid transition');
          done();
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(service.loading()).toBeFalse();
          done();
        },
      });

      const op = controller.expectOne(UPDATE_SHIPMENT);
      op.graphqlErrors([
        {
          message: 'Invalid status transition',
          extensions: {
            code: 'INVALID_OPERATION',
            details: 'Cannot transition from Pending to Delivered',
          },
        },
      ]);
    });
  });
});
