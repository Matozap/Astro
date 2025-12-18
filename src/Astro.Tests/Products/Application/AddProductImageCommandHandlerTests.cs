using Astro.Application.Common;
using Astro.Application.Products.Commands.AddProductImage;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using Astro.Domain.Products.Enums;
using Astro.Domain.Shared;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Application;

public class AddProductImageCommandHandlerTests
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AddProductImageCommandHandler> _logger;
    private readonly AddProductImageCommandHandler _handler;

    public AddProductImageCommandHandlerTests()
    {
        _repository = Substitute.For<IProductRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<AddProductImageCommandHandler>>();
        _handler = new AddProductImageCommandHandler(_repository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithExistingProduct_ShouldAddImage()
    {
        var productId = Guid.NewGuid();
        var existingProduct = Product.Create(
            "Test Product", "Description", 50m, "TEST001", 100, 10, true, "creator");

        typeof(Entity).GetProperty("Id")!.SetValue(existingProduct, productId);

        _repository.GetByIdWithDetailsAsync(productId, Arg.Any<CancellationToken>())
            .Returns(existingProduct);

        var command = new AddProductImageCommand(
            ProductId: productId,
            FileName: "test-image.jpg",
            Url: "https://example.com/images/test-image.jpg",
            StorageMode: StorageMode.Azure,
            IsPrimary: true,
            CreatedBy: "creator");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.ShouldNotBeNull();
        result.FileName.ShouldBe("test-image.jpg");
        result.Url.ShouldBe("https://example.com/images/test-image.jpg");
        result.StorageMode.ShouldBe(StorageMode.Azure);
        result.IsPrimary.ShouldBeTrue();

        _repository.Received(1).Update(Arg.Any<Product>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentProduct_ShouldThrowProductNotFoundException()
    {
        var productId = Guid.NewGuid();
        _repository.GetByIdWithDetailsAsync(productId, Arg.Any<CancellationToken>())
            .Returns((Product?)null);

        var command = new AddProductImageCommand(
            ProductId: productId,
            FileName: "test-image.jpg",
            Url: "https://example.com/images/test-image.jpg",
            StorageMode: StorageMode.Azure,
            IsPrimary: true,
            CreatedBy: "creator");

        await Should.ThrowAsync<ProductNotFoundException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithSecondPrimaryImage_ShouldRemovePrimaryFromFirst()
    {
        var productId = Guid.NewGuid();
        var existingProduct = Product.Create(
            "Test Product", "Description", 50m, "TEST001", 100, 10, true, "creator");

        typeof(Entity).GetProperty("Id")!.SetValue(existingProduct, productId);
        existingProduct.AddImage("first-image.jpg", "https://example.com/first.jpg", StorageMode.Azure, true);

        _repository.GetByIdWithDetailsAsync(productId, Arg.Any<CancellationToken>())
            .Returns(existingProduct);

        var command = new AddProductImageCommand(
            ProductId: productId,
            FileName: "second-image.jpg",
            Url: "https://example.com/second.jpg",
            StorageMode: StorageMode.Azure,
            IsPrimary: true,
            CreatedBy: "creator");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsPrimary.ShouldBeTrue();
        existingProduct.Images.Count(i => i.IsPrimary).ShouldBe(1);
        existingProduct.Images.Single(i => i.IsPrimary).FileName.ShouldBe("second-image.jpg");
    }
}
