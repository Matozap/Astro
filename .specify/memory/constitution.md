<!--
===============================================================================
SYNC IMPACT REPORT
===============================================================================
Version change: 1.0.1 → 1.1.0 (MINOR - New principle added, test scope changed)

Modified principles:
  - "Clean Architecture" → "Clean Architecture & DDD" (expanded with DDD guidance)
  - "Test Coverage Required" → "Unit Test Coverage" (scoped to unit tests only)

Added sections:
  - Principle VI: Modular Monolith Architecture

Removed sections:
  - Integration Tests requirement (from Test Coverage principle)
  - Contract Tests requirement (from Test Coverage principle)

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check section compatible)
  - .specify/templates/spec-template.md ✅ (No changes required)
  - .specify/templates/tasks-template.md ✅ (Phase structure compatible)
  - .specify/templates/checklist-template.md ✅ (No changes required)
  - .specify/templates/agent-file-template.md ✅ (No changes required)

Follow-up TODOs: None
===============================================================================
-->

# Astro Constitution

## Core Principles

### I. Clean Architecture & Domain-Driven Design

All code MUST follow Clean Architecture layer separation combined with DDD tactical
patterns. The following structure applies:

- **Domain Layer** (`*.Domain`): Aggregates, entities, value objects, domain events,
  domain services, and repository interfaces. MUST have zero dependencies on other
  layers or external frameworks. Aggregates MUST enforce invariants and encapsulate
  business rules. Value objects MUST be immutable.
- **Application Layer** (`*.Application`): Commands, queries, handlers, validators,
  application services, and DTOs. MAY reference Domain only. MUST orchestrate
  domain operations without containing business logic.
- **Infrastructure Layer** (`*.Infrastructure`): Repository implementations,
  external service integrations, and framework-specific code. MUST implement
  Domain layer repository interfaces.
- **API Layer** (`*.Api`): Entry points (GraphQL, controllers). MUST orchestrate
  via Application layer only, never bypass to Infrastructure directly.

**DDD Tactical Patterns**:
- **Aggregates**: Each bounded context MUST define aggregate roots that control
  access to child entities. External references MUST use aggregate root IDs only.
- **Value Objects**: Domain concepts without identity MUST be modeled as immutable
  value objects with equality based on properties.
- **Domain Events**: State changes with business significance MUST raise domain
  events for cross-aggregate communication.
- **Repository Pattern**: Repositories MUST operate on aggregate roots only, not
  individual entities within an aggregate.

**Rationale**: Clean Architecture ensures testability and maintainability. DDD
tactical patterns ensure the domain model accurately reflects business concepts
and enforces invariants at the correct boundaries.

### II. CQRS Pattern

All feature implementations MUST separate Commands (write operations) from Queries
(read operations):

- **Commands**: Represent intent to change state. MUST be named `[Action][Entity]Command`
  (e.g., `CreateProductCommand`). MUST have corresponding `[Command]Handler` and
  `[Command]Validator` classes.
- **Queries**: Represent intent to retrieve data. MUST be named `Get[Entity/Collection]Query`
  (e.g., `GetProductByIdQuery`). MUST have corresponding `[Query]Handler` classes.
- **Handlers**: One handler per command/query. Command handlers MUST operate through
  aggregate roots.
- **Validation**: All commands MUST have FluentValidation validators executed
  before handler invocation.

**Rationale**: CQRS enables independent scaling of read/write paths, clearer intent
expression, and simplified testing of business operations.

### III. Unit Test Coverage

All features MUST have comprehensive unit test coverage before merge:

- **Unit Tests**: Required for all handlers, validators, domain logic, aggregates,
  and value objects. Test classes MUST follow naming convention `[ClassUnderTest]Tests.cs`.
- **Domain Layer Tests**: Aggregates MUST have tests verifying invariant enforcement.
  Value objects MUST have equality and validation tests.
- **Application Layer Tests**: All command and query handlers MUST have unit tests
  with mocked dependencies.
- **Coverage Target**: Critical business logic paths MUST have test coverage.
  Coverage gaps in domain or application layers MUST be justified in PR description.
- **Test Isolation**: Unit tests MUST NOT depend on external resources (database,
  file system, network). All dependencies MUST be mocked or stubbed.

Tests MAY be written after implementation but MUST exist before code review approval.

**Rationale**: Comprehensive unit test coverage ensures regression prevention,
documents expected behavior, and enables confident refactoring. Focusing on unit
tests provides fast feedback cycles and reliable test execution.

### IV. .NET Aspire Platform

All services MUST integrate with .NET Aspire for cloud-native orchestration:

- **Service Defaults**: All projects MUST reference `Astro.ServiceDefaults` for
  consistent configuration of health checks, telemetry, and resilience.
- **App Host**: All runnable services MUST be registered in `Astro.AppHost` for
  local development orchestration.
- **Configuration**: Environment-specific settings MUST use Aspire's configuration
  abstractions. Secrets MUST use User Secrets in development.
- **Observability**: All services MUST expose health endpoints and support
  OpenTelemetry tracing and metrics via ServiceDefaults.

**Rationale**: Aspire provides consistent cloud-native patterns, simplifies local
development with orchestration, and ensures production-ready observability.

### V. Entity Framework Core

All data persistence MUST use Entity Framework Core with code-first approach:

- **DbContext**: Each module MUST have a single DbContext (e.g., `ProductsDbContext`).
  Contexts MUST NOT span multiple modules.
- **Configurations**: Entity configurations MUST be in separate `*Configuration.cs`
  files implementing `IEntityTypeConfiguration<T>`. MUST NOT use data annotations.
- **Migrations**: Schema changes MUST use EF Core migrations. Migrations MUST be
  reviewed for backward compatibility before merge.
- **Repository Pattern**: Data access MUST be abstracted via repository interfaces
  in Domain layer, implemented in Infrastructure layer. Repositories MUST operate
  on aggregate roots only.

**Rationale**: EF Core with code-first enables version-controlled schema evolution,
while repository abstraction maintains Clean Architecture boundaries and DDD patterns.

### VI. Modular Monolith Architecture

The application MUST be structured as a modular monolith with clear module boundaries:

- **Module Structure**: Each business domain MUST be implemented as a self-contained
  module with its own Domain, Application, Infrastructure, and API layers.
- **Module Boundaries**: Modules MUST communicate only through well-defined contracts
  (interfaces, events, or shared DTOs in `Shared.Contracts`). Direct cross-module
  database access is FORBIDDEN.
- **Module Naming**: Module projects MUST follow the pattern `[ModuleName].[Layer]`
  (e.g., `Products.Domain`, `Orders.Application`, `Inventory.Infrastructure`).
- **Shared Infrastructure**: Cross-cutting concerns (ServiceDefaults, AppHost,
  shared contracts) MUST reside in `Astro.*` or `Shared.*` projects.
- **Module Independence**: Each module SHOULD be deployable independently in the
  future. Module internals MUST NOT leak through public APIs.
- **Inter-Module Communication**: Synchronous communication MUST use defined
  interfaces. Asynchronous communication SHOULD use domain events or integration
  events.

**Module Evolution Guidelines**:
- New business domains MUST be added as new modules, not extensions of existing ones.
- Shared logic between modules MUST be extracted to `Shared.*` projects only when
  genuinely reusable across 2+ modules.
- Module-specific database tables MUST be prefixed with module name or use separate
  schemas.

**Rationale**: Modular monolith architecture provides the organizational benefits of
microservices (clear boundaries, team autonomy, independent evolution) while avoiding
distributed system complexity. It enables future decomposition into microservices if
needed.

## Technology Standards

**Runtime**: .NET 10.0
**Orchestration**: .NET Aspire 10+
**API Protocol**: GraphQL (HotChocolate)
**ORM**: Entity Framework Core
**Validation**: FluentValidation
**Mediator**: MediatR
**Testing**: xUnit, Shouldly, NSubstitute (for mocking)

**Project Naming Convention**:
- `Astro.*` - Shared Aspire infrastructure (AppHost, ServiceDefaults)
- `Shared.*` - Cross-module shared contracts and utilities
- `[Module].[Layer]` - Module projects (e.g., `Products.Domain`, `Products.Application`,
  `Products.Infrastructure`, `Products.Api`, `Products.Tests`)

## Development Workflow

### Code Organization

1. New features MUST be organized within their module
2. Cross-cutting concerns MUST be placed in ServiceDefaults or Shared libraries
3. GraphQL types MUST be co-located with their module in `[Module].Api/GraphQL/`
4. Inter-module contracts MUST be defined in `Shared.Contracts`

### Pull Request Requirements

1. All PRs MUST pass CI build and tests
2. Schema changes MUST include migration files
3. New commands/queries MUST include validators, handlers, and unit tests
4. Breaking changes MUST be documented and approved by project lead
5. New modules MUST follow established module structure

### Quality Gates

- Build MUST succeed with zero warnings (warnings as errors)
- All unit tests MUST pass
- New code MUST follow established patterns in the codebase
- Domain and application layer code MUST have unit test coverage

## Governance

This constitution is the authoritative source for architectural decisions in Astro.
All code reviews MUST verify compliance with these principles.

### Amendment Process

1. Propose amendment via PR to this file
2. Document rationale and migration impact
3. Obtain approval from project lead
4. Update version according to semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or material expansion
   - PATCH: Clarification or wording refinement

### Compliance

- All PRs MUST pass Constitution Check in implementation plans
- Deviations MUST be documented in Complexity Tracking with justification
- Periodic reviews SHOULD verify codebase alignment with principles

**Version**: 1.1.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-14
