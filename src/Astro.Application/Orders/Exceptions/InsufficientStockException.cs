namespace Astro.Application.Orders.Exceptions;

/// <summary>
/// Exception thrown when there is insufficient stock for an order.
/// </summary>
public sealed class InsufficientStockException : Exception
{
    public Guid ProductId { get; }
    public int RequestedQuantity { get; }
    public int AvailableQuantity { get; }

    public InsufficientStockException(Guid productId, int requestedQuantity, int availableQuantity)
        : base($"Insufficient stock for product '{productId}'. Requested: {requestedQuantity}, Available: {availableQuantity}")
    {
        ProductId = productId;
        RequestedQuantity = requestedQuantity;
        AvailableQuantity = availableQuantity;
    }

    public InsufficientStockException(Guid productId, int requestedQuantity, int availableQuantity, string message)
        : base(message)
    {
        ProductId = productId;
        RequestedQuantity = requestedQuantity;
        AvailableQuantity = availableQuantity;
    }

    public InsufficientStockException(Guid productId, int requestedQuantity, int availableQuantity, string message, Exception innerException)
        : base(message, innerException)
    {
        ProductId = productId;
        RequestedQuantity = requestedQuantity;
        AvailableQuantity = availableQuantity;
    }
}
