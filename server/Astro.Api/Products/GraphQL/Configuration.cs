using HotChocolate.Execution.Configuration;

namespace Astro.Api.Products.GraphQL;

public static class Configuration
{
    extension(IRequestExecutorBuilder builder)
    {
        public IRequestExecutorBuilder AddProductTypeExtensions()
        {
            builder.AddTypeExtension<ProductQuery>()
                .AddTypeExtension<ProductMutation>()
                .AddTypeExtension<ProductSubscription>();

            return builder;
        }

        public IRequestExecutorBuilder AddProductModuleTypes()
        {
            builder.AddType<Types.ProductType>()
                .AddType<Types.ProductDetailType>()
                .AddType<Types.ProductImageType>()
                .AddType<Types.StorageModeType>();

            return builder;
        }
    }
}