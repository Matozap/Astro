using System.Text.RegularExpressions;
using Astro.Domain.Shared;

namespace Astro.Domain.Orders.ValueObjects;

/// <summary>
/// Value object representing an email address.
/// </summary>
public sealed record Email : ValueObject
{
    private static readonly Regex EmailPattern = new(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", RegexOptions.Compiled);

    public string Value { get; }

    private Email(string value)
    {
        Value = value;
        Validate();
    }

    /// <summary>
    /// Creates an Email from a string value.
    /// </summary>
    public static Email Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email cannot be empty.", nameof(value));

        return new Email(value.ToLowerInvariant().Trim());
    }

    protected override void Validate()
    {
        if (Value.Length > 320)
            throw new ArgumentException("Email cannot exceed 320 characters.", nameof(Value));

        if (!EmailPattern.IsMatch(Value))
            throw new ArgumentException("Invalid email format.", nameof(Value));
    }

    public override string ToString() => Value;

    public static implicit operator string(Email email) => email.Value;
}
