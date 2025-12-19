using Astro.Domain.Shared;

namespace Astro.Domain.Products.Events;

/// <summary>
/// Domain event raised when product stock quantity changes.
/// </summary>
public sealed record ProductStockChangedEvent(
    Guid ProductId,
    int OldQuantity,
    int NewQuantity) : DomainEventBase;
