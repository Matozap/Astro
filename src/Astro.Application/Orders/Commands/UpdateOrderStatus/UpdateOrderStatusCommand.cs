using Astro.Domain.Orders.Entities;
using Astro.Domain.Orders.Enums;
using MediatR;

namespace Astro.Application.Orders.Commands.UpdateOrderStatus;

/// <summary>
/// Command to update order status.
/// </summary>
public sealed record UpdateOrderStatusCommand(
    Guid OrderId,
    OrderStatus NewStatus,
    string ModifiedBy) : IRequest<Order>;
