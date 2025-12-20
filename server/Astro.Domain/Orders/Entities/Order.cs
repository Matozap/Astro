using Astro.Domain.Orders.Enums;
using Astro.Domain.Orders.Events;
using Astro.Domain.Orders.ValueObjects;
using Astro.Domain.Payments.Entities;
using Astro.Domain.Shared;
using Astro.Domain.Shared.ValueObjects;

namespace Astro.Domain.Orders.Entities;

/// <summary>
/// Order aggregate root with status state machine.
/// </summary>
public class Order : Entity, IAggregateRoot
{
    private readonly List<IDomainEvent> _domainEvents = [];
    private readonly List<OrderDetail> _details = [];
    private readonly List<Payment> _payments = [];

    public OrderNumber OrderNumber { get; private set; } = null!;
    public string CustomerName { get; private set; } = null!;
    public Email CustomerEmail { get; private set; } = null!;
    public Address ShippingAddress { get; private set; } = null!;
    public OrderStatus Status { get; private set; }
    public Money TotalAmount { get; private set; } = null!;
    public string? Notes { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? UpdatedAt { get; private set; }
    public string CreatedBy { get; private set; } = null!;
    public string? ModifiedBy { get; private set; }

    public IReadOnlyCollection<OrderDetail> Details => _details.AsReadOnly();
    public IReadOnlyCollection<Payment> Payments => _payments.AsReadOnly();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    // EF Core constructor
    private Order() { }

    private Order(
        string customerName,
        Email customerEmail,
        Address shippingAddress,
        string? notes,
        string createdBy)
    {
        ValidateCustomerName(customerName);

        OrderNumber = OrderNumber.Generate();
        CustomerName = customerName;
        CustomerEmail = customerEmail;
        ShippingAddress = shippingAddress;
        Status = OrderStatus.Pending;
        TotalAmount = Money.Zero();
        Notes = notes;
        CreatedAt = DateTimeOffset.UtcNow;
        CreatedBy = createdBy;

        AddDomainEvent(new OrderCreatedEvent(Id, OrderNumber.Value, customerName));
    }

    /// <summary>
    /// Creates a new Order aggregate.
    /// </summary>
    public static Order Create(
        string customerName,
        string customerEmail,
        string street,
        string city,
        string state,
        string postalCode,
        string country,
        string? notes,
        string createdBy)
    {
        return new Order(
            customerName,
            Email.Create(customerEmail),
            Address.Create(street, city, state, postalCode, country),
            notes,
            createdBy);
    }

    /// <summary>
    /// Adds a line item to the order.
    /// </summary>
    public void AddDetail(
        Guid productId,
        string productName,
        string productSku,
        int quantity,
        decimal unitPrice)
    {
        EnsureNotTerminal();

        var existingDetail = _details.Find(d => d.ProductId == productId);
        if (existingDetail is not null)
        {
            existingDetail.UpdateQuantity(existingDetail.Quantity + quantity);
        }
        else
        {
            var detail = new OrderDetail(
                productId,
                productName,
                productSku,
                quantity,
                Money.FromDecimal(unitPrice));
            _details.Add(detail);
        }

        RecalculateTotal();
    }

    /// <summary>
    /// Removes a line item from the order.
    /// </summary>
    public void RemoveDetail(Guid productId)
    {
        EnsureNotTerminal();

        var detail = _details.Find(d => d.ProductId == productId);
        if (detail is not null)
        {
            _details.Remove(detail);
            RecalculateTotal();
        }
    }

    /// <summary>
    /// Updates the order's customer information.
    /// </summary>
    public void UpdateCustomerInfo(
        string? customerName,
        string? customerEmail,
        string? notes,
        string modifiedBy)
    {
        EnsureNotTerminal();

        if (customerName is not null)
        {
            ValidateCustomerName(customerName);
            CustomerName = customerName;
        }

        if (customerEmail is not null)
            CustomerEmail = Email.Create(customerEmail);

        if (notes is not null)
            Notes = notes;

        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;
    }

    /// <summary>
    /// Updates the shipping address.
    /// </summary>
    public void UpdateShippingAddress(
        string street,
        string city,
        string state,
        string postalCode,
        string country,
        string modifiedBy)
    {
        EnsureNotTerminal();

        ShippingAddress = Address.Create(street, city, state, postalCode, country);
        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;
    }

    /// <summary>
    /// Transitions the order to a new status.
    /// </summary>
    public void UpdateStatus(OrderStatus newStatus, string modifiedBy)
    {
        if (!Status.CanTransitionTo(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition order from {Status} to {newStatus}");

        var oldStatus = Status;
        Status = newStatus;
        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;

        AddDomainEvent(new OrderStatusChangedEvent(Id, oldStatus, newStatus));
    }

    /// <summary>
    /// Cancels the order.
    /// </summary>
    public void Cancel(string? reason, string modifiedBy)
    {
        if (Status.IsTerminal())
            throw new InvalidOperationException(
                $"Cannot cancel an order with status {Status}");

        var oldStatus = Status;
        Status = OrderStatus.Cancelled;
        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;

        AddDomainEvent(new OrderCancelledEvent(Id, reason));
        AddDomainEvent(new OrderStatusChangedEvent(Id, oldStatus, OrderStatus.Cancelled));
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    private void RecalculateTotal()
    {
        var total = Money.Zero();
        foreach (var detail in _details)
        {
            total = total.Add(detail.LineTotal);
        }
        TotalAmount = total;
    }

    private void EnsureNotTerminal()
    {
        if (Status.IsTerminal())
            throw new InvalidOperationException(
                $"Cannot modify an order with terminal status {Status}");
    }

    private static void ValidateCustomerName(string customerName)
    {
        if (string.IsNullOrWhiteSpace(customerName))
            throw new ArgumentException("Customer name is required.", nameof(customerName));

        if (customerName.Length > 200)
            throw new ArgumentException("Customer name cannot exceed 200 characters.", nameof(customerName));
    }
}
