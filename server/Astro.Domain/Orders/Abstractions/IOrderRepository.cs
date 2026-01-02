using Astro.Domain.Orders.Entities;

namespace Astro.Domain.Orders.Abstractions;

/// <summary>
/// Repository interface for Order aggregate root.
/// Repositories MUST operate on aggregate roots only per DDD principles.
/// </summary>
public interface IOrderRepository
{
    /// <summary>
    /// Gets an order by its identifier.
    /// </summary>
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an order by its identifier including all details.
    /// </summary>
    Task<Order?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an order by its order number.
    /// </summary>
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all orders as a queryable for projections.
    /// </summary>
    IQueryable<Order> GetAll();

    /// <summary>
    /// Adds a new order to the repository.
    /// </summary>
    Task AddAsync(Order order, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing order.
    /// </summary>
    void Update(Order order);

    /// <summary>
    /// Removes an order from the repository.
    /// </summary>
    void Delete(Order order);

    /// <summary>
    /// Checks if a product has been used in any orders.
    /// </summary>
    /// <param name="productId">The product identifier to check.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the product appears in one or more orders; otherwise false.</returns>
    Task<bool> HasProductOrdersAsync(Guid productId, CancellationToken cancellationToken = default);
}
