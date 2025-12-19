using Astro.Application.Products.Commands.CreateProduct;
using FluentValidation.TestHelper;
using Xunit;

namespace Astro.Tests.Products.Application;

public class CreateProductCommandValidatorTests
{
    private readonly CreateProductCommandValidator _validator;

    public CreateProductCommandValidatorTests()
    {
        _validator = new CreateProductCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ShouldNotHaveErrors()
    {
        var command = new CreateProductCommand(
            Name: "Valid Product",
            Description: "Valid description",
            Price: 99.99m,
            Sku: "TEST001",
            StockQuantity: 100,
            LowStockThreshold: 10,
            IsActive: true,
            CreatedBy: "test-user",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyName_ShouldHaveError(string? name)
    {
        var command = new CreateProductCommand(
            Name: name!,
            Description: null,
            Price: 10m,
            Sku: "TEST001",
            StockQuantity: 10,
            LowStockThreshold: 5,
            IsActive: true,
            CreatedBy: "user",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validate_WithNameExceeding200Characters_ShouldHaveError()
    {
        var command = new CreateProductCommand(
            Name: new string('a', 201),
            Description: null,
            Price: 10m,
            Sku: "TEST001",
            StockQuantity: 10,
            LowStockThreshold: 5,
            IsActive: true,
            CreatedBy: "user",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validate_WithNegativePrice_ShouldHaveError()
    {
        var command = new CreateProductCommand(
            Name: "Product",
            Description: null,
            Price: -10m,
            Sku: "TEST001",
            StockQuantity: 10,
            LowStockThreshold: 5,
            IsActive: true,
            CreatedBy: "user",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Price);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptySku_ShouldHaveError(string? sku)
    {
        var command = new CreateProductCommand(
            Name: "Product",
            Description: null,
            Price: 10m,
            Sku: sku!,
            StockQuantity: 10,
            LowStockThreshold: 5,
            IsActive: true,
            CreatedBy: "user",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Sku);
    }

    [Theory]
    [InlineData("ab")]
    [InlineData("lowercase")]
    [InlineData("with-dash")]
    [InlineData("with space")]
    public void Validate_WithInvalidSkuFormat_ShouldHaveError(string sku)
    {
        var command = new CreateProductCommand(
            Name: "Product",
            Description: null,
            Price: 10m,
            Sku: sku,
            StockQuantity: 10,
            LowStockThreshold: 5,
            IsActive: true,
            CreatedBy: "user",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Sku);
    }

    [Fact]
    public void Validate_WithNegativeStockQuantity_ShouldHaveError()
    {
        var command = new CreateProductCommand(
            Name: "Product",
            Description: null,
            Price: 10m,
            Sku: "TEST001",
            StockQuantity: -1,
            LowStockThreshold: 5,
            IsActive: true,
            CreatedBy: "user",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.StockQuantity);
    }

    [Fact]
    public void Validate_WithNegativeLowStockThreshold_ShouldHaveError()
    {
        var command = new CreateProductCommand(
            Name: "Product",
            Description: null,
            Price: 10m,
            Sku: "TEST001",
            StockQuantity: 10,
            LowStockThreshold: -1,
            IsActive: true,
            CreatedBy: "user",
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.LowStockThreshold);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyCreatedBy_ShouldHaveError(string? createdBy)
    {
        var command = new CreateProductCommand(
            Name: "Product",
            Description: null,
            Price: 10m,
            Sku: "TEST001",
            StockQuantity: 10,
            LowStockThreshold: 5,
            IsActive: true,
            CreatedBy: createdBy!,
            Details: null);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.CreatedBy);
    }
}
