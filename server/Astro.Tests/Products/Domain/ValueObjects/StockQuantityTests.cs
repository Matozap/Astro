using Astro.Domain.Products.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Domain.ValueObjects;

public class StockQuantityTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(100)]
    [InlineData(int.MaxValue)]
    public void Create_WithNonNegativeValue_ShouldCreateStockQuantity(int quantity)
    {
        var stockQuantity = StockQuantity.Create(quantity);

        stockQuantity.Value.ShouldBe(quantity);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-100)]
    [InlineData(int.MinValue)]
    public void Create_WithNegativeValue_ShouldThrowArgumentException(int quantity)
    {
        Should.Throw<ArgumentException>(() => StockQuantity.Create(quantity));
    }

    [Fact]
    public void Zero_ShouldReturnZeroQuantity()
    {
        var stockQuantity = StockQuantity.Zero();

        stockQuantity.Value.ShouldBe(0);
    }

    [Fact]
    public void Add_ShouldIncreaseQuantity()
    {
        var stockQuantity = StockQuantity.Create(100);

        var newQuantity = stockQuantity.Add(50);

        newQuantity.Value.ShouldBe(150);
        stockQuantity.Value.ShouldBe(100); // Original unchanged (immutable)
    }

    [Fact]
    public void Subtract_WithValidAmount_ShouldDecreaseQuantity()
    {
        var stockQuantity = StockQuantity.Create(100);

        var newQuantity = stockQuantity.Subtract(30);

        newQuantity.Value.ShouldBe(70);
        stockQuantity.Value.ShouldBe(100); // Original unchanged (immutable)
    }

    [Fact]
    public void Subtract_ToZero_ShouldSucceed()
    {
        var stockQuantity = StockQuantity.Create(100);

        var newQuantity = stockQuantity.Subtract(100);

        newQuantity.Value.ShouldBe(0);
    }

    [Fact]
    public void Subtract_ResultingInNegative_ShouldThrowInvalidOperationException()
    {
        var stockQuantity = StockQuantity.Create(100);

        Should.Throw<InvalidOperationException>(() => stockQuantity.Subtract(101));
    }

    [Theory]
    [InlineData(10, 10, true)]   // At threshold
    [InlineData(5, 10, true)]    // Below threshold
    [InlineData(15, 10, false)]  // Above threshold
    [InlineData(0, 0, true)]     // Zero at zero threshold
    public void IsAtOrBelowThreshold_ShouldReturnCorrectResult(int quantity, int threshold, bool expected)
    {
        var stockQuantity = StockQuantity.Create(quantity);

        var result = stockQuantity.IsAtOrBelowThreshold(threshold);

        result.ShouldBe(expected);
    }

    [Fact]
    public void Equality_TwoQuantitiesWithSameValue_ShouldBeEqual()
    {
        var qty1 = StockQuantity.Create(100);
        var qty2 = StockQuantity.Create(100);

        qty1.ShouldBe(qty2);
        (qty1 == qty2).ShouldBeTrue();
    }

    [Fact]
    public void Equality_TwoQuantitiesWithDifferentValues_ShouldNotBeEqual()
    {
        var qty1 = StockQuantity.Create(100);
        var qty2 = StockQuantity.Create(50);

        qty1.ShouldNotBe(qty2);
        (qty1 != qty2).ShouldBeTrue();
    }

    [Fact]
    public void ImplicitConversion_ToInt_ShouldReturnValue()
    {
        var stockQuantity = StockQuantity.Create(100);

        int value = stockQuantity;

        value.ShouldBe(100);
    }
}
