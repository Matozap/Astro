using Astro.Application.Orders.Queries.GetOrders;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Orders.Application;

public class GetOrdersQueryHandlerTests
{
    private readonly IOrderRepository _orderRepository;
    private readonly GetOrdersQueryHandler _handler;

    public GetOrdersQueryHandlerTests()
    {
        _orderRepository = Substitute.For<IOrderRepository>();
        _handler = new GetOrdersQueryHandler(_orderRepository);
    }

    [Fact]
    public async Task Handle_ShouldReturnQueryableFromRepository()
    {
        var orders = new List<Order>
        {
            Order.Create("Customer 1", "c1@test.com", "Street 1", "City 1", "S1", "11111", "USA", null, "creator"),
            Order.Create("Customer 2", "c2@test.com", "Street 2", "City 2", "S2", "22222", "USA", null, "creator"),
            Order.Create("Customer 3", "c3@test.com", "Street 3", "City 3", "S3", "33333", "USA", null, "creator")
        };

        _orderRepository.GetAll().Returns(orders.AsQueryable());

        var query = new GetOrdersQuery();

        var result = await _handler.Handle(query, CancellationToken.None);

        result.ShouldNotBeNull();
        result.Count().ShouldBe(3);
    }

    [Fact]
    public async Task Handle_WithEmptyRepository_ShouldReturnEmptyQueryable()
    {
        var emptyOrders = new List<Order>();
        _orderRepository.GetAll().Returns(emptyOrders.AsQueryable());
        var query = new GetOrdersQuery();

        var result = await _handler.Handle(query, CancellationToken.None);

        result.ShouldNotBeNull();
        result.Count().ShouldBe(0);
    }
}
