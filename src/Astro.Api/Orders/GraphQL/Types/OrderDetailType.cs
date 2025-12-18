using Astro.Domain.Orders.Entities;

namespace Astro.Api.Orders.GraphQL.Types;

/// <summary>
/// GraphQL type for OrderDetail entity.
/// </summary>
public class OrderDetailType : ObjectType<OrderDetail>
{
    protected override void Configure(IObjectTypeDescriptor<OrderDetail> descriptor)
    {
        descriptor.Description("Represents a line item in an order.");

        descriptor
            .Field(od => od.Id)
            .Description("The unique identifier of the order detail.");

        descriptor
            .Field(od => od.ProductId)
            .Description("The ID of the product.");

        descriptor
            .Field(od => od.ProductName)
            .Description("The name of the product at the time of order.");

        descriptor
            .Field(od => od.ProductSku)
            .Description("The SKU of the product at the time of order.");

        descriptor
            .Field(od => od.Quantity)
            .Description("The quantity ordered.");

        descriptor
            .Field(od => od.UnitPrice)
            .Description("The unit price at the time of order.");

        descriptor
            .Field(od => od.LineTotal)
            .Description("The total price for this line item.");
    }
}
