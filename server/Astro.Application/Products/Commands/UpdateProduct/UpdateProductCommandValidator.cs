using FluentValidation;

namespace Astro.Application.Products.Commands.UpdateProduct;

/// <summary>
/// Validator for UpdateProductCommand.
/// </summary>
public sealed class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be non-negative");

        RuleFor(x => x.Sku)
            .NotEmpty().WithMessage("SKU is required")
            .Matches(@"^[A-Z0-9]{3,20}$").WithMessage("SKU must be 3-20 uppercase alphanumeric characters");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative");

        RuleFor(x => x.LowStockThreshold)
            .GreaterThanOrEqualTo(0).WithMessage("Low stock threshold cannot be negative");

        RuleFor(x => x.ModifiedBy)
            .NotEmpty().WithMessage("ModifiedBy is required");

        RuleForEach(x => x.Details)
            .SetValidator(new UpdateProductDetailDtoValidator());
    }
}

/// <summary>
/// Validator for UpdateProductDetailDto.
/// </summary>
public sealed class UpdateProductDetailDtoValidator : AbstractValidator<UpdateProductDetailDto>
{
    public UpdateProductDetailDtoValidator()
    {
        RuleFor(x => x.Key)
            .NotEmpty().WithMessage("Detail key is required")
            .MaximumLength(100).WithMessage("Detail key must not exceed 100 characters");

        RuleFor(x => x.Value)
            .NotEmpty().WithMessage("Detail value is required")
            .MaximumLength(500).WithMessage("Detail value must not exceed 500 characters");
    }
}
