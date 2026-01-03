using Astro.Domain.Payments.Entities;
using MediatR;

namespace Astro.Application.Payments.Commands.CreatePayment;

/// <summary>
/// Command to create a new payment for an order.
/// </summary>
public sealed record CreatePaymentCommand(
    Guid OrderId,
    decimal Amount,
    string Currency = "USD",
    string? PaymentMethod = null
) : IRequest<Payment>;
