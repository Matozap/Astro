using System.Text.RegularExpressions;
using Astro.Domain.Shared;

namespace Astro.Domain.Products.ValueObjects;

/// <summary>
/// Value object representing a Stock Keeping Unit (SKU).
/// SKU must be 3-20 uppercase alphanumeric characters.
/// </summary>
public sealed record Sku : ValueObject
{
    private static readonly Regex SkuPattern = new("^[A-Z0-9]{3,20}$", RegexOptions.Compiled);

    public string Value { get; }

    private Sku(string value)
    {
        Value = value;
        Validate();
    }

    /// <summary>
    /// Creates a SKU from a string value.
    /// </summary>
    /// <param name="value">The SKU value (3-20 alphanumeric characters)</param>
    public static Sku Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("SKU cannot be empty.", nameof(value));

        return new Sku(value.ToUpperInvariant());
    }

    protected override void Validate()
    {
        if (!SkuPattern.IsMatch(Value))
            throw new ArgumentException(
                "SKU must be 3-20 uppercase alphanumeric characters.",
                nameof(Value));
    }

    public override string ToString() => Value;

    public static implicit operator string(Sku sku) => sku.Value;
}
