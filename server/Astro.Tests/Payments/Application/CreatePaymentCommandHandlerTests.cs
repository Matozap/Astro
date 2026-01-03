using Astro.Application.Common;
using Astro.Application.Orders.Exceptions;
using Astro.Application.Payments.Commands.CreatePayment;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using Astro.Domain.Payments.Abstractions;
using Astro.Domain.Payments.Entities;
using Astro.Domain.Payments.Enums;
using Astro.Domain.Shared;
using Astro.Domain.Shared.ValueObjects;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Payments.Application;

/// <summary>
/// Unit tests for CreatePaymentCommandHandler.
/// </summary>
public class CreatePaymentCommandHandlerTests
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreatePaymentCommandHandler> _logger;
    private readonly CreatePaymentCommandHandler _handler;

    public CreatePaymentCommandHandlerTests()
    {
        _paymentRepository = Substitute.For<IPaymentRepository>();
        _orderRepository = Substitute.For<IOrderRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<CreatePaymentCommandHandler>>();
        _handler = new CreatePaymentCommandHandler(
            _paymentRepository, _orderRepository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithValidOrderId_ShouldCreatePayment()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var order = CreateTestOrder(orderId);

        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns(order);

        var command = new CreatePaymentCommand(orderId, 100m, "USD");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.ShouldNotBeNull();
        result.OrderId.ShouldBe(orderId);
        result.Status.ShouldBe(PaymentStatus.Pending);

        await _paymentRepository.Received(1).AddAsync(Arg.Any<Payment>(), Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentOrder_ShouldThrowOrderNotFoundException()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns((Order?)null);

        var command = new CreatePaymentCommand(orderId, 100m, "USD");

        // Act & Assert
        var exception = await Should.ThrowAsync<OrderNotFoundException>(
            () => _handler.Handle(command, CancellationToken.None));

        exception.OrderId.ShouldBe(orderId);

        await _paymentRepository.DidNotReceive().AddAsync(Arg.Any<Payment>(), Arg.Any<CancellationToken>());
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldLogInformation()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var order = CreateTestOrder(orderId);

        _orderRepository.GetByIdAsync(orderId, Arg.Any<CancellationToken>())
            .Returns(order);

        var command = new CreatePaymentCommand(orderId, 100m, "USD");

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _logger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains($"Creating payment for order {orderId}")),
            null,
            Arg.Any<Func<object, Exception?, string>>());
    }

    private static Order CreateTestOrder(Guid id)
    {
        var order = Order.Create(
            customerName: "John Doe",
            customerEmail: "john@example.com",
            street: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "USA",
            notes: null,
            createdBy: "test-user");

        typeof(Entity).GetProperty("Id")!.SetValue(order, id);
        return order;
    }
}
