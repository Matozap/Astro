using Astro.Domain.Orders.Entities;
using MediatR;

namespace Astro.Application.Orders.Commands.CancelOrder;

/// <summary>
/// Command to cancel an order.
/// </summary>
public sealed record CancelOrderCommand(
    Guid OrderId,
    string? Reason,
    string CancelledBy) : IRequest<Order>;
