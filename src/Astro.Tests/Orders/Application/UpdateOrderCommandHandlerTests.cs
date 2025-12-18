using Astro.Application.Common;
using Astro.Application.Orders.Commands.UpdateOrder;
using Astro.Application.Orders.Exceptions;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using Astro.Domain.Shared;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Orders.Application;

public class UpdateOrderCommandHandlerTests
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateOrderCommandHandler> _logger;
    private readonly UpdateOrderCommandHandler _handler;

    public UpdateOrderCommandHandlerTests()
    {
        _orderRepository = Substitute.For<IOrderRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<UpdateOrderCommandHandler>>();
        _handler = new UpdateOrderCommandHandler(_orderRepository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithExistingOrder_ShouldUpdateOrder()
    {
        var orderId = Guid.NewGuid();
        var order = CreateTestOrder(orderId);

        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns(order);

        var command = new UpdateOrderCommand(
            Id: orderId,
            CustomerName: "Jane Doe",
            CustomerEmail: "jane@example.com",
            Street: null,
            City: null,
            State: null,
            PostalCode: null,
            Country: null,
            Notes: "Updated notes",
            ModifiedBy: "admin");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.CustomerName.ShouldBe("Jane Doe");
        result.CustomerEmail.Value.ShouldBe("jane@example.com");
        result.Notes.ShouldBe("Updated notes");

        _orderRepository.Received(1).Update(Arg.Any<Order>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentOrder_ShouldThrowOrderNotFoundException()
    {
        var orderId = Guid.NewGuid();
        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns((Order?)null);

        var command = new UpdateOrderCommand(
            Id: orderId,
            CustomerName: "Jane Doe",
            CustomerEmail: null,
            Street: null,
            City: null,
            State: null,
            PostalCode: null,
            Country: null,
            Notes: null,
            ModifiedBy: "admin");

        await Should.ThrowAsync<OrderNotFoundException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithFullAddress_ShouldUpdateShippingAddress()
    {
        var orderId = Guid.NewGuid();
        var order = CreateTestOrder(orderId);

        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns(order);

        var command = new UpdateOrderCommand(
            Id: orderId,
            CustomerName: null,
            CustomerEmail: null,
            Street: "456 Oak Ave",
            City: "Los Angeles",
            State: "CA",
            PostalCode: "90001",
            Country: "USA",
            Notes: null,
            ModifiedBy: "admin");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.ShippingAddress.Street.ShouldBe("456 Oak Ave");
        result.ShippingAddress.City.ShouldBe("Los Angeles");
        result.ShippingAddress.State.ShouldBe("CA");
    }

    private static Order CreateTestOrder(Guid id)
    {
        var order = Order.Create(
            "John Doe",
            "john@example.com",
            "123 Main St",
            "New York",
            "NY",
            "10001",
            "USA",
            null,
            "creator");
        typeof(Entity).GetProperty("Id")!.SetValue(order, id);
        return order;
    }
}
