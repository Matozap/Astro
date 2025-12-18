using Astro.Application.Common;
using Astro.Application.Orders.Commands.CancelOrder;
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

public class CancelOrderCommandHandlerTests
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CancelOrderCommandHandler> _logger;
    private readonly CancelOrderCommandHandler _handler;

    public CancelOrderCommandHandlerTests()
    {
        _orderRepository = Substitute.For<IOrderRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<CancelOrderCommandHandler>>();
        _handler = new CancelOrderCommandHandler(_orderRepository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithExistingOrder_ShouldCancelOrder()
    {
        var orderId = Guid.NewGuid();
        var order = CreateTestOrder(orderId);

        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns(order);

        var command = new CancelOrderCommand(
            OrderId: orderId,
            Reason: "Customer request",
            CancelledBy: "admin");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Status.ShouldBe(OrderStatus.Cancelled);

        _orderRepository.Received(1).Update(Arg.Any<Order>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentOrder_ShouldThrowOrderNotFoundException()
    {
        var orderId = Guid.NewGuid();
        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns((Order?)null);

        var command = new CancelOrderCommand(
            OrderId: orderId,
            Reason: "Customer request",
            CancelledBy: "admin");

        await Should.ThrowAsync<OrderNotFoundException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithAlreadyCancelledOrder_ShouldReturnOrderWithoutChanges()
    {
        var orderId = Guid.NewGuid();
        var order = CreateTestOrder(orderId);
        order.Cancel("Initial cancellation", "admin");
        order.ClearDomainEvents();

        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns(order);

        var command = new CancelOrderCommand(
            OrderId: orderId,
            Reason: "Customer request",
            CancelledBy: "admin");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Status.ShouldBe(OrderStatus.Cancelled);
        // Should not have added new domain events
        result.DomainEvents.ShouldBeEmpty();
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
