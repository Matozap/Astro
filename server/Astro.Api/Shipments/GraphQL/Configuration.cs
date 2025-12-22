using HotChocolate.Execution.Configuration;

namespace Astro.Api.Shipments.GraphQL;

public static class Configuration
{
    extension(IRequestExecutorBuilder builder)
    {
        public IRequestExecutorBuilder AddShipmentTypeExtensions()
        {
            builder.AddTypeExtension<ShipmentQuery>()
                .AddTypeExtension<ShipmentMutation>()
                .AddTypeExtension<ShipmentSubscription>();

            return builder;
        }

        public IRequestExecutorBuilder AddShipmentModuleTypes()
        {
            builder.AddType<Types.ShipmentType>()
                .AddType<Types.ShipmentAddressType>()
                .AddType<Types.ShipmentAddressSortInputType>()
                .AddType<Types.ShipmentAddressFilterInputType>()
                .AddType<Types.TrackingDetailType>()
                .AddType<Types.ShipmentItemType>()
                .BindRuntimeType<Domain.Shipments.ValueObjects.Address, Types.ShipmentAddressType>();

            return builder;
        }
    }
}
