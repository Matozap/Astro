using Astro.Domain.Products.Entities;

namespace Astro.Api.Products.GraphQL.Types;

/// <summary>
/// GraphQL type for ProductImage entity.
/// </summary>
public class ProductImageType : ObjectType<ProductImage>
{
    protected override void Configure(IObjectTypeDescriptor<ProductImage> descriptor)
    {
        descriptor.Description("Represents a product image.");

        descriptor
            .Field(pi => pi.Id)
            .Description("The unique identifier of the product image.");

        descriptor
            .Field(pi => pi.FileName)
            .Description("The file name of the image.");

        descriptor
            .Field(pi => pi.Url)
            .Description("The URL of the image.");

        descriptor
            .Field(pi => pi.StorageMode)
            .Description("The storage mode of the image.");

        descriptor
            .Field(pi => pi.IsPrimary)
            .Description("Whether this is the primary image for the product.");
    }
}
