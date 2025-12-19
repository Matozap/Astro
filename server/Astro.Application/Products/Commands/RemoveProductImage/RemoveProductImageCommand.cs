using MediatR;

namespace Astro.Application.Products.Commands.RemoveProductImage;

/// <summary>
/// Command to remove an image from a product.
/// </summary>
public sealed record RemoveProductImageCommand(
    Guid ProductId,
    Guid ImageId) : IRequest<Unit>;
