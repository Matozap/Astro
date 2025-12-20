using Astro.Domain.Payments.Entities;

namespace Astro.Domain.Payments.Abstractions;

/// <summary>
/// Repository interface for Payment aggregate
/// </summary>
public interface IPaymentRepository
{
    /// <summary>
    /// Retrieves a payment by its unique identifier
    /// </summary>
    /// <param name="id">The payment ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The payment if found, null otherwise</returns>
    Task<Payment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all payments for a specific order
    /// </summary>
    /// <param name="orderId">The order ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of payments for the order</returns>
    Task<IEnumerable<Payment>> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a queryable collection of all payments
    /// </summary>
    /// <returns>Queryable collection of payments</returns>
    IQueryable<Payment> GetAll();

    /// <summary>
    /// Adds a new payment to the repository
    /// </summary>
    /// <param name="payment">The payment to add</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task AddAsync(Payment payment, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing payment
    /// </summary>
    /// <param name="payment">The payment to update</param>
    void Update(Payment payment);

    /// <summary>
    /// Deletes a payment
    /// </summary>
    /// <param name="payment">The payment to delete</param>
    void Delete(Payment payment);
}
