using Astro.Application.Common;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Products.Commands.UpdateStock;

/// <summary>
/// Handler for UpdateStockCommand.
/// </summary>
public sealed class UpdateStockCommandHandler : IRequestHandler<UpdateStockCommand, Product>
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateStockCommandHandler> _logger;

    public UpdateStockCommandHandler(
        IProductRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateStockCommandHandler> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Product> Handle(UpdateStockCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating stock for product {ProductId}", request.ProductId);

        var product = await _repository.GetByIdAsync(request.ProductId, cancellationToken)
            ?? throw new ProductNotFoundException(request.ProductId);

        var oldStockQuantity = product.StockQuantity.Value;
        product.UpdateStock(request.StockQuantity, request.ModifiedBy);

        _repository.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Stock updated for product {ProductId}: {OldStock} -> {NewStock}",
            product.Id,
            oldStockQuantity,
            request.StockQuantity);

        if (product.IsLowStock())
        {
            _logger.LogWarning(
                "Low stock alert: Product {ProductId} ({ProductName}) has {StockQuantity} units",
                product.Id,
                product.Name,
                product.StockQuantity.Value);
        }

        return product;
    }
}
