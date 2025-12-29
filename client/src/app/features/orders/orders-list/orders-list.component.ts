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
import { OrderService } from '../services/order.service';
import { Order, OrderFilterInput, OrderSortInput, OrderStatus } from '../../../shared/models/order.model';
import { DEFAULT_PAGE_SIZE } from '../../../shared/models/table.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-orders-list',
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
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListComponent implements OnInit, AfterViewInit {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('orderNumberTemplate') orderNumberTemplate!: TemplateRef<unknown>;
  @ViewChild('customerTemplate') customerTemplate!: TemplateRef<unknown>;
  @ViewChild('totalTemplate') totalTemplate!: TemplateRef<unknown>;
  @ViewChild('itemCountTemplate') itemCountTemplate!: TemplateRef<unknown>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<unknown>;
  @ViewChild('dateTemplate') dateTemplate!: TemplateRef<unknown>;

  orders = signal<Order[]>([]);
  totalCount = signal(0);
  loading = this.orderService.loading;

  pageIndex = 0;
  pageSize = DEFAULT_PAGE_SIZE;
  searchTerm = '';
  statusFilter: OrderStatus | null = null;

  orderStatuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Refunded',
  ];

  private searchSubject = new Subject<string>();

  columns: ColumnDef[] = [];

  ngOnInit(): void {
    this.loadOrders();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadOrders();
      });
  }

  ngAfterViewInit(): void {
    this.initColumns();
    this.cdr.detectChanges();
  }

  private initColumns(): void {
    this.columns = [
      { field: 'orderNumber', header: 'Order #', sortable: true, template: this.orderNumberTemplate },
      { field: 'customerName', header: 'Customer', sortable: true, template: this.customerTemplate },
      { field: 'totalAmount', header: 'Total', sortable: true, template: this.totalTemplate },
      { field: 'itemCount', header: 'Items', sortable: false, template: this.itemCountTemplate },
      { field: 'status', header: 'Status', sortable: true, template: this.statusTemplate },
      { field: 'createdAt', header: 'Created', sortable: true, template: this.dateTemplate },
    ];
  }

  loadOrders(): void {
    const filters: OrderFilterInput = {};

    if (this.searchTerm) {
      filters.orderNumber = { contains: this.searchTerm };
    }

    if (this.statusFilter !== null) {
      filters.status = { eq: this.statusFilter };
    }

    this.orderService
      .getOrders({ page: this.pageIndex, pageSize: this.pageSize }, filters)
      .subscribe((result) => {
        this.orders.set(result.items);
        this.totalCount.set(result.totalCount);
      });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.loadOrders();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = null;
    this.pageIndex = 0;
    this.loadOrders();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  onSortChange(sort: Sort): void {
    this.loadOrders();
  }

  onRowClick(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }

  getStatusVariant(status: OrderStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
      case 'Refunded':
        return 'error';
      case 'Confirmed':
      case 'Shipped':
        return 'info';
      case 'Processing':
      default:
        return 'default';
    }
  }
}
