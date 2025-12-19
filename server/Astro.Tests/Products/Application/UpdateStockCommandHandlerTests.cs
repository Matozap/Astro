using Astro.Application.Common;
using Astro.Application.Products.Commands.UpdateStock;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using Astro.Domain.Shared;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Application;

public class UpdateStockCommandHandlerTests
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateStockCommandHandler> _logger;
    private readonly UpdateStockCommandHandler _handler;

    public UpdateStockCommandHandlerTests()
    {
        _repository = Substitute.For<IProductRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<UpdateStockCommandHandler>>();
        _handler = new UpdateStockCommandHandler(_repository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithExistingProduct_ShouldUpdateStock()
    {
        var productId = Guid.NewGuid();
        var existingProduct = Product.Create(
            "Test Product", "Description", 50m, "TEST001", 100, 10, true, "creator");

        typeof(Entity).GetProperty("Id")!.SetValue(existingProduct, productId);

        _repository.GetByIdAsync(productId, Arg.Any<CancellationToken>())
            .Returns(existingProduct);

        var command = new UpdateStockCommand(
            ProductId: productId,
            StockQuantity: 50,
            ModifiedBy: "modifier");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.StockQuantity.Value.ShouldBe(50);

        _repository.Received(1).Update(Arg.Any<Product>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentProduct_ShouldThrowProductNotFoundException()
    {
        var productId = Guid.NewGuid();
        _repository.GetByIdAsync(productId, Arg.Any<CancellationToken>())
            .Returns((Product?)null);

        var command = new UpdateStockCommand(
            ProductId: productId,
            StockQuantity: 50,
            ModifiedBy: "modifier");

        await Should.ThrowAsync<ProductNotFoundException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithLowStock_ShouldRaiseDomainEvent()
    {
        var productId = Guid.NewGuid();
        var existingProduct = Product.Create(
            "Test Product", "Description", 50m, "TEST001", 100, 10, true, "creator");

        typeof(Entity).GetProperty("Id")!.SetValue(existingProduct, productId);
        existingProduct.ClearDomainEvents();

        _repository.GetByIdAsync(productId, Arg.Any<CancellationToken>())
            .Returns(existingProduct);

        var command = new UpdateStockCommand(
            ProductId: productId,
            StockQuantity: 5, // Below threshold of 10
            ModifiedBy: "modifier");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsLowStock().ShouldBeTrue();
        result.DomainEvents.ShouldNotBeEmpty();
    }
}
