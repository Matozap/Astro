using Astro.Domain.Shipments.Entities;

namespace Astro.Api.Shipments.GraphQL.Types;

/// <summary>
/// GraphQL type for ShipmentItem entity.
/// </summary>
public class ShipmentItemType : ObjectType<ShipmentItem>
{
    protected override void Configure(IObjectTypeDescriptor<ShipmentItem> descriptor)
    {
        descriptor.Description("Represents an item included in a shipment.");

        descriptor
            .Field(si => si.Id)
            .Description("The unique identifier of the shipment item.");

        descriptor
            .Field(si => si.OrderDetailId)
            .Description("The ID of the associated order detail.");

        descriptor
            .Field(si => si.ProductId)
            .Description("The ID of the product.");

        descriptor
            .Field(si => si.ProductName)
            .Description("The name of the product.");

        descriptor
            .Field(si => si.ProductSku)
            .Description("The SKU of the product.");

        descriptor
            .Field(si => si.Quantity)
            .Description("The quantity of this product in the shipment.");
    }
}
