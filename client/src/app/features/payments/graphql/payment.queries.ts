import { gql } from 'apollo-angular';

export const GET_PAYMENTS = gql`
  query GetPayments(
    $skip: Int
    $take: Int
    $where: PaymentFilterInput
    $order: [PaymentSortInput!]
  ) {
    payments(skip: $skip, take: $take, where: $where, order: $order) {
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
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const GET_PAYMENT_BY_ID = gql`
  query GetPaymentById($id: UUID!) {
    payment(id: $id) {
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
`;
