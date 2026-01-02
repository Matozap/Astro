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
    .ModifyCostOptions(options => options.EnforceCostLimits = !builder.Environment.IsDevelopment())
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

// Add CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200", "http://localhost:5000", "https://localhost:5001","http://localhost:5003")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Ensure database exists and seed data
await app.SeedDatabaseAsync();

// Configure middleware
app.MapDefaultEndpoints();
app.UseCors();
app.UseWebSockets();
app.MapGraphQL();

app.Run();
