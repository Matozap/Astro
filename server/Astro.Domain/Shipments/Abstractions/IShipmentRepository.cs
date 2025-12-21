using Astro.Domain.Shipments.Entities;

namespace Astro.Domain.Shipments.Abstractions;

/// <summary>
/// Repository interface for Shipment aggregate root.
/// Repositories MUST operate on aggregate roots only per DDD principles.
/// </summary>
public interface IShipmentRepository
{
    /// <summary>
    /// Gets a shipment by its identifier.
    /// </summary>
    Task<Shipment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a shipment by its identifier including all details.
    /// </summary>
    Task<Shipment?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a shipment by its tracking number.
    /// </summary>
    Task<Shipment?> GetByTrackingNumberAsync(string trackingNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all shipments for a specific order.
    /// </summary>
    Task<List<Shipment>> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all shipments as a queryable for projections.
    /// </summary>
    IQueryable<Shipment> GetAll();

    /// <summary>
    /// Adds a new shipment to the repository.
    /// </summary>
    Task AddAsync(Shipment shipment, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing shipment.
    /// </summary>
    void Update(Shipment shipment);

    /// <summary>
    /// Removes a shipment from the repository.
    /// </summary>
    void Delete(Shipment shipment);
}
