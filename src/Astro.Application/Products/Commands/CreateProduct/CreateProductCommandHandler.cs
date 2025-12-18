using Astro.Application.Common;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Products.Commands.CreateProduct;

/// <summary>
/// Handler for CreateProductCommand.
/// </summary>
public sealed class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Product>
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateProductCommandHandler> _logger;

    public CreateProductCommandHandler(
        IProductRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<CreateProductCommandHandler> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Product> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating product with SKU {Sku}", request.Sku);

        var product = Product.Create(
            name: request.Name,
            description: request.Description,
            price: request.Price,
            sku: request.Sku,
            stockQuantity: request.StockQuantity,
            lowStockThreshold: request.LowStockThreshold,
            isActive: request.IsActive,
            createdBy: request.CreatedBy);

        // Add details if provided
        if (request.Details is not null)
        {
            foreach (var detail in request.Details)
            {
                product.AddDetail(detail.Key, detail.Value);
            }
        }

        await _repository.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Product created with ID {ProductId}", product.Id);

        return product;
    }
}
