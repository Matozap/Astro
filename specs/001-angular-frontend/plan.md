# Implementation Plan: Angular Frontend Application

**Branch**: `001-angular-frontend` | **Date**: 2025-12-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-angular-frontend/spec.md`

## Summary

Build a dark-mode Angular 19 dashboard frontend with Angular Material 3 and Apollo Client for GraphQL integration. The application will provide authentication, a visually impressive dashboard with charts and metrics, and management views for Products, Orders, Payments, and Shipments backed by the existing Astro GraphQL API. Design inspiration: [MatDash Angular Dark](https://matdash-angular-dark.netlify.app/dashboards/dashboard2).

## Technical Context

**Language/Version**: TypeScript 5.6+ / Angular 19.x with standalone components
**Primary Dependencies**: Angular Material 19 (M3), Apollo Angular 8.x, @apollo/client 4.x, ngx-charts or Apache ECharts for visualizations
**Storage**: Browser sessionStorage for auth tokens (per spec FR-018), Apollo InMemoryCache for GraphQL data
**Testing**: Jasmine + Karma (Angular default), Cypress for E2E
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) - responsive from 320px to 2560px
**Project Type**: Web application (frontend only, separate from existing server)
**Performance Goals**: Initial load <2s, dashboard render <3s, navigation <1s (per Success Criteria)
**Constraints**: Must integrate with existing GraphQL API, dark mode default, responsive design
**Scale/Scope**: 6 main views (Login, Dashboard, Products, Orders, Payments, Shipments), ~10k records per entity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applicable | Status | Notes |
|-----------|------------|--------|-------|
| I. Clean Architecture & DDD | Partial | ✅ PASS | Frontend will follow Angular best practices with feature modules, services, and state management. Domain logic remains in backend. |
| II. CQRS Pattern | N/A | ✅ PASS | Backend implements CQRS; frontend consumes via GraphQL queries/mutations |
| III. Unit Test Coverage | Yes | ⚠️ REQUIRED | Must include unit tests for services, guards, and components |
| IV. .NET Aspire Platform | Partial | ✅ PASS | Frontend project will be registered in AppHost for orchestration |
| V. Entity Framework Core | N/A | ✅ PASS | Backend concern only |
| VI. Modular Monolith Architecture | Yes | ✅ PASS | Frontend is a separate module (`client/`) at repository root |

**Pre-Design Gate Status**: ✅ PASS - May proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-angular-frontend/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - frontend models/interfaces
├── quickstart.md        # Phase 1 output - setup instructions
├── contracts/           # Phase 1 output - GraphQL operations
│   ├── queries.graphql
│   ├── mutations.graphql
│   └── fragments.graphql
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
client/                          # Angular frontend application
├── src/
│   ├── app/
│   │   ├── core/               # Singleton services, guards, interceptors
│   │   │   ├── auth/           # Authentication service, guards
│   │   │   ├── graphql/        # Apollo configuration, GraphQL service
│   │   │   └── layout/         # Shell component, sidebar, header
│   │   ├── features/           # Feature modules (lazy-loaded)
│   │   │   ├── dashboard/      # Dashboard with charts and widgets
│   │   │   ├── products/       # Product management views
│   │   │   ├── orders/         # Order management views
│   │   │   ├── payments/       # Payment management views
│   │   │   └── shipments/      # Shipment tracking views
│   │   ├── shared/             # Shared components, pipes, directives
│   │   │   ├── components/     # Reusable UI components (tables, cards, charts)
│   │   │   ├── models/         # TypeScript interfaces matching GraphQL types
│   │   │   └── utils/          # Helper functions
│   │   ├── app.component.ts
│   │   ├── app.config.ts       # Standalone app configuration
│   │   └── app.routes.ts       # Route definitions
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── styles/
│   │   ├── _variables.scss     # CSS custom properties, theme tokens
│   │   ├── _theme.scss         # Angular Material M3 theme config
│   │   └── styles.scss         # Global styles
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
├── tsconfig.json
└── karma.conf.js

server/                          # Existing backend (unchanged)
e2e/                            # Existing E2E tests
Astro.AppHost/                  # Add client project reference
```

**Structure Decision**: Web application structure with `client/` folder at repository root (per user request: "create a client folder at the same level of server and e2e"). Angular 19 standalone components with feature-based organization.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

---

## Phase Status

- [x] Phase 0: Research (generate research.md) ✅
- [x] Phase 1: Design & Contracts (generate data-model.md, contracts/, quickstart.md) ✅
- [x] Phase 2: Task Generation (via /speckit.tasks command) ✅
