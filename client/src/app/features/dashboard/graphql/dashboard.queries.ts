import { gql } from 'apollo-angular';

/**
 * Query to get dashboard metrics by fetching all entity counts and aggregations.
 * This query fetches data from multiple entities to compute dashboard metrics.
 */
export const GET_DASHBOARD_METRICS = gql`
  query GetDashboardMetrics {
    # Orders metrics
    orders(first: 1) {
      totalCount
    }
    pendingOrders: orders(where: { status: { eq: PENDING } }, first: 1) {
      totalCount
    }
    processingOrders: orders(where: { status: { eq: PROCESSING } }, first: 1) {
      totalCount
    }
    completedOrders: orders(where: { status: { eq: DELIVERED } }, first: 1) {
      totalCount
    }
    cancelledOrders: orders(where: { status: { eq: CANCELLED } }, first: 1) {
      totalCount
    }

    # Products metrics
    products(first: 1) {
      totalCount
    }
    activeProducts: products(where: { isActive: { eq: true } }, first: 1) {
      totalCount
    }

    # Payments metrics
    payments(first: 1) {
      totalCount
    }
    pendingPayments: payments(where: { status: { eq: PENDING } }, first: 1) {
      totalCount
    }
    successfulPayments: payments(where: { status: { eq: SUCCESSFUL } }, first: 1) {
      totalCount
    }
    failedPayments: payments(where: { status: { eq: FAILED } }, first: 1) {
      totalCount
    }

    # Shipments metrics
    shipments(first: 1) {
      totalCount
    }
    pendingShipments: shipments(where: { status: { eq: PENDING } }, first: 1) {
      totalCount
    }
    inTransitShipments: shipments(where: { status: { eq: IN_TRANSIT } }, first: 1) {
      totalCount
    }
    deliveredShipments: shipments(where: { status: { eq: DELIVERED } }, first: 1) {
      totalCount
    }
  }
`;

/**
 * Query to get revenue data for charts.
 * Fetches orders to calculate revenue and order counts.
 */
export const GET_REVENUE_DATA = gql`
  query GetRevenueData {
    orders(first: 100, order: [{ createdAt: ASC }]) {
      nodes {
        id
        totalAmount {
          amount
          currency
        }
        createdAt
      }
      totalCount
    }
  }
`;

/**
 * Query to get order status distribution for pie chart.
 */
export const GET_ORDER_STATUS_DISTRIBUTION = gql`
  query GetOrderStatusDistribution {
    pendingOrders: orders(where: { status: { eq: PENDING } }, first: 1) {
      totalCount
    }
    confirmedOrders: orders(where: { status: { eq: CONFIRMED } }, first: 1) {
      totalCount
    }
    processingOrders: orders(where: { status: { eq: PROCESSING } }, first: 1) {
      totalCount
    }
    shippedOrders: orders(where: { status: { eq: SHIPPED } }, first: 1) {
      totalCount
    }
    deliveredOrders: orders(where: { status: { eq: DELIVERED } }, first: 1) {
      totalCount
    }
    cancelledOrders: orders(where: { status: { eq: CANCELLED } }, first: 1) {
      totalCount
    }
  }
`;

/**
 * Query to get recent orders for the dashboard table.
 */
export const GET_RECENT_ORDERS = gql`
  query GetRecentOrders {
    orders(first: 5, order: [{ createdAt: DESC }]) {
      nodes {
        id
        orderNumber
        customerName
        status
        totalAmount {
          amount
          currency
        }
        createdAt
      }
    }
  }
`;

/**
 * Query to get shipment status distribution for the status widget.
 */
export const GET_SHIPMENT_STATUS_DISTRIBUTION = gql`
  query GetShipmentStatusDistribution {
    pendingShipments: shipments(where: { status: { eq: PENDING } }, first: 1) {
      totalCount
    }
    shippedShipments: shipments(where: { status: { eq: SHIPPED } }, first: 1) {
      totalCount
    }
    inTransitShipments: shipments(where: { status: { eq: IN_TRANSIT } }, first: 1) {
      totalCount
    }
    outForDeliveryShipments: shipments(where: { status: { eq: OUT_FOR_DELIVERY } }, first: 1) {
      totalCount
    }
    deliveredShipments: shipments(where: { status: { eq: DELIVERED } }, first: 1) {
      totalCount
    }
  }
`;

/**
 * Query to get total revenue from all orders.
 */
export const GET_TOTAL_REVENUE = gql`
  query GetTotalRevenue {
    orders {
      nodes {
        totalAmount {
          amount
          currency
        }
      }
    }
  }
`;
