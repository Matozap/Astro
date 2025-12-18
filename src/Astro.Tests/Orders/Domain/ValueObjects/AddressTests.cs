using Astro.Domain.Orders.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Orders.Domain.ValueObjects;

/// <summary>
/// Unit tests for Address value object.
/// </summary>
public class AddressTests
{
    private const string ValidStreet = "123 Main St";
    private const string ValidCity = "New York";
    private const string ValidState = "NY";
    private const string ValidPostalCode = "10001";
    private const string ValidCountry = "USA";

    [Fact]
    public void Create_WithValidData_ShouldCreate()
    {
        var address = Address.Create(ValidStreet, ValidCity, ValidState, ValidPostalCode, ValidCountry);

        address.ShouldNotBeNull();
        address.Street.ShouldBe(ValidStreet);
        address.City.ShouldBe(ValidCity);
        address.State.ShouldBe(ValidState);
        address.PostalCode.ShouldBe(ValidPostalCode);
        address.Country.ShouldBe(ValidCountry);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithNullOrEmptyStreet_ShouldThrow(string? street)
    {
        Should.Throw<ArgumentException>(() =>
            Address.Create(street!, ValidCity, ValidState, ValidPostalCode, ValidCountry));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithNullOrEmptyCity_ShouldThrow(string? city)
    {
        Should.Throw<ArgumentException>(() =>
            Address.Create(ValidStreet, city!, ValidState, ValidPostalCode, ValidCountry));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithNullOrEmptyState_ShouldThrow(string? state)
    {
        Should.Throw<ArgumentException>(() =>
            Address.Create(ValidStreet, ValidCity, state!, ValidPostalCode, ValidCountry));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithNullOrEmptyPostalCode_ShouldThrow(string? postalCode)
    {
        Should.Throw<ArgumentException>(() =>
            Address.Create(ValidStreet, ValidCity, ValidState, postalCode!, ValidCountry));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithNullOrEmptyCountry_ShouldThrow(string? country)
    {
        Should.Throw<ArgumentException>(() =>
            Address.Create(ValidStreet, ValidCity, ValidState, ValidPostalCode, country!));
    }

    [Fact]
    public void Create_WithStreetExceeding200Characters_ShouldThrow()
    {
        var longStreet = new string('a', 201);

        Should.Throw<ArgumentException>(() =>
            Address.Create(longStreet, ValidCity, ValidState, ValidPostalCode, ValidCountry));
    }

    [Fact]
    public void Create_WithCityExceeding100Characters_ShouldThrow()
    {
        var longCity = new string('a', 101);

        Should.Throw<ArgumentException>(() =>
            Address.Create(ValidStreet, longCity, ValidState, ValidPostalCode, ValidCountry));
    }

    [Fact]
    public void Create_WithStateExceeding100Characters_ShouldThrow()
    {
        var longState = new string('a', 101);

        Should.Throw<ArgumentException>(() =>
            Address.Create(ValidStreet, ValidCity, longState, ValidPostalCode, ValidCountry));
    }

    [Fact]
    public void Create_WithPostalCodeExceeding20Characters_ShouldThrow()
    {
        var longPostalCode = new string('a', 21);

        Should.Throw<ArgumentException>(() =>
            Address.Create(ValidStreet, ValidCity, ValidState, longPostalCode, ValidCountry));
    }

    [Fact]
    public void Create_WithCountryExceeding100Characters_ShouldThrow()
    {
        var longCountry = new string('a', 101);

        Should.Throw<ArgumentException>(() =>
            Address.Create(ValidStreet, ValidCity, ValidState, ValidPostalCode, longCountry));
    }

    [Fact]
    public void Create_ShouldTrimWhitespace()
    {
        var address = Address.Create(
            "  123 Main St  ",
            "  New York  ",
            "  NY  ",
            "  10001  ",
            "  USA  ");

        address.Street.ShouldBe("123 Main St");
        address.City.ShouldBe("New York");
        address.State.ShouldBe("NY");
        address.PostalCode.ShouldBe("10001");
        address.Country.ShouldBe("USA");
    }

    [Fact]
    public void Equality_WithSameValues_ShouldBeEqual()
    {
        var address1 = Address.Create(ValidStreet, ValidCity, ValidState, ValidPostalCode, ValidCountry);
        var address2 = Address.Create(ValidStreet, ValidCity, ValidState, ValidPostalCode, ValidCountry);

        address1.ShouldBe(address2);
        (address1 == address2).ShouldBeTrue();
    }

    [Fact]
    public void Equality_WithDifferentValues_ShouldNotBeEqual()
    {
        var address1 = Address.Create(ValidStreet, ValidCity, ValidState, ValidPostalCode, ValidCountry);
        var address2 = Address.Create("456 Oak Ave", ValidCity, ValidState, ValidPostalCode, ValidCountry);

        address1.ShouldNotBe(address2);
        (address1 != address2).ShouldBeTrue();
    }

    [Fact]
    public void GetHashCode_WithSameValues_ShouldBeSame()
    {
        var address1 = Address.Create(ValidStreet, ValidCity, ValidState, ValidPostalCode, ValidCountry);
        var address2 = Address.Create(ValidStreet, ValidCity, ValidState, ValidPostalCode, ValidCountry);

        address1.GetHashCode().ShouldBe(address2.GetHashCode());
    }

    [Fact]
    public void ToString_ShouldReturnFormattedAddress()
    {
        var address = Address.Create(ValidStreet, ValidCity, ValidState, ValidPostalCode, ValidCountry);

        var result = address.ToString();

        result.ShouldContain(ValidStreet);
        result.ShouldContain(ValidCity);
        result.ShouldContain(ValidState);
        result.ShouldContain(ValidPostalCode);
        result.ShouldContain(ValidCountry);
    }
}
