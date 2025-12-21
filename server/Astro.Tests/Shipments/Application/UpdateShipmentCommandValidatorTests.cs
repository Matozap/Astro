using Astro.Application.Shipments.Commands.UpdateShipment;
using Astro.Domain.Shipments.Enums;
using FluentValidation.TestHelper;
using Xunit;

namespace Astro.Tests.Shipments.Application;

public class UpdateShipmentCommandValidatorTests
{
    private readonly UpdateShipmentCommandValidator _validator;

    public UpdateShipmentCommandValidatorTests()
    {
        _validator = new UpdateShipmentCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ShouldNotHaveErrors()
    {
        var command = CreateValidCommand();

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithEmptyId_ShouldHaveError()
    {
        var command = CreateValidCommand() with { Id = Guid.Empty };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Id);
    }

    [Fact]
    public void Validate_WithTooLongCarrier_ShouldHaveError()
    {
        var command = CreateValidCommand() with { Carrier = new string('A', 101) };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Carrier);
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

    [Fact]
    public void Validate_WithTooLongStatusLocation_ShouldHaveError()
    {
        var command = CreateValidCommand() with { StatusLocation = new string('A', 201) };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.StatusLocation);
    }

    [Fact]
    public void Validate_WithTooLongStatusNotes_ShouldHaveError()
    {
        var command = CreateValidCommand() with { StatusNotes = new string('A', 1001) };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.StatusNotes);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyModifiedBy_ShouldHaveError(string? modifiedBy)
    {
        var command = CreateValidCommand() with { ModifiedBy = modifiedBy! };

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.ModifiedBy);
    }

    private static UpdateShipmentCommand CreateValidCommand()
    {
        return new UpdateShipmentCommand(
            Id: Guid.NewGuid(),
            Carrier: "UPS",
            TrackingNumber: "NEWTRACK123456",
            Status: ShipmentStatus.Shipped,
            StatusLocation: "Distribution Center",
            StatusNotes: "Package picked up",
            ModifiedBy: "test-user");
    }
}
