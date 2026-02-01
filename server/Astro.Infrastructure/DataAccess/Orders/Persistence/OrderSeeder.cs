using System.Reflection;
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
    private static readonly Random Random = new(42); // Fixed seed for reproducibility

    // Customer data for generating orders
    private static readonly (string Name, string Email)[] Customers =
    [
        ("John Smith", "john.smith@email.com"),
        ("Sarah Johnson", "sarah.j@email.com"),
        ("Michael Brown", "m.brown@email.com"),
        ("Emily Davis", "emily.davis@email.com"),
        ("Robert Wilson", "r.wilson@email.com"),
        ("Jennifer Martinez", "j.martinez@email.com"),
        ("David Anderson", "d.anderson@email.com"),
        ("Lisa Thompson", "lisa.t@email.com"),
        ("James Garcia", "j.garcia@email.com"),
        ("Amanda White", "a.white@email.com"),
        ("Christopher Lee", "c.lee@email.com"),
        ("Jessica Taylor", "j.taylor@email.com"),
        ("Matthew Harris", "m.harris@email.com"),
        ("Ashley Clark", "a.clark@email.com"),
        ("Daniel Lewis", "d.lewis@email.com"),
        ("Nicole Walker", "n.walker@email.com"),
        ("Andrew Hall", "a.hall@email.com"),
        ("Stephanie Allen", "s.allen@email.com"),
        ("Joshua Young", "j.young@email.com"),
        ("Megan King", "m.king@email.com")
    ];

    private static readonly (string Street, string City, string State, string PostalCode)[] Addresses =
    [
        ("123 Main Street", "New York", "NY", "10001"),
        ("456 Oak Avenue", "Los Angeles", "CA", "90001"),
        ("789 Pine Road", "Chicago", "IL", "60601"),
        ("321 Elm Street", "Houston", "TX", "77001"),
        ("654 Maple Drive", "Phoenix", "AZ", "85001"),
        ("987 Cedar Lane", "Philadelphia", "PA", "19101"),
        ("147 Birch Court", "San Antonio", "TX", "78201"),
        ("258 Walnut Way", "San Diego", "CA", "92101"),
        ("369 Spruce Boulevard", "Dallas", "TX", "75201"),
        ("741 Ash Circle", "San Jose", "CA", "95101"),
        ("852 Willow Street", "Austin", "TX", "78701"),
        ("963 Hickory Lane", "Jacksonville", "FL", "32099"),
        ("159 Chestnut Avenue", "Fort Worth", "TX", "76101"),
        ("357 Poplar Drive", "Columbus", "OH", "43085"),
        ("486 Magnolia Court", "Charlotte", "NC", "28201")
    ];

    private static readonly string?[] OrderNotes =
    [
        "Please leave at the front door",
        "Call before delivery",
        "Gift wrap requested",
        "Deliver to back entrance",
        "Weekend delivery preferred",
        "Leave with neighbor if not home",
        "Ring doorbell twice",
        "Fragile items - handle with care",
        null, null, null, null, null // More null values for variety
    ];

    public int Order => 2; // Orders depend on products

    public async Task<bool> SeedAsync(AstroDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Orders.AnyAsync(cancellationToken))
        {
            return false;
        }

        var products = await context.Products.ToListAsync(cancellationToken);
        var orders = CreateOrders(products, 30);

        context.Orders.AddRange(orders);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static List<DomainOrder> CreateOrders(List<Product> products, int count)
    {
        var orders = new List<DomainOrder>();
        var baseDate = DateTimeOffset.UtcNow;

        for (var i = 0; i < count; i++)
        {
            var customer = Customers[i % Customers.Length];
            var address = Addresses[i % Addresses.Length];
            var notes = OrderNotes[Random.Next(OrderNotes.Length)];
            var itemCount = Random.Next(1, 5);

            // Distribute orders across 4 weeks before and after current date
            var daysOffset = Random.Next(-28, 29); // -28 to +28 days
            var orderDate = baseDate.AddDays(daysOffset).AddHours(Random.Next(-12, 12));

            var order = CreateOrder(
                customer.Name, customer.Email,
                address.Street, address.City, address.State, address.PostalCode, "USA",
                notes,
                products, itemCount);

            // Set the CreatedAt date using reflection (for realistic seed data)
            SetCreatedAt(order, orderDate);

            orders.Add(order);
        }

        ApplyOrderStatuses(orders);

        foreach (var order in orders)
        {
            order.ClearDomainEvents();
        }

        return orders;
    }

    private static void SetCreatedAt(DomainOrder order, DateTimeOffset date)
    {
        var property = typeof(DomainOrder).GetProperty("CreatedAt", BindingFlags.Public | BindingFlags.Instance);
        property?.SetValue(order, date);
    }

    private static void ApplyOrderStatuses(List<DomainOrder> orders)
    {
        // Distribute statuses realistically based on order age
        // Older orders (past dates) are more likely to be completed
        // Future/recent orders are more likely to be pending or processing

        for (var i = 0; i < orders.Count; i++)
        {
            var order = orders[i];
            var createdAt = order.CreatedAt;
            var daysSinceCreation = (DateTimeOffset.UtcNow - createdAt).TotalDays;

            // Determine status based on age and some randomness
            if (daysSinceCreation > 14) // Orders older than 2 weeks
            {
                // 70% delivered, 15% shipped, 10% cancelled, 5% processing
                var roll = Random.Next(100);
                if (roll < 70)
                    ApplyStatusProgression(order, OrderStatus.Delivered);
                else if (roll < 85)
                    ApplyStatusProgression(order, OrderStatus.Shipped);
                else if (roll < 95)
                    order.Cancel("Customer requested cancellation", "System");
                else
                    ApplyStatusProgression(order, OrderStatus.Processing);
            }
            else if (daysSinceCreation > 7) // 1-2 weeks old
            {
                // 40% shipped, 30% processing, 20% delivered, 10% confirmed
                var roll = Random.Next(100);
                if (roll < 40)
                    ApplyStatusProgression(order, OrderStatus.Shipped);
                else if (roll < 70)
                    ApplyStatusProgression(order, OrderStatus.Processing);
                else if (roll < 90)
                    ApplyStatusProgression(order, OrderStatus.Delivered);
                else
                    ApplyStatusProgression(order, OrderStatus.Confirmed);
            }
            else if (daysSinceCreation > 0) // Within last week
            {
                // 40% processing, 30% confirmed, 20% pending, 10% shipped
                var roll = Random.Next(100);
                if (roll < 40)
                    ApplyStatusProgression(order, OrderStatus.Processing);
                else if (roll < 70)
                    ApplyStatusProgression(order, OrderStatus.Confirmed);
                else if (roll < 90)
                {
                    // Stay pending
                }
                else
                    ApplyStatusProgression(order, OrderStatus.Shipped);
            }
            else // Future orders (negative days since creation)
            {
                // 80% pending, 20% confirmed
                var roll = Random.Next(100);
                if (roll < 80)
                {
                    // Stay pending
                }
                else
                    ApplyStatusProgression(order, OrderStatus.Confirmed);
            }
        }
    }

    private static void ApplyStatusProgression(DomainOrder order, OrderStatus targetStatus)
    {
        // Apply status transitions in order to maintain valid state machine
        if (targetStatus >= OrderStatus.Confirmed && order.Status < OrderStatus.Confirmed)
            order.UpdateStatus(OrderStatus.Confirmed, "System");

        if (targetStatus >= OrderStatus.Processing && order.Status < OrderStatus.Processing)
            order.UpdateStatus(OrderStatus.Processing, "System");

        if (targetStatus >= OrderStatus.Shipped && order.Status < OrderStatus.Shipped)
            order.UpdateStatus(OrderStatus.Shipped, "System");

        if (targetStatus >= OrderStatus.Delivered && order.Status < OrderStatus.Delivered)
            order.UpdateStatus(OrderStatus.Delivered, "System");
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

        var selectedProducts = products.OrderBy(_ => Random.Next()).Take(itemCount).ToList();
        foreach (var product in selectedProducts)
        {
            var quantity = Random.Next(1, 4);
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
