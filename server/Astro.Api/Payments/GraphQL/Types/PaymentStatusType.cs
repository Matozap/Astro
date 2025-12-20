using Astro.Domain.Payments.Enums;

namespace Astro.Api.Payments.GraphQL.Types;

/// <summary>
/// GraphQL enum type for PaymentStatus.
/// </summary>
public class PaymentStatusType : EnumType<PaymentStatus>
{
    protected override void Configure(IEnumTypeDescriptor<PaymentStatus> descriptor)
    {
        descriptor.Name("PaymentStatus");
        descriptor.Description("The status of a payment.");

        descriptor.Value(PaymentStatus.Pending)
            .Description("Payment has been created but not yet processed.");

        descriptor.Value(PaymentStatus.Successful)
            .Description("Payment has been successfully processed.");

        descriptor.Value(PaymentStatus.Failed)
            .Description("Payment processing has failed.");
    }
}
