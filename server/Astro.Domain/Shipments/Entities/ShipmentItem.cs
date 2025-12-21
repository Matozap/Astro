using Astro.Domain.Shared;

namespace Astro.Domain.Shipments.Entities;

/// <summary>
/// Child entity representing an item included in a shipment.
/// Links back to the order detail for reference.
/// </summary>
public class ShipmentItem : Entity
{
    public Guid OrderDetailId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = null!;
    public string ProductSku { get; private set; } = null!;
    public int Quantity { get; private set; }

    // EF Core constructor
    private ShipmentItem() { }

    internal ShipmentItem(
        Guid orderDetailId,
        Guid productId,
        string productName,
        string productSku,
        int quantity)
    {
        if (orderDetailId == Guid.Empty)
            throw new ArgumentException("Order detail ID is required.", nameof(orderDetailId));

        if (productId == Guid.Empty)
            throw new ArgumentException("Product ID is required.", nameof(productId));

        if (string.IsNullOrWhiteSpace(productName))
            throw new ArgumentException("Product name is required.", nameof(productName));

        if (string.IsNullOrWhiteSpace(productSku))
            throw new ArgumentException("Product SKU is required.", nameof(productSku));

        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));

        OrderDetailId = orderDetailId;
        ProductId = productId;
        ProductName = productName;
        ProductSku = productSku;
        Quantity = quantity;
    }

    internal void UpdateQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));

        Quantity = quantity;
    }
}
