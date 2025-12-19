using FluentValidation;

namespace Astro.Application.Orders.Commands.UpdateOrderStatus;

/// <summary>
/// Validator for UpdateOrderStatusCommand.
/// </summary>
public sealed class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required");

        RuleFor(x => x.NewStatus)
            .IsInEnum().WithMessage("Invalid order status");

        RuleFor(x => x.ModifiedBy)
            .NotEmpty().WithMessage("ModifiedBy is required");
    }
}
