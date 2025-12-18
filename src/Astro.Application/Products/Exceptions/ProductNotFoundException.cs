namespace Astro.Application.Products.Exceptions;

/// <summary>
/// Exception thrown when a product is not found.
/// </summary>
public sealed class ProductNotFoundException : Exception
{
    public Guid ProductId { get; }

    public ProductNotFoundException(Guid productId)
        : base($"Product with ID '{productId}' was not found.")
    {
        ProductId = productId;
    }

    public ProductNotFoundException(Guid productId, string message)
        : base(message)
    {
        ProductId = productId;
    }

    public ProductNotFoundException(Guid productId, string message, Exception innerException)
        : base(message, innerException)
    {
        ProductId = productId;
    }
}
