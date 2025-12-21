using Astro.Application.Common;
using Astro.Application.Shipments.Commands.CreateShipment;
using Astro.Domain.Shipments.Abstractions;
using Astro.Domain.Shipments.Entities;
using Astro.Domain.Shipments.Enums;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Shipments.Application;

public class CreateShipmentCommandHandlerTests
{
    private readonly IShipmentRepository _shipmentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateShipmentCommandHandler> _logger;
    private readonly CreateShipmentCommandHandler _handler;

    public CreateShipmentCommandHandlerTests()
    {
        _shipmentRepository = Substitute.For<IShipmentRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<CreateShipmentCommandHandler>>();
        _handler = new CreateShipmentCommandHandler(
            _shipmentRepository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateShipment()
    {
        var command = CreateValidCommand();

        var result = await _handler.Handle(command, CancellationToken.None);

        result.ShouldNotBeNull();
        result.Carrier.ShouldBe("FedEx");
        result.Status.ShouldBe(ShipmentStatus.Pending);
        result.OrderId.ShouldBe(command.OrderId);

        await _shipmentRepository.Received(1).AddAsync(Arg.Any<Shipment>(), Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ShouldCreateShipmentWithItems()
    {
        var command = CreateValidCommand();

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Items.Count.ShouldBe(1);
        result.Items.First().ProductName.ShouldBe("Test Product");
        result.Items.First().Quantity.ShouldBe(2);
    }

    [Fact]
    public async Task Handle_WithCustomTrackingNumber_ShouldUseProvided()
    {
        var command = CreateValidCommand() with { TrackingNumber = "CUSTOM123456" };

        var result = await _handler.Handle(command, CancellationToken.None);

        result.TrackingNumber.Value.ShouldBe("CUSTOM123456");
    }

    [Fact]
    public async Task Handle_WithoutTrackingNumber_ShouldGenerateOne()
    {
        var command = CreateValidCommand() with { TrackingNumber = null };

        var result = await _handler.Handle(command, CancellationToken.None);

        result.TrackingNumber.Value.ShouldStartWith("TRK");
    }

    [Fact]
    public async Task Handle_ShouldSetShipmentAddresses()
    {
        var command = CreateValidCommand();

        var result = await _handler.Handle(command, CancellationToken.None);

        result.OriginAddress.Street.ShouldBe("123 Warehouse St");
        result.OriginAddress.City.ShouldBe("New York");
        result.DestinationAddress.Street.ShouldBe("456 Customer Ave");
        result.DestinationAddress.City.ShouldBe("Los Angeles");
    }

    [Fact]
    public async Task Handle_ShouldSetWeightAndDimensions()
    {
        var command = CreateValidCommand();

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Weight.Value.ShouldBe(5.5m);
        result.Weight.Unit.ShouldBe(WeightUnit.Pounds);
        result.Dimensions.Length.ShouldBe(12m);
        result.Dimensions.Width.ShouldBe(8m);
        result.Dimensions.Height.ShouldBe(6m);
        result.Dimensions.Unit.ShouldBe(DimensionUnit.Inches);
    }

    [Fact]
    public async Task Handle_ShouldAddInitialTrackingDetail()
    {
        var command = CreateValidCommand();

        var result = await _handler.Handle(command, CancellationToken.None);

        result.TrackingDetails.Count.ShouldBe(1);
        result.TrackingDetails.First().Status.ShouldBe(ShipmentStatus.Pending);
    }

    private static CreateShipmentCommand CreateValidCommand()
    {
        return new CreateShipmentCommand(
            OrderId: Guid.NewGuid(),
            Carrier: "FedEx",
            TrackingNumber: null,
            OriginStreet: "123 Warehouse St",
            OriginCity: "New York",
            OriginState: "NY",
            OriginPostalCode: "10001",
            OriginCountry: "USA",
            DestinationStreet: "456 Customer Ave",
            DestinationCity: "Los Angeles",
            DestinationState: "CA",
            DestinationPostalCode: "90001",
            DestinationCountry: "USA",
            Weight: 5.5m,
            WeightUnit: WeightUnit.Pounds,
            Length: 12m,
            Width: 8m,
            Height: 6m,
            DimensionUnit: DimensionUnit.Inches,
            ShippingCost: 15.99m,
            EstimatedDeliveryDate: DateTimeOffset.UtcNow.AddDays(3),
            CreatedBy: "test-user",
            Items:
            [
                new CreateShipmentItemDto(
                    OrderDetailId: Guid.NewGuid(),
                    ProductId: Guid.NewGuid(),
                    ProductName: "Test Product",
                    ProductSku: "SKU123",
                    Quantity: 2)
            ]);
    }
}
