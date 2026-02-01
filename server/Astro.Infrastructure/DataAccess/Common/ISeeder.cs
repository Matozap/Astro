namespace Astro.Infrastructure.DataAccess.Common;

/// <summary>
/// Interface for domain-specific database seeders.
/// </summary>
public interface ISeeder
{
    /// <summary>
    /// The order in which this seeder should run.
    /// Lower numbers run first. Use this to handle dependencies between seeders.
    /// </summary>
    int Order { get; }

    /// <summary>
    /// Seeds data for this domain if not already present.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if seeding was performed, false if data already exists.</returns>
    Task<bool> SeedAsync(AstroDbContext context, CancellationToken cancellationToken = default);
}
