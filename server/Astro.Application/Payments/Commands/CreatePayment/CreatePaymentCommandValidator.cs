using FluentValidation;

namespace Astro.Application.Payments.Commands.CreatePayment;

/// <summary>
/// Validator for CreatePaymentCommand.
/// </summary>
public sealed class CreatePaymentCommandValidator : AbstractValidator<CreatePaymentCommand>
{
    public CreatePaymentCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty().WithMessage("Order ID is required");
    }
}
