using HotChocolate.Execution.Configuration;

namespace Astro.Api.Orders.GraphQL;

public static class Configuration
{
    extension(IRequestExecutorBuilder builder)
    {
        public IRequestExecutorBuilder AddOrderTypeExtensions()
        {
            builder.AddTypeExtension<OrderQuery>()
                .AddTypeExtension<OrderMutation>()
                .AddTypeExtension<OrderSubscription>();

            return builder;
        }

        public IRequestExecutorBuilder AddOrderModuleTypes()
        {
            builder.AddType<Types.OrderType>()
                .AddType<Types.OrderDetailType>()
                .AddType<Types.OrderStatusType>();

            return builder;
        }
    }
}
