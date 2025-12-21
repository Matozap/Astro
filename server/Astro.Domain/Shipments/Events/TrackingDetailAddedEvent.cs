using Astro.Domain.Shared;
using Astro.Domain.Shipments.Enums;

namespace Astro.Domain.Shipments.Events;

/// <summary>
/// Domain event raised when a tracking detail is added to a shipment.
/// </summary>
public sealed record TrackingDetailAddedEvent(
    Guid ShipmentId,
    Guid TrackingDetailId,
    ShipmentStatus Status,
    string? Location,
    string? Notes) : DomainEventBase;
