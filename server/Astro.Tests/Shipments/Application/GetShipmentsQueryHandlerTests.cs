using Astro.Application.Shipments.Queries.GetShipments;
using Astro.Domain.Shipments.Abstractions;
using Astro.Domain.Shipments.Entities;
using Astro.Domain.Shipments.Enums;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Shipments.Application;

public class GetShipmentsQueryHandlerTests
{
    private readonly IShipmentRepository _shipmentRepository;
    private readonly GetShipmentsQueryHandler _handler;

    public GetShipmentsQueryHandlerTests()
    {
        _shipmentRepository = Substitute.For<IShipmentRepository>();
        _handler = new GetShipmentsQueryHandler(_shipmentRepository);
    }

    [Fact]
    public async Task Handle_ShouldReturnQueryableFromRepository()
    {
        var shipments = new List<Shipment>
        {
            CreateTestShipment(),
            CreateTestShipment()
        }.AsQueryable();

        _shipmentRepository.GetAll().Returns(shipments);

        var query = new GetShipmentsQuery();
        var result = await _handler.Handle(query, CancellationToken.None);

        result.ShouldNotBeNull();
        result.Count().ShouldBe(2);
        _shipmentRepository.Received(1).GetAll();
    }

    [Fact]
    public async Task Handle_WithEmptyRepository_ShouldReturnEmptyQueryable()
    {
        var shipments = new List<Shipment>().AsQueryable();
        _shipmentRepository.GetAll().Returns(shipments);

        var query = new GetShipmentsQuery();
        var result = await _handler.Handle(query, CancellationToken.None);

        result.ShouldNotBeNull();
        result.Count().ShouldBe(0);
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
