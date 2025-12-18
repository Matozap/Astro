using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using Astro.Infrastructure.Common;
using Microsoft.EntityFrameworkCore;

namespace Astro.Infrastructure.Orders.Persistence;

/// <summary>
/// EF Core implementation of the Order repository.
/// </summary>
public sealed class OrderRepository : IOrderRepository
{
    private readonly AstroDbContext _context;

    public OrderRepository(AstroDbContext context)
    {
        _context = context;
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Order>()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<Order?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Order>()
            .Include(o => o.Details)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Order>()
            .FirstOrDefaultAsync(o => o.OrderNumber.Value == orderNumber, cancellationToken);
    }

    public IQueryable<Order> GetAll()
    {
        return _context.Set<Order>()
            .Include(o => o.Details)
            .AsQueryable();
    }

    public async Task AddAsync(Order order, CancellationToken cancellationToken = default)
    {
        await _context.Set<Order>().AddAsync(order, cancellationToken);
    }

    public void Update(Order order)
    {
        _context.Set<Order>().Update(order);
    }

    public void Delete(Order order)
    {
        _context.Set<Order>().Remove(order);
    }
}
