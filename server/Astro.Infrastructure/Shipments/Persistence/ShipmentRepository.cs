using Astro.Domain.Shipments.Abstractions;
using Astro.Domain.Shipments.Entities;
using Astro.Infrastructure.Common;
using Microsoft.EntityFrameworkCore;

namespace Astro.Infrastructure.Shipments.Persistence;

/// <summary>
/// EF Core implementation of the Shipment repository.
/// </summary>
public sealed class ShipmentRepository : IShipmentRepository
{
    private readonly AstroDbContext _context;

    public ShipmentRepository(AstroDbContext context)
    {
        _context = context;
    }

    public async Task<Shipment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Shipment>()
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Shipment?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Shipment>()
            .Include(s => s.TrackingDetails)
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Shipment?> GetByTrackingNumberAsync(string trackingNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Shipment>()
            .Include(s => s.TrackingDetails)
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.TrackingNumber.Value == trackingNumber, cancellationToken);
    }

    public async Task<List<Shipment>> GetByOrderIdAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Shipment>()
            .Include(s => s.TrackingDetails)
            .Include(s => s.Items)
            .Where(s => s.OrderId == orderId)
            .ToListAsync(cancellationToken);
    }

    public IQueryable<Shipment> GetAll()
    {
        return _context.Set<Shipment>()
            .Include(s => s.TrackingDetails)
            .Include(s => s.Items)
            .AsQueryable();
    }

    public async Task AddAsync(Shipment shipment, CancellationToken cancellationToken = default)
    {
        await _context.Set<Shipment>().AddAsync(shipment, cancellationToken);
    }

    public void Update(Shipment shipment)
    {
        // Only call Update if the entity is not already tracked
        // When loaded via GetByIdAsync/GetByIdWithDetailsAsync, the entity is already tracked
        // and changes are detected automatically
        var entry = _context.Entry(shipment);
        if (entry.State == EntityState.Detached)
        {
            _context.Set<Shipment>().Update(shipment);
        }
    }

    public void Delete(Shipment shipment)
    {
        _context.Set<Shipment>().Remove(shipment);
    }
}
