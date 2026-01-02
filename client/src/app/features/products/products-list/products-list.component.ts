import { Component, OnInit, AfterViewInit, inject, signal, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { DataTableComponent, ColumnDef } from '../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProductService } from '../services/product.service';
import { Product, ProductFilterInput, ProductSortInput } from '../../../shared/models/product.model';
import { DEFAULT_PAGE_SIZE } from '../../../shared/models/table.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { DeleteConfirmDialogComponent, DeleteConfirmDialogData } from '../dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { DeactivateConfirmDialogComponent, DeactivateConfirmDialogData } from '../dialogs/deactivate-confirm-dialog/deactivate-confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';

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
    MatTooltipModule,
    DataTableComponent,
    StatusBadgeComponent,
    CurrencyPipe,
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent implements OnInit, AfterViewInit {
  private readonly productService = inject(ProductService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  @ViewChild('priceTemplate') priceTemplate!: TemplateRef<unknown>;
  @ViewChild('stockTemplate') stockTemplate!: TemplateRef<unknown>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<unknown>;
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<unknown>;

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
    this.loadProducts();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadProducts();
      });
  }

  ngAfterViewInit(): void {
    this.initColumns();
    this.cdr.detectChanges();
  }

  private initColumns(): void {
    this.columns = [
      { field: 'sku', header: 'SKU', sortable: true },
      { field: 'name', header: 'Name', sortable: true },
      { field: 'price', header: 'Price', sortable: true, template: this.priceTemplate },
      { field: 'stockQuantity', header: 'Stock', sortable: true, template: this.stockTemplate },
      { field: 'isActive', header: 'Status', sortable: true, template: this.statusTemplate },
      { field: 'actions', header: 'Actions', sortable: false, template: this.actionsTemplate },
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
    this.router.navigate(['/products', product.id]);
  }

  onCreateProduct(): void {
    this.router.navigate(['/products/create']);
  }

  getStockStatus(quantity: number): { label: string; variant: 'success' | 'warning' | 'error' } {
    if (quantity === 0) {
      return { label: 'Out of Stock', variant: 'error' };
    } else if (quantity <= 20) {
      return { label: 'Low Stock', variant: 'warning' };
    }
    return { label: 'In Stock', variant: 'success' };
  }

  onDeleteProduct(event: Event, product: Product): void {
    event.stopPropagation(); // Prevent row click

    const dialogData: DeleteConfirmDialogData = {
      productName: product.name,
      productSku: product.sku,
    };

    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '500px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.notificationService.success('Product deleted successfully');
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error deleting product:', error);

            // Check if it's a ProductInUseException by examining the error structure
            const isProductInUse = this.isProductInUseError(error);

            if (isProductInUse) {
              // Product is in use, show deactivate dialog instead
              this.showDeactivateDialog(product);
              return;
            }

            // Other error - show error message
            const errorMessage = this.extractErrorMessage(error);
            this.notificationService.error(errorMessage);
          },
        });
      }
    });
  }

  private showDeactivateDialog(product: Product): void {
    const dialogData: DeactivateConfirmDialogData = {
      productName: product.name,
      productSku: product.sku,
    };

    const dialogRef = this.dialog.open(DeactivateConfirmDialogComponent, {
      width: '550px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deactivateProduct(product);
      }
    });
  }

  private deactivateProduct(product: Product): void {
    const currentUser = this.authService.currentUser();
    const modifiedBy = currentUser?.email || 'system';

    const updateCommand = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || undefined,
      price: product.price.amount,
      stockQuantity: 0, // Set stock to 0
      lowStockThreshold: product.lowStockThreshold,
      isActive: false, // Deactivate
      modifiedBy,
    };

    this.productService.updateProduct(updateCommand).subscribe({
      next: () => {
        this.notificationService.success('Product deactivated successfully');
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error deactivating product:', error);
        const errorMessage = this.extractErrorMessage(error);
        this.notificationService.error(errorMessage);
      },
    });
  }

  /**
   * Checks if the error is a ProductInUseException
   */
  private isProductInUseError(error: any): boolean {
    if (!error.graphQLErrors || error.graphQLErrors.length === 0) {
      return false;
    }

    const graphQLError = error.graphQLErrors[0];

    // Check various ways the error might be identified
    return (
      graphQLError.extensions?.['code'] === 'PRODUCT_IN_USE' ||
      graphQLError.extensions?.['exception']?.['type'] === 'ProductInUseException' ||
      graphQLError.message?.includes('ProductInUseException') ||
      graphQLError.message?.includes('been used in one or more orders') ||
      graphQLError.message?.includes('cannot be deleted')
    );
  }

  /**
   * Extracts a user-friendly error message from GraphQL error
   */
  private extractErrorMessage(error: any, defaultMessage: string = 'An error occurred'): string {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message;
    } else if (error.message) {
      return error.message;
    }
    return defaultMessage;
  }
}
