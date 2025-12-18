using Astro.Domain.Orders.Entities;
using Astro.Domain.Orders.Enums;
using Astro.Domain.Orders.Events;
using Shouldly;
using Xunit;

namespace Astro.Tests.Orders.Domain;

/// <summary>
/// Unit tests for Order aggregate root invariants.
/// </summary>
public class OrderTests
{
    private const string ValidCustomerName = "John Doe";
    private const string ValidEmail = "john.doe@example.com";
    private const string ValidStreet = "123 Main St";
    private const string ValidCity = "New York";
    private const string ValidState = "NY";
    private const string ValidPostalCode = "10001";
    private const string ValidCountry = "USA";
    private const string CreatedBy = "system";

    [Fact]
    public void Create_WithValidData_ShouldCreateOrder()
    {
        var order = Order.Create(
            ValidCustomerName,
            ValidEmail,
            ValidStreet,
            ValidCity,
            ValidState,
            ValidPostalCode,
            ValidCountry,
            "Test notes",
            CreatedBy);

        order.ShouldNotBeNull();
        order.CustomerName.ShouldBe(ValidCustomerName);
        order.CustomerEmail.Value.ShouldBe(ValidEmail);
        order.ShippingAddress.Street.ShouldBe(ValidStreet);
        order.Status.ShouldBe(OrderStatus.Pending);
        order.TotalAmount.Amount.ShouldBe(0m);
        order.Notes.ShouldBe("Test notes");
        order.CreatedBy.ShouldBe(CreatedBy);
    }

    [Fact]
    public void Create_ShouldGenerateOrderNumber()
    {
        var order = CreateValidOrder();

        order.OrderNumber.ShouldNotBeNull();
        order.OrderNumber.Value.ShouldStartWith("ORD-");
    }

    [Fact]
    public void Create_ShouldRaiseOrderCreatedEvent()
    {
        var order = CreateValidOrder();

        order.DomainEvents.ShouldContain(e => e is OrderCreatedEvent);
        var createdEvent = order.DomainEvents.OfType<OrderCreatedEvent>().First();
        createdEvent.OrderId.ShouldBe(order.Id);
        createdEvent.OrderNumber.ShouldBe(order.OrderNumber.Value);
        createdEvent.CustomerName.ShouldBe(ValidCustomerName);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithInvalidCustomerName_ShouldThrow(string? invalidName)
    {
        Should.Throw<ArgumentException>(() => Order.Create(
            invalidName!,
            ValidEmail,
            ValidStreet,
            ValidCity,
            ValidState,
            ValidPostalCode,
            ValidCountry,
            null,
            CreatedBy));
    }

    [Fact]
    public void Create_WithCustomerNameExceeding200Characters_ShouldThrow()
    {
        var longName = new string('a', 201);

        Should.Throw<ArgumentException>(() => Order.Create(
            longName,
            ValidEmail,
            ValidStreet,
            ValidCity,
            ValidState,
            ValidPostalCode,
            ValidCountry,
            null,
            CreatedBy));
    }

    [Fact]
    public void AddDetail_ShouldAddLineItem()
    {
        var order = CreateValidOrder();
        var productId = Guid.NewGuid();

        order.AddDetail(productId, "Product 1", "SKU001", 2, 10.00m);

        order.Details.Count.ShouldBe(1);
        var detail = order.Details.First();
        detail.ProductId.ShouldBe(productId);
        detail.ProductName.ShouldBe("Product 1");
        detail.Quantity.ShouldBe(2);
        detail.UnitPrice.Amount.ShouldBe(10.00m);
    }

    [Fact]
    public void AddDetail_ShouldRecalculateTotal()
    {
        var order = CreateValidOrder();

        order.AddDetail(Guid.NewGuid(), "Product 1", "SKU001", 2, 10.00m);
        order.AddDetail(Guid.NewGuid(), "Product 2", "SKU002", 3, 5.00m);

        order.TotalAmount.Amount.ShouldBe(35.00m); // (2 * 10) + (3 * 5)
    }

    [Fact]
    public void AddDetail_WithExistingProduct_ShouldUpdateQuantity()
    {
        var order = CreateValidOrder();
        var productId = Guid.NewGuid();

        order.AddDetail(productId, "Product 1", "SKU001", 2, 10.00m);
        order.AddDetail(productId, "Product 1", "SKU001", 3, 10.00m);

        order.Details.Count.ShouldBe(1);
        order.Details.First().Quantity.ShouldBe(5);
        order.TotalAmount.Amount.ShouldBe(50.00m);
    }

    [Fact]
    public void RemoveDetail_ShouldRemoveLineItem()
    {
        var order = CreateValidOrder();
        var productId = Guid.NewGuid();
        order.AddDetail(productId, "Product 1", "SKU001", 2, 10.00m);

        order.RemoveDetail(productId);

        order.Details.ShouldBeEmpty();
        order.TotalAmount.Amount.ShouldBe(0m);
    }

    [Fact]
    public void UpdateCustomerInfo_ShouldUpdateFields()
    {
        var order = CreateValidOrder();
        var newEmail = "jane.doe@example.com";
        var newName = "Jane Doe";
        var newNotes = "Updated notes";

        order.UpdateCustomerInfo(newName, newEmail, newNotes, "modifier");

        order.CustomerName.ShouldBe(newName);
        order.CustomerEmail.Value.ShouldBe(newEmail);
        order.Notes.ShouldBe(newNotes);
        order.ModifiedBy.ShouldBe("modifier");
        order.UpdatedAt.ShouldNotBeNull();
    }

    [Fact]
    public void UpdateShippingAddress_ShouldUpdateAddress()
    {
        var order = CreateValidOrder();
        var newStreet = "456 Oak Ave";

        order.UpdateShippingAddress(newStreet, ValidCity, ValidState, ValidPostalCode, ValidCountry, "modifier");

        order.ShippingAddress.Street.ShouldBe(newStreet);
        order.ModifiedBy.ShouldBe("modifier");
    }

    [Fact]
    public void UpdateStatus_WithValidTransition_ShouldUpdateStatus()
    {
        var order = CreateValidOrder();
        order.ClearDomainEvents();

        order.UpdateStatus(OrderStatus.Confirmed, "modifier");

        order.Status.ShouldBe(OrderStatus.Confirmed);
        order.DomainEvents.ShouldContain(e => e is OrderStatusChangedEvent);
    }

    [Fact]
    public void UpdateStatus_WithInvalidTransition_ShouldThrow()
    {
        var order = CreateValidOrder();

        Should.Throw<InvalidOperationException>(() =>
            order.UpdateStatus(OrderStatus.Shipped, "modifier"));
    }

    [Fact]
    public void Cancel_ShouldSetCancelledStatus()
    {
        var order = CreateValidOrder();
        order.ClearDomainEvents();

        order.Cancel("Customer request", "modifier");

        order.Status.ShouldBe(OrderStatus.Cancelled);
    }

    [Fact]
    public void Cancel_ShouldRaiseCancelledAndStatusChangedEvents()
    {
        var order = CreateValidOrder();
        order.ClearDomainEvents();

        order.Cancel("Customer request", "modifier");

        order.DomainEvents.ShouldContain(e => e is OrderCancelledEvent);
        order.DomainEvents.ShouldContain(e => e is OrderStatusChangedEvent);
        var cancelledEvent = order.DomainEvents.OfType<OrderCancelledEvent>().First();
        cancelledEvent.Reason.ShouldBe("Customer request");
    }

    [Fact]
    public void Cancel_WhenAlreadyCancelled_ShouldThrow()
    {
        var order = CreateValidOrder();
        order.Cancel("First cancellation", "modifier");

        Should.Throw<InvalidOperationException>(() =>
            order.Cancel("Second cancellation", "modifier"));
    }

    [Fact]
    public void AddDetail_WhenOrderDelivered_ShouldThrow()
    {
        var order = CreateValidOrder();
        order.UpdateStatus(OrderStatus.Confirmed, "modifier");
        order.UpdateStatus(OrderStatus.Processing, "modifier");
        order.UpdateStatus(OrderStatus.Shipped, "modifier");
        order.UpdateStatus(OrderStatus.Delivered, "modifier");

        Should.Throw<InvalidOperationException>(() =>
            order.AddDetail(Guid.NewGuid(), "Product", "SKU", 1, 10m));
    }

    [Fact]
    public void ClearDomainEvents_ShouldRemoveAllEvents()
    {
        var order = CreateValidOrder();
        order.DomainEvents.Count.ShouldBeGreaterThan(0);

        order.ClearDomainEvents();

        order.DomainEvents.ShouldBeEmpty();
    }

    private static Order CreateValidOrder()
    {
        return Order.Create(
            ValidCustomerName,
            ValidEmail,
            ValidStreet,
            ValidCity,
            ValidState,
            ValidPostalCode,
            ValidCountry,
            null,
            CreatedBy);
    }
}
