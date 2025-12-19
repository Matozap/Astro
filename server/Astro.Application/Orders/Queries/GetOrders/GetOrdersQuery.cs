using Astro.Domain.Orders.Entities;
using MediatR;

namespace Astro.Application.Orders.Queries.GetOrders;

/// <summary>
/// Query to get all orders.
/// </summary>
public sealed record GetOrdersQuery : IRequest<IQueryable<Order>>;
