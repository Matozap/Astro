using Astro.Domain.Shared;

namespace Astro.Domain.Shipments.Events;

/// <summary>
/// Domain event raised when a shipment is successfully delivered.
/// </summary>
public sealed record ShipmentDeliveredEvent(
    Guid ShipmentId,
    Guid OrderId,
    string TrackingNumber,
    DateTimeOffset DeliveredAt) : DomainEventBase;
