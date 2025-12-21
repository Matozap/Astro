using Astro.Domain.Shipments.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astro.Infrastructure.Shipments.Persistence.Configuration;

/// <summary>
/// EF Core configuration for TrackingDetail child entity.
/// </summary>
public sealed class TrackingDetailConfiguration : IEntityTypeConfiguration<TrackingDetail>
{
    public void Configure(EntityTypeBuilder<TrackingDetail> builder)
    {
        builder.ToTable("TrackingDetails");

        builder.HasKey(td => td.Id);

        builder.Property(td => td.Id)
            .ValueGeneratedNever();

        builder.Property(td => td.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(td => td.Location)
            .HasMaxLength(200);

        builder.Property(td => td.Notes)
            .HasMaxLength(500);

        builder.Property(td => td.Timestamp)
            .IsRequired();

        builder.Property<Guid>("ShipmentId")
            .IsRequired();

        builder.HasIndex("ShipmentId");
        builder.HasIndex(td => td.Timestamp);
    }
}
