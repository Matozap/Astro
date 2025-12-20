using Astro.Domain.Payments.Enums;
using Astro.Domain.Shared;

namespace Astro.Domain.Payments.Events;

/// <summary>
/// Domain event raised when a payment is created
/// </summary>
public sealed record PaymentCreatedEvent(
    Guid PaymentId,
    Guid OrderId,
    PaymentStatus Status
) : DomainEventBase;
