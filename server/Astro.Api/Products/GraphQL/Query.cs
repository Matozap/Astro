using Astro.Api.Base;
using Astro.Application.Products.Queries.GetProducts;
using Astro.Domain.Products.Entities;
using MediatR;

namespace Astro.Api.Products.GraphQL;

/// <summary>
/// GraphQL queries for Products module.
/// </summary>
[ExtendObjectType(typeof(Query))]
public class ProductQuery
{
    /// <summary>
    /// Gets all products with filtering and sorting support.
    /// </summary>
    [UsePaging(DefaultPageSize = 10, IncludeTotalCount =  true)]
    [UseFiltering]
    [UseSorting]
    public async Task<IQueryable<Product>> GetProducts([Service] IMediator mediator)
    {
        var query = new GetProductsQuery();
        return await mediator.Send(query);
    }
}
