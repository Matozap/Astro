using Astro.Application.Common;
using Astro.Application.Payments.Commands.UpdatePaymentStatus;
using Astro.Application.Payments.Exceptions;
using Astro.Domain.Payments.Abstractions;
using Astro.Domain.Payments.Entities;
using Astro.Domain.Payments.Enums;
using Astro.Domain.Shared;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Payments.Application;

/// <summary>
/// Unit tests for UpdatePaymentStatusCommandHandler.
/// </summary>
public class UpdatePaymentStatusCommandHandlerTests
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdatePaymentStatusCommandHandler> _logger;
    private readonly UpdatePaymentStatusCommandHandler _handler;

    public UpdatePaymentStatusCommandHandlerTests()
    {
        _paymentRepository = Substitute.For<IPaymentRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<UpdatePaymentStatusCommandHandler>>();
        _handler = new UpdatePaymentStatusCommandHandler(_paymentRepository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithValidTransition_ShouldUpdateStatus()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        var payment = CreateTestPayment(paymentId);

        _paymentRepository.GetByIdAsync(paymentId, Arg.Any<CancellationToken>())
            .Returns(payment);

        var command = new UpdatePaymentStatusCommand(
            PaymentId: paymentId,
            NewStatus: PaymentStatus.Successful);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Status.ShouldBe(PaymentStatus.Successful);

        _paymentRepository.Received(1).Update(Arg.Any<Payment>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentPayment_ShouldThrowPaymentNotFoundException()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        _paymentRepository.GetByIdAsync(paymentId, Arg.Any<CancellationToken>())
            .Returns((Payment?)null);

        var command = new UpdatePaymentStatusCommand(
            PaymentId: paymentId,
            NewStatus: PaymentStatus.Successful);

        // Act & Assert
        var exception = await Should.ThrowAsync<PaymentNotFoundException>(
            () => _handler.Handle(command, CancellationToken.None));

        exception.PaymentId.ShouldBe(paymentId);

        _paymentRepository.DidNotReceive().Update(Arg.Any<Payment>());
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithInvalidTransition_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        var payment = CreateTestPayment(paymentId);
        // Set payment to Successful (terminal state)
        payment.UpdateStatus(PaymentStatus.Successful);

        _paymentRepository.GetByIdAsync(paymentId, Arg.Any<CancellationToken>())
            .Returns(payment);

        var command = new UpdatePaymentStatusCommand(
            PaymentId: paymentId,
            NewStatus: PaymentStatus.Failed); // Cannot transition from Successful to Failed

        // Act & Assert
        await Should.ThrowAsync<InvalidOperationException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ShouldLogStatusTransition()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        var payment = CreateTestPayment(paymentId);

        _paymentRepository.GetByIdAsync(paymentId, Arg.Any<CancellationToken>())
            .Returns(payment);

        var command = new UpdatePaymentStatusCommand(
            PaymentId: paymentId,
            NewStatus: PaymentStatus.Successful);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _logger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains($"Updating status for payment {paymentId}")),
            null,
            Arg.Any<Func<object, Exception?, string>>());

        _logger.Received(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Is<object>(o => o.ToString()!.Contains("status changed from Pending to Successful")),
            null,
            Arg.Any<Func<object, Exception?, string>>());
    }

    private static Payment CreateTestPayment(Guid id)
    {
        var orderId = Guid.NewGuid();
        var payment = Payment.Create(orderId);
        typeof(Entity).GetProperty("Id")!.SetValue(payment, id);
        return payment;
    }
}
