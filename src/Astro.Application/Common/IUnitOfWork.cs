namespace Astro.Application.Common;

/// <summary>
/// Unit of Work pattern interface for coordinating persistence operations.
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// Saves all changes made in the current transaction.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The number of state entries written to the database</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
