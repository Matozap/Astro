using FluentValidation;

namespace Astro.Application.Shipments.Commands.UpdateShipment;

/// <summary>
/// Validator for UpdateShipmentCommand.
/// </summary>
public sealed class UpdateShipmentCommandValidator : AbstractValidator<UpdateShipmentCommand>
{
    public UpdateShipmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Shipment ID is required");

        RuleFor(x => x.Carrier)
            .MaximumLength(100).WithMessage("Carrier must not exceed 100 characters")
            .When(x => x.Carrier is not null);

        RuleFor(x => x.TrackingNumber)
            .MinimumLength(5).WithMessage("Tracking number must be at least 5 characters")
            .MaximumLength(100).WithMessage("Tracking number must not exceed 100 characters")
            .When(x => x.TrackingNumber is not null);

        RuleFor(x => x.StatusLocation)
            .MaximumLength(200).WithMessage("Status location must not exceed 200 characters")
            .When(x => x.StatusLocation is not null);

        RuleFor(x => x.StatusNotes)
            .MaximumLength(1000).WithMessage("Status notes must not exceed 1000 characters")
            .When(x => x.StatusNotes is not null);

        RuleFor(x => x.ModifiedBy)
            .NotEmpty().WithMessage("ModifiedBy is required");
    }
}
