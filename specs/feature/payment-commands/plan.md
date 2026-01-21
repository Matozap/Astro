# Implementation Plan: Payment Commands

**Branch**: `feature/payment-commands` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/feature/payment-commands/spec.md`

## Summary

Add payment creation and status update functionality to the Angular frontend. The backend GraphQL mutations (`createPayment`, `updatePaymentStatus`) already exist. This feature implements:
1. **Payment Create Page** (`/payments/create`) - Form with order autocomplete, amount, currency, payment method
2. **Status Update Controls** - Mat-menu dropdown in payment detail header for status transitions (Pending → Successful/Failed)
3. **Confirmation Dialog** - MatDialog for status change confirmation
4. **Unit Tests** - 100% coverage of new UI operations

## Technical Context

**Language/Version**: TypeScript 5.7+ / Angular 19.x (client), C# 14.0 / .NET 10.0 (backend - already implemented)
**Primary Dependencies**: Apollo Angular 8.x, @apollo/client 4.x, Angular Material 19.x, RxJS
**Storage**: PostgreSQL via EF Core (backend - already implemented)
**Testing**: Jasmine/Karma with Angular TestBed, ComponentFixture, mocked services
**Target Platform**: Web browser (Angular SPA)
**Project Type**: Web application (frontend focus, backend complete)
**Performance Goals**: Form validation <1s, operations feedback <2s, page load <3s
**Constraints**: Must follow existing products/orders UI patterns, 100% unit test coverage for new components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Architecture & DDD | PASS | Backend already follows DDD patterns; frontend follows feature-module pattern |
| II. CQRS Pattern | PASS | Backend mutations use CreatePaymentCommand, UpdatePaymentStatusCommand |
| III. Unit Test Coverage | PASS | SC-005 requires 100% UI test coverage; will implement with Jasmine/TestBed |
| IV. .NET Aspire Platform | N/A | Backend already integrated; no changes needed |
| V. Entity Framework Core | N/A | Backend already implemented; no schema changes |
| VI. Modular Monolith | PASS | Frontend follows feature-module structure under `features/payments/` |

**Gate Result**: PASS - All applicable principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/feature/payment-commands/
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
client/src/app/features/payments/
├── components/
│   └── payment-create/
│       ├── payment-create.component.ts
│       ├── payment-create.component.html
│       ├── payment-create.component.scss
│       └── payment-create.component.spec.ts
├── dialogs/
│   └── status-confirm-dialog/
│       ├── status-confirm-dialog.component.ts
│       ├── status-confirm-dialog.component.html
│       ├── status-confirm-dialog.component.scss
│       └── status-confirm-dialog.component.spec.ts
├── graphql/
│   ├── payment.queries.ts     # (existing)
│   └── payment.mutations.ts   # (new)
├── services/
│   ├── payment.service.ts     # (extend with mutations)
│   └── payment.service.spec.ts # (new)
├── payments-list/
│   ├── payments-list.component.ts # (update: add Create button)
│   └── payments-list.component.spec.ts # (new)
├── payment-detail/
│   ├── payment-detail.component.ts # (update: add status menu)
│   └── payment-detail.component.spec.ts # (existing, extend)
└── payments.routes.ts         # (update: add create route)
```

**Structure Decision**: Follows existing products/orders feature module pattern with components/, dialogs/, graphql/, services/ subdirectories.

## Complexity Tracking

> No Constitution violations requiring justification.

| Item | Decision | Rationale |
|------|----------|-----------|
| Separate dialog component | StatusConfirmDialogComponent | Follows products DeleteConfirmDialog pattern for reusability |
| Separate create component | PaymentCreateComponent | Follows products/orders pattern (routed page, not dialog) |
