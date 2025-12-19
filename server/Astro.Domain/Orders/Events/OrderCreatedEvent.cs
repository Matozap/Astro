using Astro.Domain.Shared;

namespace Astro.Domain.Orders.Events;

/// <summary>
/// Domain event raised when a new order is created.
/// </summary>
public sealed record OrderCreatedEvent(
    Guid OrderId,
    string OrderNumber,
    string CustomerName) : DomainEventBase;
