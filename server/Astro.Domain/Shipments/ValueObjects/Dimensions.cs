using Astro.Domain.Shared;
using Astro.Domain.Shipments.Enums;

namespace Astro.Domain.Shipments.ValueObjects;

/// <summary>
/// Value object representing package dimensions.
/// </summary>
public sealed record Dimensions : ValueObject
{
    public decimal Length { get; }
    public decimal Width { get; }
    public decimal Height { get; }
    public DimensionUnit Unit { get; }

    public Dimensions()
    {
        Length = 0;
        Width = 0;
        Height = 0;
        Unit = DimensionUnit.Inches;
    }

    private Dimensions(decimal length, decimal width, decimal height, DimensionUnit unit)
    {
        Length = length;
        Width = width;
        Height = height;
        Unit = unit;
        Validate();
    }

    /// <summary>
    /// Creates Dimensions from length, width, height values.
    /// </summary>
    public static Dimensions Create(decimal length, decimal width, decimal height, DimensionUnit unit = DimensionUnit.Inches)
    {
        return new Dimensions(length, width, height, unit);
    }

    /// <summary>
    /// Calculates the volume in cubic inches or cubic centimeters.
    /// </summary>
    public decimal Volume => Length * Width * Height;

    /// <summary>
    /// Converts dimensions to inches.
    /// </summary>
    public Dimensions ToInches()
    {
        if (Unit == DimensionUnit.Inches)
            return this;

        // 1 cm = 0.393701 in
        return new Dimensions(
            Math.Round(Length * 0.393701m, 2),
            Math.Round(Width * 0.393701m, 2),
            Math.Round(Height * 0.393701m, 2),
            DimensionUnit.Inches);
    }

    /// <summary>
    /// Converts dimensions to centimeters.
    /// </summary>
    public Dimensions ToCentimeters()
    {
        if (Unit == DimensionUnit.Centimeters)
            return this;

        // 1 in = 2.54 cm
        return new Dimensions(
            Math.Round(Length * 2.54m, 2),
            Math.Round(Width * 2.54m, 2),
            Math.Round(Height * 2.54m, 2),
            DimensionUnit.Centimeters);
    }

    protected override void Validate()
    {
        if (Length < 0)
            throw new ArgumentException("Length cannot be negative.", nameof(Length));

        if (Width < 0)
            throw new ArgumentException("Width cannot be negative.", nameof(Width));

        if (Height < 0)
            throw new ArgumentException("Height cannot be negative.", nameof(Height));
    }

    public override string ToString()
    {
        var unitStr = Unit == DimensionUnit.Inches ? "in" : "cm";
        return $"{Length} x {Width} x {Height} {unitStr}";
    }
}
