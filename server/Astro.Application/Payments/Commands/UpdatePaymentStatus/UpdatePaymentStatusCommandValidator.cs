using FluentValidation;

namespace Astro.Application.Payments.Commands.UpdatePaymentStatus;

/// <summary>
/// Validator for UpdatePaymentStatusCommand.
/// </summary>
public sealed class UpdatePaymentStatusCommandValidator : AbstractValidator<UpdatePaymentStatusCommand>
{
    public UpdatePaymentStatusCommandValidator()
    {
        RuleFor(x => x.PaymentId)
            .NotEmpty().WithMessage("Payment ID is required");

        RuleFor(x => x.NewStatus)
            .IsInEnum().WithMessage("Invalid payment status");
    }
}
