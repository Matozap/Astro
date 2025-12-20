using Astro.Domain.Payments.Enums;
using Astro.Domain.Shared;

namespace Astro.Domain.Payments.Events;

/// <summary>
/// Domain event raised when a payment status changes
/// </summary>
public sealed record PaymentStatusChangedEvent(
    Guid PaymentId,
    Guid OrderId,
    PaymentStatus OldStatus,
    PaymentStatus NewStatus
) : DomainEventBase;
