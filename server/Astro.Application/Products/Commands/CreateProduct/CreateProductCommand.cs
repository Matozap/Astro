using Astro.Domain.Products.Entities;
using MediatR;

namespace Astro.Application.Products.Commands.CreateProduct;

/// <summary>
/// Command to create a new product.
/// </summary>
public sealed record CreateProductCommand(
    string Name,
    string? Description,
    decimal Price,
    string Sku,
    int StockQuantity,
    int LowStockThreshold,
    bool IsActive,
    string CreatedBy,
    List<CreateProductDetailDto>? Details) : IRequest<Product>;

/// <summary>
/// DTO for product detail in create command.
/// </summary>
public sealed record CreateProductDetailDto(string Key, string Value);
