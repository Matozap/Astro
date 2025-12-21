using Astro.Domain.Shared;
using Astro.Domain.Shipments.Enums;

namespace Astro.Domain.Shipments.Events;

/// <summary>
/// Domain event raised when a shipment's status changes.
/// </summary>
public sealed record ShipmentStatusChangedEvent(
    Guid ShipmentId,
    ShipmentStatus OldStatus,
    ShipmentStatus NewStatus,
    string? Location,
    string? Notes) : DomainEventBase;
