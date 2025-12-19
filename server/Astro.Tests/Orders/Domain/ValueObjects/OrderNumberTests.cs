using Astro.Domain.Orders.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Orders.Domain.ValueObjects;

/// <summary>
/// Unit tests for OrderNumber value object.
/// </summary>
public class OrderNumberTests
{
    [Fact]
    public void Generate_ShouldCreateValidOrderNumber()
    {
        var orderNumber = OrderNumber.Generate();

        orderNumber.ShouldNotBeNull();
        orderNumber.Value.ShouldNotBeNullOrWhiteSpace();
    }

    [Fact]
    public void Generate_ShouldStartWithORDPrefix()
    {
        var orderNumber = OrderNumber.Generate();

        orderNumber.Value.ShouldStartWith("ORD-");
    }

    [Fact]
    public void Generate_ShouldContainCurrentDate()
    {
        var today = DateTimeOffset.UtcNow.ToString("yyyyMMdd");

        var orderNumber = OrderNumber.Generate();

        orderNumber.Value.ShouldContain(today);
    }

    [Fact]
    public void Generate_ShouldHaveExpectedFormat()
    {
        var orderNumber = OrderNumber.Generate();

        // Format: ORD-YYYYMMDD-XXXXX
        var parts = orderNumber.Value.Split('-');
        parts.Length.ShouldBe(3);
        parts[0].ShouldBe("ORD");
        parts[1].Length.ShouldBe(8); // YYYYMMDD
        parts[2].Length.ShouldBe(5); // XXXXX
    }

    [Fact]
    public void Generate_ShouldCreateUniqueValues()
    {
        var orderNumbers = Enumerable.Range(0, 100)
            .Select(_ => OrderNumber.Generate().Value)
            .ToList();

        orderNumbers.Distinct().Count().ShouldBe(100);
    }

    [Theory]
    [InlineData("ORD-20241215-12345")]
    [InlineData("ORD-20230101-00001")]
    [InlineData("ORD-20251231-99999")]
    public void Create_WithValidFormat_ShouldCreate(string value)
    {
        var orderNumber = OrderNumber.Create(value);

        orderNumber.Value.ShouldBe(value);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithNullOrEmpty_ShouldThrow(string? value)
    {
        Should.Throw<ArgumentException>(() => OrderNumber.Create(value!));
    }

    [Theory]
    [InlineData("INVALID")]
    [InlineData("ORD-12345")]
    [InlineData("ORD-20241215")]
    [InlineData("20241215-12345")]
    [InlineData("ORD-2024121-12345")]
    [InlineData("ORD-20241215-1234")]
    public void Create_WithInvalidFormat_ShouldThrow(string value)
    {
        Should.Throw<ArgumentException>(() => OrderNumber.Create(value));
    }

    [Fact]
    public void Equality_WithSameValue_ShouldBeEqual()
    {
        var value = "ORD-20241215-12345";
        var orderNumber1 = OrderNumber.Create(value);
        var orderNumber2 = OrderNumber.Create(value);

        orderNumber1.ShouldBe(orderNumber2);
        (orderNumber1 == orderNumber2).ShouldBeTrue();
    }

    [Fact]
    public void Equality_WithDifferentValue_ShouldNotBeEqual()
    {
        var orderNumber1 = OrderNumber.Create("ORD-20241215-12345");
        var orderNumber2 = OrderNumber.Create("ORD-20241215-12346");

        orderNumber1.ShouldNotBe(orderNumber2);
        (orderNumber1 != orderNumber2).ShouldBeTrue();
    }

    [Fact]
    public void ToString_ShouldReturnValue()
    {
        var value = "ORD-20241215-12345";
        var orderNumber = OrderNumber.Create(value);

        var result = orderNumber.ToString();

        result.ShouldBe(value);
    }
}
