using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using MediatR;

namespace Astro.Application.Orders.Queries.GetOrders;

/// <summary>
/// Handler for GetOrdersQuery.
/// Returns IQueryable for deferred execution and LINQ composition.
/// </summary>
public sealed class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, IQueryable<Order>>
{
    private readonly IOrderRepository _orderRepository;

    public GetOrdersQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public Task<IQueryable<Order>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(_orderRepository.GetAll());
    }
}
