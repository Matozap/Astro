using Astro.Application.Orders.Commands.CancelOrder;
using FluentValidation.TestHelper;
using Xunit;

namespace Astro.Tests.Orders.Application;

public class CancelOrderCommandValidatorTests
{
    private readonly CancelOrderCommandValidator _validator;

    public CancelOrderCommandValidatorTests()
    {
        _validator = new CancelOrderCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ShouldNotHaveErrors()
    {
        var command = new CancelOrderCommand(
            OrderId: Guid.NewGuid(),
            Reason: "Customer request",
            CancelledBy: "admin");

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithEmptyOrderId_ShouldHaveError()
    {
        var command = new CancelOrderCommand(
            OrderId: Guid.Empty,
            Reason: "Customer request",
            CancelledBy: "admin");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }

    [Fact]
    public void Validate_WithReasonExceeding500Characters_ShouldHaveError()
    {
        var command = new CancelOrderCommand(
            OrderId: Guid.NewGuid(),
            Reason: new string('a', 501),
            CancelledBy: "admin");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Reason);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyCancelledBy_ShouldHaveError(string? cancelledBy)
    {
        var command = new CancelOrderCommand(
            OrderId: Guid.NewGuid(),
            Reason: "Customer request",
            CancelledBy: cancelledBy!);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.CancelledBy);
    }
}
