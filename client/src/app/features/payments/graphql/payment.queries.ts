import { gql } from 'apollo-angular';

export const GET_PAYMENTS = gql`
  query GetPayments(
    $first: Int
    $after: String
    $where: PaymentFilterInput
    $order: [PaymentSortInput!]
  ) {
    payments(first: $first, after: $after, where: $where, order: $order) {
      nodes {
        id
        orderId
        status
        amount {
          amount
          currency
        }
        paymentMethod
        transactionId
        createdAt
        updatedAt
        order {
          orderNumber
          customerName
          totalAmount {
            amount
            currency
          }
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

export const GET_PAYMENT_BY_ID = gql`
  query GetPaymentById($id: UUID!) {
    payments(where: { id: { eq: $id } }) {
      nodes {
        id
        orderId
        status
        amount {
          amount
          currency
        }
        paymentMethod
        transactionId
        createdAt
        updatedAt
        order {
          id
          orderNumber
          customerName
          customerEmail
          totalAmount {
            amount
            currency
          }
          status
        }
      }
    }
  }
`;
