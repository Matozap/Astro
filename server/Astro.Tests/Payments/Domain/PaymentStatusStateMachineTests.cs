using Astro.Domain.Payments.Enums;
using Shouldly;
using Xunit;

namespace Astro.Tests.Payments.Domain;

/// <summary>
/// Unit tests for PaymentStatus state machine transitions.
/// </summary>
public class PaymentStatusStateMachineTests
{
    [Theory]
    [InlineData(PaymentStatus.Pending, PaymentStatus.Successful, true)]
    [InlineData(PaymentStatus.Pending, PaymentStatus.Failed, true)]
    [InlineData(PaymentStatus.Pending, PaymentStatus.Pending, false)]
    public void Pending_CanTransitionTo_CorrectStatuses(
        PaymentStatus from,
        PaymentStatus to,
        bool expectedResult)
    {
        var result = from.CanTransitionTo(to);

        result.ShouldBe(expectedResult);
    }

    [Theory]
    [InlineData(PaymentStatus.Successful, PaymentStatus.Pending)]
    [InlineData(PaymentStatus.Successful, PaymentStatus.Failed)]
    public void Successful_CannotTransitionToAnyStatus(
        PaymentStatus from,
        PaymentStatus to)
    {
        var result = from.CanTransitionTo(to);

        result.ShouldBeFalse();
    }

    [Theory]
    [InlineData(PaymentStatus.Failed, PaymentStatus.Pending)]
    [InlineData(PaymentStatus.Failed, PaymentStatus.Successful)]
    public void Failed_CannotTransitionToAnyStatus(
        PaymentStatus from,
        PaymentStatus to)
    {
        var result = from.CanTransitionTo(to);

        result.ShouldBeFalse();
    }

    [Theory]
    [InlineData(PaymentStatus.Pending, false)]
    [InlineData(PaymentStatus.Successful, true)]
    [InlineData(PaymentStatus.Failed, true)]
    public void IsTerminal_ReturnsCorrectValue(
        PaymentStatus status,
        bool expectedIsTerminal)
    {
        var result = status.IsTerminal();

        result.ShouldBe(expectedIsTerminal);
    }

    [Fact]
    public void CanTransitionTo_SameStatus_ShouldReturnFalse()
    {
        var statuses = Enum.GetValues<PaymentStatus>();

        foreach (var status in statuses)
        {
            status.CanTransitionTo(status).ShouldBeFalse(
                $"Status {status} should not be able to transition to itself");
        }
    }

    [Fact]
    public void HappyPath_ShouldAllowPendingToSuccessful()
    {
        // Pending -> Successful
        PaymentStatus.Pending.CanTransitionTo(PaymentStatus.Successful).ShouldBeTrue();
    }

    [Fact]
    public void FailurePath_ShouldAllowPendingToFailed()
    {
        // Pending -> Failed
        PaymentStatus.Pending.CanTransitionTo(PaymentStatus.Failed).ShouldBeTrue();
    }

    [Fact]
    public void AllStatuses_ShouldBeDefined()
    {
        var expectedStatuses = new[]
        {
            PaymentStatus.Pending,
            PaymentStatus.Successful,
            PaymentStatus.Failed
        };

        var actualStatuses = Enum.GetValues<PaymentStatus>();

        actualStatuses.ShouldBe(expectedStatuses);
    }
}
