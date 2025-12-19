using Astro.Domain.Orders.Enums;
using Astro.Domain.Shared;

namespace Astro.Domain.Orders.Events;

/// <summary>
/// Domain event raised when order status changes.
/// </summary>
public sealed record OrderStatusChangedEvent(
    Guid OrderId,
    OrderStatus OldStatus,
    OrderStatus NewStatus) : DomainEventBase;
