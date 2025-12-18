using FluentValidation;

namespace Astro.Application.Orders.Commands.CreateOrder;

/// <summary>
/// Validator for CreateOrderCommand.
/// </summary>
public sealed class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.CustomerName)
            .NotEmpty().WithMessage("Customer name is required")
            .MaximumLength(200).WithMessage("Customer name must not exceed 200 characters");

        RuleFor(x => x.CustomerEmail)
            .NotEmpty().WithMessage("Customer email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(320).WithMessage("Customer email must not exceed 320 characters");

        RuleFor(x => x.Street)
            .NotEmpty().WithMessage("Street is required")
            .MaximumLength(200).WithMessage("Street must not exceed 200 characters");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .MaximumLength(100).WithMessage("City must not exceed 100 characters");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State is required")
            .MaximumLength(100).WithMessage("State must not exceed 100 characters");

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("Postal code is required")
            .MaximumLength(20).WithMessage("Postal code must not exceed 20 characters");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters");

        RuleFor(x => x.CreatedBy)
            .NotEmpty().WithMessage("CreatedBy is required");

        RuleFor(x => x.OrderDetails)
            .NotEmpty().WithMessage("At least one order detail is required");

        RuleForEach(x => x.OrderDetails)
            .SetValidator(new CreateOrderDetailDtoValidator());
    }
}

/// <summary>
/// Validator for CreateOrderDetailDto.
/// </summary>
public sealed class CreateOrderDetailDtoValidator : AbstractValidator<CreateOrderDetailDto>
{
    public CreateOrderDetailDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0");
    }
}
