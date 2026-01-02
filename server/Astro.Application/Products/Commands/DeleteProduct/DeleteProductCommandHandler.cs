using Astro.Application.Common;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Products.Abstractions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Products.Commands.DeleteProduct;

/// <summary>
/// Handler for DeleteProductCommand.
/// </summary>
public sealed class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Unit>
{
    private readonly IProductRepository _repository;
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteProductCommandHandler> _logger;

    public DeleteProductCommandHandler(
        IProductRepository repository,
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeleteProductCommandHandler> logger)
    {
        _repository = repository;
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Unit> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Deleting product {ProductId}", request.Id);

        var product = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new ProductNotFoundException(request.Id);

        // Check if product is used in any orders
        var isUsedInOrders = await _orderRepository.HasProductOrdersAsync(request.Id, cancellationToken);
        if (isUsedInOrders)
        {
            _logger.LogWarning("Cannot delete product {ProductId} because it has been used in orders", request.Id);
            throw new ProductInUseException(request.Id);
        }

        _repository.Delete(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Product {ProductId} deleted successfully", request.Id);

        return Unit.Value;
    }
}
