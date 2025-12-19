using Astro.Application.Common;
using Astro.Application.Products.Commands.RemoveProductImage;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using Astro.Domain.Products.Enums;
using Astro.Domain.Shared;
using MediatR;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Application;

public class RemoveProductImageCommandHandlerTests
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RemoveProductImageCommandHandler> _logger;
    private readonly RemoveProductImageCommandHandler _handler;

    public RemoveProductImageCommandHandlerTests()
    {
        _repository = Substitute.For<IProductRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<RemoveProductImageCommandHandler>>();
        _handler = new RemoveProductImageCommandHandler(_repository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithExistingImage_ShouldRemoveImage()
    {
        var productId = Guid.NewGuid();
        var existingProduct = Product.Create(
            "Test Product", "Description", 50m, "TEST001", 100, 10, true, "creator");

        typeof(Entity).GetProperty("Id")!.SetValue(existingProduct, productId);
        var image = existingProduct.AddImage("test-image.jpg", "https://example.com/test.jpg", StorageMode.Azure, true);

        _repository.GetByIdWithDetailsAsync(productId, Arg.Any<CancellationToken>())
            .Returns(existingProduct);

        var command = new RemoveProductImageCommand(
            ProductId: productId,
            ImageId: image.Id);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.ShouldBe(Unit.Value);
        existingProduct.Images.ShouldBeEmpty();

        _repository.Received(1).Update(Arg.Any<Product>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentProduct_ShouldThrowProductNotFoundException()
    {
        var productId = Guid.NewGuid();
        var imageId = Guid.NewGuid();

        _repository.GetByIdWithDetailsAsync(productId, Arg.Any<CancellationToken>())
            .Returns((Product?)null);

        var command = new RemoveProductImageCommand(
            ProductId: productId,
            ImageId: imageId);

        await Should.ThrowAsync<ProductNotFoundException>(
            () => _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithNonExistentImage_ShouldStillSucceed()
    {
        var productId = Guid.NewGuid();
        var nonExistentImageId = Guid.NewGuid();
        var existingProduct = Product.Create(
            "Test Product", "Description", 50m, "TEST001", 100, 10, true, "creator");

        typeof(Entity).GetProperty("Id")!.SetValue(existingProduct, productId);

        _repository.GetByIdWithDetailsAsync(productId, Arg.Any<CancellationToken>())
            .Returns(existingProduct);

        var command = new RemoveProductImageCommand(
            ProductId: productId,
            ImageId: nonExistentImageId);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.ShouldBe(Unit.Value);
    }
}
