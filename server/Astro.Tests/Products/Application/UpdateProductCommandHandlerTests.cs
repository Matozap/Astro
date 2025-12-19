using Astro.Application.Common;
using Astro.Application.Products.Commands.UpdateProduct;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using Astro.Domain.Shared;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Application;

public class UpdateProductCommandHandlerTests
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateProductCommandHandler> _logger;
    private readonly UpdateProductCommandHandler _handler;

    public UpdateProductCommandHandlerTests()
    {
        _repository = Substitute.For<IProductRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<UpdateProductCommandHandler>>();
        _handler = new UpdateProductCommandHandler(_repository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithExistingProduct_ShouldUpdateProduct()
    {
        var productId = Guid.NewGuid();
        var existingProduct = Product.Create(
            "Original Product", "Original Description", 50m, "ORIG001", 100, 10, true, "creator");

        // Use reflection to set the Id since it's auto-generated
        typeof(Entity).GetProperty("Id")!.SetValue(existingProduct, productId);

        _repository.GetByIdWithDetailsAsync(productId, Arg.Any<CancellationToken>())
            .Returns(existingProduct);

        var command = new UpdateProductCommand(
            Id: productId,
            Name: "Updated Product",
            Description: "Updated Description",
            Price: 99.99m,
            Sku: "UPD001",
            StockQuantity: 50,
            LowStockThreshold: 5,
            IsActive: false,
            ModifiedBy: "modifier",
            Details: null);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Name.ShouldBe("Updated Product");
        result.Sku.Value.ShouldBe("UPD001");
        result.Price.Amount.ShouldBe(99.99m);
        result.IsActive.ShouldBeFalse();

        _repository.Received(1).Update(Arg.Any<Product>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentProduct_ShouldThrowProductNotFoundException()
    {
        var productId = Guid.NewGuid();
        _repository.GetByIdWithDetailsAsync(productId, Arg.Any<CancellationToken>())
            .Returns((Product?)null);

        var command = new UpdateProductCommand(
            Id: productId,
            Name: "Updated Product",
            Description: null,
            Price: 99.99m,
            Sku: "UPD001",
            StockQuantity: 50,
            LowStockThreshold: 5,
            IsActive: true,
            ModifiedBy: "modifier",
            Details: null);

        await Should.ThrowAsync<ProductNotFoundException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithDetails_ShouldUpdateProductDetails()
    {
        var productId = Guid.NewGuid();
        var existingProduct = Product.Create(
            "Original Product", "Description", 50m, "ORIG001", 100, 10, true, "creator");

        typeof(Entity).GetProperty("Id")!.SetValue(existingProduct, productId);
        existingProduct.AddDetail("OldKey", "OldValue");

        _repository.GetByIdWithDetailsAsync(productId, Arg.Any<CancellationToken>())
            .Returns(existingProduct);

        var newDetails = new List<UpdateProductDetailDto>
        {
            new(null, "NewKey1", "NewValue1"),
            new(null, "NewKey2", "NewValue2")
        };

        var command = new UpdateProductCommand(
            Id: productId,
            Name: "Updated Product",
            Description: null,
            Price: 50m,
            Sku: "ORIG001",
            StockQuantity: 100,
            LowStockThreshold: 10,
            IsActive: true,
            ModifiedBy: "modifier",
            Details: newDetails);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Details.Count.ShouldBe(2);
        result.Details.ShouldContain(d => d.Key == "NewKey1");
        result.Details.ShouldContain(d => d.Key == "NewKey2");
        result.Details.ShouldNotContain(d => d.Key == "OldKey");
    }
}
