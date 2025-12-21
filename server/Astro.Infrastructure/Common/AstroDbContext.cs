using Astro.Domain.Orders.Entities;
using Astro.Domain.Payments.Entities;
using Astro.Domain.Products.Entities;
using Astro.Domain.Shipments.Entities;
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

    /// <summary>
    /// Payments aggregate roots.
    /// </summary>
    public DbSet<Payment> Payments => Set<Payment>();

    /// <summary>
    /// Shipments aggregate roots.
    /// </summary>
    public DbSet<Shipment> Shipments => Set<Shipment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from the Infrastructure assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AstroDbContext).Assembly);
    }
}
