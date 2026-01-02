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
import { PaymentService } from '../services/payment.service';
import { Payment, PaymentFilterInput, PaymentSortInput, PaymentStatus } from '../../../shared/models/payment.model';
import { DEFAULT_PAGE_SIZE } from '../../../shared/models/table.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-payments-list',
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
  templateUrl: './payments-list.component.html',
  styleUrl: './payments-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsListComponent implements OnInit, AfterViewInit {
  private readonly paymentService = inject(PaymentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  @ViewChild('transactionTemplate') transactionTemplate!: TemplateRef<unknown>;
  @ViewChild('orderTemplate') orderTemplate!: TemplateRef<unknown>;
  @ViewChild('amountTemplate') amountTemplate!: TemplateRef<unknown>;
  @ViewChild('methodTemplate') methodTemplate!: TemplateRef<unknown>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<unknown>;
  @ViewChild('dateTemplate') dateTemplate!: TemplateRef<unknown>;

  payments = signal<Payment[]>([]);
  totalCount = signal(0);
  loading = this.paymentService.loading;

  pageIndex = 0;
  pageSize = DEFAULT_PAGE_SIZE;
  searchTerm = '';
  statusFilter: PaymentStatus | null = null;

  paymentStatuses: PaymentStatus[] = ['Pending', 'Successful', 'Failed'];

  private searchSubject = new Subject<string>();

  columns: ColumnDef[] = [];

  ngOnInit(): void {
    this.loadPayments();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadPayments();
      });
  }

  ngAfterViewInit(): void {
    this.initColumns();
    this.cdr.detectChanges();
  }

  private initColumns(): void {
    this.columns = [
      { field: 'transactionId', header: 'Transaction ID', sortable: false, template: this.transactionTemplate },
      { field: 'order', header: 'Order', sortable: false, template: this.orderTemplate },
      { field: 'amount', header: 'Amount', sortable: true, template: this.amountTemplate },
      { field: 'paymentMethod', header: 'Method', sortable: false, template: this.methodTemplate },
      { field: 'status', header: 'Status', sortable: true, template: this.statusTemplate },
      { field: 'createdAt', header: 'Date', sortable: true, template: this.dateTemplate },
    ];
  }

  loadPayments(): void {
    const filters: PaymentFilterInput = {};

    if (this.statusFilter !== null) {
      filters.status = { eq: this.statusFilter };
    }

    this.paymentService
      .getPayments({ page: this.pageIndex, pageSize: this.pageSize }, filters)
      .subscribe((result) => {
        let items = result.items;

        // Client-side search filter for mock data
        if (this.searchTerm) {
          const term = this.searchTerm.toLowerCase();
          items = items.filter(
            (p) =>
              p.transactionId?.toLowerCase().includes(term) ||
              p.order?.orderNumber?.toLowerCase().includes(term) ||
              p.order?.customerName?.toLowerCase().includes(term)
          );
        }

        this.payments.set(items);
        this.totalCount.set(this.searchTerm ? items.length : result.totalCount);
      });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.loadPayments();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = null;
    this.pageIndex = 0;
    this.loadPayments();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPayments();
  }

  onSortChange(sort: Sort): void {
    this.loadPayments();
  }

  onRowClick(payment: Payment): void {
    this.router.navigate(['/payments', payment.id]);
  }

  getStatusVariant(status: PaymentStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
    switch (status) {
      case 'Successful':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Failed':
        return 'error';
      default:
        return 'default';
    }
  }

  getMethodIcon(method: string | null): string {
    if (!method) return 'payment';

    const methodLower = method.toLowerCase();
    if (methodLower.includes('credit') || methodLower.includes('debit')) {
      return 'credit_card';
    }
    if (methodLower.includes('paypal')) {
      return 'account_balance_wallet';
    }
    if (methodLower.includes('bank')) {
      return 'account_balance';
    }
    if (methodLower.includes('apple')) {
      return 'phone_iphone';
    }
    return 'payment';
  }
}
