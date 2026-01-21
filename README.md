# Astro

---


## What It this useless project

A modular monolith built on .NET 10 and C# 14, exposing a GraphQL API for managing products and orders. Orchestrated through .NET Aspire.

```
server/
├── Astro.Api/            # GraphQL gateway (HotChocolate)
├── Astro.Application/    # Commands, queries, handlers
├── Astro.Domain/         # Entities, value objects, domain events
├── Astro.Infrastructure/ # Persistence, repositories (EF Core)

client/                   # Angular 19 frontend
├── src/app/core/         # Auth, layout, GraphQL config
├── src/app/features/     # Dashboard, products, orders, payments, shipments
├── src/app/shared/       # Reusable components and models
```

---

## The Architecture

Clean Architecture is often described as a set of concentric circles. But circles imply closure—completeness. Software is never complete. It is, at best, *momentarily coherent*.

The domain layer knows nothing of databases or HTTP. It speaks only of `Products`, `Orders`, `Money`, and `Sku`—concepts that would exist even if computers didn't. The infrastructure layer handles the messy business of making ideas persist beyond the death of a process.

Between them sits the application layer, translating intention into action through commands and queries. 
---

## On Value Objects

Why wrap a `decimal` in a `Money` type? Why constrain a string into a `Sku`?

Because meaning matters. A price is not a number—it is a number *with currency*, *with context*, *with constraints*. By encoding these truths into the type system, we make illegal states unrepresentable. The compiler becomes our collaborator in maintaining coherence.

```csharp
Money.FromDecimal(99.99m, "USD")
Sku.Create("WBH001")
Address.Create("123 Main St", "Seattle", "WA", "98101", "USA")
```

---

## The State Machine of Desire

An order moves through states: `Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered`. Or it doesn't. It might be `Cancelled` at almost any point, a small tragedy in the life of commerce.

These transitions are not arbitrary. They reflect real-world constraints—you cannot ship what hasn't been processed; you cannot undeliver what has arrived. The domain enforces these rules not through documentation but through code that refuses to compile alternatives.

---

## Running It

```bash
# The Aspire host orchestrates everything (you only need docker)
dotnet run --project Astro.AppHost
```

The database creates itself. Seed data appears: 10 products with descriptions and images, 10 orders in various states of completion. The GraphQL playground awaits at `/graphql`.

---

## The Stack

### Backend

| Layer | Technology |
|-------|------------|
| API | HotChocolate 15 (GraphQL) |
| Application | MediatR, FluentValidation 12 |
| Domain | C# 14, Value Objects, Domain Events |
| Infrastructure | EF Core, PostgreSQL |
| Orchestration | .NET Aspire |
| Messaging | MassTransit 8 |

### Frontend

| Layer | Technology |
|-------|------------|
| Framework | Angular 19 (standalone components) |
| UI | Angular Material 19 (Material 3, dark theme) |
| State | Angular Signals |
| API Client | Apollo Angular 8 / @apollo/client 4 |
| Styling | SCSS with CSS custom properties |

The frontend follows a feature-based architecture with lazy-loaded routes. Each feature module (dashboard, products, orders, payments, shipments) is self-contained with its own components, services, and GraphQL queries. Shared components like `DataTableComponent`, `StatusBadgeComponent`, and `MetricCardComponent` promote consistency across the application.

---

## CI/CD Workflows

This project uses GitHub Actions with two separate workflows:

**Backend - Unit Tests** (automatic)
- Triggers on every push and pull request to `main`
- Runs only unit tests from `server/Astro.Tests`
- Provides fast feedback (typically < 3 minutes)
- Must pass before merging

**Backend - Integration Tests** (manual)
- Triggered manually via GitHub Actions UI (workflow_dispatch)
- Runs integration tests from `e2e/Astro.IntegrationTests`
- Use before releases or after significant changes
- To run: Go to Actions tab → Integration Tests → Run workflow

**Frontend - Unit Tests** (automatic)
- Triggers on every push and pull request to `main`
- Runs only unit tests from `client/Astro.Tests`
- Provides fast feedback (typically < 3 minutes)
- Must pass before merging

Both workflows use .NET 10.0.x and include: checkout, restore, build, and test steps.

---

## Summary

It is hard to find a way of thinking about problems. They make certain solutions easy and certain mistakes hard.

Use it. Break it. Rebuild it better.

The stars don't care. But maybe we should.
