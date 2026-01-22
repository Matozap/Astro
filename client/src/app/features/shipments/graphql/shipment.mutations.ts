import { gql } from 'apollo-angular';

export const CREATE_SHIPMENT = gql`
  mutation CreateShipment($command: CreateShipmentCommandInput!) {
    createShipment(input: { command: $command }) {
      shipment {
        id
        orderId
        trackingNumber
        carrier
        status
        originAddress {
          street
          city
          state
          postalCode
          country
        }
        destinationAddress {
          street
          city
          state
          postalCode
          country
        }
        weight {
          value
          unit
        }
        dimensions {
          length
          width
          height
          unit
        }
        shippingCost {
          amount
          currency
        }
        estimatedDeliveryDate
        items {
          id
          productId
          productName
          quantity
        }
        itemCount
        createdAt
        createdBy
      }
    }
  }
`;

export const UPDATE_SHIPMENT = gql`
  mutation UpdateShipment($command: UpdateShipmentCommandInput!) {
    updateShipment(input: { command: $command }) {
      shipment {
        id
        orderId
        trackingNumber
        carrier
        status
        originAddress {
          street
          city
          state
          postalCode
          country
        }
        destinationAddress {
          street
          city
          state
          postalCode
          country
        }
        weight {
          value
          unit
        }
        dimensions {
          length
          width
          height
          unit
        }
        shippingCost {
          amount
          currency
        }
        estimatedDeliveryDate
        actualDeliveryDate
        trackingDetails {
          id
          timestamp
          location
          status
          notes
        }
        items {
          id
          productId
          productName
          quantity
        }
        itemCount
        updatedAt
        modifiedBy
      }
    }
  }
`;
