import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductImage } from '../../../shared/models/product.model';

export interface ImageManagerImage {
  id?: string;
  url: string;
  fileName: string;
  storageMode: 'FILE_SYSTEM' | 'AZURE' | 'AWS';
  isPrimary: boolean;
  altText?: string;
}

@Component({
  selector: 'app-image-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './image-manager.component.html',
  styleUrl: './image-manager.component.scss',
})
export class ImageManagerComponent {
  @Input() set images(value: ImageManagerImage[]) {
    this._images.set(value || []);
  }

  @Output() imagesChange = new EventEmitter<ImageManagerImage[]>();

  private _images = signal<ImageManagerImage[]>([]);
  readonly images$ = this._images.asReadonly();

  // Form state for adding new image
  newImageUrl = signal('');
  newImageFileName = signal('');
  newImageStorageMode = signal<'FILE_SYSTEM' | 'AZURE' | 'AWS'>('FILE_SYSTEM');

  // Validation
  hasImages = computed(() => this._images().length > 0);
  hasPrimaryImage = computed(() => this._images().some(img => img.isPrimary));

  /**
   * Adds a new image to the gallery
   */
  addImage(): void {
    const url = this.newImageUrl().trim();
    const fileName = this.newImageFileName().trim();

    if (!url || !fileName) {
      return;
    }

    const images = this._images();
    const newImage: ImageManagerImage = {
      url,
      fileName,
      storageMode: this.newImageStorageMode(),
      isPrimary: images.length === 0, // First image is automatically primary
    };

    this._images.set([...images, newImage]);
    this.imagesChange.emit(this._images());

    // Reset form
    this.newImageUrl.set('');
    this.newImageFileName.set('');
    this.newImageStorageMode.set('FILE_SYSTEM');
  }

  /**
   * Removes an image from the gallery
   */
  removeImage(index: number): void {
    const images = this._images();
    const imageToRemove = images[index];

    // Prevent removing the last image or the only primary image without replacement
    if (images.length === 1) {
      // Could show a warning dialog here
      return;
    }

    const updatedImages = images.filter((_, i) => i !== index);

    // If we removed the primary image, make the first remaining image primary
    if (imageToRemove.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }

    this._images.set(updatedImages);
    this.imagesChange.emit(this._images());
  }

  /**
   * Sets an image as primary
   */
  setPrimary(index: number): void {
    const images = this._images().map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));

    this._images.set(images);
    this.imagesChange.emit(this._images());
  }

  /**
   * Validates URL format (basic)
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
