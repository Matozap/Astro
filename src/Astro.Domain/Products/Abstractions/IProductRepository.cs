using Astro.Domain.Products.Entities;

namespace Astro.Domain.Products.Abstractions;

/// <summary>
/// Repository interface for Product aggregate root.
/// Repositories MUST operate on aggregate roots only per DDD principles.
/// </summary>
public interface IProductRepository
{
    /// <summary>
    /// Gets a product by its identifier.
    /// </summary>
    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a product by its identifier including all details and images.
    /// </summary>
    Task<Product?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a product by its SKU.
    /// </summary>
    Task<Product?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all products as a queryable for projections.
    /// </summary>
    IQueryable<Product> GetAll();

    /// <summary>
    /// Adds a new product to the repository.
    /// </summary>
    Task AddAsync(Product product, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing product.
    /// </summary>
    void Update(Product product);

    /// <summary>
    /// Removes a product from the repository.
    /// </summary>
    void Delete(Product product);
}
