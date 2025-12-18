namespace Astro.Domain.Shared;

/// <summary>
/// Marker interface for aggregate roots.
/// Aggregates are the primary consistency boundaries in the domain model.
/// </summary>
public interface IAggregateRoot
{
    /// <summary>
    /// Gets the domain events that have been raised by this aggregate.
    /// </summary>
    IReadOnlyCollection<IDomainEvent> DomainEvents { get; }

    /// <summary>
    /// Clears all domain events from the aggregate.
    /// Called after events have been dispatched.
    /// </summary>
    void ClearDomainEvents();
}
