using Astro.Application.Common;
using Astro.Application.Orders.Exceptions;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using Astro.Domain.Products.Abstractions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Orders.Commands.CreateOrder;

/// <summary>
/// Handler for CreateOrderCommand.
/// </summary>
public sealed class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Order>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateOrderCommandHandler> _logger;

    public CreateOrderCommandHandler(
        IOrderRepository orderRepository,
        IProductRepository productRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Order> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating order for customer {CustomerName}", request.CustomerName);

        // Validate products and check stock
        var productIds = request.OrderDetails.Select(d => d.ProductId).ToList();
        var products = await GetAndValidateProducts(productIds, request.OrderDetails, cancellationToken);

        // Create the order
        var order = Order.Create(
            customerName: request.CustomerName,
            customerEmail: request.CustomerEmail,
            street: request.Street,
            city: request.City,
            state: request.State,
            postalCode: request.PostalCode,
            country: request.Country,
            notes: request.Notes,
            createdBy: request.CreatedBy);

        // Add order details
        foreach (var detailDto in request.OrderDetails)
        {
            var product = products[detailDto.ProductId];
            order.AddDetail(
                productId: detailDto.ProductId,
                productName: product.Name,
                productSku: product.Sku.Value,
                quantity: detailDto.Quantity,
                unitPrice: product.Price.Amount);

            // Decrease stock
            product.DecreaseStock(detailDto.Quantity, request.CreatedBy);
            _productRepository.Update(product);
        }

        await _orderRepository.AddAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Order {OrderNumber} created with ID {OrderId}", order.OrderNumber.Value, order.Id);

        return order;
    }

    private async Task<Dictionary<Guid, Domain.Products.Entities.Product>> GetAndValidateProducts(
        List<Guid> productIds,
        List<CreateOrderDetailDto> orderDetails,
        CancellationToken cancellationToken)
    {
        var products = new Dictionary<Guid, Domain.Products.Entities.Product>();

        foreach (var productId in productIds)
        {
            var product = await _productRepository.GetByIdAsync(productId, cancellationToken);

            if (product is null)
            {
                throw new ProductNotAvailableException(productId, "Product not found");
            }

            if (!product.IsActive)
            {
                throw new ProductNotAvailableException(productId, "Product is not active");
            }

            var requestedQuantity = orderDetails
                .Where(d => d.ProductId == productId)
                .Sum(d => d.Quantity);

            if (product.StockQuantity.Value < requestedQuantity)
            {
                throw new InsufficientStockException(productId, requestedQuantity, product.StockQuantity.Value);
            }

            products[productId] = product;
        }

        return products;
    }
}
