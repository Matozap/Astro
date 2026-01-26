import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ShipmentService } from '../services/shipment.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  Shipment,
  ShipmentStatus,
  SHIPMENT_STATUS_LABELS,
  isTerminalStatus,
  getAvailableTransitions,
  StatusUpdateDialogData,
  StatusUpdateDialogResult,
  ShipmentEditDialogData,
  ShipmentEditDialogResult,
  UpdateShipmentInput,
} from '../../../shared/models/shipment.model';
import { StatusUpdateDialogComponent } from '../dialogs/status-update-dialog/status-update-dialog.component';
import { ShipmentEditDialogComponent } from '../dialogs/shipment-edit-dialog/shipment-edit-dialog.component';

@Component({
  selector: 'app-shipment-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    StatusBadgeComponent,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './shipment-detail.component.html',
  styleUrl: './shipment-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shipmentService = inject(ShipmentService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  shipment = signal<Shipment | null>(null);
  loading = signal(true);
  updating = signal(false);

  displayedColumns = ['productName', 'quantity'];

  ngOnInit(): void {
    const shipmentId = this.route.snapshot.paramMap.get('id');
    if (shipmentId) {
      this.loadShipment(shipmentId);
    } else {
      this.loading.set(false);
    }
  }

  private loadShipment(id: string): void {
    this.loading.set(true);
    this.shipmentService.getShipmentById(id).subscribe((shipment) => {
      this.shipment.set(shipment);
      this.loading.set(false);
    });
  }

  goBack(): void {
    this.router.navigate(['/shipments']);
  }

  getStatusLabel(status: ShipmentStatus): string {
    return SHIPMENT_STATUS_LABELS[status] || status;
  }

  getStatusVariant(status: ShipmentStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'PENDING':
      case 'DELAYED':
        return 'warning';
      case 'FAILED_DELIVERY':
      case 'RETURNED':
        return 'error';
      case 'SHIPPED':
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return 'info';
      default:
        return 'default';
    }
  }

  isOverdue(): boolean {
    const s = this.shipment();
    if (!s || !s.estimatedDeliveryDate) return false;
    if (['DELIVERED', 'RETURNED'].includes(s.status)) return false;
    return new Date(s.estimatedDeliveryDate) < new Date();
  }

  // Status update functionality (US2)
  canUpdateStatus(): boolean {
    const s = this.shipment();
    if (!s) return false;
    return !isTerminalStatus(s.status);
  }

  getAvailableStatuses(): ShipmentStatus[] {
    const s = this.shipment();
    if (!s) return [];
    return getAvailableTransitions(s.status);
  }

  openStatusDialog(newStatus: ShipmentStatus): void {
    const currentShipment = this.shipment();
    if (!currentShipment) return;

    const dialogData: StatusUpdateDialogData = {
      shipment: currentShipment,
      newStatus,
    };

    const dialogRef = this.dialog.open(StatusUpdateDialogComponent, {
      width: '500px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: StatusUpdateDialogResult | undefined) => {
      if (result) {
        this.updateStatus(result);
      }
    });
  }

  updateStatus(result: StatusUpdateDialogResult): void {
    const currentShipment = this.shipment();
    if (!currentShipment) return;

    this.updating.set(true);

    const updateInput: UpdateShipmentInput = {
      id: currentShipment.id,
      status: result.status,
      statusLocation: result.location,
      statusNotes: result.notes,
      modifiedBy: 'current-user@astro.com', // TODO: Get from auth service
    };

    this.shipmentService.updateShipment(updateInput).subscribe({
      next: (updatedShipment) => {
        this.shipment.set(updatedShipment);
        this.updating.set(false);
        this.notificationService.success(`Status updated to ${this.getStatusLabel(result.status)}`);
      },
      error: (error) => {
        this.updating.set(false);
        console.error('Error updating shipment status:', error);

        let errorMessage = 'Failed to update shipment status';
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          errorMessage = error.graphQLErrors[0].message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.notificationService.error(errorMessage);
      },
    });
  }

  // Edit shipment functionality (US3)
  canEditShipment(): boolean {
    const s = this.shipment();
    if (!s) return false;
    return s.status === 'PENDING';
  }

  openEditDialog(): void {
    const currentShipment = this.shipment();
    if (!currentShipment) return;

    const dialogData: ShipmentEditDialogData = {
      shipment: currentShipment,
    };

    const dialogRef = this.dialog.open(ShipmentEditDialogComponent, {
      width: '500px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result: ShipmentEditDialogResult | undefined) => {
      if (result) {
        this.saveEditChanges(result);
      }
    });
  }

  saveEditChanges(result: ShipmentEditDialogResult): void {
    const currentShipment = this.shipment();
    if (!currentShipment) return;

    this.updating.set(true);

    const updateInput: UpdateShipmentInput = {
      id: currentShipment.id,
      carrier: result.carrier,
      trackingNumber: result.trackingNumber,
      modifiedBy: 'current-user@astro.com', // TODO: Get from auth service
    };

    this.shipmentService.updateShipment(updateInput).subscribe({
      next: (updatedShipment) => {
        this.shipment.set(updatedShipment);
        this.updating.set(false);
        this.notificationService.success('Shipment details updated successfully');
      },
      error: (error) => {
        this.updating.set(false);
        console.error('Error updating shipment details:', error);

        let errorMessage = 'Failed to update shipment details';
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          errorMessage = error.graphQLErrors[0].message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.notificationService.error(errorMessage);
      },
    });
  }
}
