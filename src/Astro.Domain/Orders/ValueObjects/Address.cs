using Astro.Domain.Shared;

namespace Astro.Domain.Orders.ValueObjects;

/// <summary>
/// Value object representing a shipping address.
/// </summary>
public sealed record Address : ValueObject
{
    public string Street { get; }
    public string City { get; }
    public string State { get; }
    public string PostalCode { get; }
    public string Country { get; }

    public Address()
    {
        Country = "USA";
        Street = "Unknown";
        City = "Unknown";
        State = "Unknown";
        PostalCode = "Unknown";
    }

    private Address(string street, string city, string state, string postalCode, string country)
    {
        Street = street;
        City = city;
        State = state;
        PostalCode = postalCode;
        Country = country;
        Validate();
    }

    /// <summary>
    /// Creates an Address value object.
    /// </summary>
    public static Address Create(
        string street,
        string city,
        string state,
        string postalCode,
        string country)
    {
        return new Address(
            street?.Trim() ?? string.Empty,
            city?.Trim() ?? string.Empty,
            state?.Trim() ?? string.Empty,
            postalCode?.Trim() ?? string.Empty,
            country?.Trim() ?? string.Empty);
    }

    protected override void Validate()
    {
        if (string.IsNullOrWhiteSpace(Street))
            throw new ArgumentException("Street is required.", nameof(Street));

        if (Street.Length > 200)
            throw new ArgumentException("Street cannot exceed 200 characters.", nameof(Street));

        if (string.IsNullOrWhiteSpace(City))
            throw new ArgumentException("City is required.", nameof(City));

        if (City.Length > 100)
            throw new ArgumentException("City cannot exceed 100 characters.", nameof(City));

        if (string.IsNullOrWhiteSpace(State))
            throw new ArgumentException("State is required.", nameof(State));

        if (State.Length > 100)
            throw new ArgumentException("State cannot exceed 100 characters.", nameof(State));

        if (string.IsNullOrWhiteSpace(PostalCode))
            throw new ArgumentException("Postal code is required.", nameof(PostalCode));

        if (PostalCode.Length > 20)
            throw new ArgumentException("Postal code cannot exceed 20 characters.", nameof(PostalCode));

        if (string.IsNullOrWhiteSpace(Country))
            throw new ArgumentException("Country is required.", nameof(Country));

        if (Country.Length > 100)
            throw new ArgumentException("Country cannot exceed 100 characters.", nameof(Country));
    }

    public override string ToString()
    {
        var parts = new List<string> { Street };

        if (!string.IsNullOrWhiteSpace(City))
            parts.Add(City);

        if (!string.IsNullOrWhiteSpace(State))
            parts.Add(State);

        if (!string.IsNullOrWhiteSpace(PostalCode))
            parts.Add(PostalCode);

        if (!string.IsNullOrWhiteSpace(Country))
            parts.Add(Country);

        return string.Join(", ", parts);
    }
}
