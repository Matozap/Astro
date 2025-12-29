export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type FilterOperator = 'eq' | 'neq' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';

export interface FilterParams {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableState {
  pagination: PaginationParams;
  filters: FilterParams[];
  sort: SortParams | null;
  searchTerm: string;
}

// Default pagination values
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

// Initial table state
export const INITIAL_TABLE_STATE: TableState = {
  pagination: {
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  filters: [],
  sort: null,
  searchTerm: '',
};

// Helper to convert TableState to GraphQL variables
export function tableStateToGraphQLVariables(state: TableState): {
  first?: number;
  after?: string;
  where?: Record<string, unknown>;
  order?: Record<string, string>[];
} {
  const variables: {
    first?: number;
    after?: string;
    where?: Record<string, unknown>;
    order?: Record<string, string>[];
  } = {};

  // Pagination
  if (state.pagination.pageSize > 0) {
    variables.first = state.pagination.pageSize;
  }

  // Sorting
  if (state.sort) {
    variables.order = [
      { [state.sort.field]: state.sort.direction.toUpperCase() },
    ];
  }

  // Filters
  if (state.filters.length > 0 || state.searchTerm) {
    const where: Record<string, unknown> = {};

    state.filters.forEach((filter) => {
      where[filter.field] = { [filter.operator]: filter.value };
    });

    if (state.searchTerm) {
      // Generic search implementation - adjust based on entity
      where['name'] = { contains: state.searchTerm };
    }

    variables.where = where;
  }

  return variables;
}
