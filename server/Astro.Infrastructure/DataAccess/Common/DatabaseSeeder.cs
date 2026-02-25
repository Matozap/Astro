using Astro.Infrastructure.DataAccess.Orders.Persistence;
using Astro.Infrastructure.DataAccess.Payments.Persistence;
using Astro.Infrastructure.DataAccess.Products.Persistence;
using Astro.Infrastructure.DataAccess.Shipments.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Astro.Infrastructure.DataAccess.Common;

/// <summary>
/// Database seeder that orchestrates domain-specific seeders.
/// </summary>
public static class DatabaseSeeder
{
    private const int MaxRetries = 5;
    private const int DelayMs = 2000;

    /// <summary>
    /// All available seeders, ordered by their execution priority.
    /// </summary>
    private static readonly ISeeder[] Seeders =
    [
        new ProductSeeder(),
        new OrderSeeder(),
        new PaymentSeeder(),
        new ShipmentSeeder()
    ];

    /// <summary>
    /// Ensures the database is created and seeds initial data if empty.
    /// </summary>
    public static async Task SeedDatabaseAsync(this IHost host)
    {
        using var scope = host.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<AstroDbContext>>();
        var context = services.GetRequiredService<AstroDbContext>();

        for (var attempt = 1; attempt <= MaxRetries; attempt++)
        {
            try
            {
                logger.LogInformation("Ensuring database is created (attempt {Attempt}/{MaxRetries})...", attempt, MaxRetries);

                if (!await context.Database.CanConnectAsync())
                {
                    logger.LogInformation("Can't connect to database with correct connection string {Connection}", context.Database.GetConnectionString());
                    throw new InvalidOperationException("Database is not available");
                }

                await context.Database.EnsureCreatedAsync();

                await ExecuteSeedersAsync(context, logger);

                logger.LogInformation("Database seeding completed");
                return;
            }
            catch (Exception ex) when (attempt < MaxRetries)
            {
                logger.LogWarning(ex, "Database seeding attempt {Attempt} failed, retrying in {DelayMs}ms...", attempt, DelayMs);
                await Task.Delay(DelayMs);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database after {MaxRetries} attempts", MaxRetries);
                throw;
            }
        }
    }

    private static async Task ExecuteSeedersAsync(AstroDbContext context, ILogger logger)
    {
        var orderedSeeders = Seeders.OrderBy(s => s.Order);

        foreach (var seeder in orderedSeeders)
        {
            var seederName = seeder.GetType().Name;
            logger.LogInformation("Running {SeederName}...", seederName);

            var seeded = await seeder.SeedAsync(context);

            if (seeded)
            {
                logger.LogInformation("{SeederName} completed successfully", seederName);
            }
            else
            {
                logger.LogInformation("{SeederName} skipped (data already exists)", seederName);
            }
        }
    }
}
