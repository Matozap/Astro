using Astro.Domain.Shared;

namespace Astro.Domain.Products.Events;

/// <summary>
/// Domain event raised when a product is updated.
/// </summary>
public sealed record ProductUpdatedEvent(
    Guid ProductId,
    string Name,
    string Sku,
    decimal Price) : DomainEventBase;
