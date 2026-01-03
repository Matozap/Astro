import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, catchError } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Order, OrderFilterInput, OrderSortInput, OrderStatus } from '../../../shared/models/order.model';
import { PaginatedResult, PaginationParams } from '../../../shared/models/table.model';
import { GET_ORDERS, GET_ORDER_BY_ID, UPDATE_ORDER_STATUS } from '../graphql/order.queries';

/**
 * GraphQL connection type for HotChocolate cursor-based pagination
 */
interface OrderConnection {
  nodes: Order[];
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
export class OrderService {
  private readonly apollo = inject(Apollo);

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  // Store cursors for pagination navigation
  private cursors: Map<number, string> = new Map();

  /**
   * Retrieves paginated orders from the GraphQL API
   * Uses HotChocolate cursor-based pagination
   * @param pagination - Pagination parameters (page, pageSize)
   * @param filters - Optional filter criteria
   * @param sort - Optional sort configuration
   */
  getOrders(
    pagination: PaginationParams,
    filters?: OrderFilterInput,
    sort?: OrderSortInput
  ): Observable<PaginatedResult<Order>> {
    this._loading.set(true);

    // Get cursor for the requested page (null for first page)
    const afterCursor = pagination.page > 0 ? this.cursors.get(pagination.page - 1) : null;

    return this.apollo
      .query<{ orders: OrderConnection }>({
        query: GET_ORDERS,
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
          if (!result.data) {
            throw new Error('No data returned from orders query');
          }
          const { nodes, pageInfo, totalCount } = result.data.orders;

          // Store the end cursor for next page navigation
          if (pageInfo.endCursor) {
            this.cursors.set(pagination.page, pageInfo.endCursor);
          }

          return {
            items: nodes,
            totalCount,
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalPages: Math.ceil(totalCount / pagination.pageSize),
            hasNextPage: pageInfo.hasNextPage,
            hasPreviousPage: pageInfo.hasPreviousPage,
          };
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }

  /**
   * Retrieves a single order by ID from the GraphQL API
   * @param id - The order UUID
   * @returns Observable with the order or null if not found
   */
  getOrderById(id: string): Observable<Order | null> {
    this._loading.set(true);

    return this.apollo
      .query<{ orders: OrderConnection }>({
        query: GET_ORDER_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data) {
            throw new Error('No data returned from orders query');
          }
          // Return the first node or null if not found
          return result.data.orders.nodes[0] || null;
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }

  /**
   * Updates an order's status
   * @param orderId - The order UUID
   * @param newStatus - The new order status
   * @param modifiedBy - Username of the person making the change
   * @returns Observable with the updated order or null if not found
   */
  updateOrderStatus(orderId: string, newStatus: OrderStatus, modifiedBy: string): Observable<Order | null> {
    this._loading.set(true);

    return this.apollo
      .mutate<{ updateOrderStatus: Order }>({
        mutation: UPDATE_ORDER_STATUS,
        variables: {
          command: {
            orderId,
            newStatus,
            modifiedBy,
          },
        },
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data?.updateOrderStatus) {
            throw new Error('No data returned from updateOrderStatus mutation');
          }
          return result.data.updateOrderStatus;
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }
}
