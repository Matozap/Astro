using FluentValidation;

namespace Astro.Application.Orders.Commands.UpdateOrder;

/// <summary>
/// Validator for UpdateOrderCommand.
/// </summary>
public sealed class UpdateOrderCommandValidator : AbstractValidator<UpdateOrderCommand>
{
    public UpdateOrderCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Order ID is required");

        RuleFor(x => x.CustomerName)
            .MaximumLength(200).WithMessage("Customer name must not exceed 200 characters")
            .When(x => x.CustomerName is not null);

        RuleFor(x => x.CustomerEmail)
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(320).WithMessage("Customer email must not exceed 320 characters")
            .When(x => x.CustomerEmail is not null);

        RuleFor(x => x.Street)
            .MaximumLength(200).WithMessage("Street must not exceed 200 characters")
            .When(x => x.Street is not null);

        RuleFor(x => x.City)
            .MaximumLength(100).WithMessage("City must not exceed 100 characters")
            .When(x => x.City is not null);

        RuleFor(x => x.State)
            .MaximumLength(100).WithMessage("State must not exceed 100 characters")
            .When(x => x.State is not null);

        RuleFor(x => x.PostalCode)
            .MaximumLength(20).WithMessage("Postal code must not exceed 20 characters")
            .When(x => x.PostalCode is not null);

        RuleFor(x => x.Country)
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters")
            .When(x => x.Country is not null);

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters")
            .When(x => x.Notes is not null);

        RuleFor(x => x.ModifiedBy)
            .NotEmpty().WithMessage("ModifiedBy is required");
    }
}
