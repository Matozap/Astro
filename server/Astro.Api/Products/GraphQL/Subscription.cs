using Astro.Api.Base;
using Astro.Domain.Products.Entities;

namespace Astro.Api.Products.GraphQL;

/// <summary>
/// GraphQL subscriptions for Products module.
/// </summary>
[ExtendObjectType(typeof(Subscription))]
public class ProductSubscription
{
    /// <summary>
    /// Subscription for when a product is created.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnProductCreated))]
    public Product OnProductCreated([EventMessage] Product product) => product;

    /// <summary>
    /// Subscription for when a product is updated.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnProductUpdated))]
    public Product OnProductUpdated([EventMessage] Product product) => product;

    /// <summary>
    /// Subscription for when a product is deleted.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnProductDeleted))]
    public Guid OnProductDeleted([EventMessage] Guid productId) => productId;

    /// <summary>
    /// Subscription for when a product image is added.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnProductImageAdded))]
    public ProductImage OnProductImageAdded([EventMessage] ProductImage productImage) => productImage;

    /// <summary>
    /// Subscription for when a product image is removed.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnProductImageRemoved))]
    public Guid OnProductImageRemoved([EventMessage] Guid productImageId) => productImageId;

    /// <summary>
    /// Subscription for when stock is updated.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnStockUpdated))]
    public Product OnStockUpdated([EventMessage] Product product) => product;
}
