using FluentValidation;

namespace Astro.Application.Shipments.Commands.CreateShipment;

/// <summary>
/// Validator for CreateShipmentCommand.
/// </summary>
public sealed class CreateShipmentCommandValidator : AbstractValidator<CreateShipmentCommand>
{
    public CreateShipmentCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required");

        RuleFor(x => x.Carrier)
            .NotEmpty().WithMessage("Carrier is required")
            .MaximumLength(100).WithMessage("Carrier must not exceed 100 characters");

        RuleFor(x => x.TrackingNumber)
            .MinimumLength(5).When(x => x.TrackingNumber != null)
            .WithMessage("Tracking number must be at least 5 characters")
            .MaximumLength(50).When(x => x.TrackingNumber != null)
            .WithMessage("Tracking number must not exceed 50 characters");

        // Origin Address
        RuleFor(x => x.OriginStreet)
            .NotEmpty().WithMessage("Origin street is required")
            .MaximumLength(200).WithMessage("Origin street must not exceed 200 characters");

        RuleFor(x => x.OriginCity)
            .NotEmpty().WithMessage("Origin city is required")
            .MaximumLength(100).WithMessage("Origin city must not exceed 100 characters");

        RuleFor(x => x.OriginState)
            .NotEmpty().WithMessage("Origin state is required")
            .MaximumLength(100).WithMessage("Origin state must not exceed 100 characters");

        RuleFor(x => x.OriginPostalCode)
            .NotEmpty().WithMessage("Origin postal code is required")
            .MaximumLength(20).WithMessage("Origin postal code must not exceed 20 characters");

        RuleFor(x => x.OriginCountry)
            .NotEmpty().WithMessage("Origin country is required")
            .MaximumLength(100).WithMessage("Origin country must not exceed 100 characters");

        // Destination Address
        RuleFor(x => x.DestinationStreet)
            .NotEmpty().WithMessage("Destination street is required")
            .MaximumLength(200).WithMessage("Destination street must not exceed 200 characters");

        RuleFor(x => x.DestinationCity)
            .NotEmpty().WithMessage("Destination city is required")
            .MaximumLength(100).WithMessage("Destination city must not exceed 100 characters");

        RuleFor(x => x.DestinationState)
            .NotEmpty().WithMessage("Destination state is required")
            .MaximumLength(100).WithMessage("Destination state must not exceed 100 characters");

        RuleFor(x => x.DestinationPostalCode)
            .NotEmpty().WithMessage("Destination postal code is required")
            .MaximumLength(20).WithMessage("Destination postal code must not exceed 20 characters");

        RuleFor(x => x.DestinationCountry)
            .NotEmpty().WithMessage("Destination country is required")
            .MaximumLength(100).WithMessage("Destination country must not exceed 100 characters");

        // Weight and Dimensions
        RuleFor(x => x.Weight)
            .GreaterThanOrEqualTo(0).WithMessage("Weight must be non-negative");

        RuleFor(x => x.Length)
            .GreaterThanOrEqualTo(0).WithMessage("Length must be non-negative");

        RuleFor(x => x.Width)
            .GreaterThanOrEqualTo(0).WithMessage("Width must be non-negative");

        RuleFor(x => x.Height)
            .GreaterThanOrEqualTo(0).WithMessage("Height must be non-negative");

        RuleFor(x => x.ShippingCost)
            .GreaterThanOrEqualTo(0).WithMessage("Shipping cost must be non-negative");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("CreatedBy is required");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one shipment item is required");

        RuleForEach(x => x.Items)
            .SetValidator(new CreateShipmentItemDtoValidator());
    }
}

/// <summary>
/// Validator for CreateShipmentItemDto.
/// </summary>
public sealed class CreateShipmentItemDtoValidator : AbstractValidator<CreateShipmentItemDto>
{
    public CreateShipmentItemDtoValidator()
    {
        RuleFor(x => x.OrderDetailId)
            .NotEmpty().WithMessage("Order detail ID is required");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.ProductName)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

        RuleFor(x => x.ProductSku)
            .NotEmpty().WithMessage("Product SKU is required")
            .MaximumLength(50).WithMessage("Product SKU must not exceed 50 characters");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0");
    }
}
