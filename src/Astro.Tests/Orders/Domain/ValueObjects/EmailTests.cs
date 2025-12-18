using Astro.Domain.Orders.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Orders.Domain.ValueObjects;

/// <summary>
/// Unit tests for Email value object.
/// </summary>
public class EmailTests
{
    [Theory]
    [InlineData("test@example.com")]
    [InlineData("user.name@domain.org")]
    [InlineData("user+tag@example.co.uk")]
    [InlineData("first.last@subdomain.domain.com")]
    [InlineData("a@b.co")]
    public void Create_WithValidEmail_ShouldCreate(string email)
    {
        var result = Email.Create(email);

        result.ShouldNotBeNull();
        result.Value.ShouldBe(email.ToLowerInvariant());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithNullOrEmpty_ShouldThrow(string? email)
    {
        Should.Throw<ArgumentException>(() => Email.Create(email!));
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("invalid@")]
    [InlineData("@invalid.com")]
    [InlineData("invalid@.com")]
    [InlineData("invalid@domain")]
    [InlineData("invalid @domain.com")]
    [InlineData("invalid@ domain.com")]
    public void Create_WithInvalidFormat_ShouldThrow(string email)
    {
        Should.Throw<ArgumentException>(() => Email.Create(email));
    }

    [Fact]
    public void Create_ShouldNormalizeToLowerCase()
    {
        var email = "Test.User@EXAMPLE.COM";

        var result = Email.Create(email);

        result.Value.ShouldBe("test.user@example.com");
    }

    [Fact]
    public void Create_ShouldTrimWhitespace()
    {
        var email = "  test@example.com  ";

        var result = Email.Create(email);

        result.Value.ShouldBe("test@example.com");
    }

    [Fact]
    public void Create_WithEmailExceeding320Characters_ShouldThrow()
    {
        var localPart = new string('a', 65);
        var domain = new string('b', 256);
        var longEmail = $"{localPart}@{domain}.com";

        Should.Throw<ArgumentException>(() => Email.Create(longEmail));
    }

    [Fact]
    public void Equality_WithSameEmail_ShouldBeEqual()
    {
        var email1 = Email.Create("test@example.com");
        var email2 = Email.Create("test@example.com");

        email1.ShouldBe(email2);
        (email1 == email2).ShouldBeTrue();
    }

    [Fact]
    public void Equality_WithDifferentCase_ShouldBeEqual()
    {
        var email1 = Email.Create("Test@Example.COM");
        var email2 = Email.Create("test@example.com");

        email1.ShouldBe(email2);
    }

    [Fact]
    public void Equality_WithDifferentEmail_ShouldNotBeEqual()
    {
        var email1 = Email.Create("test1@example.com");
        var email2 = Email.Create("test2@example.com");

        email1.ShouldNotBe(email2);
        (email1 != email2).ShouldBeTrue();
    }

    [Fact]
    public void GetHashCode_WithSameEmail_ShouldBeSame()
    {
        var email1 = Email.Create("test@example.com");
        var email2 = Email.Create("test@example.com");

        email1.GetHashCode().ShouldBe(email2.GetHashCode());
    }

    [Fact]
    public void ToString_ShouldReturnEmailValue()
    {
        var email = Email.Create("test@example.com");

        var result = email.ToString();

        result.ShouldBe("test@example.com");
    }
}
