using Astro.Domain.Shipments.Entities;
using Astro.Domain.Shipments.Enums;
using MediatR;

namespace Astro.Application.Shipments.Commands.UpdateShipment;

/// <summary>
/// Command to update an existing shipment.
/// All fields are optional except Id and ModifiedBy.
/// This allows updating carrier, tracking number, status, etc. depending on what is sent.
/// </summary>
public sealed record UpdateShipmentCommand(
    Guid Id,
    string? Carrier,
    string? TrackingNumber,
    ShipmentStatus? Status,
    string? StatusLocation,
    string? StatusNotes,
    string ModifiedBy) : IRequest<Shipment>;
