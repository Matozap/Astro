using Astro.Domain.Shipments.Entities;
using Astro.Domain.Shipments.Enums;
using Shouldly;
using Xunit;

namespace Astro.Tests.Shipments.Domain;

public class ShipmentTests
{
    [Fact]
    public void Create_WithValidParameters_ShouldCreateShipment()
    {
        var orderId = Guid.NewGuid();

        var shipment = Shipment.Create(
            orderId: orderId,
            carrier: "FedEx",
            originStreet: "123 Warehouse St",
            originCity: "New York",
            originState: "NY",
            originPostalCode: "10001",
            originCountry: "USA",
            destinationStreet: "456 Customer Ave",
            destinationCity: "Los Angeles",
            destinationState: "CA",
            destinationPostalCode: "90001",
            destinationCountry: "USA",
            weightValue: 5.5m,
            weightUnit: WeightUnit.Pounds,
            length: 12m,
            width: 8m,
            height: 6m,
            dimensionUnit: DimensionUnit.Inches,
            shippingCost: 15.99m,
            estimatedDeliveryDate: DateTimeOffset.UtcNow.AddDays(3),
            createdBy: "test-user");

        shipment.ShouldNotBeNull();
        shipment.OrderId.ShouldBe(orderId);
        shipment.Carrier.ShouldBe("FedEx");
        shipment.Status.ShouldBe(ShipmentStatus.Pending);
        shipment.TrackingNumber.Value.ShouldStartWith("TRK");
        shipment.OriginAddress.City.ShouldBe("New York");
        shipment.DestinationAddress.City.ShouldBe("Los Angeles");
        shipment.Weight.Value.ShouldBe(5.5m);
        shipment.Dimensions.Length.ShouldBe(12m);
        shipment.ShippingCost.Amount.ShouldBe(15.99m);
        shipment.CreatedBy.ShouldBe("test-user");
    }

    [Fact]
    public void Create_WithCustomTrackingNumber_ShouldUseProvided()
    {
        var shipment = CreateTestShipment(trackingNumber: "CUSTOM12345");

        shipment.TrackingNumber.Value.ShouldBe("CUSTOM12345");
    }

    [Fact]
    public void Create_ShouldRaiseShipmentCreatedEvent()
    {
        var shipment = CreateTestShipment();

        shipment.DomainEvents.ShouldContain(e =>
            e.GetType().Name == "ShipmentCreatedEvent");
    }

    [Fact]
    public void Create_ShouldAddInitialTrackingDetail()
    {
        var shipment = CreateTestShipment();

        shipment.TrackingDetails.Count.ShouldBe(1);
        shipment.TrackingDetails.First().Status.ShouldBe(ShipmentStatus.Pending);
    }

    [Fact]
    public void AddItem_ShouldAddItemToShipment()
    {
        var shipment = CreateTestShipment();
        var orderDetailId = Guid.NewGuid();
        var productId = Guid.NewGuid();

        shipment.AddItem(orderDetailId, productId, "Test Product", "SKU123", 2);

        shipment.Items.Count.ShouldBe(1);
        shipment.Items.First().ProductName.ShouldBe("Test Product");
        shipment.Items.First().Quantity.ShouldBe(2);
    }

    [Fact]
    public void AddItem_WithSameOrderDetailId_ShouldAddToQuantity()
    {
        var shipment = CreateTestShipment();
        var orderDetailId = Guid.NewGuid();
        var productId = Guid.NewGuid();

        shipment.AddItem(orderDetailId, productId, "Test Product", "SKU123", 2);
        shipment.AddItem(orderDetailId, productId, "Test Product", "SKU123", 3);

        shipment.Items.Count.ShouldBe(1);
        shipment.Items.First().Quantity.ShouldBe(5);
    }

    [Fact]
    public void UpdateStatus_WithValidTransition_ShouldUpdateStatus()
    {
        var shipment = CreateTestShipment();

        shipment.UpdateStatus(ShipmentStatus.Shipped, "Distribution Center", "Package picked up", "test-user");

        shipment.Status.ShouldBe(ShipmentStatus.Shipped);
        shipment.ModifiedBy.ShouldBe("test-user");
    }

    [Fact]
    public void UpdateStatus_ShouldAddTrackingDetail()
    {
        var shipment = CreateTestShipment();
        var initialTrackingCount = shipment.TrackingDetails.Count;

        shipment.UpdateStatus(ShipmentStatus.Shipped, "Distribution Center", "Package picked up", "test-user");

        shipment.TrackingDetails.Count.ShouldBe(initialTrackingCount + 1);
    }

    [Fact]
    public void UpdateStatus_ShouldRaiseStatusChangedEvent()
    {
        var shipment = CreateTestShipment();
        shipment.ClearDomainEvents();

        shipment.UpdateStatus(ShipmentStatus.Shipped, "Distribution Center", null, "test-user");

        shipment.DomainEvents.ShouldContain(e =>
            e.GetType().Name == "ShipmentStatusChangedEvent");
    }

    [Fact]
    public void UpdateStatus_WithInvalidTransition_ShouldThrow()
    {
        var shipment = CreateTestShipment();

        Should.Throw<InvalidOperationException>(() =>
            shipment.UpdateStatus(ShipmentStatus.Delivered, null, null, "test-user"));
    }

    [Fact]
    public void UpdateStatus_ToDelivered_ShouldSetActualDeliveryDate()
    {
        var shipment = CreateTestShipment();
        shipment.UpdateStatus(ShipmentStatus.Shipped, null, null, "test-user");
        shipment.UpdateStatus(ShipmentStatus.InTransit, null, null, "test-user");
        shipment.UpdateStatus(ShipmentStatus.OutForDelivery, null, null, "test-user");

        shipment.UpdateStatus(ShipmentStatus.Delivered, "Customer door", "Delivered to customer", "test-user");

        shipment.ActualDeliveryDate.ShouldNotBeNull();
    }

    [Fact]
    public void UpdateCarrier_OnPendingShipment_ShouldUpdateCarrier()
    {
        var shipment = CreateTestShipment();

        shipment.UpdateCarrier("UPS", "NEWTRACK123", "test-user");

        shipment.Carrier.ShouldBe("UPS");
        shipment.TrackingNumber.Value.ShouldBe("NEWTRACK123");
    }

    [Fact]
    public void UpdateCarrier_OnShippedShipment_ShouldThrow()
    {
        var shipment = CreateTestShipment();
        shipment.UpdateStatus(ShipmentStatus.Shipped, null, null, "test-user");

        Should.Throw<InvalidOperationException>(() =>
            shipment.UpdateCarrier("UPS", null, "test-user"));
    }

    [Fact]
    public void AddTrackingDetail_ShouldAddWithoutStatusChange()
    {
        var shipment = CreateTestShipment();
        var initialCount = shipment.TrackingDetails.Count;

        shipment.AddTrackingDetail("Sorting facility", "Package scanned", "test-user");

        shipment.TrackingDetails.Count.ShouldBe(initialCount + 1);
        shipment.Status.ShouldBe(ShipmentStatus.Pending); // Status unchanged
    }

    [Fact]
    public void Modify_OnTerminalStatus_ShouldThrow()
    {
        var shipment = CreateTestShipment();
        shipment.UpdateStatus(ShipmentStatus.Shipped, null, null, "test-user");
        shipment.UpdateStatus(ShipmentStatus.InTransit, null, null, "test-user");
        shipment.UpdateStatus(ShipmentStatus.OutForDelivery, null, null, "test-user");
        shipment.UpdateStatus(ShipmentStatus.Delivered, null, null, "test-user");

        Should.Throw<InvalidOperationException>(() =>
            shipment.AddItem(Guid.NewGuid(), Guid.NewGuid(), "Product", "SKU", 1));
    }

    private static Shipment CreateTestShipment(string? trackingNumber = null)
    {
        return Shipment.Create(
            orderId: Guid.NewGuid(),
            carrier: "FedEx",
            originStreet: "123 Warehouse St",
            originCity: "New York",
            originState: "NY",
            originPostalCode: "10001",
            originCountry: "USA",
            destinationStreet: "456 Customer Ave",
            destinationCity: "Los Angeles",
            destinationState: "CA",
            destinationPostalCode: "90001",
            destinationCountry: "USA",
            weightValue: 5.5m,
            weightUnit: WeightUnit.Pounds,
            length: 12m,
            width: 8m,
            height: 6m,
            dimensionUnit: DimensionUnit.Inches,
            shippingCost: 15.99m,
            estimatedDeliveryDate: DateTimeOffset.UtcNow.AddDays(3),
            createdBy: "test-user",
            trackingNumber: trackingNumber);
    }
}
