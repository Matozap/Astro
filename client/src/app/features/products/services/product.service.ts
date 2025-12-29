import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Product, ProductFilterInput, ProductSortInput } from '../../../shared/models/product.model';
import { PaginatedResult, PaginationParams } from '../../../shared/models/table.model';

// Mock data for development
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'PRD-001',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: { amount: 149.99, currency: 'USD' },
    stockQuantity: 150,
    lowStockThreshold: 20,
    isActive: true,
    isLowStock: false,
    details: [{ id: '1', key: 'Brand', value: 'AudioPro' }],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin',
    modifiedBy: 'admin',
    images: [{ id: '1', url: '/assets/products/headphones.jpg', altText: 'Headphones', isPrimary: true, storageMode: 'Url' }],
  },
  {
    id: '2',
    sku: 'PRD-002',
    name: 'Smart Watch Pro',
    description: 'Feature-rich smartwatch with health tracking',
    price: { amount: 299.99, currency: 'USD' },
    stockQuantity: 75,
    lowStockThreshold: 20,
    isActive: true,
    isLowStock: false,
    details: [{ id: '2', key: 'Brand', value: 'TechTime' }],
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
    createdBy: 'admin',
    modifiedBy: 'admin',
    images: [],
  },
  {
    id: '3',
    sku: 'PRD-003',
    name: 'USB-C Charging Cable 2m',
    description: 'Durable braided USB-C cable for fast charging',
    price: { amount: 19.99, currency: 'USD' },
    stockQuantity: 500,
    lowStockThreshold: 50,
    isActive: true,
    isLowStock: false,
    details: [{ id: '3', key: 'Length', value: '2 meters' }],
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
    createdBy: 'admin',
    modifiedBy: 'admin',
    images: [],
  },
  {
    id: '4',
    sku: 'PRD-004',
    name: 'Laptop Stand Adjustable',
    description: 'Ergonomic aluminum laptop stand with adjustable height',
    price: { amount: 79.99, currency: 'USD' },
    stockQuantity: 0,
    lowStockThreshold: 10,
    isActive: false,
    isLowStock: true,
    details: [{ id: '4', key: 'Material', value: 'Aluminum' }],
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
    createdBy: 'admin',
    modifiedBy: 'admin',
    images: [],
  },
  {
    id: '5',
    sku: 'PRD-005',
    name: 'Mechanical Keyboard RGB',
    description: 'Gaming mechanical keyboard with RGB backlighting',
    price: { amount: 129.99, currency: 'USD' },
    stockQuantity: 25,
    lowStockThreshold: 30,
    isActive: true,
    isLowStock: true,
    details: [{ id: '5', key: 'Switch Type', value: 'Cherry MX Blue' }],
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
    createdBy: 'admin',
    modifiedBy: 'admin',
    images: [],
  },
  {
    id: '6',
    sku: 'PRD-006',
    name: 'Wireless Mouse Ergonomic',
    description: 'Comfortable ergonomic wireless mouse',
    price: { amount: 49.99, currency: 'USD' },
    stockQuantity: 200,
    lowStockThreshold: 25,
    isActive: true,
    isLowStock: false,
    details: [{ id: '6', key: 'DPI', value: '4000' }],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    createdBy: 'admin',
    modifiedBy: 'admin',
    images: [],
  },
  {
    id: '7',
    sku: 'PRD-007',
    name: 'Monitor 27" 4K',
    description: '27-inch 4K UHD monitor with HDR support',
    price: { amount: 449.99, currency: 'USD' },
    stockQuantity: 30,
    lowStockThreshold: 10,
    isActive: true,
    isLowStock: false,
    details: [{ id: '7', key: 'Resolution', value: '3840x2160' }],
    createdAt: '2024-01-09T10:00:00Z',
    updatedAt: '2024-01-09T10:00:00Z',
    createdBy: 'admin',
    modifiedBy: 'admin',
    images: [],
  },
  {
    id: '8',
    sku: 'PRD-008',
    name: 'Webcam HD 1080p',
    description: 'Full HD webcam with built-in microphone',
    price: { amount: 89.99, currency: 'USD' },
    stockQuantity: 85,
    lowStockThreshold: 15,
    isActive: true,
    isLowStock: false,
    details: [{ id: '8', key: 'Resolution', value: '1080p' }],
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
    createdBy: 'admin',
    modifiedBy: 'admin',
    images: [],
  },
];

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apollo = inject(Apollo);

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  getProducts(
    pagination: PaginationParams,
    filters?: ProductFilterInput,
    sort?: ProductSortInput
  ): Observable<PaginatedResult<Product>> {
    this._loading.set(true);

    // Mock implementation - TODO: Replace with GraphQL query
    return of(MOCK_PRODUCTS).pipe(
      delay(500),
      map((products) => {
        let filtered = [...products];

        // Apply search filter
        if (filters?.name?.contains) {
          const searchTerm = filters.name.contains.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(searchTerm) ||
              p.sku.toLowerCase().includes(searchTerm)
          );
        }

        // Apply active filter
        if (filters?.isActive?.eq !== undefined) {
          filtered = filtered.filter((p) => p.isActive === filters.isActive?.eq);
        }

        // Apply sorting
        if (sort) {
          const sortKey = Object.keys(sort)[0] as keyof Product;
          const sortDir = Object.values(sort)[0] as 'ASC' | 'DESC';
          filtered.sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal === undefined || bVal === undefined) return 0;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              return sortDir === 'ASC'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return sortDir === 'ASC' ? aVal - bVal : bVal - aVal;
            }
            return 0;
          });
        }

        const totalCount = filtered.length;
        const startIndex = pagination.page * pagination.pageSize;
        const paginated = filtered.slice(startIndex, startIndex + pagination.pageSize);

        this._loading.set(false);

        return {
          items: paginated,
          totalCount,
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPages: Math.ceil(totalCount / pagination.pageSize),
          hasNextPage: startIndex + pagination.pageSize < totalCount,
          hasPreviousPage: pagination.page > 0,
        };
      })
    );
  }

  getProductById(id: string): Observable<Product | null> {
    this._loading.set(true);

    return of(MOCK_PRODUCTS.find((p) => p.id === id) || null).pipe(
      delay(300),
      map((product) => {
        this._loading.set(false);
        return product;
      })
    );
  }
}
