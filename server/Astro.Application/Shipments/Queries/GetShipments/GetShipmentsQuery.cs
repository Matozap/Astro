using Astro.Domain.Shipments.Entities;
using MediatR;

namespace Astro.Application.Shipments.Queries.GetShipments;

/// <summary>
/// Query to get all shipments.
/// </summary>
public sealed record GetShipmentsQuery : IRequest<IQueryable<Shipment>>;
