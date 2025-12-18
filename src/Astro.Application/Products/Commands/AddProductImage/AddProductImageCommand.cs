using Astro.Domain.Products.Entities;
using Astro.Domain.Products.Enums;
using MediatR;

namespace Astro.Application.Products.Commands.AddProductImage;

/// <summary>
/// Command to add an image to a product.
/// </summary>
public sealed record AddProductImageCommand(
    Guid ProductId,
    string FileName,
    string Url,
    StorageMode StorageMode,
    bool IsPrimary,
    string CreatedBy) : IRequest<ProductImage>;
