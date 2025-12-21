using Astro.Domain.Shipments.Abstractions;
using Astro.Domain.Shipments.Entities;
using MediatR;

namespace Astro.Application.Shipments.Queries.GetShipments;

/// <summary>
/// Handler for GetShipmentsQuery.
/// Returns IQueryable for deferred execution and LINQ composition.
/// </summary>
public sealed class GetShipmentsQueryHandler : IRequestHandler<GetShipmentsQuery, IQueryable<Shipment>>
{
    private readonly IShipmentRepository _shipmentRepository;

    public GetShipmentsQueryHandler(IShipmentRepository shipmentRepository)
    {
        _shipmentRepository = shipmentRepository;
    }

    public Task<IQueryable<Shipment>> Handle(GetShipmentsQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(_shipmentRepository.GetAll());
    }
}
