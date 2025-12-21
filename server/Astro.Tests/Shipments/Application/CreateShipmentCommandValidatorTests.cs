using Astro.Application.Shipments.Commands.CreateShipment;
using Astro.Domain.Shipments.Enums;
using FluentValidation.TestHelper;
using Xunit;

namespace Astro.Tests.Shipments.Application;

public class CreateShipmentCommandValidatorTests
{
    private readonly CreateShipmentCommandValidator _validator;

    public CreateShipmentCommandValidatorTests()
    {
        _validator = new CreateShipmentCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ShouldNotHaveErrors()
    {
        var command = CreateValidCommand();

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyCarrier_ShouldHaveError(string? carrier)
    {
        var command = CreateValidCommand() with { Carrier = carrier! };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Carrier);
    }

    [Fact]
    public void Validate_WithEmptyOrderId_ShouldHaveError()
    {
        var command = CreateValidCommand() with { OrderId = Guid.Empty };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.OrderId);
    }

    [Fact]
    public void Validate_WithTooShortTrackingNumber_ShouldHaveError()
    {
        var command = CreateValidCommand() with { TrackingNumber = "ABC" };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.TrackingNumber);
    }

    [Fact]
    public void Validate_WithNullTrackingNumber_ShouldNotHaveError()
    {
        var command = CreateValidCommand() with { TrackingNumber = null };

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveValidationErrorFor(x => x.TrackingNumber);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyOriginStreet_ShouldHaveError(string? street)
    {
        var command = CreateValidCommand() with { OriginStreet = street! };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.OriginStreet);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyDestinationCity_ShouldHaveError(string? city)
    {
        var command = CreateValidCommand() with { DestinationCity = city! };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.DestinationCity);
    }

    [Fact]
    public void Validate_WithNegativeWeight_ShouldHaveError()
    {
        var command = CreateValidCommand() with { Weight = -1m };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Weight);
    }

    [Fact]
    public void Validate_WithNegativeShippingCost_ShouldHaveError()
    {
        var command = CreateValidCommand() with { ShippingCost = -10m };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.ShippingCost);
    }

    [Fact]
    public void Validate_WithEmptyItems_ShouldHaveError()
    {
        var command = CreateValidCommand() with { Items = [] };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Items);
    }

    [Fact]
    public void Validate_WithInvalidItemQuantity_ShouldHaveError()
    {
        var command = CreateValidCommand() with
        {
            Items =
            [
                new CreateShipmentItemDto(
                    OrderDetailId: Guid.NewGuid(),
                    ProductId: Guid.NewGuid(),
                    ProductName: "Test Product",
                    ProductSku: "SKU123",
                    Quantity: 0)
            ]
        };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor("Items[0].Quantity");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyCreatedBy_ShouldHaveError(string? createdBy)
    {
        var command = CreateValidCommand() with { CreatedBy = createdBy! };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.CreatedBy);
    }

    private static CreateShipmentCommand CreateValidCommand()
    {
        return new CreateShipmentCommand(
            OrderId: Guid.NewGuid(),
            Carrier: "FedEx",
            TrackingNumber: null,
            OriginStreet: "123 Warehouse St",
            OriginCity: "New York",
            OriginState: "NY",
            OriginPostalCode: "10001",
            OriginCountry: "USA",
            DestinationStreet: "456 Customer Ave",
            DestinationCity: "Los Angeles",
            DestinationState: "CA",
            DestinationPostalCode: "90001",
            DestinationCountry: "USA",
            Weight: 5.5m,
            WeightUnit: WeightUnit.Pounds,
            Length: 12m,
            Width: 8m,
            Height: 6m,
            DimensionUnit: DimensionUnit.Inches,
            ShippingCost: 15.99m,
            EstimatedDeliveryDate: DateTimeOffset.UtcNow.AddDays(3),
            CreatedBy: "test-user",
            Items:
            [
                new CreateShipmentItemDto(
                    OrderDetailId: Guid.NewGuid(),
                    ProductId: Guid.NewGuid(),
                    ProductName: "Test Product",
                    ProductSku: "SKU123",
                    Quantity: 2)
            ]);
    }
}
