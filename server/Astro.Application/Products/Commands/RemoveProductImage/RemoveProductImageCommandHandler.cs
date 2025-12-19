using Astro.Application.Common;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Products.Abstractions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Products.Commands.RemoveProductImage;

/// <summary>
/// Handler for RemoveProductImageCommand.
/// </summary>
public sealed class RemoveProductImageCommandHandler : IRequestHandler<RemoveProductImageCommand, Unit>
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RemoveProductImageCommandHandler> _logger;

    public RemoveProductImageCommandHandler(
        IProductRepository repository,
        IUnitOfWork unitOfWork,
        ILogger<RemoveProductImageCommandHandler> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Unit> Handle(RemoveProductImageCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Removing image {ImageId} from product {ProductId}", request.ImageId, request.ProductId);

        var product = await _repository.GetByIdWithDetailsAsync(request.ProductId, cancellationToken)
            ?? throw new ProductNotFoundException(request.ProductId);

        product.RemoveImage(request.ImageId);

        _repository.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Image {ImageId} removed from product {ProductId}", request.ImageId, request.ProductId);

        return Unit.Value;
    }
}
