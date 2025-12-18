using Astro.Domain.Products.Enums;
using Astro.Domain.Shared;

namespace Astro.Domain.Products.Entities;

/// <summary>
/// Child entity representing a product image.
/// </summary>
public class ProductImage : Entity
{
    public string FileName { get; private set; } = null!;
    public string Url { get; private set; } = null!;
    public StorageMode StorageMode { get; private set; }
    public bool IsPrimary { get; private set; }

    // EF Core constructor
    private ProductImage() { }

    internal ProductImage(string fileName, string url, StorageMode storageMode, bool isPrimary = false)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name cannot be empty.", nameof(fileName));

        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("URL cannot be empty.", nameof(url));

        FileName = fileName;
        Url = url;
        StorageMode = storageMode;
        IsPrimary = isPrimary;
    }

    internal void SetAsPrimary()
    {
        IsPrimary = true;
    }

    internal void RemovePrimary()
    {
        IsPrimary = false;
    }
}
