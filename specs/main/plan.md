# Implementation Plan: Modular Monolith & DDD Migration

**Branch**: `main` | **Date**: 2025-12-14 | **Spec**: N/A (Architecture evolution)
**Input**: Constitution v1.1.0 requirements for modular monolith with DDD patterns

## Summary

Evolve the existing Astro application from its current Clean Architecture structure to a
fully DDD-compliant modular monolith. The codebase already has excellent foundational
structure with Products and Orders modules following Clean Architecture layers. This plan
focuses on enhancing DDD tactical patterns (aggregates, value objects, domain events) and
ensuring comprehensive unit test coverage as specified in the constitution.

## Technical Context

**Language/Version**: C# 14.0 / .NET 10.0
**Primary Dependencies**: HotChocolate 15.1.11, MediatR, FluentValidation 12.1.1, MassTransit 8.5.7
**Storage**: PostgreSQL via Entity Framework Core 10.0.0
**Testing**: xUnit, Shouldly, NSubstitute (for mocking)
**Target Platform**: Cloud-native via .NET Aspire 13.0.2
**Project Type**: Modular Monolith (multi-module)
**Performance Goals**: Standard CRUD operations with GraphQL API
**Constraints**: Unit tests only (no integration/contract tests per constitution)
**Scale/Scope**: 2 existing modules (Products, Orders) + future module expansion

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Architecture & DDD | PARTIAL | Layers exist; DDD patterns need enhancement |
| II. CQRS Pattern | PASS | Commands/Queries/Handlers/Validators in place |
| III. Unit Test Coverage | PARTIAL | Some tests exist; coverage gaps in domain layer |
| IV. .NET Aspire Platform | PASS | AppHost, ServiceDefaults configured |
| V. Entity Framework Core | PASS | Code-first with configurations |
| VI. Modular Monolith | PASS | Products, Orders, Shared modules structured correctly |

**Gate Status**: PASS (with enhancement work needed for principles I and III)

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md              # This file
├── research.md          # Phase 0 output - DDD pattern decisions
├── data-model.md        # Phase 1 output - Domain model with aggregates
├── quickstart.md        # Phase 1 output - Development setup
└── contracts/           # Phase 1 output - GraphQL schema documentation
    └── graphql-schema.md
```

### Source Code (repository root)

```text
Astro.AppHost/           # Aspire orchestration host
Astro.ServiceDefaults/   # Shared service configuration

Products/
├── Products.Domain/     # Aggregates, entities, value objects, domain events
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Events/
│   └── Abstractions/
├── Products.Application/
│   ├── Commands/
│   ├── Queries/
│   └── Abstractions/
├── Products.Infrastructure/
│   ├── Persistence/
│   ├── Messaging/
│   └── Repositories/
├── Products.Api/
│   └── GraphQL/
└── Products.Tests/
    ├── Domain/          # Aggregate and value object tests
    └── Application/     # Handler and validator tests

Orders/
├── Orders.Domain/       # Same structure as Products
├── Orders.Application/
├── Orders.Infrastructure/
├── Orders.Api/
└── Orders.Tests/

Shared/
└── Shared.Contracts/    # Integration events, shared DTOs
```

**Structure Decision**: The existing modular monolith structure aligns with constitution
requirements. Enhancement focus is on internal organization within each module to properly
implement DDD tactical patterns.

## Complexity Tracking

> **No constitution violations requiring justification**

| Aspect | Current State | Target State |
|--------|---------------|--------------|
| Domain Layer | Anemic entities | Rich aggregates with invariants |
| Value Objects | None identified | Price, Money, Address, Email |
| Domain Events | In Shared.Contracts | Module-internal + integration events |
| Repository Pattern | Generic repository | Aggregate root repositories |
| Test Coverage | Handlers/Validators | + Domain layer (aggregates, VOs) |
