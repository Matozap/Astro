namespace Astro.Domain.Orders.Enums;

/// <summary>
/// Order status with valid state machine transitions.
/// </summary>
public enum OrderStatus
{
    /// <summary>
    /// Order has been placed but not yet confirmed.
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Order has been confirmed and is awaiting processing.
    /// </summary>
    Confirmed = 1,

    /// <summary>
    /// Order is being processed/prepared.
    /// </summary>
    Processing = 2,

    /// <summary>
    /// Order has been shipped.
    /// </summary>
    Shipped = 3,

    /// <summary>
    /// Order has been delivered to customer.
    /// </summary>
    Delivered = 4,

    /// <summary>
    /// Order has been cancelled.
    /// </summary>
    Cancelled = 5
}

/// <summary>
/// Extension methods for OrderStatus state machine validation.
/// </summary>
public static class OrderStatusExtensions
{
    /// <summary>
    /// Checks if a transition from current status to new status is valid.
    /// </summary>
    public static bool CanTransitionTo(this OrderStatus currentStatus, OrderStatus newStatus)
    {
        return currentStatus switch
        {
            OrderStatus.Pending => newStatus is OrderStatus.Confirmed or OrderStatus.Cancelled,
            OrderStatus.Confirmed => newStatus is OrderStatus.Processing or OrderStatus.Cancelled,
            OrderStatus.Processing => newStatus is OrderStatus.Shipped or OrderStatus.Cancelled,
            OrderStatus.Shipped => newStatus is OrderStatus.Delivered,
            OrderStatus.Delivered => false, // Terminal state
            OrderStatus.Cancelled => false, // Terminal state
            _ => false
        };
    }

    /// <summary>
    /// Checks if the status is a terminal state.
    /// </summary>
    public static bool IsTerminal(this OrderStatus status)
    {
        return status is OrderStatus.Delivered or OrderStatus.Cancelled;
    }
}
