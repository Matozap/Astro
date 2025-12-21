using Astro.Domain.Shared;

namespace Astro.Domain.Shipments.Events;

/// <summary>
/// Domain event raised when a new shipment is created.
/// </summary>
public sealed record ShipmentCreatedEvent(
    Guid ShipmentId,
    Guid OrderId,
    string TrackingNumber,
    string Carrier) : DomainEventBase;
