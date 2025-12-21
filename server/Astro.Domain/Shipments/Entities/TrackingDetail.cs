using Astro.Domain.Shared;
using Astro.Domain.Shipments.Enums;

namespace Astro.Domain.Shipments.Entities;

/// <summary>
/// Child entity representing a tracking event in a shipment's history.
/// </summary>
public class TrackingDetail : Entity
{
    public ShipmentStatus Status { get; private set; }
    public string? Location { get; private set; }
    public string? Notes { get; private set; }
    public DateTimeOffset Timestamp { get; private set; }

    // EF Core constructor
    private TrackingDetail() { }

    internal TrackingDetail(
        ShipmentStatus status,
        string? location,
        string? notes)
    {
        Status = status;
        Location = location?.Trim();
        Notes = notes?.Trim();
        Timestamp = DateTimeOffset.UtcNow;

        Validate();
    }

    internal TrackingDetail(
        ShipmentStatus status,
        string? location,
        string? notes,
        DateTimeOffset timestamp)
    {
        Status = status;
        Location = location?.Trim();
        Notes = notes?.Trim();
        Timestamp = timestamp;

        Validate();
    }

    private void Validate()
    {
        if (Location?.Length > 200)
            throw new ArgumentException("Location cannot exceed 200 characters.", nameof(Location));

        if (Notes?.Length > 500)
            throw new ArgumentException("Notes cannot exceed 500 characters.", nameof(Notes));
    }
}
