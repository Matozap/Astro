using Astro.Domain.Products.Entities;
using MediatR;

namespace Astro.Application.Products.Commands.UpdateProduct;

/// <summary>
/// Command to update an existing product.
/// </summary>
public sealed record UpdateProductCommand(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    string Sku,
    int StockQuantity,
    int LowStockThreshold,
    bool IsActive,
    string ModifiedBy,
    List<UpdateProductDetailDto>? Details) : IRequest<Product>;

/// <summary>
/// DTO for product detail in update command.
/// </summary>
public sealed record UpdateProductDetailDto(Guid? Id, string Key, string Value);
