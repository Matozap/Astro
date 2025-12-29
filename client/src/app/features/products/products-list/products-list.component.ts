import { Component, OnInit, inject, signal, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { ProductService } from '../services/product.service';
import { Product, ProductFilterInput, ProductSortInput } from '../../../shared/models/product.model';
import { DEFAULT_PAGE_SIZE } from '../../../shared/models/table.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-products-list',
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
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent implements OnInit {
  private readonly productService = inject(ProductService);

  @ViewChild('priceTemplate') priceTemplate!: TemplateRef<unknown>;
  @ViewChild('stockTemplate') stockTemplate!: TemplateRef<unknown>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<unknown>;

  products = signal<Product[]>([]);
  totalCount = signal(0);
  loading = this.productService.loading;

  pageIndex = 0;
  pageSize = DEFAULT_PAGE_SIZE;
  searchTerm = '';
  activeFilter: boolean | null = null;

  private searchSubject = new Subject<string>();

  columns: ColumnDef[] = [];

  ngOnInit(): void {
    this.initColumns();
    this.loadProducts();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadProducts();
      });
  }

  private initColumns(): void {
    this.columns = [
      { field: 'sku', header: 'SKU', sortable: true },
      { field: 'name', header: 'Name', sortable: true },
      { field: 'price', header: 'Price', sortable: true, template: this.priceTemplate },
      { field: 'stockQuantity', header: 'Stock', sortable: true, template: this.stockTemplate },
      { field: 'isActive', header: 'Status', sortable: true, template: this.statusTemplate },
    ];
  }

  loadProducts(): void {
    const filters: ProductFilterInput = {};

    if (this.searchTerm) {
      filters.name = { contains: this.searchTerm };
    }

    if (this.activeFilter !== null) {
      filters.isActive = { eq: this.activeFilter };
    }

    this.productService
      .getProducts({ page: this.pageIndex, pageSize: this.pageSize }, filters)
      .subscribe((result) => {
        this.products.set(result.items);
        this.totalCount.set(result.totalCount);
      });
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  onActiveFilterChange(): void {
    this.pageIndex = 0;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.activeFilter = null;
    this.pageIndex = 0;
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  onSortChange(sort: Sort): void {
    // Sort handled by service mock for now
    this.loadProducts();
  }

  onRowClick(product: Product): void {
    // Navigate to product detail or open dialog
    console.log('Product clicked:', product);
  }

  getStockStatus(quantity: number): { label: string; variant: 'success' | 'warning' | 'error' } {
    if (quantity === 0) {
      return { label: 'Out of Stock', variant: 'error' };
    } else if (quantity <= 20) {
      return { label: 'Low Stock', variant: 'warning' };
    }
    return { label: 'In Stock', variant: 'success' };
  }
}
