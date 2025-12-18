# Quickstart: Astro Development Setup

**Date**: 2025-12-14
**Platform**: .NET 10.0 with Aspire

## Prerequisites

- .NET SDK 10.0.100 or later
- Docker Desktop (for PostgreSQL and RabbitMQ)
- IDE: Visual Studio 2022, Rider, or VS Code with C# Dev Kit

## Getting Started

### 1. Clone and Open

```bash
cd D:\Local\src\Matozap\Astro
```

Open `Astro.slnx` in your preferred IDE.

### 2. Start the Application

The easiest way to run Astro is via the Aspire AppHost:

**Visual Studio / Rider:**
- Set `Astro.AppHost` as the startup project
- Press F5 or click Run

**Command Line:**
```bash
dotnet run --project Astro.AppHost
```

This will automatically:
- Start PostgreSQL container with `productsdb` and `ordersdb` databases
- Start RabbitMQ container with management UI
- Start Products.Api service
- Start Orders.Api service
- Open the Aspire Dashboard

### 3. Access Services

| Service | URL | Notes |
|---------|-----|-------|
| Aspire Dashboard | http://localhost:15000 | Service discovery, logs, traces |
| Products API | http://localhost:5001/graphql | GraphQL Playground |
| Orders API | http://localhost:5002/graphql | GraphQL Playground |
| PgAdmin | http://localhost:5050 | Database management |
| RabbitMQ Management | http://localhost:15672 | Message broker UI |

**RabbitMQ Credentials:**
- Username: `admin`
- Password: `admin`

### 4. Verify Setup

Open Products API GraphQL Playground and run:

```graphql
query {
  products {
    nodes {
      id
      name
      sku
      price
    }
  }
}
```

---

## Development Workflow

### Adding a New Feature

1. Identify the target module (Products, Orders, or new module)
2. Follow the layer structure:
   - Domain: Entities, value objects, domain events
   - Application: Commands, queries, handlers, validators
   - Infrastructure: Repository implementations
   - API: GraphQL types, mutations, queries
   - Tests: Unit tests for all handlers and domain logic

### Running Tests

```bash
# Run all tests
dotnet test

# Run specific module tests
dotnet test Products/Products.Tests
dotnet test Orders/Orders.Tests

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Database Migrations

```bash
# Add migration (from solution root)
dotnet ef migrations add <MigrationName> \
  --project Products/Products.Infrastructure \
  --startup-project Astro.AppHost \
  --context ProductsDbContext

# Apply migrations (automatic on startup, or manual)
dotnet ef database update \
  --project Products/Products.Infrastructure \
  --startup-project Astro.AppHost \
  --context ProductsDbContext
```

### Code Style

- Language version: C# 14.0
- Nullable reference types: Enabled
- Follow existing patterns in the codebase
- Use FluentValidation for command validation
- Use MediatR for CQRS handlers

---

## Project Structure

```
Astro/
├── Astro.AppHost/           # Aspire orchestration
├── Astro.ServiceDefaults/   # Shared service configuration
│
├── Products/
│   ├── Products.Domain/     # Entities, value objects, events
│   ├── Products.Application/# Commands, queries, handlers
│   ├── Products.Infrastructure/ # EF Core, repositories
│   ├── Products.Api/        # GraphQL API
│   └── Products.Tests/      # Unit tests
│
├── Orders/
│   ├── Orders.Domain/
│   ├── Orders.Application/
│   ├── Orders.Infrastructure/
│   ├── Orders.Api/
│   └── Orders.Tests/
│
├── Shared/
│   └── Shared.Contracts/    # Integration events
│
└── specs/                   # Design documents
    └── main/
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── quickstart.md
        └── contracts/
```

---

## Common Tasks

### Create a New Command

1. Create command record in `[Module].Application/Commands/`:
   ```csharp
   public record CreateFooCommand(string Name) : IRequest<Foo>;
   ```

2. Create validator in same folder:
   ```csharp
   public class CreateFooCommandValidator : AbstractValidator<CreateFooCommand>
   {
       public CreateFooCommandValidator()
       {
           RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
       }
   }
   ```

3. Create handler:
   ```csharp
   public class CreateFooCommandHandler : IRequestHandler<CreateFooCommand, Foo>
   {
       // Implementation
   }
   ```

4. Create unit tests in `[Module].Tests/`:
   ```csharp
   public class CreateFooCommandHandlerTests
   {
       // Tests with mocked dependencies
   }
   ```

### Add GraphQL Mutation

1. Add mutation method in `[Module].Api/GraphQL/Mutation.cs`:
   ```csharp
   [UseMutationConvention]
   public async Task<Foo> CreateFoo(CreateFooCommand command, [Service] ISender sender)
       => await sender.Send(command);
   ```

2. Add type if needed in `[Module].Api/GraphQL/Types/`

### Publish Integration Event

1. Inject `IEventPublisher` in command handler
2. Publish after successful operation:
   ```csharp
   await _eventPublisher.PublishAsync(new FooCreatedEvent { ... });
   ```

---

## Troubleshooting

### Docker Issues

If containers don't start:
```bash
docker system prune -f
docker volume prune -f
```

Then restart the AppHost.

### Database Connection Issues

Check connection strings in Aspire Dashboard under Resources → PostgreSQL.

### Message Broker Issues

Verify RabbitMQ is running:
```bash
docker ps | grep rabbitmq
```

Check RabbitMQ Management UI for queue status.

---

## Additional Resources

- [.NET Aspire Documentation](https://learn.microsoft.com/en-us/dotnet/aspire/)
- [HotChocolate GraphQL](https://chillicream.com/docs/hotchocolate)
- [MediatR](https://github.com/jbogard/MediatR)
- [FluentValidation](https://docs.fluentvalidation.net/)
