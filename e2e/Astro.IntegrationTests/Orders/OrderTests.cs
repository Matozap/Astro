using Astro.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Astro.IntegrationTests.Orders;

/// <summary>
/// Integration tests for Order GraphQL operations.
/// </summary>
public class OrderTests(IntegrationTestFixture fixture) : IntegrationTestBase(fixture)
{
    protected override string PayloadsBasePath =>
        Path.Combine(AppContext.BaseDirectory, "Orders", "Payloads");

    [Fact]
    public async Task GetOrders_ReturnsOrders()
    {
        // First create an order to ensure we have data
        await CreateTestOrder();

        var response = await GraphClient.ExecuteAsync("GetOrders");

        var data = response.RootElement.GetProperty("data");
        var orders = data.GetProperty("orders").GetProperty("nodes");

        orders.GetArrayLength().ShouldBeGreaterThan(0);

        var firstOrder = orders[0];

        // Core properties
        firstOrder.GetProperty("id").GetString().ShouldNotBeNullOrEmpty();
        firstOrder.GetProperty("orderNumber").GetString().ShouldNotBeNullOrEmpty();
        firstOrder.GetProperty("customerName").GetString().ShouldNotBeNullOrEmpty();
        firstOrder.GetProperty("customerEmail").GetString().ShouldNotBeNullOrEmpty();

        // Status
        firstOrder.GetProperty("status").GetString().ShouldNotBeNullOrEmpty();

        // Shipping address
        var shippingAddress = firstOrder.GetProperty("shippingAddress");
        shippingAddress.GetProperty("street").GetString().ShouldNotBeNullOrEmpty();
        shippingAddress.GetProperty("city").GetString().ShouldNotBeNullOrEmpty();
        shippingAddress.GetProperty("state").GetString().ShouldNotBeNullOrEmpty();
        shippingAddress.GetProperty("postalCode").GetString().ShouldNotBeNullOrEmpty();
        shippingAddress.GetProperty("country").GetString().ShouldNotBeNullOrEmpty();

        // Total amount
        firstOrder.GetProperty("totalAmount").GetProperty("amount").GetDecimal().ShouldBeGreaterThanOrEqualTo(0);
        firstOrder.GetProperty("totalAmount").GetProperty("currency").GetString().ShouldBe("USD");

        // Audit fields
        firstOrder.GetProperty("createdAt").GetString().ShouldNotBeNullOrEmpty();
        firstOrder.GetProperty("createdBy").GetString().ShouldNotBeNullOrEmpty();

        // Related collections
        firstOrder.TryGetProperty("details", out _).ShouldBeTrue();
    }

    [Fact]
    public async Task CreateOrder_WithValidInput_ReturnsCreatedOrder()
    {
        // First get a product to use in the order
        var productId = await GetOrCreateTestProduct();

        var variables = new
        {
            input = new
            {
                command = new
                {
                    customerName = "John Integration",
                    customerEmail = "john.integration@test.com",
                    street = "123 Test Street",
                    city = "Test City",
                    state = "TS",
                    postalCode = "12345",
                    country = "USA",
                    notes = "Integration test order",
                    createdBy = "integration-test",
                    orderDetails = new[]
                    {
                        new { productId, quantity = 2 }
                    }
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreateOrder", variables);

        var data = response.RootElement.GetProperty("data");
        var createOrder = data.GetProperty("createOrder");
        var order = createOrder.GetProperty("order");

        order.GetProperty("id").GetString().ShouldNotBeNullOrEmpty();
        order.GetProperty("orderNumber").GetString().ShouldNotBeNullOrEmpty();
        order.GetProperty("customerName").GetString().ShouldBe("John Integration");
        order.GetProperty("customerEmail").GetString().ShouldBe("john.integration@test.com");
        order.GetProperty("status").GetString().ShouldBe("PENDING");
        order.GetProperty("notes").GetString().ShouldBe("Integration test order");
        order.GetProperty("createdBy").GetString().ShouldBe("integration-test");
        order.GetProperty("itemCount").GetInt32().ShouldBe(2);

        var shippingAddress = order.GetProperty("shippingAddress");
        shippingAddress.GetProperty("street").GetString().ShouldBe("123 Test Street");
        shippingAddress.GetProperty("city").GetString().ShouldBe("Test City");
        shippingAddress.GetProperty("state").GetString().ShouldBe("TS");
        shippingAddress.GetProperty("postalCode").GetString().ShouldBe("12345");
        shippingAddress.GetProperty("country").GetString().ShouldBe("USA");

        order.GetProperty("totalAmount").GetProperty("amount").GetDecimal().ShouldBeGreaterThan(0);

        var details = order.GetProperty("details");
        details.GetArrayLength().ShouldBe(1);
        details[0].GetProperty("productId").GetString().ShouldBe(productId);
        details[0].GetProperty("quantity").GetInt32().ShouldBe(2);

        createOrder.GetProperty("errors").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);
    }

    [Fact]
    public async Task CreateOrder_WithInvalidInput_ReturnsValidationError()
    {
        // Invalid: empty customer name, invalid email, no order details
        var variables = new
        {
            input = new
            {
                command = new
                {
                    customerName = "",
                    customerEmail = "invalid-email",
                    street = "123 Test Street",
                    city = "Test City",
                    state = "TS",
                    postalCode = "12345",
                    country = "USA",
                    notes = (string?)null,
                    createdBy = "integration-test",
                    orderDetails = Array.Empty<object>()
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreateOrder", variables);

        var data = response.RootElement.GetProperty("data");
        var createOrder = data.GetProperty("createOrder");

        createOrder.GetProperty("order").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);

        var errors = createOrder.GetProperty("errors");
        errors.GetArrayLength().ShouldBeGreaterThan(0);
    }

    [Fact]
    public async Task CancelOrder_WithValidId_ReturnsCancelledOrder()
    {
        // First create an order
        var orderId = await CreateTestOrder();

        var cancelVariables = new
        {
            input = new
            {
                command = new
                {
                    orderId,
                    reason = "Integration test cancellation",
                    cancelledBy = "integration-test"
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CancelOrder", cancelVariables);

        var data = response.RootElement.GetProperty("data");
        var cancelOrder = data.GetProperty("cancelOrder");
        var order = cancelOrder.GetProperty("order");

        order.GetProperty("id").GetString().ShouldBe(orderId);
        order.GetProperty("status").GetString().ShouldBe("CANCELLED");
        order.GetProperty("modifiedBy").GetString().ShouldBe("integration-test");

        cancelOrder.GetProperty("errors").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);
    }

    private async Task<string> GetOrCreateTestProduct()
    {
        var sku = $"ORD{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        var variables = new
        {
            input = new
            {
                command = new
                {
                    name = "Order Test Product",
                    description = "Product for order testing",
                    price = 99.99m,
                    sku,
                    stockQuantity = 100,
                    lowStockThreshold = 5,
                    isActive = true,
                    createdBy = "integration-test"
                }
            }
        };

        var response = await GraphClient.ExecuteFromModuleAsync("Products", "CreateProduct", variables);
        return response.RootElement
            .GetProperty("data")
            .GetProperty("createProduct")
            .GetProperty("product")
            .GetProperty("id")
            .GetString()!;
    }

    private async Task<string> CreateTestOrder()
    {
        var productId = await GetOrCreateTestProduct();

        var variables = new
        {
            input = new
            {
                command = new
                {
                    customerName = "Test Customer",
                    customerEmail = "test@test.com",
                    street = "456 Order Street",
                    city = "Order City",
                    state = "OC",
                    postalCode = "67890",
                    country = "USA",
                    notes = (string?)null,
                    createdBy = "integration-test",
                    orderDetails = new[]
                    {
                        new { productId, quantity = 1 }
                    }
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreateOrder", variables);
        return response.RootElement
            .GetProperty("data")
            .GetProperty("createOrder")
            .GetProperty("order")
            .GetProperty("id")
            .GetString()!;
    }
}
