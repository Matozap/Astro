import { gql } from 'apollo-angular';

export const GET_SHIPMENTS = gql`
  query GetShipments(
    $first: Int
    $after: String
    $where: ShipmentFilterInput
    $order: [ShipmentSortInput!]
  ) {
    shipments(first: $first, after: $after, where: $where, order: $order) {
      nodes {
        id
        orderId
        trackingNumber
        carrier
        status
        destinationAddress {
          city
          state
          country
        }
        shippingCost {
          amount
          currency
        }
        estimatedDeliveryDate
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

export const GET_SHIPMENT_BY_ID = gql`
  query GetShipmentById($id: UUID!) {
    shipments(where: { id: { eq: $id } }) {
      nodes {
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
          description
        }
        items {
          id
          productId
          productName
          quantity
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
