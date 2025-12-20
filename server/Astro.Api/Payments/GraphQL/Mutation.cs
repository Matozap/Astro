using Astro.Api.Base;
using Astro.Application.Orders.Exceptions;
using Astro.Application.Payments.Commands.CreatePayment;
using Astro.Application.Payments.Commands.UpdatePaymentStatus;
using Astro.Application.Payments.Exceptions;
using Astro.Domain.Payments.Entities;
using FluentValidation;
using HotChocolate.Subscriptions;
using MediatR;

namespace Astro.Api.Payments.GraphQL;

/// <summary>
/// GraphQL mutations for Payments module.
/// </summary>
[ExtendObjectType(typeof(Mutation))]
public class PaymentMutation
{
    /// <summary>
    /// Creates a new payment for an order.
    /// </summary>
    [Error<ValidationException>]
    [Error<OrderNotFoundException>]
    public async Task<Payment> CreatePayment(
        CreatePaymentCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var payment = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(PaymentSubscription.OnPaymentCreated), payment, cancellationToken);
        return payment;
    }

    /// <summary>
    /// Updates the status of a payment.
    /// </summary>
    [Error<ValidationException>]
    [Error<PaymentNotFoundException>]
    public async Task<Payment> UpdatePaymentStatus(
        UpdatePaymentStatusCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var payment = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(PaymentSubscription.OnPaymentStatusChanged), payment, cancellationToken);
        return payment;
    }
}
