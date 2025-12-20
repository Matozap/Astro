using Astro.Domain.Payments.Entities;
using Astro.Domain.Payments.Enums;
using MediatR;

namespace Astro.Application.Payments.Commands.UpdatePaymentStatus;

/// <summary>
/// Command to update payment status.
/// </summary>
public sealed record UpdatePaymentStatusCommand(
    Guid PaymentId,
    PaymentStatus NewStatus) : IRequest<Payment>;
