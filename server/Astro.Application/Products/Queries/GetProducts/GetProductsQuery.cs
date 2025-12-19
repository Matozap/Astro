using Astro.Domain.Products.Entities;
using MediatR;

namespace Astro.Application.Products.Queries.GetProducts;

/// <summary>
/// Query to get all products.
/// </summary>
public sealed record GetProductsQuery : IRequest<IQueryable<Product>>;
