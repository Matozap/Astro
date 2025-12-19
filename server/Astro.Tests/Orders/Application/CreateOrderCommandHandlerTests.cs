using Astro.Application.Common;
using Astro.Application.Orders.Commands.CreateOrder;
using Astro.Application.Orders.Exceptions;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using Astro.Domain.Shared;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Orders.Application;

public class CreateOrderCommandHandlerTests
{
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateOrderCommandHandler> _logger;
    private readonly CreateOrderCommandHandler _handler;

    public CreateOrderCommandHandlerTests()
    {
        _orderRepository = Substitute.For<IOrderRepository>();
        _productRepository = Substitute.For<IProductRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<CreateOrderCommandHandler>>();
        _handler = new CreateOrderCommandHandler(
            _orderRepository, _productRepository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateOrder()
    {
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, 100);

        _productRepository.GetByIdAsync(productId, Arg.Any<CancellationToken>())
            .Returns(product);

        var command = new CreateOrderCommand(
            CustomerName: "John Doe",
            CustomerEmail: "john@example.com",
            Street: "123 Main St",
            City: "New York",
            State: "NY",
            PostalCode: "10001",
            Country: "USA",
            Notes: "Test order",
            CreatedBy: "test-user",
            OrderDetails: [new CreateOrderDetailDto(productId, 5)]);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.ShouldNotBeNull();
        result.CustomerName.ShouldBe("John Doe");
        result.CustomerEmail.Value.ShouldBe("john@example.com");
        result.Details.Count.ShouldBe(1);

        await _orderRepository.Received(1).AddAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentProduct_ShouldThrowProductNotAvailableException()
    {
        var productId = Guid.NewGuid();
        _productRepository.GetByIdAsync(productId, Arg.Any<CancellationToken>())
            .Returns((Product?)null);

        var command = new CreateOrderCommand(
            CustomerName: "John Doe",
            CustomerEmail: "john@example.com",
            Street: "123 Main St",
            City: "New York",
            State: "NY",
            PostalCode: "10001",
            Country: "USA",
            Notes: null,
            CreatedBy: "test-user",
            OrderDetails: [new CreateOrderDetailDto(productId, 5)]);

        await Should.ThrowAsync<ProductNotAvailableException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithInactiveProduct_ShouldThrowProductNotAvailableException()
    {
        var productId = Guid.NewGuid();
        var product = Product.Create(
            "Test Product", "Description", 50m, "TEST001", 100, 10, false, "creator");
        typeof(Entity).GetProperty("Id")!.SetValue(product, productId);

        _productRepository.GetByIdAsync(productId, Arg.Any<CancellationToken>())
            .Returns(product);

        var command = new CreateOrderCommand(
            CustomerName: "John Doe",
            CustomerEmail: "john@example.com",
            Street: "123 Main St",
            City: "New York",
            State: "NY",
            PostalCode: "10001",
            Country: "USA",
            Notes: null,
            CreatedBy: "test-user",
            OrderDetails: [new CreateOrderDetailDto(productId, 5)]);

        await Should.ThrowAsync<ProductNotAvailableException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithInsufficientStock_ShouldThrowInsufficientStockException()
    {
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, 3); // Only 3 in stock

        _productRepository.GetByIdAsync(productId, Arg.Any<CancellationToken>())
            .Returns(product);

        var command = new CreateOrderCommand(
            CustomerName: "John Doe",
            CustomerEmail: "john@example.com",
            Street: "123 Main St",
            City: "New York",
            State: "NY",
            PostalCode: "10001",
            Country: "USA",
            Notes: null,
            CreatedBy: "test-user",
            OrderDetails: [new CreateOrderDetailDto(productId, 10)]); // Request 10

        await Should.ThrowAsync<InsufficientStockException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_ShouldDecreaseProductStock()
    {
        var productId = Guid.NewGuid();
        var product = CreateTestProduct(productId, 100);
        var initialStock = product.StockQuantity.Value;

        _productRepository.GetByIdAsync(productId, Arg.Any<CancellationToken>())
            .Returns(product);

        var command = new CreateOrderCommand(
            CustomerName: "John Doe",
            CustomerEmail: "john@example.com",
            Street: "123 Main St",
            City: "New York",
            State: "NY",
            PostalCode: "10001",
            Country: "USA",
            Notes: null,
            CreatedBy: "test-user",
            OrderDetails: [new CreateOrderDetailDto(productId, 5)]);

        await _handler.Handle(command, CancellationToken.None);

        product.StockQuantity.Value.ShouldBe(initialStock - 5);
        _productRepository.Received(1).Update(product);
    }

    private static Product CreateTestProduct(Guid id, int stockQuantity)
    {
        var product = Product.Create(
            "Test Product", "Description", 50m, "TEST001", stockQuantity, 10, true, "creator");
        typeof(Entity).GetProperty("Id")!.SetValue(product, id);
        return product;
    }
}
