using Astro.Api.Base;
using Astro.Application.Payments.Queries.GetPayments;
using Astro.Domain.Payments.Entities;
using MediatR;

namespace Astro.Api.Payments.GraphQL;

/// <summary>
/// GraphQL queries for Payments module.
/// </summary>
[ExtendObjectType(typeof(Query))]
public class PaymentQuery
{
    /// <summary>
    /// Gets all payments with projection, filtering, and sorting support.
    /// </summary>
    [UsePaging(DefaultPageSize = 10, IncludeTotalCount =  true)]
    [UseFiltering]
    [UseSorting]
    public async Task<IQueryable<Payment>> GetPayments([Service] IMediator mediator)
    {
        var query = new GetPaymentsQuery();
        return await mediator.Send(query);
    }
}
