namespace Astro.Domain.Shared.ValueObjects;

/// <summary>
/// Value object representing a monetary amount with currency.
/// </summary>
public sealed record Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }
    private const string DefaultCurrency = "USD";

    public Money()
    {
        Amount = 0;
        Currency = DefaultCurrency;
    }

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
        Validate();
    }

    /// <summary>
    /// Creates a Money value object from a decimal amount.
    /// </summary>
    /// <param name="amount">The monetary amount (must be non-negative)</param>
    /// <param name="currency">The ISO currency code (defaults to USD)</param>
    public static Money FromDecimal(decimal amount, string currency = DefaultCurrency)
    {
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency code is required.", nameof(currency));

        return new Money(amount, currency.ToUpperInvariant());
    }

    /// <summary>
    /// Creates a zero Money value.
    /// </summary>
    public static Money Zero(string currency = DefaultCurrency) => new(0, currency);

    protected override void Validate()
    {
        if (Amount < 0)
            throw new ArgumentException("Money amount cannot be negative.", nameof(Amount));

        if (string.IsNullOrWhiteSpace(Currency))
            throw new ArgumentException("Currency code is required.", nameof(Currency));

        if (Currency.Length != 3)
            throw new ArgumentException("Currency must be a 3-letter ISO code.", nameof(Currency));
    }

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot add money with different currencies: {Currency} and {other.Currency}");

        return new Money(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot subtract money with different currencies: {Currency} and {other.Currency}");

        return new Money(Amount - other.Amount, Currency);
    }

    public Money Multiply(int quantity)
    {
        return new Money(Amount * quantity, Currency);
    }

    public override string ToString() => $"{Amount:F2} {Currency}";
}
