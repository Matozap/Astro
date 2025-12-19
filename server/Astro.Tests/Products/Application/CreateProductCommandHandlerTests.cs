using Astro.Application.Common;
using Astro.Application.Products.Commands.CreateProduct;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Application;

public class CreateProductCommandHandlerTests
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateProductCommandHandler> _logger;
    private readonly CreateProductCommandHandler _handler;

    public CreateProductCommandHandlerTests()
    {
        _repository = Substitute.For<IProductRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<CreateProductCommandHandler>>();
        _handler = new CreateProductCommandHandler(_repository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateProduct()
    {
        var command = new CreateProductCommand(
            Name: "Test Product",
            Description: "A test product",
            Price: 99.99m,
            Sku: "TEST001",
            StockQuantity: 100,
            LowStockThreshold: 10,
            IsActive: true,
            CreatedBy: "test-user",
            Details: null);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.ShouldNotBeNull();
        result.Name.ShouldBe("Test Product");
        result.Sku.Value.ShouldBe("TEST001");
        result.Price.Amount.ShouldBe(99.99m);
        result.StockQuantity.Value.ShouldBe(100);
        result.IsActive.ShouldBeTrue();

        await _repository.Received(1).AddAsync(Arg.Any<Product>(), Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithDetails_ShouldCreateProductWithDetails()
    {
        var details = new List<CreateProductDetailDto>
        {
            new("Color", "Red"),
            new("Size", "Large")
        };

        var command = new CreateProductCommand(
            Name: "Test Product",
            Description: "A test product",
            Price: 99.99m,
            Sku: "TEST002",
            StockQuantity: 50,
            LowStockThreshold: 5,
            IsActive: true,
            CreatedBy: "test-user",
            Details: details);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Details.Count.ShouldBe(2);
        result.Details.ShouldContain(d => d.Key == "Color" && d.Value == "Red");
        result.Details.ShouldContain(d => d.Key == "Size" && d.Value == "Large");
    }

    [Fact]
    public async Task Handle_ShouldRaiseProductCreatedEvent()
    {
        var command = new CreateProductCommand(
            Name: "Test Product",
            Description: null,
            Price: 50m,
            Sku: "TEST003",
            StockQuantity: 10,
            LowStockThreshold: 2,
            IsActive: true,
            CreatedBy: "test-user",
            Details: null);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.DomainEvents.ShouldNotBeEmpty();
        result.DomainEvents.ShouldContain(e => e.GetType().Name == "ProductCreatedEvent");
    }
}
