using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using MediatR;

namespace Astro.Application.Products.Queries.GetProducts;

/// <summary>
/// Handler for GetProductsQuery.
/// Returns IQueryable for deferred execution and LINQ composition.
/// </summary>
public sealed class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, IQueryable<Product>>
{
    private readonly IProductRepository _repository;

    public GetProductsQueryHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public Task<IQueryable<Product>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(_repository.GetAll());
    }
}
