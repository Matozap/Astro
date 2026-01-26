import { OrderStatus } from '../models/order.model';
import { ShipmentStatus } from '../models/shipment.model';

/**
 * Chart theme colors following the application's dark theme palette.
 * These colors are designed to work well on dark backgrounds.
 */
export const CHART_COLORS = {
  // Primary palette
  PRIMARY: '#abc7ff',
  PRIMARY_LIGHT: 'rgba(171, 199, 255, 0.3)',
  PRIMARY_TRANSPARENT: 'rgba(171, 199, 255, 0.0)',

  // Success palette (green)
  SUCCESS: '#81c784',
  SUCCESS_LIGHT: 'rgba(129, 199, 132, 0.3)',
  SUCCESS_TRANSPARENT: 'rgba(129, 199, 132, 0.0)',

  // Warning palette (orange/amber)
  WARNING: '#ffb74d',
  WARNING_LIGHT: 'rgba(255, 183, 77, 0.3)',

  // Error palette (red)
  ERROR: '#e57373',
  ERROR_LIGHT: 'rgba(229, 115, 115, 0.3)',

  // Info palette (cyan)
  INFO: '#4fc3f7',
  INFO_LIGHT: 'rgba(79, 195, 247, 0.3)',

  // Secondary/Neutral palette
  SECONDARY: '#ba68c8',
  SECONDARY_LIGHT: 'rgba(186, 104, 200, 0.3)',

  // Neutral palette
  NEUTRAL: '#90a4ae',
  NEUTRAL_LIGHT: 'rgba(144, 164, 174, 0.3)',

  // Background colors
  BACKGROUND_DARK: '#25253a',
  BACKGROUND_TRANSPARENT: 'transparent',

  // Text colors
  TEXT_PRIMARY: '#e0e0e0',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.6)',

  // Border colors
  BORDER_LIGHT: 'rgba(255, 255, 255, 0.1)',
  BORDER_SUBTLE: 'rgba(255, 255, 255, 0.05)',
} as const;

/**
 * Tooltip configuration colors for ECharts.
 */
export const TOOLTIP_COLORS = {
  BACKGROUND: 'rgba(37, 37, 58, 0.95)',
  BORDER: CHART_COLORS.BORDER_LIGHT,
  TEXT: CHART_COLORS.TEXT_PRIMARY,
} as const;

/**
 * Order status color mapping for consistent styling across components.
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: CHART_COLORS.WARNING,
  CONFIRMED: CHART_COLORS.INFO,
  PROCESSING: CHART_COLORS.PRIMARY,
  SHIPPED: CHART_COLORS.SECONDARY,
  DELIVERED: CHART_COLORS.SUCCESS,
  CANCELLED: CHART_COLORS.ERROR,
};

/**
 * Order status icon mapping for Material Icons.
 */
export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  PENDING: 'schedule',
  CONFIRMED: 'check_circle',
  PROCESSING: 'autorenew',
  SHIPPED: 'local_shipping',
  DELIVERED: 'done_all',
  CANCELLED: 'cancel',
};

/**
 * Order status configuration combining color and icon.
 */
export const ORDER_STATUS_CONFIG: Record<OrderStatus, { color: string; icon: string }> = {
  PENDING: { color: ORDER_STATUS_COLORS.PENDING, icon: ORDER_STATUS_ICONS.PENDING },
  CONFIRMED: { color: ORDER_STATUS_COLORS.CONFIRMED, icon: ORDER_STATUS_ICONS.CONFIRMED },
  PROCESSING: { color: ORDER_STATUS_COLORS.PROCESSING, icon: ORDER_STATUS_ICONS.PROCESSING },
  SHIPPED: { color: ORDER_STATUS_COLORS.SHIPPED, icon: ORDER_STATUS_ICONS.SHIPPED },
  DELIVERED: { color: ORDER_STATUS_COLORS.DELIVERED, icon: ORDER_STATUS_ICONS.DELIVERED },
  CANCELLED: { color: ORDER_STATUS_COLORS.CANCELLED, icon: ORDER_STATUS_ICONS.CANCELLED },
};

/**
 * Shipment status color mapping for consistent styling across components.
 */
export const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  PENDING: CHART_COLORS.WARNING,
  SHIPPED: CHART_COLORS.INFO,
  IN_TRANSIT: CHART_COLORS.PRIMARY,
  OUT_FOR_DELIVERY: CHART_COLORS.SECONDARY,
  DELIVERED: CHART_COLORS.SUCCESS,
  DELAYED: CHART_COLORS.WARNING,
  FAILED_DELIVERY: CHART_COLORS.ERROR,
  RETURNED: CHART_COLORS.NEUTRAL,
};

/**
 * Shipment status icon mapping for Material Icons.
 */
export const SHIPMENT_STATUS_ICONS: Record<ShipmentStatus, string> = {
  PENDING: 'schedule',
  SHIPPED: 'inventory',
  IN_TRANSIT: 'local_shipping',
  OUT_FOR_DELIVERY: 'delivery_dining',
  DELIVERED: 'check_circle',
  DELAYED: 'warning',
  FAILED_DELIVERY: 'error',
  RETURNED: 'keyboard_return',
};

/**
 * Shipment status configuration combining color, icon, and label.
 */
export const SHIPMENT_STATUS_CONFIG: Record<
  ShipmentStatus,
  { color: string; icon: string; label: string }
> = {
  PENDING: {
    color: SHIPMENT_STATUS_COLORS.PENDING,
    icon: SHIPMENT_STATUS_ICONS.PENDING,
    label: 'Pending',
  },
  SHIPPED: {
    color: SHIPMENT_STATUS_COLORS.SHIPPED,
    icon: SHIPMENT_STATUS_ICONS.SHIPPED,
    label: 'Shipped',
  },
  IN_TRANSIT: {
    color: SHIPMENT_STATUS_COLORS.IN_TRANSIT,
    icon: SHIPMENT_STATUS_ICONS.IN_TRANSIT,
    label: 'In Transit',
  },
  OUT_FOR_DELIVERY: {
    color: SHIPMENT_STATUS_COLORS.OUT_FOR_DELIVERY,
    icon: SHIPMENT_STATUS_ICONS.OUT_FOR_DELIVERY,
    label: 'Out for Delivery',
  },
  DELIVERED: {
    color: SHIPMENT_STATUS_COLORS.DELIVERED,
    icon: SHIPMENT_STATUS_ICONS.DELIVERED,
    label: 'Delivered',
  },
  DELAYED: {
    color: SHIPMENT_STATUS_COLORS.DELAYED,
    icon: SHIPMENT_STATUS_ICONS.DELAYED,
    label: 'Delayed',
  },
  FAILED_DELIVERY: {
    color: SHIPMENT_STATUS_COLORS.FAILED_DELIVERY,
    icon: SHIPMENT_STATUS_ICONS.FAILED_DELIVERY,
    label: 'Failed Delivery',
  },
  RETURNED: {
    color: SHIPMENT_STATUS_COLORS.RETURNED,
    icon: SHIPMENT_STATUS_ICONS.RETURNED,
    label: 'Returned',
  },
};

/**
 * Get default fallback color.
 */
export const DEFAULT_STATUS_COLOR = CHART_COLORS.NEUTRAL;

/**
 * Get default fallback icon.
 */
export const DEFAULT_STATUS_ICON = 'help';
