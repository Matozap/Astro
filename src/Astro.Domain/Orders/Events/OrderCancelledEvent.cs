using Astro.Domain.Shared;

namespace Astro.Domain.Orders.Events;

/// <summary>
/// Domain event raised when an order is cancelled.
/// </summary>
public sealed record OrderCancelledEvent(
    Guid OrderId,
    string? Reason) : DomainEventBase;
