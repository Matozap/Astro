using Astro.Domain.Products.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Products.Domain.ValueObjects;

public class SkuTests
{
    [Theory]
    [InlineData("ABC")]
    [InlineData("ABC123")]
    [InlineData("PRODUCT001")]
    [InlineData("12345678901234567890")]
    public void Create_WithValidSku_ShouldCreateSku(string skuValue)
    {
        var sku = Sku.Create(skuValue);

        sku.Value.ShouldBe(skuValue.ToUpperInvariant());
    }

    [Fact]
    public void Create_WithLowercase_ShouldConvertToUppercase()
    {
        var sku = Sku.Create("abc123");

        sku.Value.ShouldBe("ABC123");
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Create_WithEmptyOrNull_ShouldThrowArgumentException(string? skuValue)
    {
        Should.Throw<ArgumentException>(() => Sku.Create(skuValue!));
    }

    [Theory]
    [InlineData("AB")]          // Too short
    [InlineData("A")]           // Too short
    [InlineData("123456789012345678901")] // Too long (21 chars)
    public void Create_WithInvalidLength_ShouldThrowArgumentException(string skuValue)
    {
        Should.Throw<ArgumentException>(() => Sku.Create(skuValue));
    }

    [Theory]
    [InlineData("ABC-123")]     // Contains hyphen
    [InlineData("ABC_123")]     // Contains underscore
    [InlineData("ABC 123")]     // Contains space
    [InlineData("ABC.123")]     // Contains period
    public void Create_WithInvalidCharacters_ShouldThrowArgumentException(string skuValue)
    {
        Should.Throw<ArgumentException>(() => Sku.Create(skuValue));
    }

    [Fact]
    public void Equality_TwoSkusWithSameValue_ShouldBeEqual()
    {
        var sku1 = Sku.Create("ABC123");
        var sku2 = Sku.Create("ABC123");

        sku1.ShouldBe(sku2);
        (sku1 == sku2).ShouldBeTrue();
    }

    [Fact]
    public void Equality_TwoSkusWithDifferentValues_ShouldNotBeEqual()
    {
        var sku1 = Sku.Create("ABC123");
        var sku2 = Sku.Create("XYZ789");

        sku1.ShouldNotBe(sku2);
        (sku1 != sku2).ShouldBeTrue();
    }

    [Fact]
    public void ImplicitConversion_ToString_ShouldReturnValue()
    {
        var sku = Sku.Create("ABC123");

        string value = sku;

        value.ShouldBe("ABC123");
    }
}
