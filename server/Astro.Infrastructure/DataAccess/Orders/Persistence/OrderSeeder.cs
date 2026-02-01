using Astro.Domain.Orders.Enums;
using Astro.Domain.Products.Entities;
using Astro.Infrastructure.DataAccess.Common;
using Microsoft.EntityFrameworkCore;
using DomainOrder = Astro.Domain.Orders.Entities.Order;

namespace Astro.Infrastructure.DataAccess.Orders.Persistence;

/// <summary>
/// Seeds initial order data into the database.
/// </summary>
public sealed class OrderSeeder : ISeeder
{
    public int Order => 2; // Orders depend on products

    public async Task<bool> SeedAsync(AstroDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Orders.AnyAsync(cancellationToken))
        {
            return false;
        }

        var products = await context.Products.ToListAsync(cancellationToken);
        var orders = CreateOrders(products);

        context.Orders.AddRange(orders);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static List<DomainOrder> CreateOrders(List<Product> products)
    {
        var random = new Random(42); // Fixed seed for reproducibility

        var orders = new List<DomainOrder>
        {
            CreateOrder(
                "John Smith", "john.smith@email.com",
                "123 Main Street", "New York", "NY", "10001", "USA",
                "Please leave at the front door",
                products, random, 3),

            CreateOrder(
                "Sarah Johnson", "sarah.j@email.com",
                "456 Oak Avenue", "Los Angeles", "CA", "90001", "USA",
                null,
                products, random, 2),

            CreateOrder(
                "Michael Brown", "m.brown@email.com",
                "789 Pine Road", "Chicago", "IL", "60601", "USA",
                "Call before delivery",
                products, random, 4),

            CreateOrder(
                "Emily Davis", "emily.davis@email.com",
                "321 Elm Street", "Houston", "TX", "77001", "USA",
                null,
                products, random, 1),

            CreateOrder(
                "Robert Wilson", "r.wilson@email.com",
                "654 Maple Drive", "Phoenix", "AZ", "85001", "USA",
                "Gift wrap requested",
                products, random, 3),

            CreateOrder(
                "Jennifer Martinez", "j.martinez@email.com",
                "987 Cedar Lane", "Philadelphia", "PA", "19101", "USA",
                null,
                products, random, 2),

            CreateOrder(
                "David Anderson", "d.anderson@email.com",
                "147 Birch Court", "San Antonio", "TX", "78201", "USA",
                "Deliver to back entrance",
                products, random, 5),

            CreateOrder(
                "Lisa Thompson", "lisa.t@email.com",
                "258 Walnut Way", "San Diego", "CA", "92101", "USA",
                null,
                products, random, 2),

            CreateOrder(
                "James Garcia", "j.garcia@email.com",
                "369 Spruce Boulevard", "Dallas", "TX", "75201", "USA",
                "Weekend delivery preferred",
                products, random, 3),

            CreateOrder(
                "Amanda White", "a.white@email.com",
                "741 Ash Circle", "San Jose", "CA", "95101", "USA",
                null,
                products, random, 4)
        };

        ApplyOrderStatuses(orders);

        foreach (var order in orders)
        {
            order.ClearDomainEvents();
        }

        return orders;
    }

    private static void ApplyOrderStatuses(List<DomainOrder> orders)
    {
        // Order 0: Confirmed
        orders[0].UpdateStatus(OrderStatus.Confirmed, "System");

        // Order 1: Processing
        orders[1].UpdateStatus(OrderStatus.Confirmed, "System");
        orders[1].UpdateStatus(OrderStatus.Processing, "System");

        // Order 2: Shipped
        orders[2].UpdateStatus(OrderStatus.Confirmed, "System");
        orders[2].UpdateStatus(OrderStatus.Processing, "System");
        orders[2].UpdateStatus(OrderStatus.Shipped, "System");

        // Order 3: Delivered
        orders[3].UpdateStatus(OrderStatus.Confirmed, "System");
        orders[3].UpdateStatus(OrderStatus.Processing, "System");
        orders[3].UpdateStatus(OrderStatus.Shipped, "System");
        orders[3].UpdateStatus(OrderStatus.Delivered, "System");

        // Order 4: stays Pending

        // Order 5: Confirmed
        orders[5].UpdateStatus(OrderStatus.Confirmed, "System");

        // Order 6: Cancelled
        orders[6].Cancel("Customer requested cancellation", "System");

        // Order 7: Processing
        orders[7].UpdateStatus(OrderStatus.Confirmed, "System");
        orders[7].UpdateStatus(OrderStatus.Processing, "System");

        // Order 8: stays Pending

        // Order 9: Confirmed
        orders[9].UpdateStatus(OrderStatus.Confirmed, "System");
    }

    private static DomainOrder CreateOrder(
        string customerName,
        string customerEmail,
        string street,
        string city,
        string state,
        string postalCode,
        string country,
        string? notes,
        List<Product> products,
        Random random,
        int itemCount)
    {
        var order = DomainOrder.Create(
            customerName,
            customerEmail,
            street,
            city,
            state,
            postalCode,
            country,
            notes,
            createdBy: "System");

        var selectedProducts = products.OrderBy(_ => random.Next()).Take(itemCount).ToList();
        foreach (var product in selectedProducts)
        {
            var quantity = random.Next(1, 4);
            order.AddDetail(
                product.Id,
                product.Name,
                product.Sku.Value,
                quantity,
                product.Price.Amount);
        }

        return order;
    }
}
