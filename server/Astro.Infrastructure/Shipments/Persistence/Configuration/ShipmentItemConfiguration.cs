using Astro.Domain.Shipments.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astro.Infrastructure.Shipments.Persistence.Configuration;

/// <summary>
/// EF Core configuration for ShipmentItem child entity.
/// </summary>
public sealed class ShipmentItemConfiguration : IEntityTypeConfiguration<ShipmentItem>
{
    public void Configure(EntityTypeBuilder<ShipmentItem> builder)
    {
        builder.ToTable("ShipmentItems");

        builder.HasKey(si => si.Id);

        builder.Property(si => si.Id)
            .ValueGeneratedNever();

        builder.Property(si => si.OrderDetailId)
            .IsRequired();

        builder.Property(si => si.ProductId)
            .IsRequired();

        builder.Property(si => si.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(si => si.ProductSku)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(si => si.Quantity)
            .IsRequired();

        builder.Property<Guid>("ShipmentId")
            .IsRequired();

        builder.HasIndex("ShipmentId");
        builder.HasIndex(si => si.OrderDetailId);
        builder.HasIndex(si => si.ProductId);
    }
}
