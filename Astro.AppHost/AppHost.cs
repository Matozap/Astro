var builder = DistributedApplication.CreateBuilder(args);

// database - single unified database for modular monolith
var databaseEngine = builder.AddPostgres("postgres");

var database = databaseEngine.AddDatabase("astrodb");

// API - consolidated modular monolith
var api = builder.AddProject<Projects.Astro_Api>("astro-api")
    .WithReference(databaseEngine)
    .WithReference(database)
    .WaitForStart(database)
    .WithExternalHttpEndpoints();

// Angular Frontend Client (uses 4200 but needs a different port for aspire dashboard)
var translatedPort = 4201;
var client = builder.AddNpmApp("client", "../client")
    .WithReference(api)
    .WithHttpEndpoint(port: translatedPort, env: "PORT")
    .WaitFor(api)
    .WithExternalHttpEndpoints();

try
{
    builder.Build().Run();
}
catch (AggregateException ex)
{
    ex.Handle(innerEx => innerEx is TaskCanceledException or OperationCanceledException);
}
