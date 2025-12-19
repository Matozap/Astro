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

        var product = await _repository.GetByIdWithDetailsAsync(request.ProductId, cancellationToken)
            ?? throw new ProductNotFoundException(request.ProductId);

        var image = product.AddImage(
            fileName: request.FileName,
            url: request.Url,
            storageMode: request.StorageMode,
            isPrimary: request.IsPrimary);

        _repository.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Image {ImageId} added to product {ProductId}", image.Id, request.ProductId);

        return image;
    }
}
