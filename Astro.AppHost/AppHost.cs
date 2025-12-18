var builder = DistributedApplication.CreateBuilder(args);

// PostgreSQL database - single unified database for modular monolith
var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin();

var astrodb = postgres.AddDatabase("astrodb");

// Astro API - consolidated modular monolith
var astroApi = builder.AddProject<Projects.Astro_Api>("astro-api")
    .WithReference(astrodb)
    .WithExternalHttpEndpoints();

builder.Build().Run();
