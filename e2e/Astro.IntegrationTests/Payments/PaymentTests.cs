using Astro.IntegrationTests.Infrastructure;
using Shouldly;
using Xunit;

namespace Astro.IntegrationTests.Payments;

/// <summary>
/// Integration tests for Payment GraphQL operations.
/// </summary>
public class PaymentTests(IntegrationTestFixture fixture) : IntegrationTestBase(fixture)
{
    protected override string PayloadsBasePath =>
        Path.Combine(AppContext.BaseDirectory, "Payments", "Payloads");

    [Fact]
    public async Task CreatePayment_WithValidOrderId_ReturnsCreatedPayment()
    {
        // First create an order
        var orderId = await CreateTestOrder();

        var variables = new
        {
            input = new
            {
                command = new
                {
                    orderId
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreatePayment", variables);

        var data = response.RootElement.GetProperty("data");
        var createPayment = data.GetProperty("createPayment");
        var payment = createPayment.GetProperty("payment");

        payment.GetProperty("id").GetString().ShouldNotBeNullOrEmpty();
        payment.GetProperty("orderId").GetString().ShouldBe(orderId);
        payment.GetProperty("status").GetString().ShouldBe("PENDING");
        payment.GetProperty("createdAt").GetString().ShouldNotBeNullOrEmpty();
        payment.GetProperty("updatedAt").GetString().ShouldNotBeNullOrEmpty();

        createPayment.GetProperty("errors").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);
    }

    [Fact]
    public async Task CreatePayment_WithNonExistentOrder_ReturnsError()
    {
        var nonExistentOrderId = Guid.NewGuid().ToString();

        var variables = new
        {
            input = new
            {
                command = new
                {
                    orderId = nonExistentOrderId
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreatePayment", variables);

        var data = response.RootElement.GetProperty("data");
        var createPayment = data.GetProperty("createPayment");

        createPayment.GetProperty("payment").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);

        var errors = createPayment.GetProperty("errors");
        errors.GetArrayLength().ShouldBeGreaterThan(0);

        var error = errors[0];
        error.GetProperty("__typename").GetString().ShouldBe("OrderNotFoundError");
        error.GetProperty("message").GetString()!.ShouldContain("not found");
    }

    [Fact]
    public async Task UpdatePaymentStatus_FromPendingToSuccessful_ReturnsUpdatedPayment()
    {
        // First create a payment
        var paymentId = await CreateTestPayment();

        var variables = new
        {
            input = new
            {
                command = new
                {
                    paymentId,
                    newStatus = "SUCCESSFUL"
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("UpdatePaymentStatus", variables);

        var data = response.RootElement.GetProperty("data");
        var updatePaymentStatus = data.GetProperty("updatePaymentStatus");
        var payment = updatePaymentStatus.GetProperty("payment");

        payment.GetProperty("id").GetString().ShouldBe(paymentId);
        payment.GetProperty("status").GetString().ShouldBe("SUCCESSFUL");

        updatePaymentStatus.GetProperty("errors").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);
    }

    [Fact]
    public async Task UpdatePaymentStatus_FromPendingToFailed_ReturnsUpdatedPayment()
    {
        // First create a payment
        var paymentId = await CreateTestPayment();

        var variables = new
        {
            input = new
            {
                command = new
                {
                    paymentId,
                    newStatus = "FAILED"
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("UpdatePaymentStatus", variables);

        var data = response.RootElement.GetProperty("data");
        var updatePaymentStatus = data.GetProperty("updatePaymentStatus");
        var payment = updatePaymentStatus.GetProperty("payment");

        payment.GetProperty("id").GetString().ShouldBe(paymentId);
        payment.GetProperty("status").GetString().ShouldBe("FAILED");

        updatePaymentStatus.GetProperty("errors").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);
    }

    [Fact]
    public async Task UpdatePaymentStatus_WithInvalidTransition_ReturnsError()
    {
        // First create a payment and set it to Successful (terminal state)
        var paymentId = await CreateTestPayment();

        // Update to Successful first
        var successVariables = new
        {
            input = new
            {
                command = new
                {
                    paymentId,
                    newStatus = "SUCCESSFUL"
                }
            }
        };
        await GraphClient.ExecuteAsync("UpdatePaymentStatus", successVariables);

        // Now try to change from Successful to Failed (invalid transition)
        var failVariables = new
        {
            input = new
            {
                command = new
                {
                    paymentId,
                    newStatus = "FAILED"
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("UpdatePaymentStatus", failVariables);

        // When InvalidOperationException is thrown, it should be in the response errors
        // Check if there are errors at the root level or in the mutation result
        if (response.RootElement.TryGetProperty("errors", out var rootErrors) && rootErrors.GetArrayLength() > 0)
        {
            // Error at root level (unhandled exception)
            rootErrors.GetArrayLength().ShouldBeGreaterThan(0);
            var error = rootErrors[0];
            error.GetProperty("message").GetString()!.ShouldContain("error");
            error.GetProperty("extensions").GetProperty("message").GetString()!.ShouldContain("cannot transition payment");
        }
        else
        {
            // Error in mutation result (handled via mutation conventions)
            var data = response.RootElement.GetProperty("data");
            var updatePaymentStatus = data.GetProperty("updatePaymentStatus");

            updatePaymentStatus.GetProperty("payment").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);

            var errors = updatePaymentStatus.GetProperty("errors");
            errors.GetArrayLength().ShouldBeGreaterThan(0);
        }
    }

    [Fact]
    public async Task UpdatePaymentStatus_WithNonExistentPayment_ReturnsError()
    {
        var nonExistentPaymentId = Guid.NewGuid().ToString();

        var variables = new
        {
            input = new
            {
                command = new
                {
                    paymentId = nonExistentPaymentId,
                    newStatus = "SUCCESSFUL"
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("UpdatePaymentStatus", variables);

        var data = response.RootElement.GetProperty("data");
        var updatePaymentStatus = data.GetProperty("updatePaymentStatus");

        updatePaymentStatus.GetProperty("payment").ValueKind.ShouldBe(System.Text.Json.JsonValueKind.Null);

        var errors = updatePaymentStatus.GetProperty("errors");
        errors.GetArrayLength().ShouldBeGreaterThan(0);

        var error = errors[0];
        error.GetProperty("__typename").GetString().ShouldBe("PaymentNotFoundError");
        error.GetProperty("message").GetString()!.ShouldContain("not found");
    }

    private async Task<string> GetOrCreateTestProduct()
    {
        var sku = $"PAY{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        var variables = new
        {
            input = new
            {
                command = new
                {
                    name = "Payment Test Product",
                    description = "Product for payment testing",
                    price = 49.99m,
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
                    customerName = "Payment Test Customer",
                    customerEmail = "payment.test@test.com",
                    street = "789 Payment Street",
                    city = "Payment City",
                    state = "PC",
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

        var response = await GraphClient.ExecuteFromModuleAsync("Orders", "CreateOrder", variables);
        return response.RootElement
            .GetProperty("data")
            .GetProperty("createOrder")
            .GetProperty("order")
            .GetProperty("id")
            .GetString()!;
    }

    private async Task<string> CreateTestPayment()
    {
        var orderId = await CreateTestOrder();

        var variables = new
        {
            input = new
            {
                command = new
                {
                    orderId
                }
            }
        };

        var response = await GraphClient.ExecuteAsync("CreatePayment", variables);
        return response.RootElement
            .GetProperty("data")
            .GetProperty("createPayment")
            .GetProperty("payment")
            .GetProperty("id")
            .GetString()!;
    }
}
