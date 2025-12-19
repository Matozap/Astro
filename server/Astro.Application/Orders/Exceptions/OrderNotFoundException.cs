namespace Astro.Application.Orders.Exceptions;

/// <summary>
/// Exception thrown when an order is not found.
/// </summary>
public sealed class OrderNotFoundException : Exception
{
    public Guid? OrderId { get; }
    public string? OrderNumber { get; }

    public OrderNotFoundException(Guid orderId)
        : base($"Order with ID '{orderId}' was not found.")
    {
        OrderId = orderId;
    }

    public OrderNotFoundException(string orderNumber)
        : base($"Order with number '{orderNumber}' was not found.")
    {
        OrderNumber = orderNumber;
    }

    public OrderNotFoundException(Guid orderId, string message)
        : base(message)
    {
        OrderId = orderId;
    }

    public OrderNotFoundException(Guid orderId, string message, Exception innerException)
        : base(message, innerException)
    {
        OrderId = orderId;
    }
}
