import { Component, Input, Output, EventEmitter, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { Product } from '../../../shared/models/product.model';
import { ImageManagerComponent, ImageManagerImage } from '../image-manager/image-manager.component';

export interface ProductFormValue {
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  images: ImageManagerImage[];
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    ImageManagerComponent,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  @Input() product?: Product;
  @Input() submitLabel = 'Save Product';
  @Output() formSubmit = new EventEmitter<ProductFormValue>();
  @Output() formCancel = new EventEmitter<void>();

  productForm!: FormGroup;
  images: ImageManagerImage[] = [];

  constructor(private fb: FormBuilder) {
    effect(() => {
      if (this.product) {
        this.loadProduct(this.product);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['USD', [Validators.required]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      lowStockThreshold: [10, [Validators.required, Validators.min(0)]],
      isActive: [true],
    });

    if (this.product) {
      this.loadProduct(this.product);
    }
  }

  private loadProduct(product: Product): void {
    this.productForm.patchValue({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      price: product.price.amount,
      currency: product.price.currency,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      isActive: product.isActive,
    });

    this.images = (product.images || []).map(img => ({
      id: img.id,
      url: img.url,
      fileName: img.fileName,
      storageMode: img.storageMode as 'FILE_SYSTEM' | 'AZURE' | 'AWS',
      isPrimary: img.isPrimary,
      altText: img.altText || undefined,
    }));
  }

  onImagesChange(images: ImageManagerImage[]): void {
    this.images = images;
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.images.length === 0) {
      return;
    }

    const hasPrimaryImage = this.images.some(img => img.isPrimary);
    if (!hasPrimaryImage) {
      return;
    }

    const formValue = this.productForm.value;
    const productFormValue: ProductFormValue = {
      sku: formValue.sku,
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      currency: formValue.currency,
      stockQuantity: formValue.stockQuantity,
      lowStockThreshold: formValue.lowStockThreshold,
      isActive: formValue.isActive,
      images: this.images,
    };

    this.formSubmit.emit(productFormValue);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (!control || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (control.hasError('maxLength')) {
      const maxLength = control.errors['maxLength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} cannot exceed ${maxLength} characters`;
    }

    if (control.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['min'].min}`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      sku: 'SKU',
      name: 'Product Name',
      description: 'Description',
      price: 'Price',
      currency: 'Currency',
      stockQuantity: 'Stock Quantity',
      lowStockThreshold: 'Low Stock Threshold',
    };
    return labels[fieldName] || fieldName;
  }

  get hasImages(): boolean {
    return this.images.length > 0;
  }

  get hasPrimaryImage(): boolean {
    return this.images.some(img => img.isPrimary);
  }
}
