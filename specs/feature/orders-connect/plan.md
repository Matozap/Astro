# Implementation Plan: Connect Orders UI to Backend

**Branch**: `feature/orders-connect` | **Date**: 2026-01-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/feature/orders-connect/spec.md`

## Summary

Replace mock data in the Angular Orders feature with real GraphQL API calls to the backend. The implementation follows the existing pattern established by the Products feature, using Apollo Angular for GraphQL operations with cursor-based pagination.

## Technical Context

**Language/Version**: TypeScript 5.7+ / Angular 19.x (client), C# 14.0 / .NET 10.0 (backend - already implemented)
**Primary Dependencies**: Apollo Angular 13.0, @apollo/client 4.x, Angular Material 19.x
**Storage**: PostgreSQL via EF Core (backend - already implemented)
**Testing**: Karma/Jasmine (client unit tests)
**Target Platform**: Web browser (Angular SPA)
**Project Type**: Web application (Angular frontend + .NET backend)
**Performance Goals**: API responses within 2 seconds under normal load
**Constraints**: Must follow existing product feature patterns, must use cursor-based pagination
**Scale/Scope**: Single feature update (orders module) - frontend changes only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies? | Status | Notes |
|-----------|----------|--------|-------|
| I. Clean Architecture & DDD | Backend only | PASS | Backend already implemented correctly; frontend follows Angular service/component patterns |
| II. CQRS Pattern | Backend only | PASS | Backend has Commands/Queries/Handlers already implemented |
| III. Unit Test Coverage | Yes | PENDING | Unit tests to be added for modified service |
| IV. .NET Aspire Platform | Backend only | PASS | Backend already integrated |
| V. Entity Framework Core | Backend only | PASS | Backend already uses EF Core |
| VI. Modular Monolith | Backend only | PASS | Orders module already exists |

**Gate Assessment**: PASS - This feature is frontend-only (connecting existing UI to existing backend). The backend Orders module is fully implemented following all constitution principles. Frontend changes follow established Angular patterns.

## Project Structure

### Documentation (this feature)

```text
specs/feature/orders-connect/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
client/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   ├── orders/                    # Target feature
│   │   │   │   ├── graphql/
│   │   │   │   │   └── order.queries.ts   # GraphQL queries (exists)
│   │   │   │   ├── services/
│   │   │   │   │   └── order.service.ts   # Main service to modify
│   │   │   │   ├── orders-list/
│   │   │   │   │   └── orders-list.component.ts
│   │   │   │   └── order-detail/
│   │   │   │       └── order-detail.component.ts
│   │   │   └── products/                  # Reference implementation
│   │   │       ├── graphql/
│   │   │       │   └── product.queries.ts
│   │   │       └── services/
│   │   │           └── product.service.ts
│   │   └── shared/
│   │       └── models/
│   │           └── order.model.ts
│   └── tests/                             # Unit tests
│
server/                                    # Backend (no changes needed)
├── Astro.Api/
│   └── Orders/
│       └── GraphQL/
│           ├── Query.cs                   # Orders query endpoint
│           ├── Mutation.cs                # Order mutations
│           └── Types/
└── ...
```

**Structure Decision**: Web application with separate client/server directories. This feature only modifies the `client/src/app/features/orders/` directory to replace mock data with real API calls, following the pattern in `client/src/app/features/products/`.

## Complexity Tracking

> No constitution violations - this is a straightforward frontend integration following established patterns.

*No complexity tracking entries required.*
