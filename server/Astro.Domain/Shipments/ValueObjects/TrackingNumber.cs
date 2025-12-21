using Astro.Domain.Shared;

namespace Astro.Domain.Shipments.ValueObjects;

/// <summary>
/// Value object representing a carrier tracking number.
/// </summary>
public sealed record TrackingNumber : ValueObject
{
    public string Value { get; }

    public TrackingNumber()
    {
        Value = string.Empty;
    }

    private TrackingNumber(string value)
    {
        Value = value;
        Validate();
    }

    /// <summary>
    /// Creates a TrackingNumber from a string value.
    /// </summary>
    public static TrackingNumber Create(string value)
    {
        return new TrackingNumber(value?.Trim().ToUpperInvariant() ?? string.Empty);
    }

    /// <summary>
    /// Generates a new random tracking number.
    /// </summary>
    public static TrackingNumber Generate()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var random = Random.Shared.Next(1000, 9999);
        return new TrackingNumber($"TRK{timestamp}{random}");
    }

    protected override void Validate()
    {
        if (string.IsNullOrWhiteSpace(Value))
            throw new ArgumentException("Tracking number is required.", nameof(Value));

        if (Value.Length < 5)
            throw new ArgumentException("Tracking number must be at least 5 characters.", nameof(Value));

        if (Value.Length > 50)
            throw new ArgumentException("Tracking number cannot exceed 50 characters.", nameof(Value));
    }

    public override string ToString() => Value;
}
