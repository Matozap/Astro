using Astro.Application.Products.Commands.UpdateProduct;
using FluentValidation.TestHelper;
using Xunit;

namespace Astro.Tests.Products.Application;

public class UpdateProductCommandValidatorTests
{
    private readonly UpdateProductCommandValidator _validator;

    public UpdateProductCommandValidatorTests()
    {
        _validator = new UpdateProductCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ShouldNotHaveErrors()
    {
        var command = new UpdateProductCommand(
            Id: Guid.NewGuid(),
            Name: "Valid Product",
            Description: "Valid description",
            Price: 99.99m,
            Sku: "TEST001",
            StockQuantity: 100,
            LowStockThreshold: 10,
            IsActive: true,
            ModifiedBy: "modifier",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithEmptyId_ShouldHaveError()
    {
        var command = new UpdateProductCommand(
            Id: Guid.Empty,
            Name: "Product",
            Description: null,
            Price: 10m,
            Sku: "TEST001",
            StockQuantity: 10,
            LowStockThreshold: 5,
            IsActive: true,
            ModifiedBy: "modifier",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Id);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyName_ShouldHaveError(string? name)
    {
        var command = new UpdateProductCommand(
            Id: Guid.NewGuid(),
            Name: name!,
            Description: null,
            Price: 10m,
            Sku: "TEST001",
            StockQuantity: 10,
            LowStockThreshold: 5,
            IsActive: true,
            ModifiedBy: "modifier",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validate_WithNegativePrice_ShouldHaveError()
    {
        var command = new UpdateProductCommand(
            Id: Guid.NewGuid(),
            Name: "Product",
            Description: null,
            Price: -10m,
            Sku: "TEST001",
            StockQuantity: 10,
            LowStockThreshold: 5,
            IsActive: true,
            ModifiedBy: "modifier",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Price);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyModifiedBy_ShouldHaveError(string? modifiedBy)
    {
        var command = new UpdateProductCommand(
            Id: Guid.NewGuid(),
            Name: "Product",
            Description: null,
            Price: 10m,
            Sku: "TEST001",
            StockQuantity: 10,
            LowStockThreshold: 5,
            IsActive: true,
            ModifiedBy: modifiedBy!,
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.ModifiedBy);
    }
}
