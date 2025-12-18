using Astro.Domain.Products.Enums;
using Astro.Domain.Products.Events;
using Astro.Domain.Products.ValueObjects;
using Astro.Domain.Shared;
using Astro.Domain.Shared.ValueObjects;

namespace Astro.Domain.Products.Entities;

/// <summary>
/// Product aggregate root with business invariants.
/// </summary>
public class Product : Entity, IAggregateRoot
{
    private readonly List<IDomainEvent> _domainEvents = [];
    private readonly List<ProductDetail> _details = [];
    private readonly List<ProductImage> _images = [];

    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public Money Price { get; private set; } = null!;
    public Sku Sku { get; private set; } = null!;
    public StockQuantity StockQuantity { get; private set; } = null!;
    public int LowStockThreshold { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? UpdatedAt { get; private set; }
    public string CreatedBy { get; private set; } = null!;
    public string? ModifiedBy { get; private set; }

    public IReadOnlyCollection<ProductDetail> Details => _details.AsReadOnly();
    public IReadOnlyCollection<ProductImage> Images => _images.AsReadOnly();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    // EF Core constructor
    private Product() { }

    private Product(
        string name,
        string? description,
        Money price,
        Sku sku,
        StockQuantity stockQuantity,
        int lowStockThreshold,
        bool isActive,
        string createdBy)
    {
        ValidateName(name);
        ValidateLowStockThreshold(lowStockThreshold);

        Name = name;
        Description = description;
        Price = price;
        Sku = sku;
        StockQuantity = stockQuantity;
        LowStockThreshold = lowStockThreshold;
        IsActive = isActive;
        CreatedAt = DateTimeOffset.UtcNow;
        CreatedBy = createdBy;

        AddDomainEvent(new ProductCreatedEvent(Id, Name, Sku.Value, Price.Amount));
    }

    /// <summary>
    /// Creates a new Product aggregate.
    /// </summary>
    public static Product Create(
        string name,
        string? description,
        decimal price,
        string sku,
        int stockQuantity,
        int lowStockThreshold,
        bool isActive,
        string createdBy)
    {
        return new Product(
            name,
            description,
            Money.FromDecimal(price),
            Sku.Create(sku),
            StockQuantity.Create(stockQuantity),
            lowStockThreshold,
            isActive,
            createdBy);
    }

    /// <summary>
    /// Updates the product information.
    /// </summary>
    public void Update(
        string? name,
        string? description,
        decimal? price,
        string? sku,
        int? lowStockThreshold,
        bool? isActive,
        string modifiedBy)
    {
        if (name is not null)
        {
            ValidateName(name);
            Name = name;
        }

        if (description is not null)
            Description = description;

        if (price.HasValue)
        {
            var oldPrice = Price;
            Price = Money.FromDecimal(price.Value);
            if (oldPrice != Price)
            {
                AddDomainEvent(new ProductUpdatedEvent(Id, Name, Sku.Value, Price.Amount));
            }
        }

        if (sku is not null)
            Sku = Sku.Create(sku);

        if (lowStockThreshold.HasValue)
        {
            ValidateLowStockThreshold(lowStockThreshold.Value);
            LowStockThreshold = lowStockThreshold.Value;
        }

        if (isActive.HasValue)
            IsActive = isActive.Value;

        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;

        AddDomainEvent(new ProductUpdatedEvent(Id, Name, Sku.Value, Price.Amount));
    }

    /// <summary>
    /// Updates the stock quantity.
    /// </summary>
    public void UpdateStock(int quantity, string modifiedBy)
    {
        var oldQuantity = StockQuantity.Value;
        StockQuantity = StockQuantity.Create(quantity);
        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;

        AddDomainEvent(new ProductStockChangedEvent(Id, oldQuantity, quantity));
    }

    /// <summary>
    /// Decreases the stock quantity by the specified amount.
    /// </summary>
    public void DecreaseStock(int amount, string modifiedBy)
    {
        var oldQuantity = StockQuantity.Value;
        StockQuantity = StockQuantity.Subtract(amount);
        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;

        AddDomainEvent(new ProductStockChangedEvent(Id, oldQuantity, StockQuantity.Value));
    }

    /// <summary>
    /// Increases the stock quantity by the specified amount.
    /// </summary>
    public void IncreaseStock(int amount, string modifiedBy)
    {
        var oldQuantity = StockQuantity.Value;
        StockQuantity = StockQuantity.Add(amount);
        UpdatedAt = DateTimeOffset.UtcNow;
        ModifiedBy = modifiedBy;

        AddDomainEvent(new ProductStockChangedEvent(Id, oldQuantity, StockQuantity.Value));
    }

    /// <summary>
    /// Adds a detail to the product.
    /// </summary>
    public void AddDetail(string key, string value)
    {
        var existing = _details.Find(d => d.Key == key);
        if (existing is not null)
        {
            existing.Update(value);
        }
        else
        {
            _details.Add(new ProductDetail(key, value));
        }
    }

    /// <summary>
    /// Removes a detail from the product.
    /// </summary>
    public void RemoveDetail(string key)
    {
        var detail = _details.Find(d => d.Key == key);
        if (detail is not null)
        {
            _details.Remove(detail);
        }
    }

    /// <summary>
    /// Clears all details from the product.
    /// </summary>
    public void ClearDetails()
    {
        _details.Clear();
    }

    /// <summary>
    /// Checks if the product is low on stock.
    /// </summary>
    public bool IsLowStock()
    {
        return StockQuantity.IsAtOrBelowThreshold(LowStockThreshold);
    }

    /// <summary>
    /// Adds an image to the product.
    /// </summary>
    public ProductImage AddImage(string fileName, string url, StorageMode storageMode, bool isPrimary = false)
    {
        if (isPrimary)
        {
            foreach (var img in _images)
            {
                img.RemovePrimary();
            }
        }

        var image = new ProductImage(fileName, url, storageMode, isPrimary);
        _images.Add(image);
        return image;
    }

    /// <summary>
    /// Removes an image from the product.
    /// </summary>
    public void RemoveImage(Guid imageId)
    {
        var image = _images.Find(i => i.Id == imageId);
        if (image is not null)
        {
            _images.Remove(image);
        }
    }

    /// <summary>
    /// Sets an image as the primary image.
    /// </summary>
    public void SetPrimaryImage(Guid imageId)
    {
        foreach (var img in _images)
        {
            if (img.Id == imageId)
                img.SetAsPrimary();
            else
                img.RemovePrimary();
        }
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    private void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name cannot be empty.", nameof(name));

        if (name.Length > 200)
            throw new ArgumentException("Product name cannot exceed 200 characters.", nameof(name));
    }

    private static void ValidateLowStockThreshold(int threshold)
    {
        if (threshold < 0)
            throw new ArgumentException("Low stock threshold cannot be negative.", nameof(threshold));
    }
}
