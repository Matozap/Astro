using Astro.Domain.Payments.Entities;

namespace Astro.Api.Payments.GraphQL.Types;

/// <summary>
/// GraphQL type for Payment aggregate.
/// </summary>
public class PaymentType : ObjectType<Payment>
{
    protected override void Configure(IObjectTypeDescriptor<Payment> descriptor)
    {
        descriptor.Description("Represents a payment for an order in the system.");

        descriptor
            .Field(p => p.Id)
            .Description("The unique identifier of the payment.");

        descriptor
            .Field(p => p.OrderId)
            .Description("The ID of the order this payment is for.");

        descriptor
            .Field(p => p.Status)
            .Description("The current status of the payment.");

        descriptor
            .Field(p => p.CreatedAt)
            .Description("When the payment was created.");

        descriptor
            .Field(p => p.UpdatedAt)
            .Description("When the payment was last updated.");

        descriptor
            .Field(p => p.Order)
            .Description("The order associated with this payment.");

        // Ignore domain events
        descriptor.Ignore(p => p.DomainEvents);
    }
}
