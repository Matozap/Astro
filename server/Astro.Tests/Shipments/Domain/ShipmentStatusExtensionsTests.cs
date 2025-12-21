using Astro.Domain.Shipments.Enums;
using Shouldly;
using Xunit;

namespace Astro.Tests.Shipments.Domain;

public class ShipmentStatusExtensionsTests
{
    [Theory]
    [InlineData(ShipmentStatus.Pending, ShipmentStatus.Shipped, true)]
    [InlineData(ShipmentStatus.Pending, ShipmentStatus.InTransit, false)]
    [InlineData(ShipmentStatus.Shipped, ShipmentStatus.InTransit, true)]
    [InlineData(ShipmentStatus.Shipped, ShipmentStatus.Delayed, true)]
    [InlineData(ShipmentStatus.InTransit, ShipmentStatus.OutForDelivery, true)]
    [InlineData(ShipmentStatus.InTransit, ShipmentStatus.Delayed, true)]
    [InlineData(ShipmentStatus.OutForDelivery, ShipmentStatus.Delivered, true)]
    [InlineData(ShipmentStatus.OutForDelivery, ShipmentStatus.FailedDelivery, true)]
    [InlineData(ShipmentStatus.Delayed, ShipmentStatus.InTransit, true)]
    [InlineData(ShipmentStatus.FailedDelivery, ShipmentStatus.Returned, true)]
    [InlineData(ShipmentStatus.FailedDelivery, ShipmentStatus.InTransit, true)]
    [InlineData(ShipmentStatus.Delivered, ShipmentStatus.Returned, false)]
    [InlineData(ShipmentStatus.Returned, ShipmentStatus.InTransit, false)]
    public void CanTransitionTo_ShouldReturnExpectedResult(
        ShipmentStatus currentStatus,
        ShipmentStatus newStatus,
        bool expectedResult)
    {
        currentStatus.CanTransitionTo(newStatus).ShouldBe(expectedResult);
    }

    [Theory]
    [InlineData(ShipmentStatus.Pending, false)]
    [InlineData(ShipmentStatus.Shipped, false)]
    [InlineData(ShipmentStatus.InTransit, false)]
    [InlineData(ShipmentStatus.OutForDelivery, false)]
    [InlineData(ShipmentStatus.Delayed, false)]
    [InlineData(ShipmentStatus.FailedDelivery, false)]
    [InlineData(ShipmentStatus.Delivered, true)]
    [InlineData(ShipmentStatus.Returned, true)]
    public void IsTerminal_ShouldReturnExpectedResult(ShipmentStatus status, bool expectedResult)
    {
        status.IsTerminal().ShouldBe(expectedResult);
    }

    [Fact]
    public void GetValidTransitions_FromPending_ShouldReturnOnlyShipped()
    {
        var transitions = ShipmentStatus.Pending.GetValidTransitions();

        transitions.ShouldContain(ShipmentStatus.Shipped);
        transitions.Length.ShouldBe(1);
    }

    [Fact]
    public void GetValidTransitions_FromOutForDelivery_ShouldIncludeDeliveredAndFailedAndDelayed()
    {
        var transitions = ShipmentStatus.OutForDelivery.GetValidTransitions();

        transitions.ShouldContain(ShipmentStatus.Delivered);
        transitions.ShouldContain(ShipmentStatus.FailedDelivery);
        transitions.ShouldContain(ShipmentStatus.Delayed);
    }

    [Fact]
    public void GetValidTransitions_FromDelivered_ShouldReturnEmpty()
    {
        var transitions = ShipmentStatus.Delivered.GetValidTransitions();

        transitions.ShouldBeEmpty();
    }
}
