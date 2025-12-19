using Astro.Domain.Products.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astro.Infrastructure.Products.Persistence;

/// <summary>
/// EF Core configuration for ProductDetail child entity.
/// </summary>
public sealed class ProductDetailConfiguration : IEntityTypeConfiguration<ProductDetail>
{
    public void Configure(EntityTypeBuilder<ProductDetail> builder)
    {
        builder.ToTable("ProductDetails");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Key)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.Value)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property<Guid>("ProductId")
            .IsRequired();

        builder.HasIndex("ProductId", "Key")
            .IsUnique();
    }
}
