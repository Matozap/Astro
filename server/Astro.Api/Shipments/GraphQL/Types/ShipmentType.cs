using Astro.Domain.Shipments.Entities;

namespace Astro.Api.Shipments.GraphQL.Types;

/// <summary>
/// GraphQL type for Shipment aggregate.
/// </summary>
public class ShipmentType : ObjectType<Shipment>
{
    protected override void Configure(IObjectTypeDescriptor<Shipment> descriptor)
    {
        descriptor.Description("Represents a shipment in the system.");

        descriptor
            .Field(s => s.Id)
            .Description("The unique identifier of the shipment.");

        descriptor
            .Field(s => s.OrderId)
            .Description("The ID of the associated order.");

        descriptor
            .Field(s => s.TrackingNumber)
            .Description("The carrier tracking number.")
            .Resolve(ctx => ctx.Parent<Shipment>().TrackingNumber.Value);

        descriptor
            .Field(s => s.Carrier)
            .Description("The shipping carrier.");

        descriptor
            .Field(s => s.Status)
            .Description("The current status of the shipment.");

        descriptor
            .Field(s => s.OriginAddress)
            .Description("The origin address of the shipment.");

        descriptor
            .Field(s => s.DestinationAddress)
            .Description("The destination address of the shipment.");

        descriptor
            .Field(s => s.Weight)
            .Description("The weight of the shipment.");

        descriptor
            .Field(s => s.Dimensions)
            .Description("The dimensions of the shipment.");

        descriptor
            .Field(s => s.ShippingCost)
            .Description("The cost of shipping.");

        descriptor
            .Field(s => s.EstimatedDeliveryDate)
            .Description("The estimated delivery date.");

        descriptor
            .Field(s => s.ActualDeliveryDate)
            .Description("The actual delivery date (if delivered).");

        descriptor
            .Field(s => s.CreatedAt)
            .Description("When the shipment was created.");

        descriptor
            .Field(s => s.UpdatedAt)
            .Description("When the shipment was last updated.");

        descriptor
            .Field(s => s.CreatedBy)
            .Description("Who created the shipment.");

        descriptor
            .Field(s => s.ModifiedBy)
            .Description("Who last modified the shipment.");

        descriptor
            .Field(s => s.TrackingDetails)
            .Description("The tracking history of the shipment.");

        descriptor
            .Field(s => s.Items)
            .Description("The items included in the shipment.");

        descriptor
            .Field("itemCount")
            .Type<IntType>()
            .Resolve(ctx =>
            {
                var shipment = ctx.Parent<Shipment>();
                return shipment.Items?.Sum(si => si.Quantity) ?? 0;
            })
            .Description("The total number of items in the shipment.");

        // Ignore domain events
        descriptor.Ignore(s => s.DomainEvents);
    }
}
