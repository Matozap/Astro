import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ShipmentService } from '../services/shipment.service';
import { Shipment, ShipmentStatus, SHIPMENT_STATUS_LABELS } from '../../../shared/models/shipment.model';

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

  shipment = signal<Shipment | null>(null);
  loading = signal(true);

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
      case 'Delivered':
        return 'success';
      case 'Pending':
      case 'Delayed':
        return 'warning';
      case 'Failed':
      case 'FailedDelivery':
      case 'Returned':
        return 'error';
      case 'PickedUp':
      case 'Shipped':
      case 'InTransit':
      case 'OutForDelivery':
        return 'info';
      default:
        return 'default';
    }
  }

  isOverdue(): boolean {
    const s = this.shipment();
    if (!s || !s.estimatedDeliveryDate) return false;
    if (['Delivered', 'Returned'].includes(s.status)) return false;
    return new Date(s.estimatedDeliveryDate) < new Date();
  }
}
