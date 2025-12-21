using Astro.Api.Base;
using Astro.Api.Base.Options;
using Astro.Api.Orders.GraphQL;
using Astro.Api.Payments.GraphQL;
using Astro.Api.Products.GraphQL;
using Astro.Api.Shipments.GraphQL;
using Astro.Application.Common;
using Astro.Infrastructure.Common;
using Astro.ServiceDefaults;
using static Astro.Infrastructure.Common.DatabaseSeeder;

var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults
builder.AddServiceDefaults();

// Add PostgreSQL with EF Core
builder.AddAstroDbContext("astrodb");

// Add API configuration
builder.Services.Configure<ApiInfoOptions>(builder.Configuration.GetSection(ApiInfoOptions.SectionName));

// Add Application layer (MediatR, Validators)
builder.Services.AddApplication();

// Add Infrastructure layer (Repositories, UnitOfWork)
builder.Services.AddInfrastructure();

// Add GraphQL with HotChocolate
builder.Services
    .AddGraphQLServer()
    // Register root types with utility operations
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddSubscriptionType<Subscription>()
    // Register Products module as type extensions
    .AddTypeExtension<ProductQuery>()
    .AddTypeExtension<ProductMutation>()
    .AddTypeExtension<ProductSubscription>()
    // Register Orders module as type extensions
    .AddTypeExtension<OrderQuery>()
    .AddTypeExtension<OrderMutation>()
    .AddTypeExtension<OrderSubscription>()
    // Register Payments module as type extensions
    .AddTypeExtension<PaymentMutation>()
    .AddTypeExtension<PaymentSubscription>()
    // Register Products module types
    .AddType<Astro.Api.Products.GraphQL.Types.ProductType>()
    .AddType<Astro.Api.Products.GraphQL.Types.ProductDetailType>()
    .AddType<Astro.Api.Products.GraphQL.Types.ProductImageType>()
    .AddType<Astro.Api.Products.GraphQL.Types.StorageModeType>()
    // Register Orders module types
    .AddType<Astro.Api.Orders.GraphQL.Types.OrderType>()
    .AddType<Astro.Api.Orders.GraphQL.Types.OrderDetailType>()
    .AddType<Astro.Api.Orders.GraphQL.Types.OrderStatusType>()
    // Register Payments module types
    .AddType<Astro.Api.Payments.GraphQL.Types.PaymentType>()
    .AddType<Astro.Api.Payments.GraphQL.Types.PaymentStatusType>()
    // Register Shipments module as type extensions
    .AddTypeExtension<ShipmentQuery>()
    .AddTypeExtension<ShipmentMutation>()
    .AddTypeExtension<ShipmentSubscription>()
    // Register Shipments module types
    .AddType<Astro.Api.Shipments.GraphQL.Types.ShipmentType>()
    .AddType<Astro.Api.Shipments.GraphQL.Types.ShipmentAddressType>()
    .AddType<Astro.Api.Shipments.GraphQL.Types.ShipmentAddressSortInputType>()
    .AddType<Astro.Api.Shipments.GraphQL.Types.ShipmentAddressFilterInputType>()
    .AddType<Astro.Api.Shipments.GraphQL.Types.TrackingDetailType>()
    .AddType<Astro.Api.Shipments.GraphQL.Types.ShipmentItemType>()
    .AddProjections()
    .AddFiltering()
    .AddSorting()
    .BindRuntimeType<Astro.Domain.Shipments.ValueObjects.Address, Astro.Api.Shipments.GraphQL.Types.ShipmentAddressType>()
    .AddMutationConventions()
    .AddInMemorySubscriptions()
    .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = builder.Environment.IsDevelopment())
    .InitializeOnStartup();

// Add WebSockets for GraphQL subscriptions
builder.Services.AddCors();

var app = builder.Build();

// Ensure database exists and seed data
await app.SeedDatabaseAsync();

// Configure middleware
app.MapDefaultEndpoints();
app.UseWebSockets();
app.MapGraphQL();

app.Run();
