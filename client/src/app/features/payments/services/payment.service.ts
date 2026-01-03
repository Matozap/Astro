import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, catchError } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Payment, PaymentFilterInput, PaymentSortInput } from '../../../shared/models/payment.model';
import { PaginatedResult, PaginationParams } from '../../../shared/models/table.model';
import { GET_PAYMENTS, GET_PAYMENT_BY_ID } from '../graphql/payment.queries';

/**
 * GraphQL connection type for HotChocolate cursor-based pagination
 */
interface PaymentConnection {
  nodes: Payment[];
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
export class PaymentService {
  private readonly apollo = inject(Apollo);

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  // Store cursors for pagination navigation
  private cursors: Map<number, string> = new Map();

  /**
   * Retrieves paginated payments from the GraphQL API
   * Uses HotChocolate cursor-based pagination
   * @param pagination - Pagination parameters (page, pageSize)
   * @param filters - Optional filter criteria
   * @param sort - Optional sort configuration
   */
  getPayments(
    pagination: PaginationParams,
    filters?: PaymentFilterInput,
    sort?: PaymentSortInput
  ): Observable<PaginatedResult<Payment>> {
    this._loading.set(true);

    // Get cursor for the requested page (null for first page)
    const afterCursor = pagination.page > 0 ? this.cursors.get(pagination.page - 1) : null;

    return this.apollo
      .query<{ payments: PaymentConnection }>({
        query: GET_PAYMENTS,
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
            throw new Error('No data returned from payments query');
          }
          const { nodes, pageInfo, totalCount } = result.data.payments;

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
   * Retrieves a single payment by ID from the GraphQL API
   * @param id - The payment UUID
   * @returns Observable with the payment or null if not found
   */
  getPaymentById(id: string): Observable<Payment | null> {
    this._loading.set(true);

    return this.apollo
      .query<{ payments: PaymentConnection }>({
        query: GET_PAYMENT_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data) {
            throw new Error('No data returned from payments query');
          }
          // Return the first node or null if not found
          return result.data.payments.nodes[0] || null;
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }
}
