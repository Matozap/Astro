// Common value objects shared across entities

export interface Money {
  amount: number;
  currency: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Weight {
  value: number;
  unit: 'kg' | 'lb';
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

// Generic filter types for GraphQL queries
export interface StringFilterInput {
  eq?: string;
  neq?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  in?: string[];
}

export interface DecimalFilterInput {
  eq?: number;
  neq?: number;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
}

export interface DateTimeFilterInput {
  eq?: string;
  neq?: string;
  gt?: string;
  gte?: string;
  lt?: string;
  lte?: string;
}
