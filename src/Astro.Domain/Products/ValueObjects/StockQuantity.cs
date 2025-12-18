using Astro.Domain.Shared;

namespace Astro.Domain.Products.ValueObjects;

/// <summary>
/// Value object representing product stock quantity.
/// Quantity must be non-negative.
/// </summary>
public sealed record StockQuantity : ValueObject
{
    public int Value { get; }

    private StockQuantity(int value)
    {
        Value = value;
        Validate();
    }

    /// <summary>
    /// Creates a StockQuantity from an integer value.
    /// </summary>
    /// <param name="value">The quantity (must be non-negative)</param>
    public static StockQuantity Create(int value)
    {
        return new StockQuantity(value);
    }

    /// <summary>
    /// Creates a zero stock quantity.
    /// </summary>
    public static StockQuantity Zero() => new(0);

    protected override void Validate()
    {
        if (Value < 0)
            throw new ArgumentException("Stock quantity cannot be negative.", nameof(Value));
    }

    /// <summary>
    /// Adds the specified amount to the current quantity.
    /// </summary>
    public StockQuantity Add(int amount)
    {
        return new StockQuantity(Value + amount);
    }

    /// <summary>
    /// Subtracts the specified amount from the current quantity.
    /// </summary>
    /// <exception cref="InvalidOperationException">Thrown when result would be negative</exception>
    public StockQuantity Subtract(int amount)
    {
        var newValue = Value - amount;
        if (newValue < 0)
            throw new InvalidOperationException(
                $"Cannot subtract {amount} from stock quantity {Value}. Result would be negative.");

        return new StockQuantity(newValue);
    }

    /// <summary>
    /// Checks if the current quantity is at or below the specified threshold.
    /// </summary>
    public bool IsAtOrBelowThreshold(int threshold)
    {
        return Value <= threshold;
    }

    public override string ToString() => Value.ToString();

    public static implicit operator int(StockQuantity quantity) => quantity.Value;
}
