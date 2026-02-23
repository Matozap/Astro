# ---------------------------------------------------------
# Dockerfile for Astro.Api
# Build context: repository root (where Astro.slnx lives)
# ---------------------------------------------------------

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer-cached restore
COPY Astro.ServiceDefaults/Astro.ServiceDefaults.csproj Astro.ServiceDefaults/
COPY server/Astro.Domain/Astro.Domain.csproj server/Astro.Domain/
COPY server/Astro.Application/Astro.Application.csproj server/Astro.Application/
COPY server/Astro.Infrastructure/Astro.Infrastructure.csproj server/Astro.Infrastructure/
COPY server/Astro.Api/Astro.Api.csproj server/Astro.Api/

RUN dotnet restore server/Astro.Api/Astro.Api.csproj

# Copy all source code
COPY Astro.ServiceDefaults/ Astro.ServiceDefaults/
COPY server/ server/

# Publish
RUN dotnet publish server/Astro.Api/Astro.Api.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Astro.Api.dll"]
