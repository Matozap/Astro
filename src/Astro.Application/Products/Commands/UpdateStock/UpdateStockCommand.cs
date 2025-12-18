using Astro.Domain.Products.Entities;
using MediatR;

namespace Astro.Application.Products.Commands.UpdateStock;

/// <summary>
/// Command to update product stock quantity.
/// </summary>
public sealed record UpdateStockCommand(
    Guid ProductId,
    int StockQuantity,
    string ModifiedBy) : IRequest<Product>;
