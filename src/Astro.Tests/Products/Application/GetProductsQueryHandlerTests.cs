using Astro.Application.Products.Queries.GetProducts;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Application;

public class GetProductsQueryHandlerTests
{
    private readonly IProductRepository _repository;
    private readonly GetProductsQueryHandler _handler;

    public GetProductsQueryHandlerTests()
    {
        _repository = Substitute.For<IProductRepository>();
        _handler = new GetProductsQueryHandler(_repository);
    }

    [Fact]
    public async Task Handle_ShouldReturnQueryableFromRepository()
    {
        var products = new List<Product>
        {
            Product.Create("Product 1", "Description 1", 10m, "SKU001", 100, 10, true, "creator"),
            Product.Create("Product 2", "Description 2", 20m, "SKU002", 50, 5, true, "creator"),
            Product.Create("Product 3", "Description 3", 30m, "SKU003", 25, 2, false, "creator")
        };

        _repository.GetAll().Returns(products.AsQueryable());

        var query = new GetProductsQuery();

        var result = await _handler.Handle(query, CancellationToken.None);

        result.ShouldNotBeNull();
        result.Count().ShouldBe(3);
    }

    [Fact]
    public async Task Handle_WithEmptyRepository_ShouldReturnEmptyQueryable()
    {
        var emptyProducts = new List<Product>();
        _repository.GetAll().Returns(emptyProducts.AsQueryable());

        var query = new GetProductsQuery();

        var result = await _handler.Handle(query, CancellationToken.None);

        result.ShouldNotBeNull();
        result.Count().ShouldBe(0);
    }

    [Fact]
    public async Task Handle_ShouldAllowFiltering()
    {
        var products = new List<Product>
        {
            Product.Create("Product 1", "Description 1", 10m, "SKU001", 100, 10, true, "creator"),
            Product.Create("Product 2", "Description 2", 20m, "SKU002", 50, 5, true, "creator"),
            Product.Create("Product 3", "Description 3", 30m, "SKU003", 25, 2, false, "creator")
        };

        _repository.GetAll().Returns(products.AsQueryable());

        var query = new GetProductsQuery();

        var result = await _handler.Handle(query, CancellationToken.None);
        var activeProducts = result.Where(p => p.IsActive).ToList();

        activeProducts.Count.ShouldBe(2);
    }
}
