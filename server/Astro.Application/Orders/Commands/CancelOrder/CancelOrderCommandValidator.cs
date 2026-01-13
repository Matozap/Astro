using FluentValidation;

namespace Astro.Application.Orders.Commands.CancelOrder;

/// <summary>
/// Validator for CancelOrderCommand.
/// </summary>
public sealed class CancelOrderCommandValidator : AbstractValidator<CancelOrderCommand>
{
    public CancelOrderCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Cancellation reason is required")
            .MaximumLength(500).WithMessage("Reason must not exceed 500 characters");

        RuleFor(x => x.CancelledBy)
            .NotEmpty().WithMessage("CancelledBy is required");
    }
}
