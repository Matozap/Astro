var builder = DistributedApplication.CreateBuilder(args);

// database - single unified database for modular monolith
var databaseEngine = builder.AddPostgres("postgres");

var database = databaseEngine.AddDatabase("astrodb");

// API - consolidated modular monolith
var api = builder.AddProject<Projects.Astro_Api>("astro-api")
    .WithReference(database)
    .WithExternalHttpEndpoints();

try
{
    builder.Build().Run();
}
catch (AggregateException ex)
{
    ex.Handle(innerEx => innerEx is TaskCanceledException or OperationCanceledException);
}
