using System.Reflection;
using Astro.Domain.Orders.Enums;
using Astro.Domain.Shipments.Entities;
using Astro.Domain.Shipments.Enums;
using Astro.Infrastructure.DataAccess.Common;
using Microsoft.EntityFrameworkCore;
using DomainOrder = Astro.Domain.Orders.Entities.Order;

namespace Astro.Infrastructure.DataAccess.Shipments.Persistence;

/// <summary>
/// Seeds initial shipment data into the database.
/// </summary>
public sealed class ShipmentSeeder : ISeeder
{
    private static readonly Random Random = new(42); // Fixed seed for reproducibility

    private static readonly string[] Carriers = ["FedEx", "UPS", "USPS", "DHL", "OnTrac"];

    private static readonly (string Street, string City, string State, string PostalCode)[] Warehouses =
    [
        ("100 Warehouse Drive", "Memphis", "TN", "38118"),
        ("200 Fulfillment Lane", "Louisville", "KY", "40213"),
        ("300 Distribution Way", "Ontario", "CA", "91761"),
        ("400 Logistics Blvd", "Tracy", "CA", "95377"),
        ("500 Shipping Center", "Dallas", "TX", "75261")
    ];

    public int Order => 4; // Shipments depend on orders

    public async Task<bool> SeedAsync(AstroDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Shipments.AnyAsync(cancellationToken))
        {
            return false;
        }

        // Get orders that should have shipments (processing, shipped, or delivered)
        var ordersForShipments = await context.Orders
            .Include(o => o.Details)
            .Where(o => o.Status == OrderStatus.Processing ||
                        o.Status == OrderStatus.Shipped ||
                        o.Status == OrderStatus.Delivered)
            .OrderBy(o => o.CreatedAt)
            .Take(20)
            .ToListAsync(cancellationToken);

        var shipments = CreateShipments(ordersForShipments, 20);

        context.Shipments.AddRange(shipments);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static List<Shipment> CreateShipments(List<DomainOrder> orders, int targetCount)
    {
        var shipments = new List<Shipment>();

        foreach (var order in orders.Take(targetCount))
        {
            var warehouse = Warehouses[Random.Next(Warehouses.Length)];
            var shipment = CreateShipmentForOrder(order, warehouse);

            // Set shipment creation date relative to order date (1-2 days after order for processing)
            var shipmentCreatedDate = order.CreatedAt.AddDays(Random.Next(1, 3)).AddHours(Random.Next(0, 12));
            SetCreatedAt(shipment, shipmentCreatedDate);

            // Set estimated delivery based on shipment creation
            var estimatedDelivery = shipmentCreatedDate.AddDays(Random.Next(3, 8));
            SetEstimatedDeliveryDate(shipment, estimatedDelivery);

            ApplyShipmentStatus(shipment, order);
            shipments.Add(shipment);
        }

        return shipments;
    }

    private static Shipment CreateShipmentForOrder(DomainOrder order, (string Street, string City, string State, string PostalCode) warehouse)
    {
        var carrier = Carriers[Random.Next(Carriers.Length)];

        var shipment = Shipment.Create(
            orderId: order.Id,
            carrier: carrier,
            originStreet: warehouse.Street,
            originCity: warehouse.City,
            originState: warehouse.State,
            originPostalCode: warehouse.PostalCode,
            originCountry: "USA",
            destinationStreet: order.ShippingAddress.Street,
            destinationCity: order.ShippingAddress.City,
            destinationState: order.ShippingAddress.State,
            destinationPostalCode: order.ShippingAddress.PostalCode,
            destinationCountry: order.ShippingAddress.Country,
            weightValue: Random.Next(1, 20) + Random.Next(0, 99) / 100m,
            weightUnit: WeightUnit.Pounds,
            length: Random.Next(6, 24),
            width: Random.Next(6, 18),
            height: Random.Next(4, 12),
            dimensionUnit: DimensionUnit.Inches,
            shippingCost: Random.Next(5, 50) + Random.Next(0, 99) / 100m,
            estimatedDeliveryDate: null, // Will be set separately with proper date
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

    private static void ApplyShipmentStatus(Shipment shipment, DomainOrder order)
    {
        var daysSinceCreation = (DateTimeOffset.UtcNow - shipment.CreatedAt).TotalDays;

        // Determine shipment status based on order status and age
        if (order.Status == OrderStatus.Delivered)
        {
            // Delivered orders have fully completed shipments
            shipment.UpdateStatus(ShipmentStatus.Shipped, "Distribution Center", "Package picked up by carrier", "System");
            shipment.UpdateStatus(ShipmentStatus.InTransit, "Regional Hub", "Package in transit", "System");
            shipment.UpdateStatus(ShipmentStatus.OutForDelivery, "Local Delivery Center", "Out for delivery", "System");
            shipment.UpdateStatus(ShipmentStatus.Delivered, "Customer Location", "Delivered to recipient", "System");
        }
        else if (order.Status == OrderStatus.Shipped)
        {
            // Shipped orders - shipment is in transit
            shipment.UpdateStatus(ShipmentStatus.Shipped, "Distribution Center", "Package picked up by carrier", "System");

            // Randomly add more progress
            if (daysSinceCreation > 2 || Random.Next(100) < 60)
            {
                shipment.UpdateStatus(ShipmentStatus.InTransit, "Regional Hub", "Package in transit to destination", "System");
            }

            if (daysSinceCreation > 4 && Random.Next(100) < 40)
            {
                shipment.UpdateStatus(ShipmentStatus.OutForDelivery, "Local Delivery Center", "Out for delivery", "System");
            }
        }
        else if (order.Status == OrderStatus.Processing)
        {
            // Processing orders - shipment is pending or just shipped
            if (daysSinceCreation > 1 && Random.Next(100) < 50)
            {
                shipment.UpdateStatus(ShipmentStatus.Shipped, "Distribution Center", "Package picked up by carrier", "System");
            }
            // Otherwise stays Pending
        }

        shipment.ClearDomainEvents();
    }

    private static void SetCreatedAt(Shipment shipment, DateTimeOffset date)
    {
        var property = typeof(Shipment).GetProperty("CreatedAt", BindingFlags.Public | BindingFlags.Instance);
        property?.SetValue(shipment, date);
    }

    private static void SetEstimatedDeliveryDate(Shipment shipment, DateTimeOffset date)
    {
        var property = typeof(Shipment).GetProperty("EstimatedDeliveryDate", BindingFlags.Public | BindingFlags.Instance);
        property?.SetValue(shipment, date);
    }
}
