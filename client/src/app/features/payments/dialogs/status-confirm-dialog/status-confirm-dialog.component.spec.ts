import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StatusConfirmDialogComponent, StatusConfirmDialogData } from './status-confirm-dialog.component';

describe('StatusConfirmDialogComponent', () => {
  let component: StatusConfirmDialogComponent;
  let fixture: ComponentFixture<StatusConfirmDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<StatusConfirmDialogComponent>>;

  const mockDataSuccessful: StatusConfirmDialogData = {
    currentStatus: 'PENDING',
    newStatus: 'SUCCESSFUL',
    transactionId: 'TXN-12345',
    amount: {
      amount: 299.99,
      currency: 'USD',
    },
  };

  const mockDataFailed: StatusConfirmDialogData = {
    currentStatus: 'PENDING',
    newStatus: 'FAILED',
    transactionId: null,
    amount: {
      amount: 150.00,
      currency: 'EUR',
    },
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [StatusConfirmDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDataSuccessful },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('with Successful status', () => {
    it('should display correct status label', () => {
      expect(component.getStatusLabel('SUCCESSFUL')).toBe('Successful');
      expect(component.getStatusLabel('PENDING')).toBe('Pending');
      expect(component.getStatusLabel('FAILED')).toBe('Failed');
    });

    it('should return check_circle icon for Successful', () => {
      expect(component.getStatusIcon()).toBe('check_circle');
    });

    it('should return primary color for Successful', () => {
      expect(component.getStatusColor()).toBe('primary');
    });

    it('should return correct warning text for Successful', () => {
      expect(component.getWarningText()).toContain('completed');
    });
  });

  describe('with Failed status', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [StatusConfirmDialogComponent, NoopAnimationsModule],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: mockDataFailed },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(StatusConfirmDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should return cancel icon for Failed', () => {
      expect(component.getStatusIcon()).toBe('cancel');
    });

    it('should return warn color for Failed', () => {
      expect(component.getStatusColor()).toBe('warn');
    });

    it('should return correct warning text for Failed', () => {
      expect(component.getWarningText()).toContain('failed');
    });
  });

  describe('dialog actions', () => {
    it('should close dialog with false when cancelled', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should close dialog with true when confirmed', () => {
      component.onConfirm();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });
  });

  describe('data display', () => {
    it('should have access to dialog data', () => {
      expect(component.data).toEqual(mockDataSuccessful);
    });

    it('should display transaction ID', () => {
      expect(component.data.transactionId).toBe('TXN-12345');
    });

    it('should display amount', () => {
      expect(component.data.amount.amount).toBe(299.99);
      expect(component.data.amount.currency).toBe('USD');
    });

    it('should display current and new status', () => {
      expect(component.data.currentStatus).toBe('PENDING');
      expect(component.data.newStatus).toBe('SUCCESSFUL');
    });
  });
});
