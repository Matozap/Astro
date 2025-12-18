using Astro.Domain.Orders.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astro.Infrastructure.Orders.Persistence;

/// <summary>
/// EF Core configuration for OrderDetail child entity.
/// </summary>
public sealed class OrderDetailConfiguration : IEntityTypeConfiguration<OrderDetail>
{
    public void Configure(EntityTypeBuilder<OrderDetail> builder)
    {
        builder.ToTable("OrderDetails");

        builder.HasKey(od => od.Id);

        builder.Property(od => od.ProductId)
            .IsRequired();

        builder.Property(od => od.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(od => od.ProductSku)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(od => od.Quantity)
            .IsRequired();

        // Configure UnitPrice value object (Money)
        builder.OwnsOne(od => od.UnitPrice, price =>
        {
            price.Property(m => m.Amount)
                .HasColumnName("UnitPrice")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(m => m.Currency)
                .HasColumnName("UnitPriceCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        // LineTotal is calculated property - ignore for persistence
        builder.Ignore(od => od.LineTotal);

        builder.Property<Guid>("OrderId")
            .IsRequired();

        builder.HasIndex(od => od.ProductId);
        builder.HasIndex("OrderId");
    }
}
