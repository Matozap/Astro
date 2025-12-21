using Astro.Domain.Shipments.Enums;

namespace Astro.Application.Shipments.Exceptions;

/// <summary>
/// Exception thrown when an invalid shipment status transition is attempted.
/// </summary>
public class InvalidShipmentStatusTransitionException : Exception
{
    public ShipmentStatus CurrentStatus { get; }
    public ShipmentStatus AttemptedStatus { get; }

    public InvalidShipmentStatusTransitionException(ShipmentStatus currentStatus, ShipmentStatus attemptedStatus)
        : base($"Cannot transition shipment from '{currentStatus}' to '{attemptedStatus}'.")
    {
        CurrentStatus = currentStatus;
        AttemptedStatus = attemptedStatus;
    }
}
