using Astro.Domain.Products.Entities;
using Astro.Domain.Products.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astro.Infrastructure.Products.Persistence;

/// <summary>
/// EF Core configuration for the Product aggregate root.
/// </summary>
public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        // Configure SKU value object
        builder.Property(p => p.Sku)
            .HasConversion(
                sku => sku.Value,
                value => Sku.Create(value))
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(p => p.Sku)
            .IsUnique();

        // Configure Price value object (Money)
        builder.OwnsOne(p => p.Price, price =>
        {
            price.Property(m => m.Amount)
                .HasColumnName("Price")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(m => m.Currency)
                .HasColumnName("PriceCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        // Configure StockQuantity value object
        builder.Property(p => p.StockQuantity)
            .HasConversion(
                sq => sq.Value,
                value => StockQuantity.Create(value))
            .HasColumnName("StockQuantity")
            .IsRequired();

        builder.Property(p => p.LowStockThreshold)
            .IsRequired();

        builder.Property(p => p.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.Property(p => p.UpdatedAt);

        builder.Property(p => p.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.ModifiedBy)
            .HasMaxLength(100);

        // Configure relationships
        builder.HasMany(p => p.Details)
            .WithOne()
            .HasForeignKey("ProductId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Images)
            .WithOne()
            .HasForeignKey("ProductId")
            .OnDelete(DeleteBehavior.Cascade);

        // Ignore domain events collection
        builder.Ignore(p => p.DomainEvents);
    }
}
