using Astro.Domain.Payments.Abstractions;
using Astro.Domain.Payments.Entities;
using Astro.Infrastructure.Common;
using Microsoft.EntityFrameworkCore;

namespace Astro.Infrastructure.Payments.Persistence;

/// <summary>
/// EF Core implementation of the Payment repository
/// </summary>
public sealed class PaymentRepository : IPaymentRepository
{
    private readonly AstroDbContext _context;

    public PaymentRepository(AstroDbContext context)
    {
        _context = context;
    }

    public async Task<Payment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Payment>()
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Payment>> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Payment>()
            .Include(p => p.Order)
            .Where(p => p.OrderId == orderId)
            .OrderBy(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public IQueryable<Payment> GetAll()
    {
        return _context.Set<Payment>()
            .Include(p => p.Order)
            .AsQueryable();
    }

    public async Task AddAsync(Payment payment, CancellationToken cancellationToken = default)
    {
        await _context.Set<Payment>().AddAsync(payment, cancellationToken);
    }

    public void Update(Payment payment)
    {
        _context.Set<Payment>().Update(payment);
    }

    public void Delete(Payment payment)
    {
        _context.Set<Payment>().Remove(payment);
    }
}
