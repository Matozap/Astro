using Astro.Domain.Products.Entities;
using Astro.Domain.Products.Enums;
using Astro.Infrastructure.DataAccess.Common;
using Microsoft.EntityFrameworkCore;

namespace Astro.Infrastructure.DataAccess.Products.Persistence;

/// <summary>
/// Seeds initial product data into the database.
/// </summary>
public sealed class ProductSeeder : ISeeder
{
    public int Order => 1; // Products must be seeded first (orders depend on them)

    public async Task<bool> SeedAsync(AstroDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Products.AnyAsync(cancellationToken))
        {
            return false;
        }

        var products = CreateProducts();
        context.Products.AddRange(products);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static List<Product> CreateProducts() =>
    [
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
            [("headphones-main.jpg", "https://picsum.photos/seed/1/200/300.jpg", true),
             ("headphones-side.jpg", "https://picsum.photos/seed/2/200/300.jpg", false)]),

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
            [("keyboard-main.jpg", "https://picsum.photos/seed/3/200/300.jpg", true),
             ("keyboard-rgb.jpg", "https://picsum.photos/seed/4/200/300.jpg", false)]),

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
            [("monitor-front.jpg", "https://picsum.photos/seed/5/200/300.jpg", true),
             ("monitor-angle.jpg", "https://picsum.photos/seed/6/200/300.jpg", false),
             ("monitor-back.jpg", "https://picsum.photos/seed/7/200/300.jpg", false)]),

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
            [("chair-main.jpg", "https://picsum.photos/seed/8/200/300.jpg", true),
             ("chair-side.jpg", "https://picsum.photos/seed/9/200/300.jpg", false)]),

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
            [("ssd-main.jpg", "https://picsum.photos/seed/10/200/300.jpg", true)]),

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
            [("watch-main.jpg", "https://picsum.photos/seed/11/200/300.jpg", true),
             ("watch-band.jpg", "https://picsum.photos/seed/12/200/300.jpg", false)]),

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
            [("dock-main.jpg", "https://picsum.photos/seed/13/200/300.jpg", true),
             ("dock-ports.jpg", "https://picsum.photos/seed/14/200/300.jpg", false)]),

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
            [("mouse-main.jpg", "https://picsum.photos/seed/15/200/300.jpg", true),
             ("mouse-grip.jpg", "https://picsum.photos/seed/16/200/300.jpg", false)]),

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
            [("webcam-main.jpg", "https://picsum.photos/seed/17/200/300.jpg", true)]),

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
            [("desk-main.jpg", "https://picsum.photos/seed/18/200/300.jpg", true),
             ("desk-raised.jpg", "https://picsum.photos/seed/19/200/300.jpg", false),
             ("desk-lowered.jpg", "https://picsum.photos/seed/20/200/300.jpg", false)])
    ];

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
}
