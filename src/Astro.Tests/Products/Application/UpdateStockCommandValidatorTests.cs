using Astro.Application.Products.Commands.UpdateStock;
using FluentValidation.TestHelper;
using Xunit;

namespace Astro.Tests.Products.Application;

public class UpdateStockCommandValidatorTests
{
    private readonly UpdateStockCommandValidator _validator;

    public UpdateStockCommandValidatorTests()
    {
        _validator = new UpdateStockCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ShouldNotHaveErrors()
    {
        var command = new UpdateStockCommand(
            ProductId: Guid.NewGuid(),
            StockQuantity: 100,
            ModifiedBy: "modifier");

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithEmptyProductId_ShouldHaveError()
    {
        var command = new UpdateStockCommand(
            ProductId: Guid.Empty,
            StockQuantity: 100,
            ModifiedBy: "modifier");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.ProductId);
    }

    [Fact]
    public void Validate_WithNegativeStockQuantity_ShouldHaveError()
    {
        var command = new UpdateStockCommand(
            ProductId: Guid.NewGuid(),
            StockQuantity: -1,
            ModifiedBy: "modifier");

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.StockQuantity);
    }

    [Fact]
    public void Validate_WithZeroStockQuantity_ShouldNotHaveError()
    {
        var command = new UpdateStockCommand(
            ProductId: Guid.NewGuid(),
            StockQuantity: 0,
            ModifiedBy: "modifier");

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveValidationErrorFor(x => x.StockQuantity);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyModifiedBy_ShouldHaveError(string? modifiedBy)
    {
        var command = new UpdateStockCommand(
            ProductId: Guid.NewGuid(),
            StockQuantity: 100,
            ModifiedBy: modifiedBy!);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.ModifiedBy);
    }
}
