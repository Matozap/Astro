using HotChocolate.Execution.Configuration;

namespace Astro.Api.Payments.GraphQL;

public static class Configuration
{
    extension(IRequestExecutorBuilder builder)
    {
        public IRequestExecutorBuilder AddPaymentTypeExtensions()
        {
            builder.AddTypeExtension<PaymentMutation>()
                .AddTypeExtension<PaymentSubscription>();

            return builder;
        }

        public IRequestExecutorBuilder AddPaymentModuleTypes()
        {
            builder.AddType<Types.PaymentType>()
                .AddType<Types.PaymentStatusType>();

            return builder;
        }
    }
}
