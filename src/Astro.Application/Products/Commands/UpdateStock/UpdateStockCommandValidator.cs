using FluentValidation;

namespace Astro.Application.Products.Commands.UpdateStock;

/// <summary>
/// Validator for UpdateStockCommand.
/// </summary>
public sealed class UpdateStockCommandValidator : AbstractValidator<UpdateStockCommand>
{
    public UpdateStockCommandValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative");

        RuleFor(x => x.ModifiedBy)
            .NotEmpty().WithMessage("ModifiedBy is required");
    }
}
