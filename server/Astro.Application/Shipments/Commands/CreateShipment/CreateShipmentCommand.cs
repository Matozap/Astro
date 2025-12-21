using Astro.Domain.Shipments.Entities;
using Astro.Domain.Shipments.Enums;
using MediatR;

namespace Astro.Application.Shipments.Commands.CreateShipment;

/// <summary>
/// Command to create a new shipment.
/// </summary>
public sealed record CreateShipmentCommand(
    Guid OrderId,
    string Carrier,
    string? TrackingNumber,
    string OriginStreet,
    string OriginCity,
    string OriginState,
    string OriginPostalCode,
    string OriginCountry,
    string DestinationStreet,
    string DestinationCity,
    string DestinationState,
    string DestinationPostalCode,
    string DestinationCountry,
    decimal Weight,
    WeightUnit WeightUnit,
    decimal Length,
    decimal Width,
    decimal Height,
    DimensionUnit DimensionUnit,
    decimal ShippingCost,
    DateTimeOffset? EstimatedDeliveryDate,
    string CreatedBy,
    List<CreateShipmentItemDto> Items) : IRequest<Shipment>;

/// <summary>
/// DTO for shipment item in create command.
/// </summary>
public sealed record CreateShipmentItemDto(
    Guid OrderDetailId,
    Guid ProductId,
    string ProductName,
    string ProductSku,
    int Quantity);
