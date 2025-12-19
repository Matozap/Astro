using Astro.Domain.Shared;

namespace Astro.Domain.Products.Events;

/// <summary>
/// Domain event raised when a new product is created.
/// </summary>
public sealed record ProductCreatedEvent(
    Guid ProductId,
    string Name,
    string Sku,
    decimal Price) : DomainEventBase;
