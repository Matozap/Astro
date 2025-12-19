using FluentValidation;

namespace Astro.Application.Products.Commands.AddProductImage;

/// <summary>
/// Validator for AddProductImageCommand.
/// </summary>
public sealed class AddProductImageCommandValidator : AbstractValidator<AddProductImageCommand>
{
    public AddProductImageCommandValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("File name is required")
            .MaximumLength(200).WithMessage("File name must not exceed 200 characters");

        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("URL is required")
            .MaximumLength(500).WithMessage("URL must not exceed 500 characters");

        RuleFor(x => x.StorageMode)
            .IsInEnum().WithMessage("Invalid storage mode");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("CreatedBy is required");
    }
}
