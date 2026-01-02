import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductFormComponent, ProductFormValue } from '../product-form/product-form.component';
import { ProductService } from '../services/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ProductFormComponent,
  ],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss',
})
export class ProductCreateComponent {
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isSubmitting = signal(false);

  onFormSubmit(formValue: ProductFormValue): void {
    this.isSubmitting.set(true);

    const currentUser = this.authService.currentUser();
    const createdBy = currentUser?.email || 'system';

    const createCommand = {
      sku: formValue.sku,
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      stockQuantity: formValue.stockQuantity,
      lowStockThreshold: formValue.lowStockThreshold,
      isActive: formValue.isActive,
      createdBy,
    };

    this.productService.createProduct(createCommand).subscribe({
      next: (createdProduct) => {
        const productId = createdProduct.id;

        const imagePromises = formValue.images.map((img) =>
          this.productService.addProductImage({
            productId,
            fileName: img.fileName,
            url: img.url,
            storageMode: img.storageMode,
            isPrimary: img.isPrimary,
            createdBy,
          }).toPromise()
        );

        Promise.all(imagePromises)
          .then(() => {
            this.isSubmitting.set(false);
            this.notificationService.success('Product created successfully');
            this.router.navigate(['/products']);
          })
          .catch((error) => {
            this.isSubmitting.set(false);
            console.error('Error adding product images:', error);
            this.notificationService.error(
              'Product created but some images failed to upload. Please edit the product to add images.'
            );
            this.router.navigate(['/products']);
          });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error creating product:', error);

        let errorMessage = 'Failed to create product';
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
    this.router.navigate(['/products']);
  }
}
