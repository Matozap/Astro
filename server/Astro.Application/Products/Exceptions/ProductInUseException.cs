namespace Astro.Application.Products.Exceptions;

/// <summary>
/// Exception thrown when attempting to delete a product that is referenced in one or more orders.
/// </summary>
public class ProductInUseException : Exception
{
    /// <summary>
    /// Gets the ID of the product that cannot be deleted.
    /// </summary>
    public Guid ProductId { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="ProductInUseException"/> class.
    /// </summary>
    /// <param name="productId">The ID of the product that cannot be deleted.</param>
    public ProductInUseException(Guid productId)
        : base($"Cannot delete product '{productId}' because it has been used in one or more orders.")
    {
        ProductId = productId;
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="ProductInUseException"/> class with a custom message.
    /// </summary>
    /// <param name="productId">The ID of the product that cannot be deleted.</param>
    /// <param name="message">The error message.</param>
    public ProductInUseException(Guid productId, string message)
        : base(message)
    {
        ProductId = productId;
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="ProductInUseException"/> class with a custom message and inner exception.
    /// </summary>
    /// <param name="productId">The ID of the product that cannot be deleted.</param>
    /// <param name="message">The error message.</param>
    /// <param name="innerException">The inner exception.</param>
    public ProductInUseException(Guid productId, string message, Exception innerException)
        : base(message, innerException)
    {
        ProductId = productId;
    }
}
