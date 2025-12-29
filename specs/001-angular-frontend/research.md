# Research: Angular Frontend Application

**Feature**: 001-angular-frontend | **Date**: 2025-12-21

This document captures technology decisions and research findings for the Angular frontend implementation.

---

## 1. Angular Version & Architecture

### Decision: Angular 19.x with Standalone Components

**Rationale**: Angular 19 (released November 2024) is the latest stable version with full Material 3 support, improved hydration, and optimized bundle sizes. Standalone components eliminate NgModule boilerplate and are now the recommended pattern.

**Alternatives Considered**:
- Angular 18: Still supported but lacks latest M3 theming improvements
- Angular 17: Would miss incremental hydration and latest performance optimizations

**Implementation Notes**:
- Use `ng new client --standalone --style=scss --routing` for project scaffolding
- Configure `provideRouter` with lazy loading for feature modules
- Use signals for reactive state where appropriate

---

## 2. UI Framework & Theming

### Decision: Angular Material 19 with Material 3 (M3) Theming

**Rationale**: Angular Material 19 has full M3 support with CSS custom properties (design tokens), enabling granular theme customization without selector overrides. The `light-dark()` CSS function provides seamless dark mode support.

**Alternatives Considered**:
- PrimeNG: Feature-rich but heavier bundle, different design language
- Tailwind CSS + Headless UI: More flexibility but no Material Design components
- Bootstrap: Not aligned with Material Design aesthetic

**Theme Configuration**:
```scss
// Using M3 theme with dark mode
@use '@angular/material' as mat;

$dark-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$azure-palette,
    tertiary: mat.$violet-palette,
  ),
  typography: (
    brand-family: 'Manrope, sans-serif',
    plain-family: 'Roboto, sans-serif',
  ),
));

:root {
  @include mat.all-component-themes($dark-theme);
  color-scheme: dark;
}
```

**Design Reference**: [MatDash Angular Dark](https://matdash-angular-dark.netlify.app/dashboards/dashboard2)
- Dark sidebar with navigation icons
- Card-based widget layout
- Manrope/Inter font family
- Primary blue (#005cbb dark: #abc7ff) with accent colors

---

## 3. GraphQL Client

### Decision: Apollo Angular 8.x with @apollo/client 4.x

**Rationale**: Apollo Client is the industry standard for GraphQL with excellent TypeScript support, intelligent caching (InMemoryCache), and devtools. Apollo Angular provides Angular-specific integrations with observables.

**Alternatives Considered**:
- URQL: Lighter weight but less mature Angular integration
- graphql-request: Too minimal, no caching
- Native fetch: Would require manual cache implementation

**Implementation Notes**:
```typescript
// graphql.provider.ts
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

export function provideGraphQL() {
  return provideApollo(() => {
    const httpLink = inject(HttpLink);
    return {
      link: httpLink.create({ uri: environment.graphqlUrl }),
      cache: new InMemoryCache(),
    };
  });
}
```

**Code Generation**: Use `@graphql-codegen/cli` to generate TypeScript types from GraphQL schema.

---

## 4. Charting Library

### Decision: Apache ECharts via ngx-echarts

**Rationale**: ECharts provides visually impressive, interactive charts with excellent dark theme support. The MatDash reference uses similar chart aesthetics. ngx-echarts provides Angular bindings.

**Alternatives Considered**:
- Chart.js / ng2-charts: Simpler but less visually impressive
- ngx-charts (Swimlane): Good Material integration but limited chart types
- D3.js: Too low-level for dashboard widgets
- Highcharts: Requires commercial license

**Dashboard Charts Needed** (from reference image):
- Revenue Forecast: Bar chart with grouped bars (2024 vs 2025)
- Annual Profit: Area/line chart with trend
- Progress indicators: Circular progress / gauge widgets
- Metric cards: Simple stat displays with sparklines

---

## 5. Authentication Strategy

### Decision: JWT Token-based Authentication with sessionStorage

**Rationale**:
- Spec FR-018 requires sessionStorage (tokens cleared on tab close)
- Backend currently has no auth implementation - frontend will mock/prepare for it
- GraphQL API will need a login mutation added to backend

**Implementation Notes**:
```typescript
// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  login(credentials: LoginCredentials): Observable<AuthResult> {
    // Will call GraphQL mutation when backend implements it
    // For now, mock successful login for development
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem(this.TOKEN_KEY);
  }
}
```

**Auth Guard**: Implement `CanActivate` functional guard to protect routes.

**Note**: Backend authentication is out of scope for this feature. Frontend will include auth UI and service structure, with mock authentication for development.

---

## 6. State Management

### Decision: Apollo Client Cache + Angular Signals (no external state library)

**Rationale**: Apollo InMemoryCache handles server state. Angular 19 signals provide lightweight reactive state for UI state. No need for NgRx/NGXS complexity for a read-heavy dashboard.

**Alternatives Considered**:
- NgRx: Overkill for primarily GraphQL-backed data
- NGXS: Same concerns as NgRx
- Akita: Additional dependency not needed

**Implementation Notes**:
- Use Apollo `watchQuery` for auto-updating queries
- Use Angular signals for UI state (sidebar collapsed, loading states)
- Component-level state for forms and local interactions

---

## 7. Responsive Design Strategy

### Decision: CSS Grid + Flexbox with Material Breakpoints

**Rationale**: CSS Grid provides powerful 2D layouts for dashboard widgets. Material Design breakpoints ensure consistency. No need for additional CSS frameworks.

**Breakpoints** (Material Design):
- xs: 0-599px (mobile)
- sm: 600-959px (tablet portrait)
- md: 960-1279px (tablet landscape)
- lg: 1280-1919px (desktop)
- xl: 1920px+ (large desktop)

**Implementation Notes**:
```scss
// Dashboard grid responsive layout
.dashboard-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 8. .NET Aspire Integration

### Decision: Register Angular app as npm project in AppHost

**Rationale**: Aspire can orchestrate Node.js/npm applications alongside .NET services, providing unified local development experience.

**Implementation Notes**:
```csharp
// AppHost.cs addition
var client = builder.AddNpmApp("client", "../client", "start")
    .WithReference(api)
    .WithHttpEndpoint(port: 4200, env: "PORT")
    .WithExternalHttpEndpoints();
```

**Proxy Configuration**: Angular dev server will proxy `/graphql` to Aspire-managed API.

---

## 9. Testing Strategy

### Decision: Jasmine/Karma for unit tests, Cypress for E2E (optional)

**Rationale**: Angular CLI includes Jasmine/Karma by default. Sufficient for component and service tests. Cypress for E2E if time permits.

**Test Coverage Requirements** (per Constitution):
- Services: AuthService, GraphQL services (query/mutation wrappers)
- Guards: AuthGuard, route guards
- Components: Key dashboard widgets, data tables

**Implementation Notes**:
```typescript
// Example service test
describe('AuthService', () => {
  it('should return false when no token exists', () => {
    sessionStorage.clear();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
```

---

## 10. Project Setup Commands

```bash
# Create Angular project
ng new client --standalone --style=scss --routing --skip-git

# Add Angular Material with M3
ng add @angular/material

# Add Apollo Angular
ng add apollo-angular

# Add charting
npm install echarts ngx-echarts

# Add GraphQL codegen (dev dependency)
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations

# Generate GraphQL types
npx graphql-codegen
```

---

## Summary of Decisions

| Category | Decision | Key Rationale |
|----------|----------|---------------|
| Framework | Angular 19.x standalone | Latest features, M3 support |
| UI Library | Angular Material 19 (M3) | Native Material Design, dark theme |
| GraphQL | Apollo Angular 8.x | Industry standard, caching |
| Charts | Apache ECharts (ngx-echarts) | Visual impact, dark theme |
| Auth | JWT + sessionStorage | Spec requirement, secure |
| State | Apollo Cache + Signals | Minimal complexity |
| Responsive | CSS Grid + Material breakpoints | Native CSS, no dependencies |
| Testing | Jasmine/Karma | Angular default, sufficient |

---

## References

- [Angular Material Theming Guide](https://material.angular.dev/guide/theming)
- [Apollo Angular Documentation](https://the-guild.dev/graphql/apollo-angular/docs)
- [Apache ECharts](https://echarts.apache.org/)
- [MatDash Angular Dark Template](https://matdash-angular-dark.netlify.app/dashboards/dashboard2)
- [Angular 19 Release Notes](https://blog.angular.dev/)
