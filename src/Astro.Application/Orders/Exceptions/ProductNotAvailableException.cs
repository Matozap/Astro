namespace Astro.Application.Orders.Exceptions;

/// <summary>
/// Exception thrown when a product is not available for ordering.
/// </summary>
public sealed class ProductNotAvailableException : Exception
{
    public Guid ProductId { get; }
    public string? Reason { get; }

    public ProductNotAvailableException(Guid productId, string? reason = null)
        : base($"Product '{productId}' is not available for ordering. {reason}")
    {
        ProductId = productId;
        Reason = reason;
    }

    public ProductNotAvailableException(Guid productId, string reason, Exception innerException)
        : base($"Product '{productId}' is not available for ordering. {reason}", innerException)
    {
        ProductId = productId;
        Reason = reason;
    }
}
