using Astro.Api.Base;
using Astro.Api.Base.Models;
using Astro.Application.Products.Commands.AddProductImage;
using Astro.Application.Products.Commands.CreateProduct;
using Astro.Application.Products.Commands.DeleteProduct;
using Astro.Application.Products.Commands.RemoveProductImage;
using Astro.Application.Products.Commands.UpdateProduct;
using Astro.Application.Products.Commands.UpdateStock;
using Astro.Application.Products.Exceptions;
using Astro.Domain.Products.Entities;
using FluentValidation;
using HotChocolate.Subscriptions;
using MediatR;

namespace Astro.Api.Products.GraphQL;

/// <summary>
/// GraphQL mutations for Products module.
/// </summary>
[ExtendObjectType(typeof(Mutation))]
public class ProductMutation
{
    /// <summary>
    /// Creates a new product.
    /// </summary>
    [Error<ValidationException>]
    public async Task<Product> CreateProduct(
        CreateProductCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var product = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(ProductSubscription.OnProductCreated), product, cancellationToken);
        return product;
    }

    /// <summary>
    /// Updates an existing product.
    /// </summary>
    [Error<ValidationException>]
    [Error<ProductNotFoundException>]
    public async Task<Product> UpdateProduct(
        UpdateProductCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var product = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(ProductSubscription.OnProductUpdated), product, cancellationToken);
        return product;
    }

    /// <summary>
    /// Deletes a product.
    /// </summary>
    [Error<ProductNotFoundException>]
    [Error<ProductInUseException>]
    public async Task<DeleteResponse> DeleteProduct(
        DeleteProductCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(ProductSubscription.OnProductDeleted), command.Id, cancellationToken);
        return new DeleteResponse(command.Id);
    }

    /// <summary>
    /// Updates the stock quantity for a product.
    /// </summary>
    [Error<ValidationException>]
    [Error<ProductNotFoundException>]
    public async Task<Product> UpdateStock(
        UpdateStockCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var product = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(ProductSubscription.OnStockUpdated), product, cancellationToken);
        return product;
    }

    /// <summary>
    /// Adds an image to a product.
    /// </summary>
    [Error<ValidationException>]
    [Error<ProductNotFoundException>]
    public async Task<ProductImage> AddProductImage(
        AddProductImageCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var productImage = await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(ProductSubscription.OnProductImageAdded), productImage, cancellationToken);
        return productImage;
    }

    /// <summary>
    /// Removes an image from a product.
    /// </summary>
    [Error<ProductNotFoundException>]
    public async Task<DeleteResponse> RemoveProductImage(
        RemoveProductImageCommand command,
        [Service] IMediator mediator,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        await mediator.Send(command, cancellationToken);
        await eventSender.SendAsync(nameof(ProductSubscription.OnProductImageRemoved), command.ImageId, cancellationToken);
        return new DeleteResponse(command.ImageId);
    }
}
