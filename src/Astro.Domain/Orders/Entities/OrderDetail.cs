using Astro.Domain.Shared;
using Astro.Domain.Shared.ValueObjects;

namespace Astro.Domain.Orders.Entities;

/// <summary>
/// Child entity representing an order line item.
/// Contains a snapshot of product data at order time.
/// </summary>
public class OrderDetail : Entity
{
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = null!;
    public string ProductSku { get; private set; } = null!;
    public int Quantity { get; private set; }
    public Money UnitPrice { get; private set; } = null!;

    /// <summary>
    /// Calculated line total (Quantity * UnitPrice).
    /// </summary>
    public Money LineTotal => UnitPrice.Multiply(Quantity);

    // EF Core constructor
    private OrderDetail() { }

    internal OrderDetail(
        Guid productId,
        string productName,
        string productSku,
        int quantity,
        Money unitPrice)
    {
        if (productId == Guid.Empty)
            throw new ArgumentException("Product ID is required.", nameof(productId));

        if (string.IsNullOrWhiteSpace(productName))
            throw new ArgumentException("Product name is required.", nameof(productName));

        if (string.IsNullOrWhiteSpace(productSku))
            throw new ArgumentException("Product SKU is required.", nameof(productSku));

        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));

        ProductId = productId;
        ProductName = productName;
        ProductSku = productSku;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }

    internal void UpdateQuantity(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));

        Quantity = quantity;
    }
}
