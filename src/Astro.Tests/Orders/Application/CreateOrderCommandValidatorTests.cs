using Astro.Application.Orders.Commands.CreateOrder;
using FluentValidation.TestHelper;
using Xunit;

namespace Astro.Tests.Orders.Application;

public class CreateOrderCommandValidatorTests
{
    private readonly CreateOrderCommandValidator _validator;

    public CreateOrderCommandValidatorTests()
    {
        _validator = new CreateOrderCommandValidator();
    }

    [Fact]
    public void Validate_WithValidCommand_ShouldNotHaveErrors()
    {
        var command = new CreateOrderCommand(
            CustomerName: "John Doe",
            CustomerEmail: "john@example.com",
            Street: "123 Main St",
            City: "New York",
            State: "NY",
            PostalCode: "10001",
            Country: "USA",
            Notes: "Test order",
            CreatedBy: "test-user",
            OrderDetails: [new CreateOrderDetailDto(Guid.NewGuid(), 5)]);

        var result = _validator.TestValidate(command);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WithEmptyCustomerName_ShouldHaveError(string? customerName)
    {
        var command = new CreateOrderCommand(
            CustomerName: customerName!,
            CustomerEmail: "john@example.com",
            Street: "123 Main St",
            City: "New York",
            State: "NY",
            PostalCode: "10001",
            Country: "USA",
            Notes: null,
            CreatedBy: "test-user",
            OrderDetails: [new CreateOrderDetailDto(Guid.NewGuid(), 5)]);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.CustomerName);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("invalid-email")]
    public void Validate_WithInvalidEmail_ShouldHaveError(string? email)
    {
        var command = new CreateOrderCommand(
            CustomerName: "John Doe",
            CustomerEmail: email!,
            Street: "123 Main St",
            City: "New York",
            State: "NY",
            PostalCode: "10001",
            Country: "USA",
            Notes: null,
            CreatedBy: "test-user",
            OrderDetails: [new CreateOrderDetailDto(Guid.NewGuid(), 5)]);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.CustomerEmail);
    }

    [Fact]
    public void Validate_WithEmptyOrderDetails_ShouldHaveError()
    {
        var command = new CreateOrderCommand(
            CustomerName: "John Doe",
            CustomerEmail: "john@example.com",
            Street: "123 Main St",
            City: "New York",
            State: "NY",
            PostalCode: "10001",
            Country: "USA",
            Notes: null,
            CreatedBy: "test-user",
            OrderDetails: []);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.OrderDetails);
    }

    [Fact]
    public void Validate_WithInvalidQuantity_ShouldHaveError()
    {
        var command = new CreateOrderCommand(
            CustomerName: "John Doe",
            CustomerEmail: "john@example.com",
            Street: "123 Main St",
            City: "New York",
            State: "NY",
            PostalCode: "10001",
            Country: "USA",
            Notes: null,
            CreatedBy: "test-user",
            OrderDetails: [new CreateOrderDetailDto(Guid.NewGuid(), 0)]);

        var result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor("OrderDetails[0].Quantity");
    }
}
