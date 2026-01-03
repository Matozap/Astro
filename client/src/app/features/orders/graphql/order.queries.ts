import { gql } from 'apollo-angular';

export const GET_ORDERS = gql`
  query GetOrders(
    $first: Int
    $after: String
    $where: OrderFilterInput
    $order: [OrderSortInput!]
  ) {
    orders(first: $first, after: $after, where: $where, order: $order) {
      nodes {
        id
        orderNumber
        customerName
        customerEmail
        status
        totalAmount {
          amount
          currency
        }
        itemCount
        createdAt
        updatedAt
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

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: UUID!) {
    orders(where: { id: { eq: $id } }) {
      nodes {
        id
        orderNumber
        customerName
        customerEmail
        shippingAddress {
          street
          city
          state
          postalCode
          country
        }
        status
        totalAmount {
          amount
          currency
        }
        notes
        details {
          id
          productId
          productName
          productSku
          quantity
          unitPrice {
            amount
            currency
          }
          lineTotal {
            amount
            currency
          }
        }
        itemCount
        createdAt
        updatedAt
        createdBy
        modifiedBy
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($command: UpdateOrderStatusCommandInput!) {
    updateOrderStatus(command: $command) {
      id
      orderNumber
      status
      updatedAt
      modifiedBy
    }
  }
`;
