using Astro.Domain.Shipments.Entities;

namespace Astro.Api.Shipments.GraphQL.Types;

/// <summary>
/// GraphQL type for TrackingDetail entity.
/// </summary>
public class TrackingDetailType : ObjectType<TrackingDetail>
{
    protected override void Configure(IObjectTypeDescriptor<TrackingDetail> descriptor)
    {
        descriptor.Description("Represents a tracking event in a shipment's history.");

        descriptor
            .Field(td => td.Id)
            .Description("The unique identifier of the tracking detail.");

        descriptor
            .Field(td => td.Status)
            .Description("The status at the time of this tracking event.");

        descriptor
            .Field(td => td.Location)
            .Description("The location where this event occurred.");

        descriptor
            .Field(td => td.Notes)
            .Description("Additional notes about this tracking event.");

        descriptor
            .Field(td => td.Timestamp)
            .Description("When this tracking event occurred.");
    }
}
