using Astro.Domain.Shipments.Enums;
using Astro.Domain.Shipments.ValueObjects;
using Shouldly;
using Xunit;

namespace Astro.Tests.Shipments.Domain;

public class WeightTests
{
    [Fact]
    public void Create_WithValidValue_ShouldCreateWeight()
    {
        var weight = Weight.Create(5.5m, WeightUnit.Pounds);

        weight.Value.ShouldBe(5.5m);
        weight.Unit.ShouldBe(WeightUnit.Pounds);
    }

    [Fact]
    public void Create_WithDefaultUnit_ShouldUsePounds()
    {
        var weight = Weight.Create(5.5m);

        weight.Unit.ShouldBe(WeightUnit.Pounds);
    }

    [Fact]
    public void Create_WithNegativeValue_ShouldThrow()
    {
        Should.Throw<ArgumentException>(() => Weight.Create(-1m));
    }

    [Fact]
    public void Zero_ShouldReturnZeroWeight()
    {
        var weight = Weight.Zero();

        weight.Value.ShouldBe(0);
        weight.Unit.ShouldBe(WeightUnit.Pounds);
    }

    [Fact]
    public void ToPounds_FromKilograms_ShouldConvert()
    {
        var weight = Weight.Create(1m, WeightUnit.Kilograms);

        var converted = weight.ToPounds();

        converted.Value.ShouldBe(2.20m, 0.01m);
        converted.Unit.ShouldBe(WeightUnit.Pounds);
    }

    [Fact]
    public void ToPounds_FromPounds_ShouldReturnSame()
    {
        var weight = Weight.Create(5m, WeightUnit.Pounds);

        var converted = weight.ToPounds();

        converted.ShouldBe(weight);
    }

    [Fact]
    public void ToKilograms_FromPounds_ShouldConvert()
    {
        var weight = Weight.Create(1m, WeightUnit.Pounds);

        var converted = weight.ToKilograms();

        converted.Value.ShouldBe(0.45m, 0.01m);
        converted.Unit.ShouldBe(WeightUnit.Kilograms);
    }

    [Fact]
    public void ToKilograms_FromKilograms_ShouldReturnSame()
    {
        var weight = Weight.Create(5m, WeightUnit.Kilograms);

        var converted = weight.ToKilograms();

        converted.ShouldBe(weight);
    }

    [Fact]
    public void Equality_WithSameValueAndUnit_ShouldBeEqual()
    {
        var weight1 = Weight.Create(5m, WeightUnit.Pounds);
        var weight2 = Weight.Create(5m, WeightUnit.Pounds);

        weight1.ShouldBe(weight2);
    }

    [Fact]
    public void Equality_WithDifferentUnit_ShouldNotBeEqual()
    {
        var weight1 = Weight.Create(5m, WeightUnit.Pounds);
        var weight2 = Weight.Create(5m, WeightUnit.Kilograms);

        weight1.ShouldNotBe(weight2);
    }

    [Fact]
    public void ToString_WithPounds_ShouldFormatCorrectly()
    {
        var weight = Weight.Create(5.5m, WeightUnit.Pounds);

        weight.ToString().ShouldBe("5.50 lbs");
    }

    [Fact]
    public void ToString_WithKilograms_ShouldFormatCorrectly()
    {
        var weight = Weight.Create(2.5m, WeightUnit.Kilograms);

        weight.ToString().ShouldBe("2.50 kg");
    }
}
