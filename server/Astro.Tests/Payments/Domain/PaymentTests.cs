using Astro.Domain.Payments.Entities;
using Astro.Domain.Payments.Enums;
using Astro.Domain.Payments.Events;
using Astro.Domain.Shared.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Payments.Domain;

/// <summary>
/// Unit tests for Payment aggregate root invariants.
/// </summary>
public class PaymentTests
{
    private static readonly Guid ValidOrderId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidOrderId_ShouldCreatePaymentWithPendingStatus()
    {
        // Arrange & Act
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));

        // Assert
        payment.ShouldNotBeNull();
        payment.OrderId.ShouldBe(ValidOrderId);
        payment.Status.ShouldBe(PaymentStatus.Pending);
        payment.CreatedAt.ShouldNotBe(default);
        payment.UpdatedAt.ShouldNotBe(default);
    }

    [Fact]
    public void Create_ShouldPublishPaymentCreatedEvent()
    {
        // Arrange & Act
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));

        // Assert
        payment.DomainEvents.ShouldContain(e => e is PaymentCreatedEvent);
        var createdEvent = payment.DomainEvents.OfType<PaymentCreatedEvent>().First();
        createdEvent.PaymentId.ShouldBe(payment.Id);
        createdEvent.OrderId.ShouldBe(ValidOrderId);
        createdEvent.Status.ShouldBe(PaymentStatus.Pending);
    }

    [Fact]
    public void Create_WithEmptyOrderId_ShouldThrowArgumentException()
    {
        // Arrange
        var emptyOrderId = Guid.Empty;

        // Act & Assert
        var exception = Should.Throw<ArgumentException>(() => Payment.Create(emptyOrderId, Money.FromDecimal(100, "USD")));
        exception.Message.ShouldContain("Order ID cannot be empty");
        exception.ParamName.ShouldBe("orderId");
    }

    [Fact]
    public void UpdateStatus_FromPendingToSuccessful_ShouldUpdateStatus()
    {
        // Arrange
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));
        payment.ClearDomainEvents();

        // Act
        payment.UpdateStatus(PaymentStatus.Successful);

        // Assert
        payment.Status.ShouldBe(PaymentStatus.Successful);
    }

    [Fact]
    public void UpdateStatus_FromPendingToFailed_ShouldUpdateStatus()
    {
        // Arrange
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));
        payment.ClearDomainEvents();

        // Act
        payment.UpdateStatus(PaymentStatus.Failed);

        // Assert
        payment.Status.ShouldBe(PaymentStatus.Failed);
    }

    [Theory]
    [InlineData(PaymentStatus.Successful, PaymentStatus.Failed)]
    [InlineData(PaymentStatus.Failed, PaymentStatus.Successful)]
    [InlineData(PaymentStatus.Successful, PaymentStatus.Pending)]
    [InlineData(PaymentStatus.Failed, PaymentStatus.Pending)]
    public void UpdateStatus_WithInvalidTransition_ShouldThrowInvalidOperationException(
        PaymentStatus fromStatus,
        PaymentStatus toStatus)
    {
        // Arrange
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));
        if (fromStatus == PaymentStatus.Successful)
        {
            payment.UpdateStatus(PaymentStatus.Successful);
        }
        else if (fromStatus == PaymentStatus.Failed)
        {
            payment.UpdateStatus(PaymentStatus.Failed);
        }

        // Act & Assert
        var exception = Should.Throw<InvalidOperationException>(() => payment.UpdateStatus(toStatus));
        exception.Message.ShouldContain($"Cannot transition payment status from {fromStatus} to {toStatus}");
    }

    [Fact]
    public void UpdateStatus_ShouldPublishPaymentStatusChangedEvent()
    {
        // Arrange
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));
        payment.ClearDomainEvents();

        // Act
        payment.UpdateStatus(PaymentStatus.Successful);

        // Assert
        payment.DomainEvents.ShouldContain(e => e is PaymentStatusChangedEvent);
        var statusChangedEvent = payment.DomainEvents.OfType<PaymentStatusChangedEvent>().First();
        statusChangedEvent.PaymentId.ShouldBe(payment.Id);
        statusChangedEvent.OrderId.ShouldBe(ValidOrderId);
        statusChangedEvent.OldStatus.ShouldBe(PaymentStatus.Pending);
        statusChangedEvent.NewStatus.ShouldBe(PaymentStatus.Successful);
    }

    [Fact]
    public void UpdateStatus_ShouldUpdateUpdatedAt()
    {
        // Arrange
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));
        var originalUpdatedAt = payment.UpdatedAt;

        // Wait a small amount to ensure time difference
        Thread.Sleep(10);

        // Act
        payment.UpdateStatus(PaymentStatus.Successful);

        // Assert
        payment.UpdatedAt.ShouldBeGreaterThan(originalUpdatedAt);
    }

    [Theory]
    [InlineData(PaymentStatus.Successful)]
    [InlineData(PaymentStatus.Failed)]
    public void UpdateStatus_FromTerminalState_ShouldNotAllowTransition(PaymentStatus terminalStatus)
    {
        // Arrange
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));
        payment.UpdateStatus(terminalStatus);

        // Act & Assert - Try to transition to any other status
        Should.Throw<InvalidOperationException>(() =>
            payment.UpdateStatus(PaymentStatus.Pending));
    }

    [Fact]
    public void UpdateStatus_ToSameStatus_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));

        // Act & Assert
        var exception = Should.Throw<InvalidOperationException>(() =>
            payment.UpdateStatus(PaymentStatus.Pending));
        exception.Message.ShouldContain("Payment is already in Pending status");
    }

    [Fact]
    public void ClearDomainEvents_ShouldRemoveAllEvents()
    {
        // Arrange
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));
        payment.UpdateStatus(PaymentStatus.Successful);
        payment.DomainEvents.Count.ShouldBeGreaterThan(0);

        // Act
        payment.ClearDomainEvents();

        // Assert
        payment.DomainEvents.ShouldBeEmpty();
    }

    [Fact]
    public void Payment_ShouldHaveId()
    {
        // Arrange & Act
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));

        // Assert
        payment.Id.ShouldNotBe(Guid.Empty);
    }

    [Fact]
    public void CreatedAt_ShouldBeSetOnCreation()
    {
        // Arrange
        var beforeCreation = DateTimeOffset.UtcNow;

        // Act
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));

        // Assert
        var afterCreation = DateTimeOffset.UtcNow;
        payment.CreatedAt.ShouldBeInRange(beforeCreation, afterCreation);
    }

    [Fact]
    public void UpdatedAt_ShouldBeSetOnCreation()
    {
        // Arrange
        var beforeCreation = DateTimeOffset.UtcNow;

        // Act
        var payment = Payment.Create(ValidOrderId, Money.FromDecimal(100, "USD"));

        // Assert
        var afterCreation = DateTimeOffset.UtcNow;
        payment.UpdatedAt.ShouldBeInRange(beforeCreation, afterCreation);
    }
}
