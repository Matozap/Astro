using Astro.Application.Common;
using Astro.Domain.Shipments.Abstractions;
using Astro.Domain.Shipments.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Shipments.Commands.CreateShipment;

/// <summary>
/// Handler for CreateShipmentCommand.
/// </summary>
public sealed class CreateShipmentCommandHandler : IRequestHandler<CreateShipmentCommand, Shipment>
{
    private readonly IShipmentRepository _shipmentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateShipmentCommandHandler> _logger;

    public CreateShipmentCommandHandler(
        IShipmentRepository shipmentRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateShipmentCommandHandler> logger)
    {
        _shipmentRepository = shipmentRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Shipment> Handle(CreateShipmentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating shipment for order {OrderId}", request.OrderId);

        // Create the shipment
        var shipment = Shipment.Create(
            orderId: request.OrderId,
            carrier: request.Carrier,
            originStreet: request.OriginStreet,
            originCity: request.OriginCity,
            originState: request.OriginState,
            originPostalCode: request.OriginPostalCode,
            originCountry: request.OriginCountry,
            destinationStreet: request.DestinationStreet,
            destinationCity: request.DestinationCity,
            destinationState: request.DestinationState,
            destinationPostalCode: request.DestinationPostalCode,
            destinationCountry: request.DestinationCountry,
            weightValue: request.Weight,
            weightUnit: request.WeightUnit,
            length: request.Length,
            width: request.Width,
            height: request.Height,
            dimensionUnit: request.DimensionUnit,
            shippingCost: request.ShippingCost,
            estimatedDeliveryDate: request.EstimatedDeliveryDate,
            createdBy: request.CreatedBy,
            trackingNumber: request.TrackingNumber);

        // Add shipment items
        foreach (var itemDto in request.Items)
        {
            shipment.AddItem(
                orderDetailId: itemDto.OrderDetailId,
                productId: itemDto.ProductId,
                productName: itemDto.ProductName,
                productSku: itemDto.ProductSku,
                quantity: itemDto.Quantity);
        }

        await _shipmentRepository.AddAsync(shipment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Shipment {ShipmentId} created with tracking number {TrackingNumber}",
            shipment.Id,
            shipment.TrackingNumber.Value);

        return shipment;
    }
}
