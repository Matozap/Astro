using Astro.Domain.Shipments.Enums;
using Astro.Domain.Shipments.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Shipments.Domain;

public class DimensionsTests
{
    [Fact]
    public void Create_WithValidValues_ShouldCreateDimensions()
    {
        var dimensions = Dimensions.Create(10m, 8m, 5m, DimensionUnit.Inches);

        dimensions.Length.ShouldBe(10m);
        dimensions.Width.ShouldBe(8m);
        dimensions.Height.ShouldBe(5m);
        dimensions.Unit.ShouldBe(DimensionUnit.Inches);
    }

    [Fact]
    public void Create_WithDefaultUnit_ShouldUseInches()
    {
        var dimensions = Dimensions.Create(10m, 8m, 5m);

        dimensions.Unit.ShouldBe(DimensionUnit.Inches);
    }

    [Fact]
    public void Create_WithNegativeLength_ShouldThrow()
    {
        Should.Throw<ArgumentException>(() => Dimensions.Create(-1m, 8m, 5m));
    }

    [Fact]
    public void Create_WithNegativeWidth_ShouldThrow()
    {
        Should.Throw<ArgumentException>(() => Dimensions.Create(10m, -1m, 5m));
    }

    [Fact]
    public void Create_WithNegativeHeight_ShouldThrow()
    {
        Should.Throw<ArgumentException>(() => Dimensions.Create(10m, 8m, -1m));
    }

    [Fact]
    public void Volume_ShouldCalculateCorrectly()
    {
        var dimensions = Dimensions.Create(10m, 8m, 5m);

        dimensions.Volume.ShouldBe(400m);
    }

    [Fact]
    public void ToInches_FromCentimeters_ShouldConvert()
    {
        var dimensions = Dimensions.Create(25.4m, 12.7m, 5.08m, DimensionUnit.Centimeters);

        var converted = dimensions.ToInches();

        converted.Length.ShouldBe(10m, 0.1m);
        converted.Width.ShouldBe(5m, 0.1m);
        converted.Height.ShouldBe(2m, 0.1m);
        converted.Unit.ShouldBe(DimensionUnit.Inches);
    }

    [Fact]
    public void ToInches_FromInches_ShouldReturnSame()
    {
        var dimensions = Dimensions.Create(10m, 8m, 5m, DimensionUnit.Inches);

        var converted = dimensions.ToInches();

        converted.ShouldBe(dimensions);
    }

    [Fact]
    public void ToCentimeters_FromInches_ShouldConvert()
    {
        var dimensions = Dimensions.Create(10m, 5m, 2m, DimensionUnit.Inches);

        var converted = dimensions.ToCentimeters();

        converted.Length.ShouldBe(25.4m, 0.1m);
        converted.Width.ShouldBe(12.7m, 0.1m);
        converted.Height.ShouldBe(5.08m, 0.1m);
        converted.Unit.ShouldBe(DimensionUnit.Centimeters);
    }

    [Fact]
    public void ToCentimeters_FromCentimeters_ShouldReturnSame()
    {
        var dimensions = Dimensions.Create(10m, 8m, 5m, DimensionUnit.Centimeters);

        var converted = dimensions.ToCentimeters();

        converted.ShouldBe(dimensions);
    }

    [Fact]
    public void Equality_WithSameValues_ShouldBeEqual()
    {
        var dim1 = Dimensions.Create(10m, 8m, 5m, DimensionUnit.Inches);
        var dim2 = Dimensions.Create(10m, 8m, 5m, DimensionUnit.Inches);

        dim1.ShouldBe(dim2);
    }

    [Fact]
    public void Equality_WithDifferentValues_ShouldNotBeEqual()
    {
        var dim1 = Dimensions.Create(10m, 8m, 5m, DimensionUnit.Inches);
        var dim2 = Dimensions.Create(11m, 8m, 5m, DimensionUnit.Inches);

        dim1.ShouldNotBe(dim2);
    }

    [Fact]
    public void ToString_WithInches_ShouldFormatCorrectly()
    {
        var dimensions = Dimensions.Create(10m, 8m, 5m, DimensionUnit.Inches);

        dimensions.ToString().ShouldBe("10 x 8 x 5 in");
    }

    [Fact]
    public void ToString_WithCentimeters_ShouldFormatCorrectly()
    {
        var dimensions = Dimensions.Create(25m, 20m, 10m, DimensionUnit.Centimeters);

        dimensions.ToString().ShouldBe("25 x 20 x 10 cm");
    }
}
