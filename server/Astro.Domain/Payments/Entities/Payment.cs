using Astro.Domain.Orders.Entities;
using Astro.Domain.Payments.Enums;
using Astro.Domain.Payments.Events;
using Astro.Domain.Shared;
using Astro.Domain.Shared.ValueObjects;

namespace Astro.Domain.Payments.Entities;

/// <summary>
/// Payment aggregate root representing a payment for an order
/// </summary>
public class Payment : Entity, IAggregateRoot
{
    private readonly List<IDomainEvent> _domainEvents = [];

    public Guid OrderId { get; private set; }
    public PaymentStatus Status { get; private set; }
    public Money Amount { get; private set; } = null!;
    public string? PaymentMethod { get; private set; }
    public string? TransactionId { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    // Navigation property for EF Core
    public Order Order { get; private set; } = null!;

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    // EF Core constructor
    private Payment()
    {
        // Initialize with default values for EF Core
        Amount = Money.Zero();
    }

    private Payment(Guid orderId, Money amount, string? paymentMethod = null)
    {
        if (orderId == Guid.Empty)
            throw new ArgumentException("Order ID cannot be empty", nameof(orderId));

        OrderId = orderId;
        Amount = amount ?? throw new ArgumentNullException(nameof(amount));
        PaymentMethod = paymentMethod;
        Status = PaymentStatus.Pending;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new PaymentCreatedEvent(
            Id,
            OrderId,
            Status
        ));
    }

    /// <summary>
    /// Creates a new Payment aggregate with Pending status
    /// </summary>
    /// <param name="orderId">The ID of the order this payment is for</param>
    /// <param name="amount">The payment amount</param>
    /// <param name="paymentMethod">The payment method (optional)</param>
    /// <returns>A new Payment instance</returns>
    public static Payment Create(Guid orderId, Money amount, string? paymentMethod = null)
    {
        return new Payment(orderId, amount, paymentMethod);
    }

    /// <summary>
    /// Sets the transaction ID when payment is processed
    /// </summary>
    /// <param name="transactionId">The transaction ID from the payment processor</param>
    public void SetTransactionId(string transactionId)
    {
        if (string.IsNullOrWhiteSpace(transactionId))
            throw new ArgumentException("Transaction ID cannot be empty", nameof(transactionId));

        TransactionId = transactionId;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Updates the payment status
    /// </summary>
    /// <param name="newStatus">The new status to transition to</param>
    /// <exception cref="InvalidOperationException">Thrown when the status transition is invalid</exception>
    public void UpdateStatus(PaymentStatus newStatus)
    {
        ValidateStatusTransition(newStatus);

        var oldStatus = Status;
        Status = newStatus;
        UpdatedAt = DateTimeOffset.UtcNow;

        AddDomainEvent(new PaymentStatusChangedEvent(
            Id,
            OrderId,
            oldStatus,
            newStatus
        ));
    }

    private void ValidateStatusTransition(PaymentStatus newStatus)
    {
        if (Status == newStatus)
            throw new InvalidOperationException($"Payment is already in {Status} status");

        if (!Status.CanTransitionTo(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition payment status from {Status} to {newStatus}");
    }

    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
