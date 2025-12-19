using Astro.Application.Orders.Commands.UpdateOrder;
using FluentValidation.TestHelper;
using Xunit;

namespace Astro.Tests.Orders.Application;

public class UpdateOrderCommandValidatorTests
{
    private readonly UpdateOrderCommandValidator _validator;

    public UpdateOrderCommandValidatorTests()
    {
        _validator = new UpdateOrderCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ShouldNotHaveErrors()
    {
        var command = new UpdateOrderCommand(
            Id: Guid.NewGuid(),
            CustomerName: "Jane Doe",
            CustomerEmail: "jane@example.com",
            Street: "456 Oak Ave",
            City: "Los Angeles",
            State: "CA",
            PostalCode: "90001",
            Country: "USA",
            Notes: "Updated notes",
            ModifiedBy: "admin");

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithEmptyId_ShouldHaveError()
    {
        var command = new UpdateOrderCommand(
            Id: Guid.Empty,
            CustomerName: null,
            CustomerEmail: null,
            Street: null,
            City: null,
            State: null,
            PostalCode: null,
            Country: null,
            Notes: null,
            ModifiedBy: "admin");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Id);
    }

    [Fact]
    public void Validate_WithInvalidEmail_ShouldHaveError()
    {
        var command = new UpdateOrderCommand(
            Id: Guid.NewGuid(),
            CustomerName: null,
            CustomerEmail: "invalid-email",
            Street: null,
            City: null,
            State: null,
            PostalCode: null,
            Country: null,
            Notes: null,
            ModifiedBy: "admin");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.CustomerEmail);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyModifiedBy_ShouldHaveError(string? modifiedBy)
    {
        var command = new UpdateOrderCommand(
            Id: Guid.NewGuid(),
            CustomerName: null,
            CustomerEmail: null,
            Street: null,
            City: null,
            State: null,
            PostalCode: null,
            Country: null,
            Notes: null,
            ModifiedBy: modifiedBy!);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.ModifiedBy);
    }

    [Fact]
    public void Validate_WithNullOptionalFields_ShouldNotHaveErrors()
    {
        var command = new UpdateOrderCommand(
            Id: Guid.NewGuid(),
            CustomerName: null,
            CustomerEmail: null,
            Street: null,
            City: null,
            State: null,
            PostalCode: null,
            Country: null,
            Notes: null,
            ModifiedBy: "admin");

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }
}
