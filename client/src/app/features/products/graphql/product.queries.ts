import { gql } from 'apollo-angular';

export const GET_PRODUCTS = gql`
  query GetProducts(
    $first: Int
    $after: String
    $where: ProductFilterInput
    $order: [ProductSortInput!]
  ) {
    products(first: $first, after: $after, where: $where, order: $order) {
      nodes {
        id
        sku
        name
        description
        price {
          amount
          currency
        }
        stockQuantity
        isActive
        createdAt
        updatedAt
        images {
          id
          url
          isPrimary
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: UUID!) {
    productById(id: $id) {
      id
      sku
      name
      description
      price {
        amount
        currency
      }
      stockQuantity
      isActive
      createdAt
      updatedAt
      createdBy
      modifiedBy
      images {
        id
        url
        altText
        isPrimary
      }
    }
  }
`;
