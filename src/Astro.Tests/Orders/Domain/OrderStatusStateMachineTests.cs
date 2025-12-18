using Astro.Domain.Orders.Enums;
using Shouldly;
using Xunit;

namespace Astro.Tests.Orders.Domain;

/// <summary>
/// Unit tests for OrderStatus state machine transitions.
/// </summary>
public class OrderStatusStateMachineTests
{
    [Theory]
    [InlineData(OrderStatus.Pending, OrderStatus.Confirmed, true)]
    [InlineData(OrderStatus.Pending, OrderStatus.Cancelled, true)]
    [InlineData(OrderStatus.Pending, OrderStatus.Processing, false)]
    [InlineData(OrderStatus.Pending, OrderStatus.Shipped, false)]
    [InlineData(OrderStatus.Pending, OrderStatus.Delivered, false)]
    public void Pending_CanTransitionTo_CorrectStatuses(
        OrderStatus from,
        OrderStatus to,
        bool expectedResult)
    {
        var result = from.CanTransitionTo(to);

        result.ShouldBe(expectedResult);
    }

    [Theory]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Processing, true)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Cancelled, true)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Pending, false)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Shipped, false)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Delivered, false)]
    public void Confirmed_CanTransitionTo_CorrectStatuses(
        OrderStatus from,
        OrderStatus to,
        bool expectedResult)
    {
        var result = from.CanTransitionTo(to);

        result.ShouldBe(expectedResult);
    }

    [Theory]
    [InlineData(OrderStatus.Processing, OrderStatus.Shipped, true)]
    [InlineData(OrderStatus.Processing, OrderStatus.Cancelled, true)]
    [InlineData(OrderStatus.Processing, OrderStatus.Pending, false)]
    [InlineData(OrderStatus.Processing, OrderStatus.Confirmed, false)]
    [InlineData(OrderStatus.Processing, OrderStatus.Delivered, false)]
    public void Processing_CanTransitionTo_CorrectStatuses(
        OrderStatus from,
        OrderStatus to,
        bool expectedResult)
    {
        var result = from.CanTransitionTo(to);

        result.ShouldBe(expectedResult);
    }

    [Theory]
    [InlineData(OrderStatus.Shipped, OrderStatus.Delivered, true)]
    [InlineData(OrderStatus.Shipped, OrderStatus.Pending, false)]
    [InlineData(OrderStatus.Shipped, OrderStatus.Confirmed, false)]
    [InlineData(OrderStatus.Shipped, OrderStatus.Processing, false)]
    [InlineData(OrderStatus.Shipped, OrderStatus.Cancelled, false)]
    public void Shipped_CanTransitionTo_CorrectStatuses(
        OrderStatus from,
        OrderStatus to,
        bool expectedResult)
    {
        var result = from.CanTransitionTo(to);

        result.ShouldBe(expectedResult);
    }

    [Theory]
    [InlineData(OrderStatus.Delivered, OrderStatus.Pending)]
    [InlineData(OrderStatus.Delivered, OrderStatus.Confirmed)]
    [InlineData(OrderStatus.Delivered, OrderStatus.Processing)]
    [InlineData(OrderStatus.Delivered, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Delivered, OrderStatus.Cancelled)]
    public void Delivered_CannotTransitionToAnyStatus(
        OrderStatus from,
        OrderStatus to)
    {
        var result = from.CanTransitionTo(to);

        result.ShouldBeFalse();
    }

    [Theory]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Pending)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Confirmed)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Processing)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Delivered)]
    public void Cancelled_CannotTransitionToAnyStatus(
        OrderStatus from,
        OrderStatus to)
    {
        var result = from.CanTransitionTo(to);

        result.ShouldBeFalse();
    }

    [Theory]
    [InlineData(OrderStatus.Pending, false)]
    [InlineData(OrderStatus.Confirmed, false)]
    [InlineData(OrderStatus.Processing, false)]
    [InlineData(OrderStatus.Shipped, false)]
    [InlineData(OrderStatus.Delivered, true)]
    [InlineData(OrderStatus.Cancelled, true)]
    public void IsTerminal_ReturnsCorrectValue(
        OrderStatus status,
        bool expectedIsTerminal)
    {
        var result = status.IsTerminal();

        result.ShouldBe(expectedIsTerminal);
    }

    [Fact]
    public void CanTransitionTo_SameStatus_ShouldReturnFalse()
    {
        var statuses = Enum.GetValues<OrderStatus>();

        foreach (var status in statuses)
        {
            status.CanTransitionTo(status).ShouldBeFalse(
                $"Status {status} should not be able to transition to itself");
        }
    }

    [Fact]
    public void HappyPath_ShouldAllowFullTransitionChain()
    {

        // Pending -> Confirmed -> Processing -> Shipped -> Delivered
        OrderStatus.Pending.CanTransitionTo(OrderStatus.Confirmed).ShouldBeTrue();
        OrderStatus.Confirmed.CanTransitionTo(OrderStatus.Processing).ShouldBeTrue();
        OrderStatus.Processing.CanTransitionTo(OrderStatus.Shipped).ShouldBeTrue();
        OrderStatus.Shipped.CanTransitionTo(OrderStatus.Delivered).ShouldBeTrue();
    }

    [Fact]
    public void CancellablePath_ShouldAllowCancellationUntilShipped()
    {

        OrderStatus.Pending.CanTransitionTo(OrderStatus.Cancelled).ShouldBeTrue();
        OrderStatus.Confirmed.CanTransitionTo(OrderStatus.Cancelled).ShouldBeTrue();
        OrderStatus.Processing.CanTransitionTo(OrderStatus.Cancelled).ShouldBeTrue();
        OrderStatus.Shipped.CanTransitionTo(OrderStatus.Cancelled).ShouldBeFalse();
    }

    [Fact]
    public void AllStatuses_ShouldBeDefined()
    {
        var expectedStatuses = new[]
        {
            OrderStatus.Pending,
            OrderStatus.Confirmed,
            OrderStatus.Processing,
            OrderStatus.Shipped,
            OrderStatus.Delivered,
            OrderStatus.Cancelled
        };

        var actualStatuses = Enum.GetValues<OrderStatus>();

        actualStatuses.ShouldBe(expectedStatuses);
    }
}
