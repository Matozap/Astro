using Astro.Domain.Orders.Entities;
using Astro.Domain.Orders.Enums;
using Astro.Domain.Payments.Entities;
using Astro.Domain.Payments.Enums;
using Astro.Domain.Products.Entities;
using Astro.Domain.Products.Enums;
using Astro.Domain.Shipments.Entities;
using Astro.Domain.Shipments.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Astro.Infrastructure.Common;

/// <summary>
/// Database seeder for initial product and order data.
/// </summary>
public static class DatabaseSeeder
{
    /// <summary>
    /// Ensures the database is created and seeds initial data if empty.
    /// </summary>
    public static async Task SeedDatabaseAsync(this IHost host)
    {
        using var scope = host.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<AstroDbContext>>();
        var context = services.GetRequiredService<AstroDbContext>();

        const int maxRetries = 5;
        const int delayMs = 2000;

        for (var attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                logger.LogInformation("Ensuring database is created (attempt {Attempt}/{MaxRetries})...", attempt, maxRetries);

                if (!await context.Database.CanConnectAsync())
                {
                    throw new InvalidOperationException("Database is not available");
                }

                await context.Database.EnsureCreatedAsync();

                if (!await context.Products.AnyAsync())
                {
                    logger.LogInformation("Seeding products...");
                    await SeedProductsAsync(context);
                }

                if (!await context.Orders.AnyAsync())
                {
                    logger.LogInformation("Seeding orders...");
                    await SeedOrdersAsync(context);
                }

                if (!await context.Payments.AnyAsync())
                {
                    logger.LogInformation("Seeding payments...");
                    await SeedPaymentsAsync(context);
                }

                if (!await context.Shipments.AnyAsync())
                {
                    logger.LogInformation("Seeding shipments...");
                    await SeedShipmentsAsync(context);
                }

                logger.LogInformation("Database seeding completed");
                return;
            }
            catch (Exception ex) when (attempt < maxRetries)
            {
                logger.LogWarning(ex, "Database seeding attempt {Attempt} failed, retrying in {DelayMs}ms...", attempt, delayMs);
                await Task.Delay(delayMs);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database after {MaxRetries} attempts", maxRetries);
                throw;
            }
        }
    }

    private static async Task SeedProductsAsync(AstroDbContext context)
    {
        var products = new List<Product>
        {
            CreateProduct(
                "Wireless Bluetooth Headphones",
                "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Features memory foam ear cushions for all-day comfort.",
                149.99m, "WBH001", 50, 10,
                new Dictionary<string, string>
                {
                    { "Brand", "AudioTech" },
                    { "Color", "Matte Black" },
                    { "Battery Life", "30 hours" },
                    { "Connectivity", "Bluetooth 5.2" },
                    { "Weight", "250g" }
                },
                new[] { ("headphones-main.jpg", "https://images.example.com/products/headphones-main.jpg", true),
                        ("headphones-side.jpg", "https://images.example.com/products/headphones-side.jpg", false) }),

            CreateProduct(
                "Mechanical Gaming Keyboard",
                "RGB backlit mechanical keyboard with Cherry MX switches, programmable macros, and detachable wrist rest. N-key rollover for competitive gaming.",
                129.99m, "MGK002", 75, 15,
                new Dictionary<string, string>
                {
                    { "Brand", "GameGear" },
                    { "Switch Type", "Cherry MX Red" },
                    { "Backlighting", "RGB Per-Key" },
                    { "Layout", "Full Size (104 keys)" },
                    { "Cable Length", "1.8m braided" }
                },
                new[] { ("keyboard-main.jpg", "https://images.example.com/products/keyboard-main.jpg", true),
                        ("keyboard-rgb.jpg", "https://images.example.com/products/keyboard-rgb.jpg", false) }),

            CreateProduct(
                "4K Ultra HD Monitor",
                "27-inch IPS display with 4K UHD resolution, HDR10 support, and 144Hz refresh rate. Perfect for gaming and professional content creation.",
                449.99m, "UHD027", 30, 5,
                new Dictionary<string, string>
                {
                    { "Brand", "ViewMaster" },
                    { "Screen Size", "27 inches" },
                    { "Resolution", "3840x2160" },
                    { "Refresh Rate", "144Hz" },
                    { "Panel Type", "IPS" },
                    { "Response Time", "1ms" }
                },
                new[] { ("monitor-front.jpg", "https://images.example.com/products/monitor-front.jpg", true),
                        ("monitor-angle.jpg", "https://images.example.com/products/monitor-angle.jpg", false),
                        ("monitor-back.jpg", "https://images.example.com/products/monitor-back.jpg", false) }),

            CreateProduct(
                "Ergonomic Office Chair",
                "High-back mesh office chair with lumbar support, adjustable armrests, and breathable design. Supports up to 300 lbs with smooth-rolling casters.",
                299.99m, "EOC003", 40, 8,
                new Dictionary<string, string>
                {
                    { "Brand", "ComfortPlus" },
                    { "Material", "Breathable Mesh" },
                    { "Weight Capacity", "300 lbs" },
                    { "Adjustable Height", "16-20 inches" },
                    { "Warranty", "5 years" }
                },
                new[] { ("chair-main.jpg", "https://images.example.com/products/chair-main.jpg", true),
                        ("chair-side.jpg", "https://images.example.com/products/chair-side.jpg", false) }),

            CreateProduct(
                "Portable SSD 1TB",
                "Ultra-fast portable solid state drive with USB-C connectivity. Read speeds up to 1050MB/s. Shock-resistant and compact design.",
                89.99m, "SSD1TB", 100, 20,
                new Dictionary<string, string>
                {
                    { "Brand", "DataVault" },
                    { "Capacity", "1TB" },
                    { "Read Speed", "1050 MB/s" },
                    { "Write Speed", "1000 MB/s" },
                    { "Interface", "USB 3.2 Gen 2" },
                    { "Dimensions", "100x55x9mm" }
                },
                new[] { ("ssd-main.jpg", "https://images.example.com/products/ssd-main.jpg", true) }),

            CreateProduct(
                "Smart Fitness Watch",
                "Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Water resistant to 50 meters.",
                199.99m, "SFW004", 60, 12,
                new Dictionary<string, string>
                {
                    { "Brand", "FitTech" },
                    { "Display", "1.4 inch AMOLED" },
                    { "Battery Life", "7 days" },
                    { "Water Resistance", "50 meters" },
                    { "Sensors", "Heart Rate, SpO2, GPS" },
                    { "Compatibility", "iOS & Android" }
                },
                new[] { ("watch-main.jpg", "https://images.example.com/products/watch-main.jpg", true),
                        ("watch-band.jpg", "https://images.example.com/products/watch-band.jpg", false) }),

            CreateProduct(
                "USB-C Docking Station",
                "12-in-1 USB-C hub with dual HDMI, Ethernet, SD card reader, and 100W power delivery. Perfect for laptop users seeking expanded connectivity.",
                79.99m, "DOCK012", 45, 10,
                new Dictionary<string, string>
                {
                    { "Brand", "ConnectPro" },
                    { "Ports", "12" },
                    { "Video Output", "Dual HDMI 4K@60Hz" },
                    { "Power Delivery", "100W" },
                    { "Ethernet", "Gigabit" },
                    { "Card Slots", "SD/MicroSD" }
                },
                new[] { ("dock-main.jpg", "https://images.example.com/products/dock-main.jpg", true),
                        ("dock-ports.jpg", "https://images.example.com/products/dock-ports.jpg", false) }),

            CreateProduct(
                "Wireless Gaming Mouse",
                "Ultra-lightweight wireless mouse with 25K DPI sensor, 70-hour battery life, and customizable RGB lighting. Weighs only 63 grams.",
                69.99m, "WGM005", 80, 15,
                new Dictionary<string, string>
                {
                    { "Brand", "GameGear" },
                    { "DPI", "25,600" },
                    { "Battery Life", "70 hours" },
                    { "Weight", "63g" },
                    { "Buttons", "6 programmable" },
                    { "Connectivity", "2.4GHz Wireless & Bluetooth" }
                },
                new[] { ("mouse-main.jpg", "https://images.example.com/products/mouse-main.jpg", true),
                        ("mouse-grip.jpg", "https://images.example.com/products/mouse-grip.jpg", false) }),

            CreateProduct(
                "Webcam 4K Pro",
                "Professional 4K webcam with auto-focus, dual noise-canceling microphones, and privacy shutter. Ideal for streaming and video conferencing.",
                159.99m, "WC4K006", 35, 7,
                new Dictionary<string, string>
                {
                    { "Brand", "StreamCam" },
                    { "Resolution", "4K @ 30fps" },
                    { "Field of View", "90 degrees" },
                    { "Microphones", "Dual stereo" },
                    { "Mount", "Universal clip" },
                    { "Features", "Auto-focus, HDR, Privacy shutter" }
                },
                new[] { ("webcam-main.jpg", "https://images.example.com/products/webcam-main.jpg", true) }),

            CreateProduct(
                "Standing Desk Converter",
                "Height-adjustable standing desk converter with spacious work surface. Smoothly transitions between sitting and standing positions in seconds.",
                249.99m, "SDC007", 25, 5,
                new Dictionary<string, string>
                {
                    { "Brand", "ErgoRise" },
                    { "Surface Dimensions", "35 x 23 inches" },
                    { "Height Range", "6-17 inches" },
                    { "Weight Capacity", "35 lbs" },
                    { "Lift Mechanism", "Gas spring" },
                    { "Keyboard Tray", "Included" }
                },
                new[] { ("desk-main.jpg", "https://images.example.com/products/desk-main.jpg", true),
                        ("desk-raised.jpg", "https://images.example.com/products/desk-raised.jpg", false),
                        ("desk-lowered.jpg", "https://images.example.com/products/desk-lowered.jpg", false) })
        };

        context.Products.AddRange(products);
        await context.SaveChangesAsync();
    }

    private static Product CreateProduct(
        string name,
        string description,
        decimal price,
        string sku,
        int stockQuantity,
        int lowStockThreshold,
        Dictionary<string, string> details,
        (string fileName, string url, bool isPrimary)[] images)
    {
        var product = Product.Create(
            name,
            description,
            price,
            sku,
            stockQuantity,
            lowStockThreshold,
            isActive: true,
            createdBy: "System");

        foreach (var (key, value) in details)
        {
            product.AddDetail(key, value);
        }

        foreach (var (fileName, url, isPrimary) in images)
        {
            product.AddImage(fileName, url, StorageMode.Azure, isPrimary);
        }

        product.ClearDomainEvents();
        return product;
    }

    private static async Task SeedOrdersAsync(AstroDbContext context)
    {
        var products = await context.Products.ToListAsync();
        var random = new Random(42); // Fixed seed for reproducibility

        var orders = new List<Order>
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

        // Set various order statuses for realistic data
        orders[0].UpdateStatus(OrderStatus.Confirmed, "System");
        orders[1].UpdateStatus(OrderStatus.Confirmed, "System");
        orders[1].UpdateStatus(OrderStatus.Processing, "System");
        orders[2].UpdateStatus(OrderStatus.Confirmed, "System");
        orders[2].UpdateStatus(OrderStatus.Processing, "System");
        orders[2].UpdateStatus(OrderStatus.Shipped, "System");
        orders[3].UpdateStatus(OrderStatus.Confirmed, "System");
        orders[3].UpdateStatus(OrderStatus.Processing, "System");
        orders[3].UpdateStatus(OrderStatus.Shipped, "System");
        orders[3].UpdateStatus(OrderStatus.Delivered, "System");
        // orders[4] stays Pending
        orders[5].UpdateStatus(OrderStatus.Confirmed, "System");
        orders[6].Cancel("Customer requested cancellation", "System");
        orders[7].UpdateStatus(OrderStatus.Confirmed, "System");
        orders[7].UpdateStatus(OrderStatus.Processing, "System");
        // orders[8] stays Pending
        orders[9].UpdateStatus(OrderStatus.Confirmed, "System");

        foreach (var order in orders)
        {
            order.ClearDomainEvents();
        }

        context.Orders.AddRange(orders);
        await context.SaveChangesAsync();
    }

    private static Order CreateOrder(
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
        var order = Order.Create(
            customerName,
            customerEmail,
            street,
            city,
            state,
            postalCode,
            country,
            notes,
            createdBy: "System");

        // Add random products to the order
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

    private static async Task SeedPaymentsAsync(AstroDbContext context)
    {
        var orders = await context.Orders.ToListAsync();
        var random = new Random(42); // Fixed seed for reproducibility

        var payments = new List<Payment>();

        // Create payments for orders with a mix of statuses
        // 30% Pending, 50% Successful, 20% Failed
        var paymentScenarios = new[]
        {
            // Order 1: Successful payment on first attempt
            (orders[0].Id, PaymentStatus.Successful),

            // Order 2: Failed first attempt, successful second attempt (retry scenario)
            (orders[1].Id, PaymentStatus.Failed),
            (orders[1].Id, PaymentStatus.Successful),

            // Order 3: Still pending
            (orders[2].Id, PaymentStatus.Pending),

            // Order 4: Multiple failed attempts, still pending
            (orders[3].Id, PaymentStatus.Failed),
            (orders[3].Id, PaymentStatus.Failed),
            (orders[3].Id, PaymentStatus.Pending),

            // Order 5: Successful
            (orders[4].Id, PaymentStatus.Successful),

            // Order 6: Pending
            (orders[5].Id, PaymentStatus.Pending),

            // Order 7: Successful
            (orders[6].Id, PaymentStatus.Successful),

            // Order 8: Failed then successful
            (orders[7].Id, PaymentStatus.Failed),
            (orders[7].Id, PaymentStatus.Successful),

            // Order 9: Pending
            (orders[8].Id, PaymentStatus.Pending),

            // Order 10: Successful
            (orders[9].Id, PaymentStatus.Successful),

            // Additional payments for variety
            (orders[0].Id, PaymentStatus.Pending), // Order 1 has another pending payment
            (orders[2].Id, PaymentStatus.Failed),  // Order 3 also has a failed payment
            (orders[5].Id, PaymentStatus.Successful), // Order 6 has successful payment
            (orders[8].Id, PaymentStatus.Failed)   // Order 9 has a failed payment
        };

        foreach (var (orderId, status) in paymentScenarios)
        {
            var payment = Payment.Create(orderId);

            // Update status if not Pending
            if (status != PaymentStatus.Pending)
            {
                payment.UpdateStatus(status);
            }

            payment.ClearDomainEvents();
            payments.Add(payment);
        }

        context.Payments.AddRange(payments);
        await context.SaveChangesAsync();
    }

    private static async Task SeedShipmentsAsync(AstroDbContext context)
    {
        var orders = await context.Orders
            .Include(o => o.Details)
            .Where(o => o.Status == OrderStatus.Shipped || o.Status == OrderStatus.Delivered)
            .ToListAsync();

        var shipments = new List<Shipment>();
        var carriers = new[] { "FedEx", "UPS", "USPS", "DHL" };
        var random = new Random(42); // Fixed seed for reproducibility

        foreach (var order in orders)
        {
            var carrier = carriers[random.Next(carriers.Length)];
            var shipment = Shipment.Create(
                orderId: order.Id,
                carrier: carrier,
                originStreet: "100 Warehouse Drive",
                originCity: "Memphis",
                originState: "TN",
                originPostalCode: "38118",
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

            // Add items from order details
            foreach (var detail in order.Details)
            {
                shipment.AddItem(
                    detail.Id,
                    detail.ProductId,
                    detail.ProductName,
                    detail.ProductSku,
                    detail.Quantity);
            }

            // Update shipment status based on order status
            if (order.Status == OrderStatus.Shipped)
            {
                shipment.UpdateStatus(ShipmentStatus.Shipped, "Distribution Center", "Package picked up by carrier", "System");
                shipment.UpdateStatus(ShipmentStatus.InTransit, "Regional Hub", "Package in transit to destination", "System");
            }
            else if (order.Status == OrderStatus.Delivered)
            {
                shipment.UpdateStatus(ShipmentStatus.Shipped, "Distribution Center", "Package picked up by carrier", "System");
                shipment.UpdateStatus(ShipmentStatus.InTransit, "Regional Hub", "Package in transit", "System");
                shipment.UpdateStatus(ShipmentStatus.OutForDelivery, "Local Delivery Center", "Out for delivery", "System");
                shipment.UpdateStatus(ShipmentStatus.Delivered, "Customer Location", "Delivered to recipient", "System");
            }

            shipment.ClearDomainEvents();
            shipments.Add(shipment);
        }

        // Add some additional shipments for variety
        var allOrders = await context.Orders
            .Include(o => o.Details)
            .Where(o => o.Status == OrderStatus.Processing)
            .Take(3)
            .ToListAsync();

        foreach (var order in allOrders)
        {
            var carrier = carriers[random.Next(carriers.Length)];
            var shipment = Shipment.Create(
                orderId: order.Id,
                carrier: carrier,
                originStreet: "200 Fulfillment Lane",
                originCity: "Louisville",
                originState: "KY",
                originPostalCode: "40213",
                originCountry: "USA",
                destinationStreet: order.ShippingAddress.Street,
                destinationCity: order.ShippingAddress.City,
                destinationState: order.ShippingAddress.State,
                destinationPostalCode: order.ShippingAddress.PostalCode,
                destinationCountry: order.ShippingAddress.Country,
                weightValue: random.Next(1, 15) + random.Next(0, 99) / 100m,
                weightUnit: WeightUnit.Pounds,
                length: random.Next(8, 20),
                width: random.Next(6, 14),
                height: random.Next(4, 10),
                dimensionUnit: DimensionUnit.Inches,
                shippingCost: random.Next(8, 35) + random.Next(0, 99) / 100m,
                estimatedDeliveryDate: DateTimeOffset.UtcNow.AddDays(random.Next(2, 7)),
                createdBy: "System");

            // Add items from order details
            foreach (var detail in order.Details)
            {
                shipment.AddItem(
                    detail.Id,
                    detail.ProductId,
                    detail.ProductName,
                    detail.ProductSku,
                    detail.Quantity);
            }

            // These shipments are still pending (awaiting pickup)
            shipment.ClearDomainEvents();
            shipments.Add(shipment);
        }

        context.Shipments.AddRange(shipments);
        await context.SaveChangesAsync();
    }
}
