using FluentValidation;

namespace Astro.Application.Products.Commands.CreateProduct;

/// <summary>
/// Validator for CreateProductCommand.
/// </summary>
public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
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

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("CreatedBy is required");

        RuleForEach(x => x.Details)
            .SetValidator(new CreateProductDetailDtoValidator());
    }
}

/// <summary>
/// Validator for CreateProductDetailDto.
/// </summary>
public sealed class CreateProductDetailDtoValidator : AbstractValidator<CreateProductDetailDto>
{
    public CreateProductDetailDtoValidator()
    {
        RuleFor(x => x.Key)
            .NotEmpty().WithMessage("Detail key is required")
            .MaximumLength(100).WithMessage("Detail key must not exceed 100 characters");

        RuleFor(x => x.Value)
            .NotEmpty().WithMessage("Detail value is required")
            .MaximumLength(500).WithMessage("Detail value must not exceed 500 characters");
    }
}
