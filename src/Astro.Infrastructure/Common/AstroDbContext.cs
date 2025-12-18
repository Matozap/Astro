using Astro.Domain.Orders.Entities;
using Astro.Domain.Products.Entities;
using Microsoft.EntityFrameworkCore;

namespace Astro.Infrastructure.Common;

/// <summary>
/// Unified DbContext for all domain modules in the modular monolith.
/// Each module's entities are configured via separate configuration classes.
/// </summary>
public class AstroDbContext : DbContext
{
    public AstroDbContext(DbContextOptions<AstroDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Products aggregate roots.
    /// </summary>
    public DbSet<Product> Products => Set<Product>();

    /// <summary>
    /// Orders aggregate roots.
    /// </summary>
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from the Infrastructure assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AstroDbContext).Assembly);
    }
}
