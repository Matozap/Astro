using Astro.Domain.Orders.Entities;
using Astro.Domain.Orders.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astro.Infrastructure.Orders.Persistence;

/// <summary>
/// EF Core configuration for the Order aggregate root.
/// </summary>
public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);

        // Configure OrderNumber value object
        builder.Property(o => o.OrderNumber)
            .HasConversion(
                on => on.Value,
                value => OrderNumber.Create(value))
            .IsRequired()
            .HasMaxLength(25);

        builder.HasIndex(o => o.OrderNumber)
            .IsUnique();

        builder.Property(o => o.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        // Configure Email value object
        builder.Property(o => o.CustomerEmail)
            .HasConversion(
                email => email.Value,
                value => Email.Create(value))
            .IsRequired()
            .HasMaxLength(320);

        // Configure Address as owned type
        builder.OwnsOne(o => o.ShippingAddress, address =>
        {
            address.Property(a => a.Street)
                .HasColumnName("ShippingStreet")
                .HasMaxLength(200)
                .IsRequired();

            address.Property(a => a.City)
                .HasColumnName("ShippingCity")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.State)
                .HasColumnName("ShippingState")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(a => a.PostalCode)
                .HasColumnName("ShippingPostalCode")
                .HasMaxLength(20)
                .IsRequired();

            address.Property(a => a.Country)
                .HasColumnName("ShippingCountry")
                .HasMaxLength(100)
                .IsRequired();
        });

        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<int>();

        // Configure TotalAmount value object (Money)
        builder.OwnsOne(o => o.TotalAmount, total =>
        {
            total.Property(m => m.Amount)
                .HasColumnName("TotalAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            total.Property(m => m.Currency)
                .HasColumnName("TotalCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.Property(o => o.Notes)
            .HasMaxLength(1000);

        builder.Property(o => o.CreatedAt)
            .IsRequired();

        builder.Property(o => o.UpdatedAt);

        builder.Property(o => o.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(o => o.ModifiedBy)
            .HasMaxLength(100);

        // Configure relationship with OrderDetails
        builder.HasMany(o => o.Details)
            .WithOne()
            .HasForeignKey("OrderId")
            .OnDelete(DeleteBehavior.Cascade);

        // Ignore domain events collection
        builder.Ignore(o => o.DomainEvents);
    }
}
