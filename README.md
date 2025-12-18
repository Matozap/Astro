# Astro

*Not a brainrot ☠️*

---


## What It this useless project

A modular monolith built on .NET 10 and C# 14, exposing a GraphQL API for managing products and orders. Orchestrated through .NET Aspire.

```
src/
├── Astro.Api/            # GraphQL gateway (HotChocolate)
├── Astro.Application/    # Commands, queries, handlers (MediatR)
├── Astro.Domain/         # Entities, value objects, domain events
├── Astro.Infrastructure/ # Persistence, repositories (EF Core)
```

---

## The Architecture

Clean Architecture is often described as a set of concentric circles. But circles imply closure—completeness. Software is never complete. It is, at best, *momentarily coherent*.

The domain layer knows nothing of databases or HTTP. It speaks only of `Products`, `Orders`, `Money`, and `Sku`—concepts that would exist even if computers didn't. The infrastructure layer handles the messy business of making ideas persist beyond the death of a process.

Between them sits the application layer, translating intention into action through commands and queries. MediatR provides the postal service; FluentValidation ensures the letters are legible.

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
# The Aspire host orchestrates everything
dotnet run --project Astro.AppHost
```

The database creates itself. Seed data appears: 10 products with descriptions and images, 10 orders in various states of completion. The GraphQL playground awaits at `/graphql`.

---

## The Stack

| Layer | Technology |
|-------|------------|
| API | HotChocolate 15 (GraphQL) |
| Application | MediatR, FluentValidation 12 |
| Domain | C# 14, Value Objects, Domain Events |
| Infrastructure | EF Core, PostgreSQL |
| Orchestration | .NET Aspire |
| Messaging | MassTransit 8 |

---

## A Final Thought

It is hard to find a way of thinking about problems. They make certain solutions easy and certain mistakes hard.

Use it. Break it. Rebuild it better.

The stars don't care. But maybe we should.

---

*Built with curiosity and a suspicious amount of caffeine.*
