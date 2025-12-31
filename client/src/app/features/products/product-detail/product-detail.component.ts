import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ProductService } from '../services/product.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    StatusBadgeComponent,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);

  product = signal<Product | null>(null);
  loading = signal(true);

  displayedColumns = ['key', 'value'];

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.loading.set(false);
    }
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe((product) => {
      this.product.set(product);
      this.loading.set(false);
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  getStockStatus(): { label: string; variant: 'success' | 'warning' | 'error' } {
    const p = this.product();
    if (!p) return { label: 'Unknown', variant: 'warning' };

    if (p.stockQuantity === 0) {
      return { label: 'Out of Stock', variant: 'error' };
    } else if (p.isLowStock || p.stockQuantity <= p.lowStockThreshold) {
      return { label: 'Low Stock', variant: 'warning' };
    }
    return { label: 'In Stock', variant: 'success' };
  }

  getActiveStatus(): { label: string; variant: 'success' | 'error' } {
    const p = this.product();
    if (!p) return { label: 'Unknown', variant: 'error' };

    return p.isActive
      ? { label: 'Active', variant: 'success' }
      : { label: 'Inactive', variant: 'error' };
  }

  getPrimaryImage(): string | null {
    const p = this.product();
    if (!p || !p.images || p.images.length === 0) return null;

    const primary = p.images.find((img) => img.isPrimary);
    return primary?.url || p.images[0]?.url || null;
  }
}
