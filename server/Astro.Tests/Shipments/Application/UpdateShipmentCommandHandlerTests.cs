using Astro.Application.Common;
using Astro.Application.Shipments.Commands.UpdateShipment;
using Astro.Application.Shipments.Exceptions;
using Astro.Domain.Shipments.Abstractions;
using Astro.Domain.Shipments.Entities;
using Astro.Domain.Shipments.Enums;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using Shouldly;
using Xunit;

namespace Astro.Tests.Shipments.Application;

public class UpdateShipmentCommandHandlerTests
{
    private readonly IShipmentRepository _shipmentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateShipmentCommandHandler> _logger;
    private readonly UpdateShipmentCommandHandler _handler;

    public UpdateShipmentCommandHandlerTests()
    {
        _shipmentRepository = Substitute.For<IShipmentRepository>();
        _unitOfWork = Substitute.For<IUnitOfWork>();
        _logger = Substitute.For<ILogger<UpdateShipmentCommandHandler>>();
        _handler = new UpdateShipmentCommandHandler(
            _shipmentRepository, _unitOfWork, _logger);
    }

    [Fact]
    public async Task Handle_WithNonExistentShipment_ShouldThrowNotFoundException()
    {
        var command = new UpdateShipmentCommand(
            Id: Guid.NewGuid(),
            Carrier: "UPS",
            TrackingNumber: null,
            Status: null,
            StatusLocation: null,
            StatusNotes: null,
            ModifiedBy: "test-user");

        _shipmentRepository.GetByIdWithDetailsAsync(command.Id, Arg.Any<CancellationToken>())
            .ReturnsNull();

        await Should.ThrowAsync<ShipmentNotFoundException>(() =>
            _handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithCarrierUpdate_ShouldUpdateCarrier()
    {
        var shipment = CreateTestShipment();
        var command = new UpdateShipmentCommand(
            Id: shipment.Id,
            Carrier: "UPS",
            TrackingNumber: "NEWTRACK123456",
            Status: null,
            StatusLocation: null,
            StatusNotes: null,
            ModifiedBy: "test-user");

        _shipmentRepository.GetByIdWithDetailsAsync(command.Id, Arg.Any<CancellationToken>())
            .Returns(shipment);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Carrier.ShouldBe("UPS");
        result.TrackingNumber.Value.ShouldBe("NEWTRACK123456");
        _shipmentRepository.Received(1).Update(shipment);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithStatusUpdate_ShouldUpdateStatus()
    {
        var shipment = CreateTestShipment();
        var command = new UpdateShipmentCommand(
            Id: shipment.Id,
            Carrier: null,
            TrackingNumber: null,
            Status: ShipmentStatus.Shipped,
            StatusLocation: "Distribution Center",
            StatusNotes: "Package picked up",
            ModifiedBy: "test-user");

        _shipmentRepository.GetByIdWithDetailsAsync(command.Id, Arg.Any<CancellationToken>())
            .Returns(shipment);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Status.ShouldBe(ShipmentStatus.Shipped);
        result.ModifiedBy.ShouldBe("test-user");
    }

    [Fact]
    public async Task Handle_WithTrackingDetailOnly_ShouldAddTrackingDetail()
    {
        var shipment = CreateTestShipment();
        var initialTrackingCount = shipment.TrackingDetails.Count;

        var command = new UpdateShipmentCommand(
            Id: shipment.Id,
            Carrier: null,
            TrackingNumber: null,
            Status: null,
            StatusLocation: "Sorting facility",
            StatusNotes: "Package scanned",
            ModifiedBy: "test-user");

        _shipmentRepository.GetByIdWithDetailsAsync(command.Id, Arg.Any<CancellationToken>())
            .Returns(shipment);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.TrackingDetails.Count.ShouldBe(initialTrackingCount + 1);
        result.Status.ShouldBe(ShipmentStatus.Pending); // Status unchanged
    }

    private static Shipment CreateTestShipment()
    {
        return Shipment.Create(
            orderId: Guid.NewGuid(),
            carrier: "FedEx",
            originStreet: "123 Warehouse St",
            originCity: "New York",
            originState: "NY",
            originPostalCode: "10001",
            originCountry: "USA",
            destinationStreet: "456 Customer Ave",
            destinationCity: "Los Angeles",
            destinationState: "CA",
            destinationPostalCode: "90001",
            destinationCountry: "USA",
            weightValue: 5.5m,
            weightUnit: WeightUnit.Pounds,
            length: 12m,
            width: 8m,
            height: 6m,
            dimensionUnit: DimensionUnit.Inches,
            shippingCost: 15.99m,
            estimatedDeliveryDate: DateTimeOffset.UtcNow.AddDays(3),
            createdBy: "test-user");
    }
}
