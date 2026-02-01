using Astro.Domain.Orders.Entities;
using Astro.Domain.Orders.Enums;
using Astro.Domain.Shipments.Entities;
using Astro.Domain.Shipments.Enums;
using Astro.Infrastructure.DataAccess.Common;
using Microsoft.EntityFrameworkCore;

namespace Astro.Infrastructure.DataAccess.Shipments.Persistence;

/// <summary>
/// Seeds initial shipment data into the database.
/// </summary>
public sealed class ShipmentSeeder : ISeeder
{
    private static readonly string[] Carriers = ["FedEx", "UPS", "USPS", "DHL"];

    public int Order => 4; // Shipments depend on orders

    public async Task<bool> SeedAsync(AstroDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Shipments.AnyAsync(cancellationToken))
        {
            return false;
        }

        var random = new Random(42); // Fixed seed for reproducibility

        var shippedOrDeliveredOrders = await context.Orders
            .Include(o => o.Details)
            .Where(o => o.Status == OrderStatus.Shipped || o.Status == OrderStatus.Delivered)
            .ToListAsync(cancellationToken);

        var processingOrders = await context.Orders
            .Include(o => o.Details)
            .Where(o => o.Status == OrderStatus.Processing)
            .Take(3)
            .ToListAsync(cancellationToken);

        var shipments = new List<Shipment>();

        // Create shipments for shipped/delivered orders
        foreach (var order in shippedOrDeliveredOrders)
        {
            var shipment = CreateShipmentForOrder(order, random, "100 Warehouse Drive", "Memphis", "TN", "38118");
            ApplyShipmentStatus(shipment, order.Status);
            shipments.Add(shipment);
        }

        // Create pending shipments for processing orders
        foreach (var order in processingOrders)
        {
            var shipment = CreateShipmentForOrder(order, random, "200 Fulfillment Lane", "Louisville", "KY", "40213");
            shipment.ClearDomainEvents();
            shipments.Add(shipment);
        }

        context.Shipments.AddRange(shipments);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static Shipment CreateShipmentForOrder(Order order, Random random, string originStreet, string originCity, string originState, string originPostalCode)
    {
        var carrier = Carriers[random.Next(Carriers.Length)];

        var shipment = Shipment.Create(
            orderId: order.Id,
            carrier: carrier,
            originStreet: originStreet,
            originCity: originCity,
            originState: originState,
            originPostalCode: originPostalCode,
            originCountry: "USA",
            destinationStreet: order.ShippingAddress.Street,
            destinationCity: order.ShippingAddress.City,
            destinationState: order.ShippingAddress.State,
            destinationPostalCode: order.ShippingAddress.PostalCode,
            destinationCountry: order.ShippingAddress.Country,
            weightValue: random.Next(1, 20) + random.Next(0, 99) / 100m,
            weightUnit: WeightUnit.Pounds,
            length: random.Next(6, 24),
            width: random.Next(6, 18),
            height: random.Next(4, 12),
            dimensionUnit: DimensionUnit.Inches,
            shippingCost: random.Next(5, 50) + random.Next(0, 99) / 100m,
            estimatedDeliveryDate: DateTimeOffset.UtcNow.AddDays(random.Next(3, 10)),
            createdBy: "System");

        foreach (var detail in order.Details)
        {
            shipment.AddItem(
                detail.Id,
                detail.ProductId,
                detail.ProductName,
                detail.ProductSku,
                detail.Quantity);
        }

        return shipment;
    }

    private static void ApplyShipmentStatus(Shipment shipment, OrderStatus orderStatus)
    {
        if (orderStatus == OrderStatus.Shipped)
        {
            shipment.UpdateStatus(ShipmentStatus.Shipped, "Distribution Center", "Package picked up by carrier", "System");
            shipment.UpdateStatus(ShipmentStatus.InTransit, "Regional Hub", "Package in transit to destination", "System");
        }
        else if (orderStatus == OrderStatus.Delivered)
        {
            shipment.UpdateStatus(ShipmentStatus.Shipped, "Distribution Center", "Package picked up by carrier", "System");
            shipment.UpdateStatus(ShipmentStatus.InTransit, "Regional Hub", "Package in transit", "System");
            shipment.UpdateStatus(ShipmentStatus.OutForDelivery, "Local Delivery Center", "Out for delivery", "System");
            shipment.UpdateStatus(ShipmentStatus.Delivered, "Customer Location", "Delivered to recipient", "System");
        }

        shipment.ClearDomainEvents();
    }
}
