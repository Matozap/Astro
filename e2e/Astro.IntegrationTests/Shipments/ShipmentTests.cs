using Astro.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Astro.IntegrationTests.Shipments;

/// <summary>
/// Integration tests for Shipment GraphQL operations.
/// </summary>
public class ShipmentTests(IntegrationTestFixture fixture) : IntegrationTestBase(fixture)
{
    protected override string PayloadsBasePath =>
        Path.Combine(AppContext.BaseDirectory, "Shipments", "Payloads");

    [Fact]
    public async Task GetShipments_ReturnsShipments()
    {
        // First create a shipment to ensure we have data
        await CreateTestShipment();

        var response = await GraphClient.ExecuteAsync("GetShipments");

        var data = response.RootElement.GetProperty("data");
        var shipments = data.GetProperty("shipments").GetProperty("nodes");

        shipments.GetArrayLength().ShouldBeGreaterThan(0);

        var firstShipment = shipments[0];

        // Core properties
        firstShipment.GetProperty("id").GetString().ShouldNotBeNullOrEmpty();
        firstShipment.GetProperty("orderId").GetString().ShouldNotBeNullOrEmpty();
        firstShipment.GetProperty("trackingNumber").GetString().ShouldNotBeNullOrEmpty();
        firstShipment.GetProperty("carrier").GetString().ShouldNotBeNullOrEmpty();

        // Status
        firstShipment.GetProperty("status").GetString().ShouldNotBeNullOrEmpty();

        // Origin address
        var originAddress = firstShipment.GetProperty("originAddress");
        originAddress.GetProperty("street").GetString().ShouldNotBeNullOrEmpty();
        originAddress.GetProperty("city").GetString().ShouldNotBeNullOrEmpty();
        originAddress.GetProperty("state").GetString().ShouldNotBeNullOrEmpty();
        originAddress.GetProperty("postalCode").GetString().ShouldNotBeNullOrEmpty();
        originAddress.GetProperty("country").GetString().ShouldNotBeNullOrEmpty();

        // Destination address
        var destinationAddress = firstShipment.GetProperty("destinationAddress");
        destinationAddress.GetProperty("street").GetString().ShouldNotBeNullOrEmpty();
        destinationAddress.GetProperty("city").GetString().ShouldNotBeNullOrEmpty();
        destinationAddress.GetProperty("state").GetString().ShouldNotBeNullOrEmpty();
        destinationAddress.GetProperty("postalCode").GetString().ShouldNotBeNullOrEmpty();
        destinationAddress.GetProperty("country").GetString().ShouldNotBeNullOrEmpty();

        // Weight
        firstShipment.GetProperty("weight").GetProperty("value").GetDecimal().ShouldBeGreaterThan(0);
        firstShipment.GetProperty("weight").GetProperty("unit").GetString().ShouldNotBeNullOrEmpty();

        // Dimensions
        var dimensions = firstShipment.GetProperty("dimensions");
        dimensions.GetProperty("length").GetDecimal().ShouldBeGreaterThan(0);
        dimensions.GetProperty("width").GetDecimal().ShouldBeGreaterThan(0);
        dimensions.GetProperty("height").GetDecimal().ShouldBeGreaterThan(0);

        // Shipping cost
        firstShipment.GetProperty("shippingCost").GetProperty("amount").GetDecimal().ShouldBeGreaterThanOrEqualTo(0);
        firstShipment.GetProperty("shippingCost").GetProperty("currency").GetString().ShouldBe("USD");

        // Audit fields
        firstShipment.GetProperty("createdAt").GetString().ShouldNotBeNullOrEmpty();
        firstShipment.GetProperty("createdBy").GetString().ShouldNotBeNullOrEmpty();

        // Related collections
        firstShipment.TryGetProperty("trackingDetails", out _).ShouldBeTrue();
        firstShipment.TryGetProperty("items", out _).ShouldBeTrue();
    }

    [Fact]
    public async Task CreateShipment_WithValidInput_ReturnsCreatedShipment()
    {
        // First get an order to use for the shipment
        var orderId = await GetOrCreateTestOrder();

        var variables = new
        {
            input = new
            {
                command = new
                {
                    orderId,
                    carrier = "FedEx",
                    trackingNumber = (string?)null,
                    originStreet = "123 Warehouse St",
                    originCity = "New York",
                    originState = "NY",
                    originPostalCode = "10001",
                    originCountry = "USA",
                    destinationStreet = "456 Customer Ave",
                    destinationCity = "Los Angeles",
                    destinationState = "CA",
                    destinationPostalCode = "90001",
                    destinationCountry = "USA",
                    weight = 5.5m,
                    weightUnit = "POUNDS",
                    length = 12m,
                    width = 8m,
                    height = 6m,
                    dimensionUnit = "INCHES",
                    shippingCost = 15.99m,
                    estimatedDeliveryDate = DateTimeOffset.UtcNow.AddDays(3),
                    createdBy = "integration-test",
                    items = new[]
                    {
                        new
                        {
                            orderDetailId = Guid.NewGuid().ToString(),
                            productId = Guid.NewGuid().ToString(),
                            productName = "Test Product",
                            productSku = "SKU123",
                            quantity = 2
                        }
                    }
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreateShipment", variables);

        var data = response.RootElement.GetProperty("data");
        var createShipment = data.GetProperty("createShipment");
        var shipment = createShipment.GetProperty("shipment");

        shipment.GetProperty("id").GetString().ShouldNotBeNullOrEmpty();
        shipment.GetProperty("orderId").GetString().ShouldBe(orderId);
        shipment.GetProperty("trackingNumber").GetString().ShouldStartWith("TRK");
        shipment.GetProperty("carrier").GetString().ShouldBe("FedEx");
        shipment.GetProperty("status").GetString().ShouldBe("PENDING");
        shipment.GetProperty("createdBy").GetString().ShouldBe("integration-test");

        var originAddress = shipment.GetProperty("originAddress");
        originAddress.GetProperty("street").GetString().ShouldBe("123 Warehouse St");
        originAddress.GetProperty("city").GetString().ShouldBe("New York");
        originAddress.GetProperty("state").GetString().ShouldBe("NY");
        originAddress.GetProperty("postalCode").GetString().ShouldBe("10001");
        originAddress.GetProperty("country").GetString().ShouldBe("USA");

        var destinationAddress = shipment.GetProperty("destinationAddress");
        destinationAddress.GetProperty("street").GetString().ShouldBe("456 Customer Ave");
        destinationAddress.GetProperty("city").GetString().ShouldBe("Los Angeles");
        destinationAddress.GetProperty("state").GetString().ShouldBe("CA");
        destinationAddress.GetProperty("postalCode").GetString().ShouldBe("90001");
        destinationAddress.GetProperty("country").GetString().ShouldBe("USA");

        shipment.GetProperty("weight").GetProperty("value").GetDecimal().ShouldBe(5.5m);
        shipment.GetProperty("weight").GetProperty("unit").GetString().ShouldBe("POUNDS");

        var dimensions = shipment.GetProperty("dimensions");
        dimensions.GetProperty("length").GetDecimal().ShouldBe(12m);
        dimensions.GetProperty("width").GetDecimal().ShouldBe(8m);
        dimensions.GetProperty("height").GetDecimal().ShouldBe(6m);
        dimensions.GetProperty("unit").GetString().ShouldBe("INCHES");

        shipment.GetProperty("shippingCost").GetProperty("amount").GetDecimal().ShouldBe(15.99m);
        shipment.GetProperty("itemCount").GetInt32().ShouldBe(2);

        var trackingDetails = shipment.GetProperty("trackingDetails");
        trackingDetails.GetArrayLength().ShouldBe(1);
        trackingDetails[0].GetProperty("status").GetString().ShouldBe("PENDING");

        var items = shipment.GetProperty("items");
        items.GetArrayLength().ShouldBe(1);
        items[0].GetProperty("productName").GetString().ShouldBe("Test Product");
        items[0].GetProperty("quantity").GetInt32().ShouldBe(2);

        createShipment.GetProperty("errors").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);
    }

    [Fact]
    public async Task CreateShipment_WithInvalidInput_ReturnsValidationError()
    {
        // Invalid: empty carrier, negative weight, no items
        var variables = new
        {
            input = new
            {
                command = new
                {
                    orderId = Guid.Empty.ToString(),
                    carrier = "",
                    trackingNumber = (string?)null,
                    originStreet = "123 Warehouse St",
                    originCity = "New York",
                    originState = "NY",
                    originPostalCode = "10001",
                    originCountry = "USA",
                    destinationStreet = "456 Customer Ave",
                    destinationCity = "Los Angeles",
                    destinationState = "CA",
                    destinationPostalCode = "90001",
                    destinationCountry = "USA",
                    weight = -1m,
                    weightUnit = "POUNDS",
                    length = 12m,
                    width = 8m,
                    height = 6m,
                    dimensionUnit = "INCHES",
                    shippingCost = 15.99m,
                    estimatedDeliveryDate = DateTimeOffset.UtcNow.AddDays(3),
                    createdBy = "integration-test",
                    items = Array.Empty<object>()
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreateShipment", variables);

        var data = response.RootElement.GetProperty("data");
        var createShipment = data.GetProperty("createShipment");

        createShipment.GetProperty("shipment").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);

        var errors = createShipment.GetProperty("errors");
        errors.GetArrayLength().ShouldBeGreaterThan(0);
    }

    [Fact]
    public async Task UpdateShipment_WithValidId_ReturnsUpdatedShipment()
    {
        // First create a shipment
        var shipmentId = await CreateTestShipment();

        var updateVariables = new
        {
            input = new
            {
                command = new
                {
                    id = shipmentId,
                    carrier = "UPS",
                    trackingNumber = "NEWTRACK123456",
                    status = "SHIPPED",
                    statusLocation = "Distribution Center",
                    statusNotes = "Package picked up",
                    modifiedBy = "integration-test"
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("UpdateShipment", updateVariables);

        var data = response.RootElement.GetProperty("data");
        var updateShipment = data.GetProperty("updateShipment");
        var shipment = updateShipment.GetProperty("shipment");

        shipment.GetProperty("id").GetString().ShouldBe(shipmentId);
        shipment.GetProperty("carrier").GetString().ShouldBe("UPS");
        shipment.GetProperty("trackingNumber").GetString().ShouldBe("NEWTRACK123456");
        shipment.GetProperty("status").GetString().ShouldBe("SHIPPED");
        shipment.GetProperty("modifiedBy").GetString().ShouldBe("integration-test");

        updateShipment.GetProperty("errors").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);
    }

    private async Task<string> GetOrCreateTestOrder()
    {
        // First get or create a product
        var sku = $"SHP{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        var productVariables = new
        {
            input = new
            {
                command = new
                {
                    name = "Shipment Test Product",
                    description = "Product for shipment testing",
                    price = 49.99m,
                    sku,
                    stockQuantity = 100,
                    lowStockThreshold = 5,
                    isActive = true,
                    createdBy = "integration-test"
                }
            }
        };

        var productResponse = await GraphClient.ExecuteFromModuleAsync("Products", "CreateProduct", productVariables);
        var productId = productResponse.RootElement
            .GetProperty("data")
            .GetProperty("createProduct")
            .GetProperty("product")
            .GetProperty("id")
            .GetString()!;

        // Now create an order
        var orderVariables = new
        {
            input = new
            {
                command = new
                {
                    customerName = "Shipment Test Customer",
                    customerEmail = "shipment@test.com",
                    street = "789 Shipment Street",
                    city = "Shipment City",
                    state = "SC",
                    postalCode = "11111",
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

        var orderResponse = await GraphClient.ExecuteFromModuleAsync("Orders", "CreateOrder", orderVariables);
        return orderResponse.RootElement
            .GetProperty("data")
            .GetProperty("createOrder")
            .GetProperty("order")
            .GetProperty("id")
            .GetString()!;
    }

    private async Task<string> CreateTestShipment()
    {
        var orderId = await GetOrCreateTestOrder();

        var variables = new
        {
            input = new
            {
                command = new
                {
                    orderId,
                    carrier = "FedEx",
                    trackingNumber = (string?)null,
                    originStreet = "123 Warehouse St",
                    originCity = "New York",
                    originState = "NY",
                    originPostalCode = "10001",
                    originCountry = "USA",
                    destinationStreet = "456 Customer Ave",
                    destinationCity = "Los Angeles",
                    destinationState = "CA",
                    destinationPostalCode = "90001",
                    destinationCountry = "USA",
                    weight = 5.5m,
                    weightUnit = "POUNDS",
                    length = 12m,
                    width = 8m,
                    height = 6m,
                    dimensionUnit = "INCHES",
                    shippingCost = 15.99m,
                    estimatedDeliveryDate = DateTimeOffset.UtcNow.AddDays(3),
                    createdBy = "integration-test",
                    items = new[]
                    {
                        new
                        {
                            orderDetailId = Guid.NewGuid().ToString(),
                            productId = Guid.NewGuid().ToString(),
                            productName = "Test Shipping Product",
                            productSku = "SHPSKU123",
                            quantity = 1
                        }
                    }
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreateShipment", variables);
        return response.RootElement
            .GetProperty("data")
            .GetProperty("createShipment")
            .GetProperty("shipment")
            .GetProperty("id")
            .GetString()!;
    }
}
