using Astro.Api.Base;
using Astro.Domain.Shipments.Entities;

namespace Astro.Api.Shipments.GraphQL;

/// <summary>
/// GraphQL subscriptions for Shipments module.
/// </summary>
[ExtendObjectType(typeof(Subscription))]
public class ShipmentSubscription
{
    /// <summary>
    /// Subscription for when a shipment is created.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnShipmentCreated))]
    public Shipment OnShipmentCreated([EventMessage] Shipment shipment) => shipment;

    /// <summary>
    /// Subscription for when a shipment is updated.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnShipmentUpdated))]
    public Shipment OnShipmentUpdated([EventMessage] Shipment shipment) => shipment;

    /// <summary>
    /// Subscription for when a shipment's status changes.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnShipmentStatusChanged))]
    public Shipment OnShipmentStatusChanged([EventMessage] Shipment shipment) => shipment;

    /// <summary>
    /// Subscription for when a shipment is delivered.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnShipmentDelivered))]
    public Shipment OnShipmentDelivered([EventMessage] Shipment shipment) => shipment;
}
