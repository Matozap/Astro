import { gql } from 'apollo-angular';

export const GET_ORDERS = gql`
  query GetOrders(
    $skip: Int
    $take: Int
    $where: OrderFilterInput
    $order: [OrderSortInput!]
  ) {
    orders(skip: $skip, take: $take, where: $where, order: $order) {
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
      }
      totalCount
    }
  }
`;

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: UUID!) {
    order(id: $id) {
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
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      order {
        id
        status
        updatedAt
      }
      errors {
        ... on Error {
          message
        }
      }
    }
  }
`;
