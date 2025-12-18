using MediatR;

namespace Astro.Application.Products.Commands.DeleteProduct;

/// <summary>
/// Command to delete a product.
/// </summary>
public sealed record DeleteProductCommand(Guid Id) : IRequest<Unit>;
