import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, catchError } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Product, ProductFilterInput, ProductSortInput, ProductImage } from '../../../shared/models/product.model';
import { PaginatedResult, PaginationParams } from '../../../shared/models/table.model';
import { CREATE_PRODUCT, ADD_PRODUCT_IMAGE, UPDATE_PRODUCT, DELETE_PRODUCT, REMOVE_PRODUCT_IMAGE } from '../graphql/product.mutations';
import { GET_PRODUCTS, GET_PRODUCT_BY_ID } from '../graphql/product.queries';

/**
 * GraphQL connection type for HotChocolate cursor-based pagination
 */
interface ProductConnection {
  nodes: Product[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apollo = inject(Apollo);

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  // Store cursors for pagination navigation
  private cursors: Map<number, string> = new Map();

  /**
   * Retrieves paginated products from the GraphQL API
   * Uses HotChocolate cursor-based pagination
   * @param pagination - Pagination parameters (page, pageSize)
   * @param filters - Optional filter criteria
   * @param sort - Optional sort configuration
   */
  getProducts(
    pagination: PaginationParams,
    filters?: ProductFilterInput,
    sort?: ProductSortInput
  ): Observable<PaginatedResult<Product>> {
    this._loading.set(true);

    // Get cursor for the requested page (null for first page)
    const afterCursor = pagination.page > 0 ? this.cursors.get(pagination.page - 1) : null;

    return this.apollo
      .query<{ products: ProductConnection }>({
        query: GET_PRODUCTS,
        variables: {
          first: pagination.pageSize,
          after: afterCursor || null,
          where: filters || null,
          order: sort ? [sort] : null,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data || !result.data.products) {
            // Return empty result when no data
            return {
              items: [],
              totalCount: 0,
              page: pagination.page,
              pageSize: pagination.pageSize,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            };
          }
          const { nodes, pageInfo, totalCount } = result.data.products;

          // Store the end cursor for next page navigation
          if (pageInfo?.endCursor) {
            this.cursors.set(pagination.page, pageInfo.endCursor);
          }

          return {
            items: nodes || [],
            totalCount: totalCount || 0,
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalPages: Math.ceil((totalCount || 0) / pagination.pageSize),
            hasNextPage: pageInfo?.hasNextPage || false,
            hasPreviousPage: pageInfo?.hasPreviousPage || false,
          };
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }

  /**
   * Retrieves a single product by ID from the GraphQL API
   * @param id - The product UUID
   * @returns Observable with the product or null if not found
   */
  getProductById(id: string): Observable<Product | null> {
    this._loading.set(true);

    return this.apollo
      .query<{ products: ProductConnection }>({
        query: GET_PRODUCT_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data || !result.data.products) {
            return null;
          }
          // Return the first node or null if not found
          return result.data.products.nodes?.[0] || null;
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }

  /**
   * Creates a new product
   */
  createProduct(input: CreateProductInput): Observable<Product> {
    this._loading.set(true);

    return this.apollo
      .mutate<{ createProduct: { product: Product } }>({
        mutation: CREATE_PRODUCT,
        variables: { command: input },
        refetchQueries: [{ query: GET_PRODUCTS }],
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data?.createProduct?.product) {
            throw new Error('No data returned from createProduct mutation');
          }
          return result.data.createProduct.product;
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }

  /**
   * Updates an existing product
   */
  updateProduct(input: UpdateProductInput): Observable<Product> {
    this._loading.set(true);

    return this.apollo
      .mutate<{ updateProduct: { product: Product } }>({
        mutation: UPDATE_PRODUCT,
        variables: { command: input },
        refetchQueries: [{ query: GET_PRODUCTS }],
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data?.updateProduct?.product) {
            throw new Error('No data returned from updateProduct mutation');
          }
          return result.data.updateProduct.product;
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }

  /**
   * Deletes a product
   * Note: Will throw ProductInUseException if product is referenced in orders
   */
  deleteProduct(id: string): Observable<void> {
    this._loading.set(true);

    interface DeleteProductError {
      message: string;
      productId: string;
    }

    interface DeleteProductResponse {
      errors?: DeleteProductError[];
      deleteResponse?: { objectDeleted: string; executedAt: string } | null;
    }

    return this.apollo
      .mutate<{ deleteProduct: DeleteProductResponse }>({
        mutation: DELETE_PRODUCT,
        variables: { command: { id } },
      })
      .pipe(
        map((result) => {
          this._loading.set(false);

          // Check for errors in the response payload
          if (result.data?.deleteProduct?.errors && result.data.deleteProduct.errors.length > 0) {
            const error = result.data.deleteProduct.errors[0];
            // Create an error object that matches the expected GraphQL error structure
            throw {
              message: error.message,
              graphQLErrors: [{
                message: error.message,
                extensions: { productId: error.productId }
              }]
            };
          }
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }

  /**
   * Adds an image to a product
   */
  addProductImage(input: AddProductImageInput): Observable<ProductImage> {
    this._loading.set(true);

    return this.apollo
      .mutate<{ addProductImage: { productImage: ProductImage } }>({
        mutation: ADD_PRODUCT_IMAGE,
        variables: { command: input },
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data?.addProductImage?.productImage) {
            throw new Error('No data returned from addProductImage mutation');
          }
          return result.data.addProductImage.productImage;
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }

  /**
   * Removes an image from a product
   */
  removeProductImage(productId: string, imageId: string): Observable<void> {
    this._loading.set(true);

    interface RemoveImageError {
      message: string;
      productId: string;
    }

    interface RemoveImageResponse {
      errors?: RemoveImageError[];
      deleteResponse?: { objectDeleted: string; executedAt: string } | null;
    }

    return this.apollo
      .mutate<{ removeProductImage: RemoveImageResponse }>({
        mutation: REMOVE_PRODUCT_IMAGE,
        variables: { command: { productId, imageId } },
      })
      .pipe(
        map((result) => {
          this._loading.set(false);

          // Check for errors in the response payload
          if (result.data?.removeProductImage?.errors && result.data.removeProductImage.errors.length > 0) {
            const error = result.data.removeProductImage.errors[0];
            throw {
              message: error.message,
              graphQLErrors: [{
                message: error.message,
                extensions: { productId: error.productId }
              }]
            };
          }
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }
}

// Type definitions for mutation inputs
export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdBy: string;
  details?: Array<{ key: string; value: string }>;
}

export interface UpdateProductInput {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  modifiedBy: string;
  details?: Array<{ id?: string; key: string; value: string }>;
}

export interface AddProductImageInput {
  productId: string;
  fileName: string;
  url: string;
  storageMode: 'FILE_SYSTEM' | 'AZURE' | 'AWS';
  isPrimary: boolean;
  createdBy: string;
}
