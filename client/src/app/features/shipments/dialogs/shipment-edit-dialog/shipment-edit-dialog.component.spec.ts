import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShipmentEditDialogComponent } from './shipment-edit-dialog.component';
import {
  ShipmentEditDialogData,
  Shipment,
  ShipmentStatus,
} from '../../../../shared/models/shipment.model';

describe('ShipmentEditDialogComponent', () => {
  let component: ShipmentEditDialogComponent;
  let fixture: ComponentFixture<ShipmentEditDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ShipmentEditDialogComponent>>;

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
    items: [],
    itemCount: 0,
    createdAt: '2026-01-21T10:00:00Z',
    updatedAt: '2026-01-21T10:00:00Z',
    createdBy: 'admin@astro.com',
    modifiedBy: 'admin@astro.com',
  };

  const mockDialogData: ShipmentEditDialogData = {
    shipment: mockShipment,
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ShipmentEditDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with shipment values', () => {
      expect(component.form.get('carrier')?.value).toBe('FedEx');
      expect(component.form.get('trackingNumber')?.value).toBe('TRACK123456');
    });

    it('should have carrier options', () => {
      expect(component.carrierOptions.length).toBeGreaterThan(0);
    });
  });

  describe('form validation', () => {
    it('should require carrier', () => {
      component.form.get('carrier')?.setValue('');
      expect(component.form.get('carrier')?.valid).toBeFalse();
      expect(component.form.get('carrier')?.hasError('required')).toBeTrue();
    });

    it('should validate carrier max length', () => {
      component.form.get('carrier')?.setValue('a'.repeat(101));
      expect(component.form.get('carrier')?.valid).toBeFalse();
      expect(component.form.get('carrier')?.hasError('maxlength')).toBeTrue();
    });

    it('should allow empty tracking number', () => {
      component.form.get('trackingNumber')?.setValue('');
      expect(component.form.get('trackingNumber')?.valid).toBeTrue();
    });

    it('should validate tracking number min length', () => {
      component.form.get('trackingNumber')?.setValue('abc');
      expect(component.form.get('trackingNumber')?.valid).toBeFalse();
      expect(component.form.get('trackingNumber')?.hasError('minlength')).toBeTrue();
    });

    it('should validate tracking number max length', () => {
      component.form.get('trackingNumber')?.setValue('a'.repeat(51));
      expect(component.form.get('trackingNumber')?.valid).toBeFalse();
      expect(component.form.get('trackingNumber')?.hasError('maxlength')).toBeTrue();
    });

    it('should accept valid tracking number', () => {
      component.form.get('trackingNumber')?.setValue('TRACK12345');
      expect(component.form.get('trackingNumber')?.valid).toBeTrue();
    });
  });

  describe('hasChanges', () => {
    it('should return false when no changes made', () => {
      expect(component.hasChanges()).toBeFalse();
    });

    it('should return true when carrier changed', () => {
      component.form.get('carrier')?.setValue('UPS');
      expect(component.hasChanges()).toBeTrue();
    });

    it('should return true when tracking number changed', () => {
      component.form.get('trackingNumber')?.setValue('NEWTRACK123');
      expect(component.hasChanges()).toBeTrue();
    });
  });

  describe('cancel', () => {
    it('should close dialog without result on cancel', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('save', () => {
    it('should close dialog with result on save', () => {
      component.form.patchValue({
        carrier: 'UPS',
        trackingNumber: 'UPS123456789',
      });

      component.onSave();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        carrier: 'UPS',
        trackingNumber: 'UPS123456789',
      });
    });

    it('should close dialog with undefined tracking number when empty', () => {
      component.form.patchValue({
        carrier: 'UPS',
        trackingNumber: '',
      });

      component.onSave();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        carrier: 'UPS',
        trackingNumber: undefined,
      });
    });

    it('should not close dialog if form is invalid', () => {
      component.form.get('carrier')?.setValue('');
      component.onSave();

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when invalid', () => {
      component.form.get('carrier')?.setValue('');
      spyOn(component.form.get('carrier')!, 'markAsTouched');
      spyOn(component.form.get('trackingNumber')!, 'markAsTouched');

      component.onSave();

      expect(component.form.get('carrier')!.markAsTouched).toHaveBeenCalled();
      expect(component.form.get('trackingNumber')!.markAsTouched).toHaveBeenCalled();
    });
  });

  describe('error messages', () => {
    it('should return required error message', () => {
      component.form.get('carrier')?.setValue('');
      component.form.get('carrier')?.markAsTouched();

      expect(component.getErrorMessage('carrier')).toBe('Carrier is required');
    });

    it('should return minlength error message', () => {
      component.form.get('trackingNumber')?.setValue('abc');
      component.form.get('trackingNumber')?.markAsTouched();

      expect(component.getErrorMessage('trackingNumber')).toBe('Minimum 5 characters required');
    });

    it('should return maxlength error message', () => {
      component.form.get('carrier')?.setValue('a'.repeat(101));
      component.form.get('carrier')?.markAsTouched();

      expect(component.getErrorMessage('carrier')).toBe('Maximum 100 characters allowed');
    });

    it('should return empty string for valid fields', () => {
      component.form.get('carrier')?.setValue('FedEx');
      expect(component.getErrorMessage('carrier')).toBe('');
    });
  });
});
