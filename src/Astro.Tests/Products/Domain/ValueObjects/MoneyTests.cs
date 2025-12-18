using Astro.Domain.Shared.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Domain.ValueObjects;

public class MoneyTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(99.99)]
    [InlineData(1000000)]
    public void FromDecimal_WithNonNegativeAmount_ShouldCreateMoney(decimal amount)
    {
        var money = Money.FromDecimal(amount);

        money.Amount.ShouldBe(amount);
        money.Currency.ShouldBe("USD");
    }

    [Fact]
    public void FromDecimal_WithCurrency_ShouldSetCurrency()
    {
        var money = Money.FromDecimal(100, "EUR");

        money.Amount.ShouldBe(100);
        money.Currency.ShouldBe("EUR");
    }

    [Fact]
    public void FromDecimal_WithLowercaseCurrency_ShouldConvertToUppercase()
    {
        var money = Money.FromDecimal(100, "eur");

        money.Currency.ShouldBe("EUR");
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-0.01)]
    [InlineData(-1000)]
    public void FromDecimal_WithNegativeAmount_ShouldThrowArgumentException(decimal amount)
    {
        Should.Throw<ArgumentException>(() => Money.FromDecimal(amount));
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void FromDecimal_WithEmptyCurrency_ShouldThrowArgumentException(string? currency)
    {
        Should.Throw<ArgumentException>(() => Money.FromDecimal(100, currency!));
    }

    [Theory]
    [InlineData("US")]
    [InlineData("U")]
    [InlineData("USDD")]
    public void FromDecimal_WithInvalidCurrencyLength_ShouldThrowArgumentException(string currency)
    {
        Should.Throw<ArgumentException>(() => Money.FromDecimal(100, currency));
    }

    [Fact]
    public void Zero_ShouldReturnZeroAmount()
    {
        var money = Money.Zero();

        money.Amount.ShouldBe(0);
        money.Currency.ShouldBe("USD");
    }

    [Fact]
    public void Add_WithSameCurrency_ShouldAddAmounts()
    {
        var money1 = Money.FromDecimal(100, "USD");
        var money2 = Money.FromDecimal(50, "USD");

        var result = money1.Add(money2);

        result.Amount.ShouldBe(150);
        result.Currency.ShouldBe("USD");
    }

    [Fact]
    public void Add_WithDifferentCurrency_ShouldThrowInvalidOperationException()
    {
        var money1 = Money.FromDecimal(100, "USD");
        var money2 = Money.FromDecimal(50, "EUR");

        Should.Throw<InvalidOperationException>(() => money1.Add(money2));
    }

    [Fact]
    public void Subtract_WithSameCurrency_ShouldSubtractAmounts()
    {
        var money1 = Money.FromDecimal(100, "USD");
        var money2 = Money.FromDecimal(30, "USD");

        var result = money1.Subtract(money2);

        result.Amount.ShouldBe(70);
        result.Currency.ShouldBe("USD");
    }

    [Fact]
    public void Subtract_ResultingInNegative_ShouldThrowArgumentException()
    {
        var money1 = Money.FromDecimal(30, "USD");
        var money2 = Money.FromDecimal(100, "USD");

        Should.Throw<ArgumentException>(() => money1.Subtract(money2));
    }

    [Fact]
    public void Subtract_WithDifferentCurrency_ShouldThrowInvalidOperationException()
    {
        var money1 = Money.FromDecimal(100, "USD");
        var money2 = Money.FromDecimal(30, "EUR");

        Should.Throw<InvalidOperationException>(() => money1.Subtract(money2));
    }

    [Fact]
    public void Multiply_ShouldMultiplyAmount()
    {
        var money = Money.FromDecimal(25.50m, "USD");

        var result = money.Multiply(4);

        result.Amount.ShouldBe(102.00m);
        result.Currency.ShouldBe("USD");
    }

    [Fact]
    public void Equality_TwoMoneyWithSameValues_ShouldBeEqual()
    {
        var money1 = Money.FromDecimal(100, "USD");
        var money2 = Money.FromDecimal(100, "USD");

        money1.ShouldBe(money2);
        (money1 == money2).ShouldBeTrue();
    }

    [Fact]
    public void Equality_TwoMoneyWithDifferentAmounts_ShouldNotBeEqual()
    {
        var money1 = Money.FromDecimal(100, "USD");
        var money2 = Money.FromDecimal(50, "USD");

        money1.ShouldNotBe(money2);
        (money1 != money2).ShouldBeTrue();
    }

    [Fact]
    public void Equality_TwoMoneyWithDifferentCurrencies_ShouldNotBeEqual()
    {
        var money1 = Money.FromDecimal(100, "USD");
        var money2 = Money.FromDecimal(100, "EUR");

        money1.ShouldNotBe(money2);
    }

    [Fact]
    public void ToString_ShouldReturnFormattedString()
    {
        var money = Money.FromDecimal(99.99m, "USD");

        var result = money.ToString();

        result.ShouldBe("99.99 USD");
    }
}
