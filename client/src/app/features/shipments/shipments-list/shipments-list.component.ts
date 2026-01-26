import { Component, OnInit, AfterViewInit, inject, signal, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { DataTableComponent, ColumnDef } from '../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ShipmentService } from '../services/shipment.service';
import { Shipment, ShipmentFilterInput, ShipmentStatus, SHIPMENT_STATUS_LABELS } from '../../../shared/models/shipment.model';
import { DEFAULT_PAGE_SIZE } from '../../../shared/models/table.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-shipments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    DataTableComponent,
    StatusBadgeComponent,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './shipments-list.component.html',
  styleUrl: './shipments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsListComponent implements OnInit, AfterViewInit {
  private readonly shipmentService = inject(ShipmentService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('trackingTemplate') trackingTemplate!: TemplateRef<unknown>;
  @ViewChild('carrierTemplate') carrierTemplate!: TemplateRef<unknown>;
  @ViewChild('destinationTemplate') destinationTemplate!: TemplateRef<unknown>;
  @ViewChild('costTemplate') costTemplate!: TemplateRef<unknown>;
  @ViewChild('etaTemplate') etaTemplate!: TemplateRef<unknown>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<unknown>;

  shipments = signal<Shipment[]>([]);
  totalCount = signal(0);
  loading = this.shipmentService.loading;

  pageIndex = 0;
  pageSize = DEFAULT_PAGE_SIZE;
  searchTerm = '';
  statusFilter: ShipmentStatus | null = null;
  carrierFilter: string | null = null;

  shipmentStatuses: ShipmentStatus[] = [
    'PENDING',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'DELAYED',
    'FAILED_DELIVERY',
    'RETURNED',
  ];

  carriers = ['USPS', 'FedEx', 'UPS', 'DHL'];

  private searchSubject = new Subject<string>();

  columns: ColumnDef[] = [];

  ngOnInit(): void {
    this.loadShipments();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadShipments();
      });
  }

  ngAfterViewInit(): void {
    this.initColumns();
    this.cdr.detectChanges();
  }

  private initColumns(): void {
    this.columns = [
      { field: 'trackingNumber', header: 'Tracking #', sortable: true, template: this.trackingTemplate },
      { field: 'carrier', header: 'Carrier', sortable: true, template: this.carrierTemplate },
      { field: 'destinationAddress', header: 'Destination', sortable: false, template: this.destinationTemplate },
      { field: 'shippingCost', header: 'Cost', sortable: false, template: this.costTemplate },
      { field: 'estimatedDeliveryDate', header: 'ETA', sortable: true, template: this.etaTemplate },
      { field: 'status', header: 'Status', sortable: true, template: this.statusTemplate },
    ];
  }

  loadShipments(): void {
    const filters: ShipmentFilterInput = {};

    if (this.searchTerm) {
      filters.trackingNumber = { contains: this.searchTerm };
    }

    if (this.statusFilter !== null) {
      filters.status = { eq: this.statusFilter };
    }

    if (this.carrierFilter !== null) {
      filters.carrier = { eq: this.carrierFilter };
    }

    this.shipmentService
      .getShipments({ page: this.pageIndex, pageSize: this.pageSize }, filters)
      .subscribe((result) => {
        this.shipments.set(result.items);
        this.totalCount.set(result.totalCount);
      });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.loadShipments();
  }

  onCarrierFilterChange(): void {
    this.pageIndex = 0;
    this.loadShipments();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = null;
    this.carrierFilter = null;
    this.pageIndex = 0;
    this.loadShipments();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadShipments();
  }

  onSortChange(sort: Sort): void {
    this.loadShipments();
  }

  onRowClick(shipment: Shipment): void {
    this.router.navigate(['/shipments', shipment.id]);
  }

  onCreateShipment(): void {
    this.router.navigate(['/shipments/create']);
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

  getCarrierIcon(carrier: string): string {
    switch (carrier?.toLowerCase()) {
      case 'usps':
        return 'local_post_office';
      case 'fedex':
      case 'ups':
      case 'dhl':
        return 'local_shipping';
      default:
        return 'inventory_2';
    }
  }

  isOverdue(eta: string, status: ShipmentStatus): boolean {
    if (['DELIVERED', 'RETURNED'].includes(status)) {
      return false;
    }
    return new Date(eta) < new Date();
  }
}
