using Astro.Api.Base;
using Astro.Application.Shipments.Queries.GetShipments;
using Astro.Domain.Shipments.Entities;
using MediatR;

namespace Astro.Api.Shipments.GraphQL;

/// <summary>
/// GraphQL queries for Shipments module.
/// </summary>
[ExtendObjectType(typeof(Query))]
public class ShipmentQuery
{
    /// <summary>
    /// Gets all shipments with projection, filtering, and sorting support.
    /// </summary>
    [UsePaging(DefaultPageSize = 10, IncludeTotalCount =  true)]
    [UseFiltering]
    [UseSorting]
    public async Task<IQueryable<Shipment>> GetShipments([Service] IMediator mediator)
    {
        var query = new GetShipmentsQuery();
        return await mediator.Send(query);
    }
}
