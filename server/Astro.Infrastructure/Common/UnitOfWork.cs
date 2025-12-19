using Astro.Application.Common;

namespace Astro.Infrastructure.Common;

/// <summary>
/// Implementation of Unit of Work pattern using EF Core.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly AstroDbContext _context;

    public UnitOfWork(AstroDbContext context)
    {
        _context = context;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
