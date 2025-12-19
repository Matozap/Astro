using Astro.Domain.Orders.Enums;

namespace Astro.Api.Orders.GraphQL.Types;

/// <summary>
/// GraphQL enum type for OrderStatus.
/// </summary>
public class OrderStatusType : EnumType<OrderStatus>
{
    protected override void Configure(IEnumTypeDescriptor<OrderStatus> descriptor)
    {
        descriptor.Name("OrderStatus");
        descriptor.Description("The status of an order.");

        descriptor.Value(OrderStatus.Pending)
            .Description("Order has been placed but not yet confirmed.");

        descriptor.Value(OrderStatus.Confirmed)
            .Description("Order has been confirmed and is awaiting processing.");

        descriptor.Value(OrderStatus.Processing)
            .Description("Order is being prepared for shipment.");

        descriptor.Value(OrderStatus.Shipped)
            .Description("Order has been shipped.");

        descriptor.Value(OrderStatus.Delivered)
            .Description("Order has been delivered to the customer.");

        descriptor.Value(OrderStatus.Cancelled)
            .Description("Order has been cancelled.");
    }
}
