import { gql } from 'apollo-angular';

/**
 * Mutation to create a new payment for an order.
 * HotChocolate mutation conventions wrap result in createPayment payload.
 */
export const CREATE_PAYMENT = gql`
  mutation CreatePayment($command: CreatePaymentCommandInput!) {
    createPayment(input: { command: $command }) {
      payment {
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
          totalAmount {
            amount
            currency
          }
        }
      }
    }
  }
`;

/**
 * Mutation to update the status of an existing payment.
 * HotChocolate mutation conventions wrap result in updatePaymentStatus payload.
 */
export const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdatePaymentStatus($command: UpdatePaymentStatusCommandInput!) {
    updatePaymentStatus(input: { command: $command }) {
      payment {
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
      }
    }
  }
`;
