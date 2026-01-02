import { Money, StringFilterInput, DecimalFilterInput } from './common.model';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: Money;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isLowStock: boolean;
  details: ProductDetail[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string;
}

export interface ProductDetail {
  id: string;
  key: string;
  value: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  fileName: string;
  url: string;
  altText: string | null;
  storageMode: 'FILE_SYSTEM' | 'AZURE' | 'AWS';
  isPrimary: boolean;
  createdAt: string;
  createdBy: string;
}

// GraphQL input types
export interface ProductFilterInput {
  name?: StringFilterInput;
  sku?: StringFilterInput;
  isActive?: { eq?: boolean };
  isLowStock?: { eq?: boolean };
  price?: DecimalFilterInput;
}

export interface ProductSortInput {
  name?: 'ASC' | 'DESC';
  sku?: 'ASC' | 'DESC';
  price?: 'ASC' | 'DESC';
  stockQuantity?: 'ASC' | 'DESC';
  createdAt?: 'ASC' | 'DESC';
  updatedAt?: 'ASC' | 'DESC';
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  details?: { key: string; value: string }[];
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  isActive?: boolean;
  details?: { key: string; value: string }[];
}

export interface UpdateStockInput {
  id: string;
  quantity: number;
  lowStockThreshold?: number;
}
