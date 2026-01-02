using Astro.Application.Common;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Products.Commands.AddProductImage;

/// <summary>
/// Handler for AddProductImageCommand.
/// </summary>
public sealed class AddProductImageCommandHandler : IRequestHandler<AddProductImageCommand, ProductImage>
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AddProductImageCommandHandler> _logger;

    public AddProductImageCommandHandler(
        IProductRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<AddProductImageCommandHandler> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ProductImage> Handle(AddProductImageCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Adding image to product {ProductId}", request.ProductId);

        // Verify product exists (lightweight check - no need to load the aggregate)
        var productExists = await _repository.GetByIdAsync(request.ProductId, cancellationToken);
        if (productExists is null)
        {
            throw new ProductNotFoundException(request.ProductId);
        }

        // Create and add image directly to the database
        var image = ProductImage.CreateForProduct(
            productId: request.ProductId,
            fileName: request.FileName,
            url: request.Url,
            storageMode: request.StorageMode,
            isPrimary: request.IsPrimary);

        await _repository.AddImageAsync(image, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Image {ImageId} added to product {ProductId}", image.Id, request.ProductId);

        return image;
    }
}
