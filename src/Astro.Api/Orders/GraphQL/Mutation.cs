using Astro.Api.Base;
using Astro.Application.Orders.Commands.CancelOrder;
using Astro.Application.Orders.Commands.CreateOrder;
using Astro.Application.Orders.Commands.UpdateOrder;
using Astro.Application.Orders.Commands.UpdateOrderStatus;
using Astro.Application.Orders.Exceptions;
using Astro.Domain.Orders.Entities;
using FluentValidation;
using HotChocolate.Subscriptions;
using MediatR;

namespace Astro.Api.Orders.GraphQL;

/// <summary>
/// GraphQL mutations for Orders module.
/// </summary>
[ExtendObjectType(typeof(Mutation))]
public class OrderMutation
{
    /// <summary>
    /// Creates a new order.
    /// </summary>
    [Error<ValidationException>]
    [Error<ProductNotAvailableException>]
    [Error<InsufficientStockException>]
    public async Task<Order> CreateOrder(
        CreateOrderCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var order = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(OrderSubscription.OnOrderCreated), order, cancellationToken);
        return order;
    }

    /// <summary>
    /// Updates an existing order.
    /// </summary>
    [Error<ValidationException>]
    [Error<OrderNotFoundException>]
    public async Task<Order> UpdateOrder(
        UpdateOrderCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var order = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(OrderSubscription.OnOrderUpdated), order, cancellationToken);
        return order;
    }

    /// <summary>
    /// Updates the status of an order.
    /// </summary>
    [Error<ValidationException>]
    [Error<OrderNotFoundException>]
    public async Task<Order> UpdateOrderStatus(
        UpdateOrderStatusCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var order = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(OrderSubscription.OnOrderStatusChanged), order, cancellationToken);
        return order;
    }

    /// <summary>
    /// Cancels an order.
    /// </summary>
    [Error<ValidationException>]
    [Error<OrderNotFoundException>]
    public async Task<Order> CancelOrder(
        CancelOrderCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var order = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(OrderSubscription.OnOrderCancelled), order, cancellationToken);
        return order;
    }
}
