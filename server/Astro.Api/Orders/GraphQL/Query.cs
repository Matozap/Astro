using Astro.Api.Base;
using Astro.Application.Orders.Queries.GetOrders;
using Astro.Domain.Orders.Entities;
using MediatR;

namespace Astro.Api.Orders.GraphQL;

/// <summary>
/// GraphQL queries for Orders module.
/// </summary>
[ExtendObjectType(typeof(Query))]
public class OrderQuery
{
    /// <summary>
    /// Gets all orders with projection, filtering, and sorting support.
    /// </summary>
    [UseFiltering]
    [UseSorting]
    public async Task<IQueryable<Order>> GetOrders([Service] IMediator mediator)
    {
        var query = new GetOrdersQuery();
        return await mediator.Send(query);
    }
}
