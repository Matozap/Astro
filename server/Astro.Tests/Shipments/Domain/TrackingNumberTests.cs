using Astro.Domain.Shipments.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Shipments.Domain;

public class TrackingNumberTests
{
    [Fact]
    public void Create_WithValidValue_ShouldCreateTrackingNumber()
    {
        var trackingNumber = TrackingNumber.Create("TRK12345678");

        trackingNumber.Value.ShouldBe("TRK12345678");
    }

    [Fact]
    public void Create_WithLowerCaseValue_ShouldConvertToUpperCase()
    {
        var trackingNumber = TrackingNumber.Create("trk12345678");

        trackingNumber.Value.ShouldBe("TRK12345678");
    }

    [Fact]
    public void Create_WithWhitespace_ShouldTrim()
    {
        var trackingNumber = TrackingNumber.Create("  TRK12345678  ");

        trackingNumber.Value.ShouldBe("TRK12345678");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyValue_ShouldThrow(string? value)
    {
        Should.Throw<ArgumentException>(() => TrackingNumber.Create(value!));
    }

    [Fact]
    public void Create_WithTooShortValue_ShouldThrow()
    {
        Should.Throw<ArgumentException>(() => TrackingNumber.Create("TRK1"));
    }

    [Fact]
    public void Create_WithTooLongValue_ShouldThrow()
    {
        var longValue = new string('A', 51);
        Should.Throw<ArgumentException>(() => TrackingNumber.Create(longValue));
    }

    [Fact]
    public void Generate_ShouldCreateValidTrackingNumber()
    {
        var trackingNumber = TrackingNumber.Generate();

        trackingNumber.Value.ShouldStartWith("TRK");
        trackingNumber.Value.Length.ShouldBeGreaterThan(10);
    }

    [Fact]
    public void Equality_WithSameValue_ShouldBeEqual()
    {
        var trackingNumber1 = TrackingNumber.Create("TRK12345678");
        var trackingNumber2 = TrackingNumber.Create("TRK12345678");

        trackingNumber1.ShouldBe(trackingNumber2);
    }

    [Fact]
    public void Equality_WithDifferentValue_ShouldNotBeEqual()
    {
        var trackingNumber1 = TrackingNumber.Create("TRK12345678");
        var trackingNumber2 = TrackingNumber.Create("TRK87654321");

        trackingNumber1.ShouldNotBe(trackingNumber2);
    }

    [Fact]
    public void ToString_ShouldReturnValue()
    {
        var trackingNumber = TrackingNumber.Create("TRK12345678");

        trackingNumber.ToString().ShouldBe("TRK12345678");
    }
}
