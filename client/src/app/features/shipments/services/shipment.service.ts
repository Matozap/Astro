import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, catchError } from 'rxjs';
import { Apollo } from 'apollo-angular';
import {
  Shipment,
  ShipmentFilterInput,
  ShipmentSortInput,
  CreateShipmentInput,
  UpdateShipmentInput,
} from '../../../shared/models/shipment.model';
import { PaginatedResult, PaginationParams } from '../../../shared/models/table.model';
import { GET_SHIPMENTS, GET_SHIPMENT_BY_ID } from '../graphql/shipment.queries';
import { CREATE_SHIPMENT, UPDATE_SHIPMENT } from '../graphql/shipment.mutations';

/**
 * GraphQL connection type for HotChocolate cursor-based pagination
 */
interface ShipmentConnection {
  nodes: Shipment[];
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
export class ShipmentService {
  private readonly apollo = inject(Apollo);

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  // Store cursors for pagination navigation
  private cursors: Map<number, string> = new Map();

  /**
   * Retrieves paginated shipments from the GraphQL API
   * Uses HotChocolate cursor-based pagination
   * @param pagination - Pagination parameters (page, pageSize)
   * @param filters - Optional filter criteria
   * @param sort - Optional sort configuration
   */
  getShipments(
    pagination: PaginationParams,
    filters?: ShipmentFilterInput,
    sort?: ShipmentSortInput
  ): Observable<PaginatedResult<Shipment>> {
    this._loading.set(true);

    // Get cursor for the requested page (null for first page)
    const afterCursor = pagination.page > 0 ? this.cursors.get(pagination.page - 1) : null;

    return this.apollo
      .query<{ shipments: ShipmentConnection }>({
        query: GET_SHIPMENTS,
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
            throw new Error('No data returned from shipments query');
          }
          const { nodes, pageInfo, totalCount } = result.data.shipments;

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
   * Retrieves a single shipment by ID from the GraphQL API
   * @param id - The shipment UUID
   * @returns Observable with the shipment or null if not found
   */
  getShipmentById(id: string): Observable<Shipment | null> {
    this._loading.set(true);

    return this.apollo
      .query<{ shipments: ShipmentConnection }>({
        query: GET_SHIPMENT_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data) {
            throw new Error('No data returned from shipments query');
          }
          // Return the first node or null if not found
          return result.data.shipments.nodes[0] || null;
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }

  /**
   * T007: Creates a new shipment via GraphQL mutation
   * @param input - The shipment creation input
   * @returns Observable with the created shipment
   */
  createShipment(input: CreateShipmentInput): Observable<Shipment> {
    this._loading.set(true);

    return this.apollo
      .mutate<{ createShipment: { shipment: Shipment } }>({
        mutation: CREATE_SHIPMENT,
        variables: { command: input },
        refetchQueries: [{ query: GET_SHIPMENTS, variables: { first: 10 } }],
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data?.createShipment?.shipment) {
            throw new Error('No data returned from createShipment mutation');
          }
          return result.data.createShipment.shipment;
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }

  /**
   * T008: Updates an existing shipment via GraphQL mutation
   * @param input - The shipment update input
   * @returns Observable with the updated shipment
   */
  updateShipment(input: UpdateShipmentInput): Observable<Shipment> {
    this._loading.set(true);

    return this.apollo
      .mutate<{ updateShipment: { shipment: Shipment } }>({
        mutation: UPDATE_SHIPMENT,
        variables: { command: input },
      })
      .pipe(
        map((result) => {
          this._loading.set(false);
          if (!result.data?.updateShipment?.shipment) {
            throw new Error('No data returned from updateShipment mutation');
          }
          return result.data.updateShipment.shipment;
        }),
        catchError((error) => {
          this._loading.set(false);
          throw error;
        })
      );
  }
}
