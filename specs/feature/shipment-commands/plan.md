# Implementation Plan: Shipment Commands

**Branch**: `feature/shipment-commands` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/feature/shipment-commands/spec.md`

## Summary

Add shipment creation and update functionality to the Angular frontend. The backend GraphQL mutations (`createShipment`, `updateShipment`) already exist and are fully functional. This feature implements:
1. **Shipment Create Page** (`/shipments/create`) - Form with order selection, carrier, addresses, weight, dimensions, shipping cost, estimated delivery date, and items
2. **Shipment Update Controls** - Update form/dialog in shipment detail for status transitions and carrier/tracking updates
3. **Status Update Dialog** - Confirmation dialog for status changes with location/notes
4. **Unit Tests** - Comprehensive coverage of new UI components following existing test patterns

## Technical Context

**Language/Version**: TypeScript 5.7+ / Angular 19.x (client), C# 14.0 / .NET 10.0 (backend - already implemented)
**Primary Dependencies**: Apollo Angular 8.x, @apollo/client 4.x, Angular Material 19.x, RxJS
**Storage**: PostgreSQL via EF Core (backend - already implemented)
**Testing**: Jasmine/Karma with Angular TestBed, ComponentFixture, mocked services
**Target Platform**: Web browser (Angular SPA), Windows development environment
**Project Type**: Web application (frontend focus, backend complete)
**Performance Goals**: Form validation <1s, operations feedback <2s, page load <3s
**Constraints**: Must follow existing products/orders/payments UI patterns, unit test coverage required for all new components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Architecture & DDD | PASS | Backend already follows DDD patterns (Shipment aggregate, value objects); frontend follows feature-module pattern |
| II. CQRS Pattern | PASS | Backend mutations use CreateShipmentCommand, UpdateShipmentCommand with handlers and validators |
| III. Unit Test Coverage | PASS | FR-015 requires unit tests for all new UI components; will implement with Jasmine/TestBed |
| IV. .NET Aspire Platform | N/A | Backend already integrated; no changes needed |
| V. Entity Framework Core | N/A | Backend already implemented; no schema changes |
| VI. Modular Monolith | PASS | Frontend follows feature-module structure under `features/shipments/` |

**Gate Result**: PASS - All applicable principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/feature/shipment-commands/
├── plan.md              # This file
├── research.md          # Phase 0 output - existing patterns analysis
├── data-model.md        # Phase 1 output - TypeScript interfaces
├── quickstart.md        # Phase 1 output - implementation guide
├── contracts/           # Phase 1 output - GraphQL operations
│   └── mutations.graphql
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
client/src/app/features/shipments/
├── components/
│   └── shipment-create/
│       ├── shipment-create.component.ts
│       ├── shipment-create.component.html
│       ├── shipment-create.component.scss
│       └── shipment-create.component.spec.ts
├── dialogs/
│   ├── status-update-dialog/
│   │   ├── status-update-dialog.component.ts
│   │   ├── status-update-dialog.component.html
│   │   ├── status-update-dialog.component.scss
│   │   └── status-update-dialog.component.spec.ts
│   └── shipment-edit-dialog/
│       ├── shipment-edit-dialog.component.ts
│       ├── shipment-edit-dialog.component.html
│       ├── shipment-edit-dialog.component.scss
│       └── shipment-edit-dialog.component.spec.ts
├── graphql/
│   ├── shipment.queries.ts     # (existing)
│   └── shipment.mutations.ts   # (new)
├── services/
│   ├── shipment.service.ts     # (extend with mutations)
│   └── shipment.service.spec.ts # (new)
├── shipments-list/
│   ├── shipments-list.component.ts    # (update: add Create button)
│   ├── shipments-list.component.html  # (update: add Create button)
│   └── shipments-list.component.spec.ts # (new)
├── shipment-detail/
│   ├── shipment-detail.component.ts   # (update: add update actions)
│   ├── shipment-detail.component.html # (update: add update actions)
│   └── shipment-detail.component.spec.ts # (new)
└── shipments.routes.ts         # (update: add create route)
```

**Structure Decision**: Follows existing payments feature module pattern with components/, dialogs/, graphql/, services/ subdirectories. Uses separate dialog components for status updates (complex state machine with location/notes) and shipment edits (carrier/tracking for pending shipments).

## Constitution Check (Post-Design)

*Re-evaluation after Phase 1 design artifacts are complete.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Architecture & DDD | PASS | Design follows feature-module pattern; data-model.md defines proper interfaces |
| II. CQRS Pattern | PASS | GraphQL mutations follow command pattern; no query/command mixing |
| III. Unit Test Coverage | PASS | All new components have corresponding .spec.ts files planned |
| IV. .NET Aspire Platform | N/A | No backend changes required |
| V. Entity Framework Core | N/A | No schema changes required |
| VI. Modular Monolith | PASS | All changes contained within features/shipments/ module |

**Post-Design Gate Result**: PASS - Design conforms to all applicable principles

## Complexity Tracking

> No Constitution violations requiring justification.

| Item | Decision | Rationale |
|------|----------|-----------|
| Separate dialog for status update | StatusUpdateDialogComponent | Status transitions are complex (state machine with location/notes) - justifies dedicated dialog |
| Separate dialog for shipment edit | ShipmentEditDialogComponent | Edit carrier/tracking only for Pending status - separate from status flow |
| Routed page for create | ShipmentCreateComponent | Follows products/orders/payments pattern for complex forms with many fields |

## Generated Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| Research | [research.md](./research.md) | Pattern analysis and decisions |
| Data Model | [data-model.md](./data-model.md) | TypeScript interfaces and types |
| GraphQL Contracts | [contracts/mutations.graphql](./contracts/mutations.graphql) | Mutation definitions |
| Quickstart | [quickstart.md](./quickstart.md) | Implementation guide |

## Next Steps

Run `/speckit.tasks` to generate the actionable task list for implementation.
