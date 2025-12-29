# Tasks: Angular Frontend Application

**Input**: Design documents from `/specs/001-angular-frontend/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Unit tests are REQUIRED per Constitution principle III (Unit Test Coverage). Tests for services, guards, and key components.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `client/src/app/` for Angular application
- Paths follow plan.md structure with `client/` at repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create Angular project with all required dependencies and configuration

- [x] T001 Create Angular 19 project with `ng new client --standalone --style=scss --routing --skip-git` in repository root
- [x] T002 Add Angular Material 19 with `ng add @angular/material` (select custom theme, include typography and animations)
- [x] T003 Add Apollo Angular with `ng add apollo-angular` in client/
- [x] T004 [P] Install additional dependencies: `npm install echarts ngx-echarts` in client/
- [x] T005 [P] Install dev dependencies: `npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-apollo-angular` in client/
- [x] T006 Create folder structure per plan.md in client/src/app/ (core/, features/, shared/)
- [x] T007 [P] Configure environment files in client/src/environments/environment.ts and environment.prod.ts
- [x] T008 [P] Create proxy configuration in client/proxy.conf.json for GraphQL API
- [x] T009 [P] Configure GraphQL codegen in client/codegen.ts
- [x] T010 Setup dark theme configuration in client/src/styles/_theme.scss with M3 theming
- [x] T011 Configure global styles in client/src/styles/styles.scss
- [x] T012 [P] Update Astro.AppHost/AppHost.cs to register Angular client with Aspire orchestration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 [P] Create TypeScript interfaces for common value objects in client/src/app/shared/models/common.model.ts (Money, Address, Weight, Dimensions)
- [x] T014 [P] Create TypeScript interfaces for Product entity in client/src/app/shared/models/product.model.ts
- [x] T015 [P] Create TypeScript interfaces for Order entity in client/src/app/shared/models/order.model.ts
- [x] T016 [P] Create TypeScript interfaces for Payment entity in client/src/app/shared/models/payment.model.ts
- [x] T017 [P] Create TypeScript interfaces for Shipment entity in client/src/app/shared/models/shipment.model.ts
- [x] T018 [P] Create TypeScript interfaces for Auth models in client/src/app/shared/models/auth.model.ts
- [x] T019 [P] Create TypeScript interfaces for Dashboard metrics in client/src/app/shared/models/dashboard.model.ts
- [x] T020 [P] Create TypeScript interfaces for table/pagination in client/src/app/shared/models/table.model.ts
- [x] T021 Create barrel export in client/src/app/shared/models/index.ts
- [x] T022 Configure Apollo Client provider in client/src/app/core/graphql/graphql.provider.ts
- [x] T023 Create GraphQL fragments file in client/src/app/core/graphql/fragments.graphql (copy from contracts/)
- [ ] T024 Generate GraphQL types by running `npm run codegen` in client/ (SKIPPED - requires backend running)
- [x] T025 Create error handling service in client/src/app/core/services/error-handler.service.ts
- [x] T026 [P] Create loading state service with signals in client/src/app/core/services/loading.service.ts
- [x] T027 [P] Create notification/toast service in client/src/app/core/services/notification.service.ts
- [x] T028 Configure app routes skeleton in client/src/app/app.routes.ts with lazy loading
- [x] T029 Create app.config.ts with Apollo, Material, and router providers in client/src/app/app.config.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Authentication and Access (Priority: P1) 🎯 MVP

**Goal**: Enable users to authenticate before accessing the application with secure session management

**Independent Test**: Access any route → redirected to login → enter credentials → reach dashboard → logout → return to login

### Unit Tests for User Story 1

- [ ] T030 [P] [US1] Create AuthService unit tests in client/src/app/core/auth/auth.service.spec.ts
- [ ] T031 [P] [US1] Create AuthGuard unit tests in client/src/app/core/auth/auth.guard.spec.ts

### Implementation for User Story 1

- [ ] T032 [US1] Create AuthService in client/src/app/core/auth/auth.service.ts (login, logout, isAuthenticated, token management with sessionStorage)
- [ ] T033 [US1] Create AuthGuard functional guard in client/src/app/core/auth/auth.guard.ts (redirect unauthenticated to login)
- [ ] T034 [US1] Create Login page component in client/src/app/features/login/login.component.ts with dark mode styling
- [ ] T035 [US1] Create Login form template in client/src/app/features/login/login.component.html (email, password, submit button, error display)
- [ ] T036 [US1] Create Login page styles in client/src/app/features/login/login.component.scss (centered card, dark theme)
- [ ] T037 [US1] Configure login route in client/src/app/app.routes.ts (public, no guard)
- [ ] T038 [US1] Apply AuthGuard to all protected routes in client/src/app/app.routes.ts
- [ ] T039 [US1] Add logout button to layout (placeholder) and wire to AuthService in client/src/app/core/layout/

**Checkpoint**: User can login with mock credentials, access protected routes, logout and be redirected to login

---

## Phase 4: User Story 2 - Dashboard Overview and Metrics Visualization (Priority: P2)

**Goal**: Display visually impressive dashboard with metric widgets, charts, and responsive layout in dark mode

**Independent Test**: Login → dashboard displays with metric cards, revenue charts, recent activity widgets → resize browser → layout adapts responsively

### Unit Tests for User Story 2

- [ ] T040 [P] [US2] Create DashboardService unit tests in client/src/app/features/dashboard/services/dashboard.service.spec.ts
- [ ] T041 [P] [US2] Create MetricCard component unit tests in client/src/app/shared/components/metric-card/metric-card.component.spec.ts

### Implementation for User Story 2

- [ ] T042 [P] [US2] Create reusable MetricCard component in client/src/app/shared/components/metric-card/metric-card.component.ts (title, value, change percentage, icon)
- [ ] T043 [P] [US2] Create MetricCard template and styles in client/src/app/shared/components/metric-card/ (dark mode, color variants)
- [ ] T044 [US2] Create DashboardService in client/src/app/features/dashboard/services/dashboard.service.ts (aggregate queries for metrics)
- [ ] T045 [US2] Create Dashboard page component in client/src/app/features/dashboard/dashboard.component.ts
- [ ] T046 [US2] Create Dashboard layout template in client/src/app/features/dashboard/dashboard.component.html (grid layout with metric cards)
- [ ] T047 [US2] Create Dashboard responsive styles in client/src/app/features/dashboard/dashboard.component.scss (CSS Grid, breakpoints)
- [ ] T048 [P] [US2] Create RevenueChart component using ngx-echarts in client/src/app/features/dashboard/components/revenue-chart/revenue-chart.component.ts
- [ ] T049 [P] [US2] Create OrderStatusChart component in client/src/app/features/dashboard/components/order-status-chart/order-status-chart.component.ts
- [ ] T050 [P] [US2] Create RecentOrdersWidget component in client/src/app/features/dashboard/components/recent-orders/recent-orders.component.ts
- [ ] T051 [P] [US2] Create ShipmentStatusWidget component in client/src/app/features/dashboard/components/shipment-status/shipment-status.component.ts
- [ ] T052 [US2] Integrate all dashboard widgets in dashboard.component.html
- [ ] T053 [US2] Configure dashboard route in client/src/app/app.routes.ts (default authenticated route)
- [ ] T054 [US2] Create Shell layout component with sidebar in client/src/app/core/layout/shell/shell.component.ts
- [ ] T055 [US2] Create Sidebar navigation component in client/src/app/core/layout/sidebar/sidebar.component.ts (Dashboard, Products, Orders, Payments, Shipments menu items)
- [ ] T056 [US2] Create Header component in client/src/app/core/layout/header/header.component.ts (logo, user menu with logout)
- [ ] T057 [US2] Style Shell, Sidebar, Header with dark theme in client/src/app/core/layout/*.scss

**Checkpoint**: Dashboard displays with working metrics, charts render correctly, sidebar navigation visible, responsive on all screen sizes

---

## Phase 5: User Story 3 - Product Management (Priority: P3)

**Goal**: Display products in a data table with filtering and sorting capabilities

**Independent Test**: Navigate to Products via sidebar → see product table with data → filter by name/SKU → sort by columns → pagination works

### Unit Tests for User Story 3

- [ ] T058 [P] [US3] Create ProductService unit tests in client/src/app/features/products/services/product.service.spec.ts
- [ ] T059 [P] [US3] Create DataTable component unit tests in client/src/app/shared/components/data-table/data-table.component.spec.ts

### Implementation for User Story 3

- [ ] T060 [US3] Create GraphQL queries for products in client/src/app/features/products/graphql/product.queries.ts
- [ ] T061 [US3] Create ProductService in client/src/app/features/products/services/product.service.ts (getProducts with filters/sort)
- [ ] T062 [P] [US3] Create reusable DataTable component in client/src/app/shared/components/data-table/data-table.component.ts (Material table with sort, filter, pagination)
- [ ] T063 [P] [US3] Create DataTable template and styles in client/src/app/shared/components/data-table/ (dark theme styling)
- [ ] T064 [P] [US3] Create StatusBadge component in client/src/app/shared/components/status-badge/status-badge.component.ts (colored status indicators)
- [ ] T065 [US3] Create Products list page component in client/src/app/features/products/products-list/products-list.component.ts
- [ ] T066 [US3] Create Products list template in client/src/app/features/products/products-list/products-list.component.html (table with columns: name, SKU, price, stock, status)
- [ ] T067 [US3] Create Products list styles in client/src/app/features/products/products-list/products-list.component.scss
- [ ] T068 [US3] Add filter controls (search input, active filter) to products list
- [ ] T069 [US3] Configure products route in client/src/app/app.routes.ts with lazy loading

**Checkpoint**: Products page displays table with real data from GraphQL, filtering and sorting work, navigable from sidebar

---

## Phase 6: User Story 4 - Order Management (Priority: P3)

**Goal**: Display orders in a data table with filtering, sorting, and order detail view

**Independent Test**: Navigate to Orders → see order table → filter by status → click order → see order details with line items

### Unit Tests for User Story 4

- [ ] T070 [P] [US4] Create OrderService unit tests in client/src/app/features/orders/services/order.service.spec.ts

### Implementation for User Story 4

- [ ] T071 [US4] Create GraphQL queries for orders in client/src/app/features/orders/graphql/order.queries.ts
- [ ] T072 [US4] Create OrderService in client/src/app/features/orders/services/order.service.ts (getOrders, getOrderById)
- [ ] T073 [US4] Create Orders list page component in client/src/app/features/orders/orders-list/orders-list.component.ts
- [ ] T074 [US4] Create Orders list template in client/src/app/features/orders/orders-list/orders-list.component.html (table: order#, customer, status, total, date)
- [ ] T075 [US4] Create Orders list styles in client/src/app/features/orders/orders-list/orders-list.component.scss
- [ ] T076 [US4] Add status filter dropdown to orders list
- [ ] T077 [US4] Create Order detail component in client/src/app/features/orders/order-detail/order-detail.component.ts
- [ ] T078 [US4] Create Order detail template in client/src/app/features/orders/order-detail/order-detail.component.html (order info, line items table, shipping address)
- [ ] T079 [US4] Create Order detail styles in client/src/app/features/orders/order-detail/order-detail.component.scss
- [ ] T080 [US4] Configure orders routes in client/src/app/app.routes.ts (list and detail with :id param)

**Checkpoint**: Orders page displays table, status filter works, clicking order navigates to detail view with all information

---

## Phase 7: User Story 5 - Payment Management (Priority: P4)

**Goal**: Display payments in a table with status indicators and filtering by payment status

**Independent Test**: Navigate to Payments → see payment table with status indicators → filter by status (Pending/Successful/Failed)

### Unit Tests for User Story 5

- [ ] T081 [P] [US5] Create PaymentService unit tests in client/src/app/features/payments/services/payment.service.spec.ts

### Implementation for User Story 5

- [ ] T082 [US5] Create GraphQL queries for payments in client/src/app/features/payments/graphql/payment.queries.ts
- [ ] T083 [US5] Create PaymentService in client/src/app/features/payments/services/payment.service.ts
- [ ] T084 [US5] Create Payments list page component in client/src/app/features/payments/payments-list/payments-list.component.ts
- [ ] T085 [US5] Create Payments list template in client/src/app/features/payments/payments-list/payments-list.component.html (table: payment ID, order#, amount, status, date)
- [ ] T086 [US5] Create Payments list styles in client/src/app/features/payments/payments-list/payments-list.component.scss (status color coding)
- [ ] T087 [US5] Add payment status filter with visual status badges
- [ ] T088 [US5] Configure payments route in client/src/app/app.routes.ts with lazy loading

**Checkpoint**: Payments page displays table with colored status indicators, status filter works

---

## Phase 8: User Story 6 - Shipment Tracking (Priority: P4)

**Goal**: Display shipments with tracking information, status visualization, and filtering

**Independent Test**: Navigate to Shipments → see shipment table with tracking numbers → filter by status → see tracking status timeline

### Unit Tests for User Story 6

- [ ] T089 [P] [US6] Create ShipmentService unit tests in client/src/app/features/shipments/services/shipment.service.spec.ts

### Implementation for User Story 6

- [ ] T090 [US6] Create GraphQL queries for shipments in client/src/app/features/shipments/graphql/shipment.queries.ts
- [ ] T091 [US6] Create ShipmentService in client/src/app/features/shipments/services/shipment.service.ts
- [ ] T092 [US6] Create Shipments list page component in client/src/app/features/shipments/shipments-list/shipments-list.component.ts
- [ ] T093 [US6] Create Shipments list template in client/src/app/features/shipments/shipments-list/shipments-list.component.html (table: tracking#, carrier, status, dates)
- [ ] T094 [US6] Create Shipments list styles in client/src/app/features/shipments/shipments-list/shipments-list.component.scss
- [ ] T095 [US6] Add shipment status filter with status badges
- [ ] T096 [US6] Create Shipment detail component in client/src/app/features/shipments/shipment-detail/shipment-detail.component.ts
- [ ] T097 [US6] Create Shipment detail template with tracking timeline in client/src/app/features/shipments/shipment-detail/shipment-detail.component.html
- [ ] T098 [US6] Create Shipment detail styles in client/src/app/features/shipments/shipment-detail/shipment-detail.component.scss
- [ ] T099 [US6] Configure shipments routes in client/src/app/app.routes.ts (list and detail)

**Checkpoint**: Shipments page displays table, status filter works, clicking shipment shows tracking timeline

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality assurance

- [ ] T100 [P] Add loading spinners/skeletons to all data-fetching components
- [ ] T101 [P] Add error state handling and user-friendly error messages to all pages
- [ ] T102 [P] Add empty state displays when no data available (e.g., "No orders yet")
- [ ] T103 Implement responsive sidebar collapse on mobile in client/src/app/core/layout/sidebar/
- [ ] T104 Add keyboard navigation and accessibility attributes (ARIA) to navigation and tables
- [ ] T105 [P] Create loading skeleton components in client/src/app/shared/components/skeleton/
- [ ] T106 Verify dark theme consistency across all pages and components
- [ ] T107 [P] Add page transition animations using Angular animations
- [ ] T108 Performance optimization: verify lazy loading works for all feature modules
- [ ] T109 [P] Run `ng build --configuration production` and verify bundle size is acceptable
- [ ] T110 Run all unit tests with `ng test` and ensure all pass
- [ ] T111 Validate quickstart.md instructions work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 (Auth) should be completed first as other stories need protected routes
  - US2 (Dashboard) depends on US1 for layout shell and authentication
  - US3-US6 can proceed in parallel after US2 provides the shell layout
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1: Auth) ← MUST complete first (provides guards, login)
    ↓
Phase 4 (US2: Dashboard) ← Provides shell/sidebar layout
    ↓
┌───┴───┬───────┬───────┐
↓       ↓       ↓       ↓
US3     US4     US5     US6    ← Can run in PARALLEL
(Products)(Orders)(Payments)(Shipments)
    ↓
Phase 9 (Polish)
```

### Within Each User Story

1. Unit tests created first (TDD approach per Constitution)
2. Services before components
3. Components before routes
4. List views before detail views

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All model creation tasks (T013-T020) can run in parallel
- Dashboard widget components (T048-T051) can run in parallel
- User Stories 3-6 can be worked on in parallel by different developers
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: Phase 2 Models

```bash
# Launch all model creation tasks in parallel:
Task: "Create TypeScript interfaces for common value objects in client/src/app/shared/models/common.model.ts"
Task: "Create TypeScript interfaces for Product entity in client/src/app/shared/models/product.model.ts"
Task: "Create TypeScript interfaces for Order entity in client/src/app/shared/models/order.model.ts"
Task: "Create TypeScript interfaces for Payment entity in client/src/app/shared/models/payment.model.ts"
Task: "Create TypeScript interfaces for Shipment entity in client/src/app/shared/models/shipment.model.ts"
Task: "Create TypeScript interfaces for Auth models in client/src/app/shared/models/auth.model.ts"
```

## Parallel Example: Dashboard Widgets (Phase 4)

```bash
# Launch all dashboard widget components in parallel:
Task: "Create RevenueChart component using ngx-echarts"
Task: "Create OrderStatusChart component"
Task: "Create RecentOrdersWidget component"
Task: "Create ShipmentStatusWidget component"
```

## Parallel Example: Entity Management Features (Phases 5-8)

```bash
# After Phase 4 completes, these can run in parallel with different developers:
Developer A: Phase 5 (Products - US3)
Developer B: Phase 6 (Orders - US4)
Developer C: Phase 7 (Payments - US5)
Developer D: Phase 8 (Shipments - US6)
```

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Authentication)
4. Complete Phase 4: User Story 2 (Dashboard with shell layout)
5. **STOP and VALIDATE**: Users can login, see dashboard with metrics and charts
6. Deploy/demo if ready - this is a working MVP!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Auth) → Test login flow → Users can access system
3. Add US2 (Dashboard) → Test dashboard → Users see business metrics (MVP!)
4. Add US3 (Products) → Test products table → Deploy
5. Add US4 (Orders) → Test orders with detail → Deploy
6. Add US5 (Payments) → Test payments → Deploy
7. Add US6 (Shipments) → Test shipments → Deploy
8. Add Polish → Final QA → Production release

### Parallel Team Strategy

With multiple developers after Phase 4:

1. Team completes Setup + Foundational + US1 + US2 together
2. Once US2 (Dashboard/Shell) is done:
   - Developer A: US3 (Products)
   - Developer B: US4 (Orders)
   - Developer C: US5 (Payments)
   - Developer D: US6 (Shipments)
3. Stories complete and integrate independently
4. Everyone collaborates on Polish phase

---

## Summary

| Phase | Story | Tasks | Parallel Tasks |
|-------|-------|-------|----------------|
| Phase 1 | Setup | 12 | 5 |
| Phase 2 | Foundational | 17 | 10 |
| Phase 3 | US1 (Auth) | 10 | 2 |
| Phase 4 | US2 (Dashboard) | 18 | 6 |
| Phase 5 | US3 (Products) | 12 | 4 |
| Phase 6 | US4 (Orders) | 11 | 1 |
| Phase 7 | US5 (Payments) | 8 | 1 |
| Phase 8 | US6 (Shipments) | 11 | 1 |
| Phase 9 | Polish | 12 | 6 |
| **Total** | | **111** | **36** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Unit tests are REQUIRED per Constitution - write tests first
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Dark theme must be consistent across ALL components
- All data tables must support filtering and sorting per spec requirements
