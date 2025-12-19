using Astro.Application.Common;
using Astro.Application.Orders.Commands.UpdateOrderStatus;
using Astro.Application.Orders.Exceptions;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using Astro.Domain.Orders.Enums;
using Astro.Domain.Shared;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Orders.Application;

public class UpdateOrderStatusCommandHandlerTests
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateOrderStatusCommandHandler> _logger;
    private readonly UpdateOrderStatusCommandHandler _handler;

    public UpdateOrderStatusCommandHandlerTests()
    {
        _orderRepository = Substitute.For<IOrderRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<UpdateOrderStatusCommandHandler>>();
        _handler = new UpdateOrderStatusCommandHandler(_orderRepository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithValidTransition_ShouldUpdateStatus()
    {
        var orderId = Guid.NewGuid();
        var order = CreateTestOrder(orderId);

        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns(order);

        var command = new UpdateOrderStatusCommand(
            OrderId: orderId,
            NewStatus: OrderStatus.Confirmed,
            ModifiedBy: "admin");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Status.ShouldBe(OrderStatus.Confirmed);

        _orderRepository.Received(1).Update(Arg.Any<Order>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentOrder_ShouldThrowOrderNotFoundException()
    {
        var orderId = Guid.NewGuid();
        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns((Order?)null);

        var command = new UpdateOrderStatusCommand(
            OrderId: orderId,
            NewStatus: OrderStatus.Confirmed,
            ModifiedBy: "admin");

        await Should.ThrowAsync<OrderNotFoundException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithInvalidTransition_ShouldThrowInvalidOperationException()
    {
        var orderId = Guid.NewGuid();
        var order = CreateTestOrder(orderId);

        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns(order);

        var command = new UpdateOrderStatusCommand(
            OrderId: orderId,
            NewStatus: OrderStatus.Shipped, // Cannot go from Pending directly to Shipped
            ModifiedBy: "admin");

        await Should.ThrowAsync<InvalidOperationException>(
            () => _handler.Handle(command, CancellationToken.None));
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
