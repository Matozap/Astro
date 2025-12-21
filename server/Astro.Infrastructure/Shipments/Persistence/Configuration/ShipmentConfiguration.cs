using Astro.Domain.Shipments.Entities;
using Astro.Domain.Shipments.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astro.Infrastructure.Shipments.Persistence.Configuration;

/// <summary>
/// EF Core configuration for the Shipment aggregate root.
/// </summary>
public sealed class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
{
    public void Configure(EntityTypeBuilder<Shipment> builder)
    {
        builder.ToTable("Shipments");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.Property(s => s.OrderId)
            .IsRequired();

        // Configure TrackingNumber value object
        builder.Property(s => s.TrackingNumber)
            .HasConversion(
                tn => tn.Value,
                value => TrackingNumber.Create(value))
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(s => s.TrackingNumber)
            .IsUnique();

        builder.Property(s => s.Carrier)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Status)
            .IsRequired()
            .HasConversion<int>();

        // Configure Origin Address as owned type
        builder.OwnsOne(s => s.OriginAddress, address =>
        {
            address.Property(a => a.Street)
                .HasColumnName("OriginStreet")
                .HasMaxLength(200)
                .IsRequired();

            address.Property(a => a.City)
                .HasColumnName("OriginCity")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.State)
                .HasColumnName("OriginState")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.PostalCode)
                .HasColumnName("OriginPostalCode")
                .HasMaxLength(20)
                .IsRequired();

            address.Property(a => a.Country)
                .HasColumnName("OriginCountry")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.ContactName)
                .HasColumnName("OriginContactName")
                .HasMaxLength(200);

            address.Property(a => a.ContactPhone)
                .HasColumnName("OriginContactPhone")
                .HasMaxLength(50);
        });

        // Configure Destination Address as owned type
        builder.OwnsOne(s => s.DestinationAddress, address =>
        {
            address.Property(a => a.Street)
                .HasColumnName("DestinationStreet")
                .HasMaxLength(200)
                .IsRequired();

            address.Property(a => a.City)
                .HasColumnName("DestinationCity")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.State)
                .HasColumnName("DestinationState")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.PostalCode)
                .HasColumnName("DestinationPostalCode")
                .HasMaxLength(20)
                .IsRequired();

            address.Property(a => a.Country)
                .HasColumnName("DestinationCountry")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.ContactName)
                .HasColumnName("DestinationContactName")
                .HasMaxLength(200);

            address.Property(a => a.ContactPhone)
                .HasColumnName("DestinationContactPhone")
                .HasMaxLength(50);
        });

        // Configure Weight value object
        builder.OwnsOne(s => s.Weight, weight =>
        {
            weight.Property(w => w.Value)
                .HasColumnName("Weight")
                .HasPrecision(18, 2)
                .IsRequired();

            weight.Property(w => w.Unit)
                .HasColumnName("WeightUnit")
                .HasConversion<int>()
                .IsRequired();
        });

        // Configure Dimensions value object
        builder.OwnsOne(s => s.Dimensions, dims =>
        {
            dims.Property(d => d.Length)
                .HasColumnName("Length")
                .HasPrecision(18, 2)
                .IsRequired();

            dims.Property(d => d.Width)
                .HasColumnName("Width")
                .HasPrecision(18, 2)
                .IsRequired();

            dims.Property(d => d.Height)
                .HasColumnName("Height")
                .HasPrecision(18, 2)
                .IsRequired();

            dims.Property(d => d.Unit)
                .HasColumnName("DimensionUnit")
                .HasConversion<int>()
                .IsRequired();
        });

        // Configure ShippingCost value object (Money)
        builder.OwnsOne(s => s.ShippingCost, cost =>
        {
            cost.Property(m => m.Amount)
                .HasColumnName("ShippingCost")
                .HasPrecision(18, 2)
                .IsRequired();

            cost.Property(m => m.Currency)
                .HasColumnName("ShippingCostCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(s => s.EstimatedDeliveryDate);
        builder.Property(s => s.ActualDeliveryDate);

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.Property(s => s.UpdatedAt);

        builder.Property(s => s.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.ModifiedBy)
            .HasMaxLength(100);

        // Configure relationship with TrackingDetails using backing field
        builder.HasMany(s => s.TrackingDetails)
            .WithOne()
            .HasForeignKey("ShipmentId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(s => s.TrackingDetails)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        // Configure relationship with ShipmentItems using backing field
        builder.HasMany(s => s.Items)
            .WithOne()
            .HasForeignKey("ShipmentId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(s => s.Items)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        // Ignore domain events collection
        builder.Ignore(s => s.DomainEvents);

        // Indexes
        builder.HasIndex(s => s.OrderId);
        builder.HasIndex(s => s.Status);
        builder.HasIndex(s => s.CreatedAt);
    }
}
