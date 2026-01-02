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
import { Product, ProductImage } from '../../../shared/models/product.model';
import { ProductFormComponent, ProductFormValue } from '../product-form/product-form.component';
import { ImageManagerImage } from '../image-manager/image-manager.component';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';

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
    ProductFormComponent,
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
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  product = signal<Product | null>(null);
  loading = signal(true);
  editMode = signal(false);
  saving = signal(false);

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

  toggleEditMode(): void {
    this.editMode.update(mode => !mode);
  }

  onFormSubmit(formValue: ProductFormValue): void {
    const product = this.product();
    if (!product) return;

    this.saving.set(true);

    const currentUser = this.authService.currentUser();
    const modifiedBy = currentUser?.email || 'system';

    const updateCommand = {
      id: product.id,
      sku: formValue.sku,
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      stockQuantity: formValue.stockQuantity,
      lowStockThreshold: formValue.lowStockThreshold,
      isActive: formValue.isActive,
      modifiedBy,
    };

    this.productService.updateProduct(updateCommand).subscribe({
      next: (updatedProduct) => {
        this.syncImages(product.id, product.images || [], formValue.images, modifiedBy)
          .then(() => {
            this.loadProduct(product.id);
            this.editMode.set(false);
            this.saving.set(false);
            this.notificationService.success('Product updated successfully');
          })
          .catch((error) => {
            this.saving.set(false);
            console.error('Error syncing images:', error);
            this.notificationService.error('Product updated but some image changes failed');
            this.loadProduct(product.id);
            this.editMode.set(false);
          });
      },
      error: (error) => {
        this.saving.set(false);
        console.error('Error updating product:', error);

        let errorMessage = 'Failed to update product';
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          errorMessage = error.graphQLErrors[0].message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.notificationService.error(errorMessage);
      },
    });
  }

  onFormCancel(): void {
    this.editMode.set(false);
  }

  private async syncImages(
    productId: string,
    existingImages: ProductImage[],
    newImages: ImageManagerImage[],
    createdBy: string
  ): Promise<void> {
    const existingIds = new Set(existingImages.map(img => img.id));
    const newIds = new Set(newImages.filter(img => img.id).map(img => img.id!));

    // Remove images that are no longer in the list
    const imagesToRemove = existingImages.filter(img => !newIds.has(img.id));
    const removePromises = imagesToRemove.map(img =>
      this.productService.removeProductImage(productId, img.id).toPromise()
    );

    // Add new images (those without an id)
    const imagesToAdd = newImages.filter(img => !img.id);
    const addPromises = imagesToAdd.map(img =>
      this.productService.addProductImage({
        productId,
        fileName: img.fileName,
        url: img.url,
        storageMode: img.storageMode,
        isPrimary: img.isPrimary,
        createdBy,
      }).toPromise()
    );

    await Promise.all([...removePromises, ...addPromises]);
  }
}
