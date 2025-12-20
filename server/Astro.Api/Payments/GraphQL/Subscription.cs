using Astro.Api.Base;
using Astro.Domain.Payments.Entities;

namespace Astro.Api.Payments.GraphQL;

/// <summary>
/// GraphQL subscriptions for Payments module.
/// </summary>
[ExtendObjectType(typeof(Subscription))]
public class PaymentSubscription
{
    /// <summary>
    /// Subscription for when a payment is created.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnPaymentCreated))]
    public Payment OnPaymentCreated([EventMessage] Payment payment) => payment;

    /// <summary>
    /// Subscription for when a payment's status changes.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnPaymentStatusChanged))]
    public Payment OnPaymentStatusChanged([EventMessage] Payment payment) => payment;
}
