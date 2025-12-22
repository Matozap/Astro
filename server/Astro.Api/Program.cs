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
    // Register Products module
    .AddProductTypeExtensions()
    .AddProductModuleTypes()
    // Register Orders module
    .AddOrderTypeExtensions()
    .AddOrderModuleTypes()
    // Register Payments module
    .AddPaymentTypeExtensions()
    .AddPaymentModuleTypes()
    // Register Shipments module
    .AddShipmentTypeExtensions()
    .AddShipmentModuleTypes()
    // Configure data operations
    .AddProjections()
    .AddFiltering()
    .AddSorting()
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
