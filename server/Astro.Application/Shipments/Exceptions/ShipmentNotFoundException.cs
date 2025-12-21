namespace Astro.Application.Shipments.Exceptions;

/// <summary>
/// Exception thrown when a shipment cannot be found.
/// </summary>
public class ShipmentNotFoundException : Exception
{
    public Guid ShipmentId { get; }
    public string? TrackingNumber { get; }

    public ShipmentNotFoundException(Guid shipmentId)
        : base($"Shipment with ID '{shipmentId}' was not found.")
    {
        ShipmentId = shipmentId;
    }

    public ShipmentNotFoundException(string trackingNumber)
        : base($"Shipment with tracking number '{trackingNumber}' was not found.")
    {
        TrackingNumber = trackingNumber;
    }
}
