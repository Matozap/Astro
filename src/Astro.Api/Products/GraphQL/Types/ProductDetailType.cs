using Astro.Domain.Products.Entities;

namespace Astro.Api.Products.GraphQL.Types;

/// <summary>
/// GraphQL type for ProductDetail entity.
/// </summary>
public class ProductDetailType : ObjectType<ProductDetail>
{
    protected override void Configure(IObjectTypeDescriptor<ProductDetail> descriptor)
    {
        descriptor.Description("Represents a key-value attribute of a product.");

        descriptor
            .Field(d => d.Id)
            .Description("The unique identifier of the detail.");

        descriptor
            .Field(d => d.Key)
            .Description("The attribute key.");

        descriptor
            .Field(d => d.Value)
            .Description("The attribute value.");
    }
}
