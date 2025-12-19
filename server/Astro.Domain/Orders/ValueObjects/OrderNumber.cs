using System.Text.RegularExpressions;
using Astro.Domain.Shared;

namespace Astro.Domain.Orders.ValueObjects;

/// <summary>
/// Value object representing an order number.
/// Format: ORD-YYYYMMDD-XXXXX where XXXXX is a random alphanumeric string.
/// </summary>
public sealed record OrderNumber : ValueObject
{
    private static readonly Regex OrderNumberPattern = new(@"^ORD-\d{8}-[A-Z0-9]{5}$", RegexOptions.Compiled);

    public string Value { get; }

    private OrderNumber(string value)
    {
        Value = value;
        Validate();
    }

    /// <summary>
    /// Generates a new unique order number.
    /// </summary>
    public static OrderNumber Generate()
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var randomPart = GenerateRandomString(5);
        return new OrderNumber($"ORD-{datePart}-{randomPart}");
    }

    /// <summary>
    /// Creates an OrderNumber from an existing string value.
    /// </summary>
    public static OrderNumber Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Order number cannot be empty.", nameof(value));

        return new OrderNumber(value.ToUpperInvariant());
    }

    protected override void Validate()
    {
        if (!OrderNumberPattern.IsMatch(Value))
            throw new ArgumentException(
                "Order number must match format: ORD-YYYYMMDD-XXXXX",
                nameof(Value));
    }

    private static string GenerateRandomString(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = Random.Shared;
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    public override string ToString() => Value;

    public static implicit operator string(OrderNumber orderNumber) => orderNumber.Value;
}
