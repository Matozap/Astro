using Astro.Domain.Orders.Entities;

namespace Astro.Api.Orders.GraphQL.Types;

/// <summary>
/// GraphQL type for Order aggregate.
/// </summary>
public class OrderType : ObjectType<Order>
{
    protected override void Configure(IObjectTypeDescriptor<Order> descriptor)
    {
        descriptor.Description("Represents an order in the system.");

        descriptor
            .Field(o => o.Id)
            .Description("The unique identifier of the order.");

        descriptor
            .Field(o => o.OrderNumber)
            .Description("The human-readable order number.")
            .Resolve(ctx => ctx.Parent<Order>().OrderNumber.Value);

        descriptor
            .Field(o => o.CustomerName)
            .Description("The name of the customer.");

        descriptor
            .Field(o => o.CustomerEmail)
            .Description("The email address of the customer.")
            .Resolve(ctx => ctx.Parent<Order>().CustomerEmail.Value);

        descriptor
            .Field(o => o.ShippingAddress)
            .Description("The shipping address for the order.");

        descriptor
            .Field(o => o.Status)
            .Description("The current status of the order.");

        descriptor
            .Field(o => o.TotalAmount)
            .Description("The total amount of the order.");

        descriptor
            .Field(o => o.Notes)
            .Description("Additional notes for the order.");

        descriptor
            .Field(o => o.CreatedAt)
            .Description("When the order was created.");

        descriptor
            .Field(o => o.UpdatedAt)
            .Description("When the order was last updated.");

        descriptor
            .Field(o => o.CreatedBy)
            .Description("Who created the order.");

        descriptor
            .Field(o => o.ModifiedBy)
            .Description("Who last modified the order.");

        descriptor
            .Field(o => o.Details)
            .Description("The line items in the order.");

        descriptor
            .Field("itemCount")
            .Type<IntType>()
            .Resolve(ctx =>
            {
                var order = ctx.Parent<Order>();
                return order.Details?.Sum(od => od.Quantity) ?? 0;
            })
            .Description("The total number of items in the order.");

        // Ignore domain events
        descriptor.Ignore(o => o.DomainEvents);
    }
}
