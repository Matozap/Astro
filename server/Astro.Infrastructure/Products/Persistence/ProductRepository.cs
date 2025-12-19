using Astro.Domain.Products.Abstractions;
using Astro.Domain.Products.Entities;
using Astro.Infrastructure.Common;
using Microsoft.EntityFrameworkCore;

namespace Astro.Infrastructure.Products.Persistence;

/// <summary>
/// EF Core implementation of the Product repository.
/// </summary>
public sealed class ProductRepository : IProductRepository
{
    private readonly AstroDbContext _context;

    public ProductRepository(AstroDbContext context)
    {
        _context = context;
    }

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Product>()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Product?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Product>()
            .Include(p => p.Details)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Product?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Product>()
            .FirstOrDefaultAsync(p => p.Sku.Value == sku, cancellationToken);
    }

    public IQueryable<Product> GetAll()
    {
        return _context.Set<Product>()
            .Include(p => p.Details)
            .Include(p => p.Images)
            .AsSplitQuery()
            .AsQueryable();
    }

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _context.Set<Product>().AddAsync(product, cancellationToken);
    }

    public void Update(Product product)
    {
        _context.Set<Product>().Update(product);
    }

    public void Delete(Product product)
    {
        _context.Set<Product>().Remove(product);
    }
}
