import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StatusUpdateDialogComponent } from './status-update-dialog.component';
import {
  StatusUpdateDialogData,
  Shipment,
  ShipmentStatus,
} from '../../../../shared/models/shipment.model';

describe('StatusUpdateDialogComponent', () => {
  let component: StatusUpdateDialogComponent;
  let fixture: ComponentFixture<StatusUpdateDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<StatusUpdateDialogComponent>>;

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

  const mockDialogData: StatusUpdateDialogData = {
    shipment: mockShipment,
    newStatus: 'Shipped' as ShipmentStatus,
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [StatusUpdateDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have form initialized', () => {
      expect(component.form).toBeTruthy();
      expect(component.form.get('location')).toBeTruthy();
      expect(component.form.get('notes')).toBeTruthy();
    });

    it('should display current status label', () => {
      expect(component.currentStatusLabel).toBe('Pending');
    });

    it('should display new status label', () => {
      expect(component.newStatusLabel).toBe('Shipped');
    });
  });

  describe('form validation', () => {
    it('should accept empty location', () => {
      component.form.get('location')?.setValue('');
      expect(component.form.get('location')?.valid).toBeTrue();
    });

    it('should accept location within max length', () => {
      component.form.get('location')?.setValue('Chicago, IL');
      expect(component.form.get('location')?.valid).toBeTrue();
    });

    it('should reject location exceeding max length', () => {
      component.form.get('location')?.setValue('a'.repeat(201));
      expect(component.form.get('location')?.valid).toBeFalse();
      expect(component.form.get('location')?.hasError('maxlength')).toBeTrue();
    });

    it('should accept notes within max length', () => {
      component.form.get('notes')?.setValue('Package picked up by carrier');
      expect(component.form.get('notes')?.valid).toBeTrue();
    });

    it('should reject notes exceeding max length', () => {
      component.form.get('notes')?.setValue('a'.repeat(501));
      expect(component.form.get('notes')?.valid).toBeFalse();
      expect(component.form.get('notes')?.hasError('maxlength')).toBeTrue();
    });
  });

  describe('cancel', () => {
    it('should close dialog without result on cancel', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('confirm', () => {
    it('should close dialog with result on confirm', () => {
      component.form.patchValue({
        location: 'Chicago, IL',
        notes: 'Package picked up',
      });

      component.onConfirm();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        status: 'Shipped',
        location: 'Chicago, IL',
        notes: 'Package picked up',
      });
    });

    it('should close dialog with minimal result when fields are empty', () => {
      component.form.patchValue({
        location: '',
        notes: '',
      });

      component.onConfirm();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        status: 'Shipped',
        location: undefined,
        notes: undefined,
      });
    });

    it('should not close dialog if form is invalid', () => {
      component.form.get('location')?.setValue('a'.repeat(201));
      component.onConfirm();

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('error messages', () => {
    it('should return maxlength error message', () => {
      component.form.get('location')?.setValue('a'.repeat(201));
      component.form.get('location')?.markAsTouched();

      expect(component.getErrorMessage('location')).toBe('Maximum 200 characters allowed');
    });

    it('should return maxlength error message for notes', () => {
      component.form.get('notes')?.setValue('a'.repeat(501));
      component.form.get('notes')?.markAsTouched();

      expect(component.getErrorMessage('notes')).toBe('Maximum 500 characters allowed');
    });

    it('should return empty string for valid fields', () => {
      component.form.get('location')?.setValue('Valid location');
      expect(component.getErrorMessage('location')).toBe('');
    });
  });
});
