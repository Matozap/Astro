import { gql } from 'apollo-angular';

export const GET_SHIPMENTS = gql`
  query GetShipments(
    $skip: Int
    $take: Int
    $where: ShipmentFilterInput
    $order: [ShipmentSortInput!]
  ) {
    shipments(skip: $skip, take: $take, where: $where, order: $order) {
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
      }
      totalCount
    }
  }
`;

export const GET_SHIPMENT_BY_ID = gql`
  query GetShipmentById($id: UUID!) {
    shipment(id: $id) {
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
`;
