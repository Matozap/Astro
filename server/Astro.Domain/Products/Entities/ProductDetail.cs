using Astro.Domain.Shared;

namespace Astro.Domain.Products.Entities;

/// <summary>
/// Child entity representing additional product details as key-value pairs.
/// </summary>
public class ProductDetail : Entity
{
    public string Key { get; private set; } = null!;
    public string Value { get; private set; } = null!;

    // EF Core constructor
    private ProductDetail() { }

    internal ProductDetail(string key, string value)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new ArgumentException("Detail key cannot be empty.", nameof(key));

        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Detail value cannot be empty.", nameof(value));

        Key = key;
        Value = value;
    }

    internal void Update(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Detail value cannot be empty.", nameof(value));

        Value = value;
    }
}
