using Astro.Domain.Products.Entities;

namespace Astro.Api.Products.GraphQL.Types;

/// <summary>
/// GraphQL type for Product aggregate.
/// </summary>
public class ProductType : ObjectType<Product>
{
    protected override void Configure(IObjectTypeDescriptor<Product> descriptor)
    {
        descriptor.Description("Represents a product in the catalog.");

        descriptor
            .Field(p => p.Id)
            .Description("The unique identifier of the product.");

        descriptor
            .Field(p => p.Name)
            .Description("The name of the product.");

        descriptor
            .Field(p => p.Description)
            .Description("The description of the product.");

        descriptor
            .Field(p => p.Price)
            .Description("The price of the product.");

        descriptor
            .Field(p => p.Sku)
            .Description("The stock keeping unit (SKU) of the product.")
            .Resolve(ctx => ctx.Parent<Product>().Sku.Value);

        descriptor
            .Field(p => p.StockQuantity)
            .Description("The current stock quantity of the product.")
            .Resolve(ctx => ctx.Parent<Product>().StockQuantity.Value);

        descriptor
            .Field(p => p.LowStockThreshold)
            .Description("The threshold below which stock is considered low.");

        descriptor
            .Field(p => p.IsActive)
            .Description("Whether the product is currently active.");

        descriptor
            .Field(p => p.CreatedAt)
            .Description("When the product was created.");

        descriptor
            .Field(p => p.UpdatedAt)
            .Description("When the product was last updated.");

        descriptor
            .Field(p => p.CreatedBy)
            .Description("Who created the product.");

        descriptor
            .Field(p => p.ModifiedBy)
            .Description("Who last modified the product.");

        descriptor
            .Field("isLowStock")
            .Type<BooleanType>()
            .Resolve(ctx => ctx.Parent<Product>().IsLowStock())
            .Description("Whether the product stock is at or below the low stock threshold.");

        descriptor
            .Field(p => p.Details)
            .Description("The product details/attributes.");

        descriptor
            .Field(p => p.Images)
            .Description("The product images.");

        // Ignore domain events
        descriptor.Ignore(p => p.DomainEvents);
    }
}
