using Astro.Api.Base;
using Astro.Domain.Orders.Entities;

namespace Astro.Api.Orders.GraphQL;

/// <summary>
/// GraphQL subscriptions for Orders module.
/// </summary>
[ExtendObjectType(typeof(Subscription))]
public class OrderSubscription
{
    /// <summary>
    /// Subscription for when an order is created.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnOrderCreated))]
    public Order OnOrderCreated([EventMessage] Order order) => order;

    /// <summary>
    /// Subscription for when an order is updated.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnOrderUpdated))]
    public Order OnOrderUpdated([EventMessage] Order order) => order;

    /// <summary>
    /// Subscription for when an order's status changes.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnOrderStatusChanged))]
    public Order OnOrderStatusChanged([EventMessage] Order order) => order;

    /// <summary>
    /// Subscription for when an order is cancelled.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnOrderCancelled))]
    public Order OnOrderCancelled([EventMessage] Order order) => order;
}
