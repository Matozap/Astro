using Astro.Application.Orders.Commands.UpdateOrderStatus;
using Astro.Domain.Orders.Enums;
using FluentValidation.TestHelper;
using Xunit;

namespace Astro.Tests.Orders.Application;

public class UpdateOrderStatusCommandValidatorTests
{
    private readonly UpdateOrderStatusCommandValidator _validator;

    public UpdateOrderStatusCommandValidatorTests()
    {
        _validator = new UpdateOrderStatusCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ShouldNotHaveErrors()
    {
        var command = new UpdateOrderStatusCommand(
            OrderId: Guid.NewGuid(),
            NewStatus: OrderStatus.Confirmed,
            ModifiedBy: "admin");

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithEmptyOrderId_ShouldHaveError()
    {
        var command = new UpdateOrderStatusCommand(
            OrderId: Guid.Empty,
            NewStatus: OrderStatus.Confirmed,
            ModifiedBy: "admin");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyModifiedBy_ShouldHaveError(string? modifiedBy)
    {
        var command = new UpdateOrderStatusCommand(
            OrderId: Guid.NewGuid(),
            NewStatus: OrderStatus.Confirmed,
            ModifiedBy: modifiedBy!);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.ModifiedBy);
    }
}
