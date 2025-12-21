using Astro.Domain.Shipments.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Shipments.Domain;

public class AddressTests
{
    [Fact]
    public void Create_WithValidValues_ShouldCreateAddress()
    {
        var address = Address.Create(
            street: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "USA");

        address.Street.ShouldBe("123 Main St");
        address.City.ShouldBe("New York");
        address.State.ShouldBe("NY");
        address.PostalCode.ShouldBe("10001");
        address.Country.ShouldBe("USA");
    }

    [Fact]
    public void Create_WithContactInfo_ShouldIncludeContact()
    {
        var address = Address.Create(
            street: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "USA",
            contactName: "John Doe",
            contactPhone: "555-1234");

        address.ContactName.ShouldBe("John Doe");
        address.ContactPhone.ShouldBe("555-1234");
    }

    [Fact]
    public void Create_WithWhitespace_ShouldTrim()
    {
        var address = Address.Create(
            street: "  123 Main St  ",
            city: "  New York  ",
            state: "  NY  ",
            postalCode: "  10001  ",
            country: "  USA  ");

        address.Street.ShouldBe("123 Main St");
        address.City.ShouldBe("New York");
        address.State.ShouldBe("NY");
        address.PostalCode.ShouldBe("10001");
        address.Country.ShouldBe("USA");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyStreet_ShouldThrow(string? street)
    {
        Should.Throw<ArgumentException>(() => Address.Create(
            street: street!,
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "USA"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyCity_ShouldThrow(string? city)
    {
        Should.Throw<ArgumentException>(() => Address.Create(
            street: "123 Main St",
            city: city!,
            state: "NY",
            postalCode: "10001",
            country: "USA"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyState_ShouldThrow(string? state)
    {
        Should.Throw<ArgumentException>(() => Address.Create(
            street: "123 Main St",
            city: "New York",
            state: state!,
            postalCode: "10001",
            country: "USA"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyPostalCode_ShouldThrow(string? postalCode)
    {
        Should.Throw<ArgumentException>(() => Address.Create(
            street: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: postalCode!,
            country: "USA"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyCountry_ShouldThrow(string? country)
    {
        Should.Throw<ArgumentException>(() => Address.Create(
            street: "123 Main St",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: country!));
    }

    [Fact]
    public void Create_WithTooLongStreet_ShouldThrow()
    {
        var longStreet = new string('A', 201);
        Should.Throw<ArgumentException>(() => Address.Create(
            street: longStreet,
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "USA"));
    }

    [Fact]
    public void Equality_WithSameValues_ShouldBeEqual()
    {
        var address1 = Address.Create("123 Main St", "New York", "NY", "10001", "USA");
        var address2 = Address.Create("123 Main St", "New York", "NY", "10001", "USA");

        address1.ShouldBe(address2);
    }

    [Fact]
    public void Equality_WithDifferentValues_ShouldNotBeEqual()
    {
        var address1 = Address.Create("123 Main St", "New York", "NY", "10001", "USA");
        var address2 = Address.Create("456 Oak Ave", "New York", "NY", "10001", "USA");

        address1.ShouldNotBe(address2);
    }

    [Fact]
    public void ToString_ShouldFormatCorrectly()
    {
        var address = Address.Create("123 Main St", "New York", "NY", "10001", "USA");

        address.ToString().ShouldBe("123 Main St, New York, NY, 10001, USA");
    }
}
