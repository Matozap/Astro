using Astro.Application.Common;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Products.Commands.UpdateProduct;

/// <summary>
/// Handler for UpdateProductCommand.
/// </summary>
public sealed class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Product>
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateProductCommandHandler> _logger;

    public UpdateProductCommandHandler(
        IProductRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateProductCommandHandler> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Product> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating product {ProductId}", request.Id);

        var product = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new ProductNotFoundException(request.Id);

        product.Update(
            name: request.Name,
            description: request.Description,
            price: request.Price,
            sku: request.Sku,
            lowStockThreshold: request.LowStockThreshold,
            isActive: request.IsActive,
            modifiedBy: request.ModifiedBy);

        // Update stock separately if changed
        if (request.StockQuantity != product.StockQuantity.Value)
        {
            product.UpdateStock(request.StockQuantity, request.ModifiedBy);
        }

        // Update details - clear and re-add
        product.ClearDetails();
        if (request.Details is not null)
        {
            foreach (var detail in request.Details)
            {
                product.AddDetail(detail.Key, detail.Value);
            }
        }

        _repository.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Product {ProductId} updated successfully", request.Id);

        return product;
    }
}
