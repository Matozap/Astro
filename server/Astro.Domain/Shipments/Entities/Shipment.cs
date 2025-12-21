using Astro.Domain.Shared;
using Astro.Domain.Shared.ValueObjects;
using Astro.Domain.Shipments.Enums;
using Astro.Domain.Shipments.Events;
using Astro.Domain.Shipments.ValueObjects;

namespace Astro.Domain.Shipments.Entities;

/// <summary>
/// Shipment aggregate root with status state machine.
/// </summary>
public class Shipment : Entity, IAggregateRoot
{
    private readonly List<IDomainEvent> _domainEvents = [];
    private readonly List<TrackingDetail> _trackingDetails = [];
    private readonly List<ShipmentItem> _items = [];

    public Guid OrderId { get; private set; }
    public TrackingNumber TrackingNumber { get; private set; } = null!;
    public string Carrier { get; private set; } = null!;
    public ShipmentStatus Status { get; private set; }
    public Address OriginAddress { get; private set; } = null!;
    public Address DestinationAddress { get; private set; } = null!;
    public Weight Weight { get; private set; } = null!;
    public Dimensions Dimensions { get; private set; } = null!;
    public Money ShippingCost { get; private set; } = null!;
    public DateTimeOffset? EstimatedDeliveryDate { get; private set; }
    public DateTimeOffset? ActualDeliveryDate { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? UpdatedAt { get; private set; }
    public string CreatedBy { get; private set; } = null!;
    public string? ModifiedBy { get; private set; }

    public IReadOnlyCollection<TrackingDetail> TrackingDetails => _trackingDetails.AsReadOnly();
    public IReadOnlyCollection<ShipmentItem> Items => _items.AsReadOnly();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    // EF Core constructor
    private Shipment() { }

    private Shipment(
        Guid orderId,
        TrackingNumber trackingNumber,
        string carrier,
        Address originAddress,
        Address destinationAddress,
        Weight weight,
        Dimensions dimensions,
        Money shippingCost,
        DateTimeOffset? estimatedDeliveryDate,
        string createdBy)
    {
        ValidateCarrier(carrier);

        OrderId = orderId;
        TrackingNumber = trackingNumber;
        Carrier = carrier;
        Status = ShipmentStatus.Pending;
        OriginAddress = originAddress;
        DestinationAddress = destinationAddress;
        Weight = weight;
        Dimensions = dimensions;
        ShippingCost = shippingCost;
        EstimatedDeliveryDate = estimatedDeliveryDate;
        CreatedAt = DateTimeOffset.UtcNow;
        CreatedBy = createdBy;

        // Add initial tracking detail
        _trackingDetails.Add(new TrackingDetail(
            ShipmentStatus.Pending,
            originAddress.City,
            "Shipment created, awaiting pickup"));

        AddDomainEvent(new ShipmentCreatedEvent(Id, orderId, trackingNumber.Value, carrier));
    }

    /// <summary>
    /// Creates a new Shipment aggregate.
    /// </summary>
    public static Shipment Create(
        Guid orderId,
        string carrier,
        string originStreet,
        string originCity,
        string originState,
        string originPostalCode,
        string originCountry,
        string destinationStreet,
        string destinationCity,
        string destinationState,
        string destinationPostalCode,
        string destinationCountry,
        decimal weightValue,
        WeightUnit weightUnit,
        decimal length,
        decimal width,
        decimal height,
        DimensionUnit dimensionUnit,
        decimal shippingCost,
        DateTimeOffset? estimatedDeliveryDate,
        string createdBy,
        string? trackingNumber = null)
    {
        if (orderId == Guid.Empty)
            throw new ArgumentException("Order ID is required.", nameof(orderId));

        return new Shipment(
            orderId,
            trackingNumber != null ? TrackingNumber.Create(trackingNumber) : TrackingNumber.Generate(),
            carrier,
            Address.Create(originStreet, originCity, originState, originPostalCode, originCountry),
            Address.Create(destinationStreet, destinationCity, destinationState, destinationPostalCode, destinationCountry),
            Weight.Create(weightValue, weightUnit),
            Dimensions.Create(length, width, height, dimensionUnit),
            Money.FromDecimal(shippingCost),
            estimatedDeliveryDate,
            createdBy);
    }

    /// <summary>
    /// Adds an item to the shipment.
    /// </summary>
    public void AddItem(
        Guid orderDetailId,
        Guid productId,
        string productName,
        string productSku,
        int quantity)
    {
        EnsureNotTerminal();

        var existingItem = _items.Find(i => i.OrderDetailId == orderDetailId);
        if (existingItem is not null)
        {
            existingItem.UpdateQuantity(existingItem.Quantity + quantity);
        }
        else
        {
            var item = new ShipmentItem(orderDetailId, productId, productName, productSku, quantity);
            _items.Add(item);
        }

        UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Removes an item from the shipment.
    /// </summary>
    public void RemoveItem(Guid orderDetailId)
    {
        EnsureNotTerminal();

        var item = _items.Find(i => i.OrderDetailId == orderDetailId);
        if (item is not null)
        {
            _items.Remove(item);
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    /// <summary>
    /// Updates the shipment carrier and/or tracking number.
    /// Only allowed for Pending status.
    /// </summary>
    public void UpdateCarrier(string? carrier, string? trackingNumber, string modifiedBy)
    {
        if (Status != ShipmentStatus.Pending)
            throw new InvalidOperationException("Cannot update carrier after shipment has been shipped.");

        if (carrier is not null)
        {
            ValidateCarrier(carrier);
            Carrier = carrier;
        }

        if (trackingNumber is not null)
        {
            TrackingNumber = TrackingNumber.Create(trackingNumber);
        }

        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;
    }

    /// <summary>
    /// Transitions the shipment to a new status.
    /// </summary>
    public void UpdateStatus(ShipmentStatus newStatus, string? location, string? notes, string modifiedBy)
    {
        if (!Status.CanTransitionTo(newStatus))
            throw new InvalidOperationException(
                $"Cannot transition shipment from {Status} to {newStatus}");

        var oldStatus = Status;
        Status = newStatus;
        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;

        // Add tracking detail for the status change
        var trackingDetail = new TrackingDetail(newStatus, location, notes);
        _trackingDetails.Add(trackingDetail);

        AddDomainEvent(new ShipmentStatusChangedEvent(Id, oldStatus, newStatus, location, notes));
        AddDomainEvent(new TrackingDetailAddedEvent(Id, trackingDetail.Id, newStatus, location, notes));

        // Handle delivered status
        if (newStatus == ShipmentStatus.Delivered)
        {
            ActualDeliveryDate = DateTimeOffset.UtcNow;
            AddDomainEvent(new ShipmentDeliveredEvent(Id, OrderId, TrackingNumber.Value, ActualDeliveryDate.Value));
        }
    }

    /// <summary>
    /// Adds a tracking detail without changing status.
    /// </summary>
    public void AddTrackingDetail(string? location, string? notes, string modifiedBy)
    {
        EnsureNotTerminal();

        var trackingDetail = new TrackingDetail(Status, location, notes);
        _trackingDetails.Add(trackingDetail);
        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;

        AddDomainEvent(new TrackingDetailAddedEvent(Id, trackingDetail.Id, Status, location, notes));
    }

    /// <summary>
    /// Updates the estimated delivery date.
    /// </summary>
    public void UpdateEstimatedDeliveryDate(DateTimeOffset? estimatedDeliveryDate, string modifiedBy)
    {
        EnsureNotTerminal();

        EstimatedDeliveryDate = estimatedDeliveryDate;
        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    private void EnsureNotTerminal()
    {
        if (Status.IsTerminal())
            throw new InvalidOperationException(
                $"Cannot modify a shipment with terminal status {Status}");
    }

    private static void ValidateCarrier(string carrier)
    {
        if (string.IsNullOrWhiteSpace(carrier))
            throw new ArgumentException("Carrier is required.", nameof(carrier));

        if (carrier.Length > 100)
            throw new ArgumentException("Carrier cannot exceed 100 characters.", nameof(carrier));
    }
}
