using Astro.Application.Common;
using Astro.Application.Products.Commands.DeleteProduct;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using Astro.Domain.Shared;
using MediatR;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Application;

public class DeleteProductCommandHandlerTests
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly DeleteProductCommandHandler _handler;

    public DeleteProductCommandHandlerTests()
    {
        _repository = Substitute.For<IProductRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        var logger = Substitute.For<ILogger<DeleteProductCommandHandler>>();
        var orderRepository = Substitute.For<IOrderRepository>();
        _handler = new DeleteProductCommandHandler(_repository, orderRepository, _unitOfWork, logger);
    }

    [Fact]
    public async Task Handle_WithExistingProduct_ShouldDeleteProduct()
    {
        var productId = Guid.NewGuid();
        var existingProduct = Product.Create(
            "Test Product", "Description", 50m, "TEST001", 100, 10, true, "creator");

        typeof(Entity).GetProperty("Id")!.SetValue(existingProduct, productId);

        _repository.GetByIdAsync(productId, Arg.Any<CancellationToken>())
            .Returns(existingProduct);

        var command = new DeleteProductCommand(productId);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.ShouldBe(Unit.Value);

        _repository.Received(1).Delete(Arg.Any<Product>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentProduct_ShouldThrowProductNotFoundException()
    {
        var productId = Guid.NewGuid();
        _repository.GetByIdAsync(productId, Arg.Any<CancellationToken>())
            .Returns((Product?)null);

        var command = new DeleteProductCommand(productId);

        await Should.ThrowAsync<ProductNotFoundException>(
            () => _handler.Handle(command, CancellationToken.None));
    }
}
