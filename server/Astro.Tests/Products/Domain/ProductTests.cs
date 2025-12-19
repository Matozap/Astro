using Astro.Domain.Products.Entities;
using Astro.Domain.Products.Enums;
using Astro.Domain.Products.Events;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Domain;

public class ProductTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateProduct()
    {
        var product = Product.Create(
            name: "Test Product",
            description: "A test product",
            price: 99.99m,
            sku: "TEST001",
            stockQuantity: 100,
            lowStockThreshold: 10,
            isActive: true,
            createdBy: "test-user");

        product.Name.ShouldBe("Test Product");
        product.Description.ShouldBe("A test product");
        product.Price.Amount.ShouldBe(99.99m);
        product.Sku.Value.ShouldBe("TEST001");
        product.StockQuantity.Value.ShouldBe(100);
        product.LowStockThreshold.ShouldBe(10);
        product.IsActive.ShouldBeTrue();
        product.CreatedBy.ShouldBe("test-user");
    }

    [Fact]
    public void Create_ShouldRaiseProductCreatedEvent()
    {
        var product = Product.Create(
            name: "Test Product",
            description: null,
            price: 99.99m,
            sku: "TEST001",
            stockQuantity: 100,
            lowStockThreshold: 10,
            isActive: true,
            createdBy: "test-user");

        product.DomainEvents.ShouldContain(e => e is ProductCreatedEvent);
        var createdEvent = product.DomainEvents.OfType<ProductCreatedEvent>().First();
        createdEvent.ProductId.ShouldBe(product.Id);
        createdEvent.Name.ShouldBe("Test Product");
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        Should.Throw<ArgumentException>(() =>
            Product.Create(
                name: "",
                description: null,
                price: 99.99m,
                sku: "TEST001",
                stockQuantity: 100,
                lowStockThreshold: 10,
                isActive: true,
                createdBy: "test-user"));
    }

    [Fact]
    public void Create_WithNameExceeding200Chars_ShouldThrowArgumentException()
    {
        var longName = new string('a', 201);

        Should.Throw<ArgumentException>(() =>
            Product.Create(
                name: longName,
                description: null,
                price: 99.99m,
                sku: "TEST001",
                stockQuantity: 100,
                lowStockThreshold: 10,
                isActive: true,
                createdBy: "test-user"));
    }

    [Fact]
    public void Create_WithNegativePrice_ShouldThrowArgumentException()
    {
        Should.Throw<ArgumentException>(() =>
            Product.Create(
                name: "Test Product",
                description: null,
                price: -10m,
                sku: "TEST001",
                stockQuantity: 100,
                lowStockThreshold: 10,
                isActive: true,
                createdBy: "test-user"));
    }

    [Fact]
    public void Create_WithNegativeStockQuantity_ShouldThrowArgumentException()
    {
        Should.Throw<ArgumentException>(() =>
            Product.Create(
                name: "Test Product",
                description: null,
                price: 99.99m,
                sku: "TEST001",
                stockQuantity: -1,
                lowStockThreshold: 10,
                isActive: true,
                createdBy: "test-user"));
    }

    [Fact]
    public void UpdateStock_ShouldRaiseProductStockChangedEvent()
    {
        var product = CreateTestProduct();
        product.ClearDomainEvents();

        product.UpdateStock(50, "modifier");

        product.StockQuantity.Value.ShouldBe(50);
        product.DomainEvents.ShouldContain(e => e is ProductStockChangedEvent);
        var stockEvent = product.DomainEvents.OfType<ProductStockChangedEvent>().First();
        stockEvent.OldQuantity.ShouldBe(100);
        stockEvent.NewQuantity.ShouldBe(50);
    }

    [Fact]
    public void DecreaseStock_WithValidAmount_ShouldDecreaseQuantity()
    {
        var product = CreateTestProduct();
        product.ClearDomainEvents();

        product.DecreaseStock(30, "modifier");

        product.StockQuantity.Value.ShouldBe(70);
    }

    [Fact]
    public void DecreaseStock_WithAmountExceedingStock_ShouldThrowInvalidOperationException()
    {
        var product = CreateTestProduct();

        Should.Throw<InvalidOperationException>(() =>
            product.DecreaseStock(150, "modifier"));
    }

    [Fact]
    public void AddDetail_ShouldAddDetailToProduct()
    {
        var product = CreateTestProduct();

        product.AddDetail("Color", "Blue");

        product.Details.Count.ShouldBe(1);
        product.Details.First().Key.ShouldBe("Color");
        product.Details.First().Value.ShouldBe("Blue");
    }

    [Fact]
    public void AddDetail_WithExistingKey_ShouldUpdateValue()
    {
        var product = CreateTestProduct();
        product.AddDetail("Color", "Blue");

        product.AddDetail("Color", "Red");

        product.Details.Count.ShouldBe(1);
        product.Details.First().Value.ShouldBe("Red");
    }

    [Fact]
    public void RemoveDetail_ShouldRemoveDetailFromProduct()
    {
        var product = CreateTestProduct();
        product.AddDetail("Color", "Blue");

        product.RemoveDetail("Color");

        product.Details.Count.ShouldBe(0);
    }

    [Fact]
    public void AddImage_ShouldAddImageToProduct()
    {
        var product = CreateTestProduct();

        var image = product.AddImage("test.jpg", "https://example.com/test.jpg",
            StorageMode.Azure, isPrimary: true);

        product.Images.Count.ShouldBe(1);
        image.FileName.ShouldBe("test.jpg");
        image.IsPrimary.ShouldBeTrue();
    }

    [Fact]
    public void AddImage_WithPrimary_ShouldRemovePrimaryFromOtherImages()
    {
        var product = CreateTestProduct();
        product.AddImage("first.jpg", "https://example.com/first.jpg",
            StorageMode.Azure, isPrimary: true);

        product.AddImage("second.jpg", "https://example.com/second.jpg",
            StorageMode.Azure, isPrimary: true);

        product.Images.Count.ShouldBe(2);
        product.Images.Count(i => i.IsPrimary).ShouldBe(1);
        product.Images.Single(i => i.IsPrimary).FileName.ShouldBe("second.jpg");
    }

    private static Product CreateTestProduct()
    {
        return Product.Create(
            name: "Test Product",
            description: "A test product",
            price: 99.99m,
            sku: "TEST001",
            stockQuantity: 100,
            lowStockThreshold: 10,
            isActive: true,
            createdBy: "test-user");
    }
}
