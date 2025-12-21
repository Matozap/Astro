using Astro.Api.Base;
using Astro.Application.Shipments.Commands.CreateShipment;
using Astro.Application.Shipments.Commands.UpdateShipment;
using Astro.Application.Shipments.Exceptions;
using Astro.Domain.Shipments.Entities;
using FluentValidation;
using HotChocolate.Subscriptions;
using MediatR;

namespace Astro.Api.Shipments.GraphQL;

/// <summary>
/// GraphQL mutations for Shipments module.
/// </summary>
[ExtendObjectType(typeof(Mutation))]
public class ShipmentMutation
{
    /// <summary>
    /// Creates a new shipment.
    /// </summary>
    [Error<ValidationException>]
    public async Task<Shipment> CreateShipment(
        CreateShipmentCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var shipment = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(ShipmentSubscription.OnShipmentCreated), shipment, cancellationToken);
        return shipment;
    }

    /// <summary>
    /// Updates an existing shipment.
    /// Can update carrier, tracking number, status, and add tracking details.
    /// </summary>
    [Error<ValidationException>]
    [Error<ShipmentNotFoundException>]
    [Error<InvalidShipmentStatusTransitionException>]
    public async Task<Shipment> UpdateShipment(
        UpdateShipmentCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var shipment = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(ShipmentSubscription.OnShipmentUpdated), shipment, cancellationToken);

        if (command.Status.HasValue)
        {
            await eventSender.SendAsync(nameof(ShipmentSubscription.OnShipmentStatusChanged), shipment, cancellationToken);
        }

        return shipment;
    }
}
