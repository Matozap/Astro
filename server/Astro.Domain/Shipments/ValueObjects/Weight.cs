using Astro.Domain.Shared;
using Astro.Domain.Shipments.Enums;

namespace Astro.Domain.Shipments.ValueObjects;

/// <summary>
/// Value object representing package weight.
/// </summary>
public sealed record Weight : ValueObject
{
    public decimal Value { get; }
    public WeightUnit Unit { get; }

    public Weight()
    {
        Value = 0;
        Unit = WeightUnit.Pounds;
    }

    private Weight(decimal value, WeightUnit unit)
    {
        Value = value;
        Unit = unit;
        Validate();
    }

    /// <summary>
    /// Creates a Weight from a decimal value and unit.
    /// </summary>
    public static Weight Create(decimal value, WeightUnit unit = WeightUnit.Pounds)
    {
        return new Weight(value, unit);
    }

    /// <summary>
    /// Creates a zero weight.
    /// </summary>
    public static Weight Zero(WeightUnit unit = WeightUnit.Pounds) => new(0, unit);

    /// <summary>
    /// Converts weight to pounds.
    /// </summary>
    public Weight ToPounds()
    {
        if (Unit == WeightUnit.Pounds)
            return this;

        // 1 kg = 2.20462 lbs
        return new Weight(Math.Round(Value * 2.20462m, 2), WeightUnit.Pounds);
    }

    /// <summary>
    /// Converts weight to kilograms.
    /// </summary>
    public Weight ToKilograms()
    {
        if (Unit == WeightUnit.Kilograms)
            return this;

        // 1 lb = 0.453592 kg
        return new Weight(Math.Round(Value * 0.453592m, 2), WeightUnit.Kilograms);
    }

    protected override void Validate()
    {
        if (Value < 0)
            throw new ArgumentException("Weight cannot be negative.", nameof(Value));
    }

    public override string ToString() => Unit switch
    {
        WeightUnit.Pounds => $"{Value:F2} lbs",
        WeightUnit.Kilograms => $"{Value:F2} kg",
        _ => $"{Value:F2}"
    };
}
