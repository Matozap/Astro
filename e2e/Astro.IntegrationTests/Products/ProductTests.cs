using Astro.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Astro.IntegrationTests.Products;

/// <summary>
/// Integration tests for Product GraphQL operations.
/// </summary>
public class ProductTests(IntegrationTestFixture fixture) : IntegrationTestBase(fixture)
{
    protected override string PayloadsBasePath =>
        Path.Combine(AppContext.BaseDirectory, "Products", "Payloads");

    [Fact]
    public async Task GetProducts_ReturnsProducts()
    {
        var response = await GraphClient.ExecuteAsync("GetProducts");

        var data = response.RootElement.GetProperty("data");
        var products = data.GetProperty("products");

        products.GetArrayLength().ShouldBeGreaterThan(0);

        var firstProduct = products[0];

        // Core properties
        firstProduct.GetProperty("id").GetString().ShouldNotBeNullOrEmpty();
        firstProduct.GetProperty("name").GetString().ShouldNotBeNullOrEmpty();
        firstProduct.GetProperty("sku").GetString().ShouldNotBeNullOrEmpty();

        // Price
        firstProduct.GetProperty("price").GetProperty("amount").GetDecimal().ShouldBeGreaterThan(0);
        firstProduct.GetProperty("price").GetProperty("currency").GetString().ShouldBe("USD");

        // Stock properties
        firstProduct.GetProperty("stockQuantity").GetInt32().ShouldBeGreaterThanOrEqualTo(0);
        firstProduct.GetProperty("lowStockThreshold").GetInt32().ShouldBeGreaterThanOrEqualTo(0);
        firstProduct.TryGetProperty("isLowStock", out _).ShouldBeTrue();

        // Status
        firstProduct.TryGetProperty("isActive", out _).ShouldBeTrue();

        // Audit fields
        firstProduct.GetProperty("createdAt").GetString().ShouldNotBeNullOrEmpty();
        firstProduct.GetProperty("createdBy").GetString().ShouldNotBeNullOrEmpty();

        // Related collections (verify they exist, may be empty)
        firstProduct.TryGetProperty("details", out _).ShouldBeTrue();
        firstProduct.TryGetProperty("images", out _).ShouldBeTrue();
    }

    [Fact]
    public async Task CreateProduct_ReturnsCreatedProduct()
    {
        var sku = $"SWT{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        var variables = new
        {
            input = new
            {
                command = new
                {
                    name = "Smart Watch Test",
                    description = "Smart Watch for integration testing",
                    price = 289.99m,
                    sku,
                    stockQuantity = 24,
                    lowStockThreshold = 4,
                    isActive = true,
                    createdBy = "integration-test"
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreateProduct", variables);

        var data = response.RootElement.GetProperty("data");
        var createProduct = data.GetProperty("createProduct");
        var product = createProduct.GetProperty("product");

        product.GetProperty("id").GetString().ShouldNotBeNullOrEmpty();
        product.GetProperty("name").GetString().ShouldBe("Smart Watch Test");
        product.GetProperty("description").GetString().ShouldBe("Smart Watch for integration testing");
        product.GetProperty("sku").GetString().ShouldBe(sku);
        product.GetProperty("stockQuantity").GetInt32().ShouldBe(24);
        product.GetProperty("lowStockThreshold").GetInt32().ShouldBe(4);
        product.GetProperty("isActive").GetBoolean().ShouldBeTrue();
        product.GetProperty("createdBy").GetString().ShouldBe("integration-test");
        product.GetProperty("price").GetProperty("amount").GetDecimal().ShouldBe(289.99m);
        product.GetProperty("price").GetProperty("currency").GetString().ShouldBe("USD");

        createProduct.GetProperty("errors").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);
    }

    [Fact]
    public async Task CreateProduct_WithInvalidInput_ReturnsValidationError()
    {
        // Invalid: empty name, invalid SKU format
        var variables = new
        {
            input = new
            {
                command = new
                {
                    name = "",
                    description = "Test",
                    price = 10.00m,
                    sku = "invalid-sku", // Invalid: lowercase and has dash
                    stockQuantity = 5,
                    lowStockThreshold = 2,
                    isActive = true,
                    createdBy = "integration-test"
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreateProduct", variables);

        var data = response.RootElement.GetProperty("data");
        var createProduct = data.GetProperty("createProduct");

        createProduct.GetProperty("product").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);

        var errors = createProduct.GetProperty("errors");
        errors.GetArrayLength().ShouldBeGreaterThan(0);
    }

    [Fact]
    public async Task UpdateProduct_WithValidInput_ReturnsUpdatedProduct()
    {
        // First create a product
        var sku = $"UPD{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        var createVariables = new
        {
            input = new
            {
                command = new
                {
                    name = "Product To Update",
                    description = "Original description",
                    price = 100.00m,
                    sku,
                    stockQuantity = 10,
                    lowStockThreshold = 2,
                    isActive = true,
                    createdBy = "integration-test"
                }
            }
        };
        var createResponse = await GraphClient.ExecuteAsync("CreateProduct", createVariables);
        var productId = createResponse.RootElement
            .GetProperty("data")
            .GetProperty("createProduct")
            .GetProperty("product")
            .GetProperty("id")
            .GetString();

        // Update the product
        var updateVariables = new
        {
            input = new
            {
                command = new
                {
                    id = productId,
                    name = "Updated Product Name",
                    description = "Updated description",
                    price = 150.00m,
                    sku,
                    stockQuantity = 15,
                    lowStockThreshold = 3,
                    isActive = false,
                    modifiedBy = "integration-test-update"
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("UpdateProduct", updateVariables);

        var data = response.RootElement.GetProperty("data");
        var updateProduct = data.GetProperty("updateProduct");
        var product = updateProduct.GetProperty("product");

        product.GetProperty("id").GetString().ShouldBe(productId);
        product.GetProperty("name").GetString().ShouldBe("Updated Product Name");
        product.GetProperty("description").GetString().ShouldBe("Updated description");
        product.GetProperty("price").GetProperty("amount").GetDecimal().ShouldBe(150.00m);
        product.GetProperty("stockQuantity").GetInt32().ShouldBe(15);
        product.GetProperty("lowStockThreshold").GetInt32().ShouldBe(3);
        product.GetProperty("isActive").GetBoolean().ShouldBeFalse();
        product.GetProperty("modifiedBy").GetString().ShouldBe("integration-test-update");

        updateProduct.GetProperty("errors").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);
    }

    [Fact]
    public async Task UpdateProduct_WithNonExistentId_ReturnsError()
    {
        var nonExistentId = Guid.NewGuid().ToString();
        var variables = new
        {
            input = new
            {
                command = new
                {
                    id = nonExistentId,
                    name = "Won't Matter",
                    description = "Test",
                    price = 10.00m,
                    sku = "TESTSKU123",
                    stockQuantity = 5,
                    lowStockThreshold = 2,
                    isActive = true,
                    modifiedBy = "integration-test"
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("UpdateProduct", variables);

        var data = response.RootElement.GetProperty("data");
        var updateProduct = data.GetProperty("updateProduct");

        updateProduct.GetProperty("product").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);

        var errors = updateProduct.GetProperty("errors");
        errors.GetArrayLength().ShouldBeGreaterThan(0);
    }

    [Fact]
    public async Task DeleteProduct_WithValidId_ReturnsSuccess()
    {
        // First create a product
        var sku = $"DEL{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        var createVariables = new
        {
            input = new
            {
                command = new
                {
                    name = "Product To Delete",
                    description = "Will be deleted",
                    price = 50.00m,
                    sku,
                    stockQuantity = 5,
                    lowStockThreshold = 1,
                    isActive = true,
                    createdBy = "integration-test"
                }
            }
        };
        var createResponse = await GraphClient.ExecuteAsync("CreateProduct", createVariables);
        var productId = createResponse.RootElement
            .GetProperty("data")
            .GetProperty("createProduct")
            .GetProperty("product")
            .GetProperty("id")
            .GetString();

        // Delete the product
        var deleteVariables = new
        {
            input = new
            {
                command = new
                {
                    id = productId
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("DeleteProduct", deleteVariables);

        var data = response.RootElement.GetProperty("data");
        var deleteProduct = data.GetProperty("deleteProduct");
        var deleteResponse = deleteProduct.GetProperty("deleteResponse");

        deleteResponse.GetProperty("objectDeleted").GetString().ShouldBe(productId);

        deleteProduct.GetProperty("errors").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);
    }
}
