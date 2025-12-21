using Astro.Domain.Shipments.ValueObjects;
using HotChocolate.Data.Filters;
using HotChocolate.Data.Sorting;

namespace Astro.Api.Shipments.GraphQL.Types;

/// <summary>
/// GraphQL type for Shipment Address value object.
/// Named differently to avoid conflict with Order's Address type.
/// </summary>
public class ShipmentAddressType : ObjectType<Address>
{
    protected override void Configure(IObjectTypeDescriptor<Address> descriptor)
    {
        descriptor.Name("ShipmentAddress");
        descriptor.Description("Represents a shipping address with contact information.");

        descriptor
            .Field(a => a.Street)
            .Description("The street address.");

        descriptor
            .Field(a => a.City)
            .Description("The city.");

        descriptor
            .Field(a => a.State)
            .Description("The state or province.");

        descriptor
            .Field(a => a.PostalCode)
            .Description("The postal code.");

        descriptor
            .Field(a => a.Country)
            .Description("The country.");

        descriptor
            .Field(a => a.ContactName)
            .Description("The contact person's name.");

        descriptor
            .Field(a => a.ContactPhone)
            .Description("The contact phone number.");
    }
}

/// <summary>
/// Sort input type for Shipment Address to avoid naming conflict with Order's Address.
/// </summary>
public class ShipmentAddressSortInputType : SortInputType<Address>
{
    protected override void Configure(ISortInputTypeDescriptor<Address> descriptor)
    {
        descriptor.Name("ShipmentAddressSortInput");
    }
}

/// <summary>
/// Filter input type for Shipment Address to avoid naming conflict with Order's Address.
/// </summary>
public class ShipmentAddressFilterInputType : FilterInputType<Address>
{
    protected override void Configure(IFilterInputTypeDescriptor<Address> descriptor)
    {
        descriptor.Name("ShipmentAddressFilterInput");
    }
}
