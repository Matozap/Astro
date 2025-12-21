namespace Astro.Domain.Shipments.Enums;

/// <summary>
/// Shipment status with valid state machine transitions.
/// </summary>
public enum ShipmentStatus
{
    /// <summary>
    /// Shipment created, awaiting carrier pickup.
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Carrier has collected the package.
    /// </summary>
    Shipped = 1,

    /// <summary>
    /// Package is in transit to destination.
    /// </summary>
    InTransit = 2,

    /// <summary>
    /// Package is out for delivery today.
    /// </summary>
    OutForDelivery = 3,

    /// <summary>
    /// Successfully delivered to customer.
    /// </summary>
    Delivered = 4,

    /// <summary>
    /// Shipment has been delayed.
    /// </summary>
    Delayed = 5,

    /// <summary>
    /// Delivery attempt failed.
    /// </summary>
    FailedDelivery = 6,

    /// <summary>
    /// Package returned to sender.
    /// </summary>
    Returned = 7
}

/// <summary>
/// Extension methods for ShipmentStatus state machine validation.
/// </summary>
public static class ShipmentStatusExtensions
{
    /// <summary>
    /// Checks if a transition from current status to new status is valid.
    /// </summary>
    public static bool CanTransitionTo(this ShipmentStatus currentStatus, ShipmentStatus newStatus)
    {
        return currentStatus switch
        {
            ShipmentStatus.Pending => newStatus == ShipmentStatus.Shipped,
            ShipmentStatus.Shipped => newStatus is ShipmentStatus.InTransit or ShipmentStatus.Delayed or ShipmentStatus.FailedDelivery,
            ShipmentStatus.InTransit => newStatus is ShipmentStatus.OutForDelivery or ShipmentStatus.Delayed or ShipmentStatus.FailedDelivery,
            ShipmentStatus.OutForDelivery => newStatus is ShipmentStatus.Delivered or ShipmentStatus.FailedDelivery or ShipmentStatus.Delayed,
            ShipmentStatus.Delayed => newStatus is ShipmentStatus.InTransit or ShipmentStatus.OutForDelivery or ShipmentStatus.FailedDelivery,
            ShipmentStatus.FailedDelivery => newStatus is ShipmentStatus.Returned or ShipmentStatus.InTransit,
            ShipmentStatus.Delivered => false, // Terminal state
            ShipmentStatus.Returned => false, // Terminal state
            _ => false
        };
    }

    /// <summary>
    /// Checks if the status is a terminal state.
    /// </summary>
    public static bool IsTerminal(this ShipmentStatus status)
    {
        return status is ShipmentStatus.Delivered or ShipmentStatus.Returned;
    }

    /// <summary>
    /// Gets the valid transitions from the current status.
    /// </summary>
    public static ShipmentStatus[] GetValidTransitions(this ShipmentStatus currentStatus)
    {
        return Enum.GetValues<ShipmentStatus>()
            .Where(s => currentStatus.CanTransitionTo(s))
            .ToArray();
    }
}
