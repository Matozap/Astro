using Astro.Application.Common;
using Astro.Application.Shipments.Exceptions;
using Astro.Domain.Shipments.Abstractions;
using Astro.Domain.Shipments.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Shipments.Commands.UpdateShipment;

/// <summary>
/// Handler for UpdateShipmentCommand.
/// Handles updating carrier, tracking number, and status depending on what fields are provided.
/// </summary>
public sealed class UpdateShipmentCommandHandler : IRequestHandler<UpdateShipmentCommand, Shipment>
{
    private readonly IShipmentRepository _shipmentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateShipmentCommandHandler> _logger;

    public UpdateShipmentCommandHandler(
        IShipmentRepository shipmentRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateShipmentCommandHandler> logger)
    {
        _shipmentRepository = shipmentRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Shipment> Handle(UpdateShipmentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating shipment {ShipmentId}", request.Id);

        var shipment = await _shipmentRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new ShipmentNotFoundException(request.Id);

        // Update carrier and tracking number if provided (can only be done on pending shipments)
        if (request.Carrier is not null || request.TrackingNumber is not null)
        {
            shipment.UpdateCarrier(
                carrier: request.Carrier,
                trackingNumber: request.TrackingNumber,
                modifiedBy: request.ModifiedBy);
        }

        // Update status if provided
        if (request.Status.HasValue)
        {
            shipment.UpdateStatus(
                newStatus: request.Status.Value,
                location: request.StatusLocation,
                notes: request.StatusNotes,
                modifiedBy: request.ModifiedBy);
        }
        else if (request.StatusLocation is not null || request.StatusNotes is not null)
        {
            // Add tracking detail without status change
            shipment.AddTrackingDetail(
                location: request.StatusLocation,
                notes: request.StatusNotes,
                modifiedBy: request.ModifiedBy);
        }

        _shipmentRepository.Update(shipment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Shipment {ShipmentId} updated successfully", request.Id);

        return shipment;
    }
}
