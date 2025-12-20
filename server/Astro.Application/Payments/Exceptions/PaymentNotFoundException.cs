namespace Astro.Application.Payments.Exceptions;

/// <summary>
/// Exception thrown when a payment cannot be found
/// </summary>
public class PaymentNotFoundException : Exception
{
    public Guid PaymentId { get; }

    public PaymentNotFoundException(Guid paymentId)
        : base($"Payment with ID '{paymentId}' was not found.")
    {
        PaymentId = paymentId;
    }
}
