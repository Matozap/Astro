# Quickstart: Angular Frontend Application

**Feature**: 001-angular-frontend | **Date**: 2025-12-21

This guide provides step-by-step instructions for setting up the Angular frontend development environment.

---

## Prerequisites

- **Node.js**: 20.x LTS or later
- **npm**: 10.x or later (comes with Node.js)
- **Angular CLI**: 19.x (`npm install -g @angular/cli@19`)
- **Backend API**: Running Astro GraphQL API (via .NET Aspire)

### Verify Prerequisites

```bash
# Check Node.js version (should be 20.x+)
node --version

# Check npm version (should be 10.x+)
npm --version

# Check Angular CLI version (should be 19.x)
ng version
```

---

## Project Setup

### 1. Create Angular Project

From the repository root (`D:\Local\src\Matozap\Astro`):

```bash
# Create new Angular project with standalone components
ng new client --standalone --style=scss --routing --skip-git --skip-tests

# Navigate to project
cd client
```

### 2. Add Angular Material

```bash
# Add Angular Material with M3 theming
ng add @angular/material

# When prompted:
# - Theme: Custom (we'll configure dark theme manually)
# - Typography: Yes
# - Animations: Yes
```

### 3. Add Apollo Angular (GraphQL)

```bash
# Add Apollo Angular
ng add apollo-angular

# When prompted for GraphQL endpoint:
# Enter: http://localhost:5000/graphql (or use environment variable)
```

### 4. Add Additional Dependencies

```bash
# Charting library
npm install echarts ngx-echarts

# GraphQL code generation (dev dependency)
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-apollo-angular
```

---

## Configuration

### 1. Environment Configuration

Create/update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  graphqlUrl: 'http://localhost:5000/graphql',
  graphqlWsUrl: 'ws://localhost:5000/graphql',
};
```

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  graphqlUrl: '/graphql',
  graphqlWsUrl: '/graphql',
};
```

### 2. GraphQL Codegen Configuration

Create `codegen.ts` in the client root:

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:5000/graphql',
  documents: ['src/**/*.graphql', '../specs/001-angular-frontend/contracts/*.graphql'],
  generates: {
    'src/app/shared/graphql/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-apollo-angular',
      ],
      config: {
        addExplicitOverride: true,
        strictScalars: true,
        scalars: {
          UUID: 'string',
          DateTime: 'string',
          Decimal: 'number',
        },
      },
    },
  },
};

export default config;
```

Add script to `package.json`:

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch"
  }
}
```

### 3. Dark Theme Configuration

Create `src/styles/_theme.scss`:

```scss
@use '@angular/material' as mat;

// Define dark theme with custom colors
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
  density: (
    scale: 0,
  ),
));

// Apply theme globally
:root {
  @include mat.all-component-themes($dark-theme);
  color-scheme: dark;
}

// Custom CSS variables for dashboard
:root {
  --primary-color: #abc7ff;
  --primary-dark: #005cbb;
  --background-color: #1a1a2e;
  --surface-color: #25253a;
  --surface-variant: #2d2d44;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 64px;
  --header-height: 64px;
}
```

Update `src/styles.scss`:

```scss
@use './styles/theme';

html, body {
  height: 100%;
  margin: 0;
  background-color: var(--background-color);
  color: var(--text-primary);
}

body {
  font-family: 'Manrope', 'Roboto', sans-serif;
}
```

### 4. Proxy Configuration (Development)

Create `proxy.conf.json` in client root:

```json
{
  "/graphql": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Update `angular.json` serve configuration:

```json
{
  "serve": {
    "options": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

---

## Folder Structure Setup

Create the following folder structure:

```bash
# Core module folders
mkdir -p src/app/core/auth
mkdir -p src/app/core/graphql
mkdir -p src/app/core/layout

# Feature module folders
mkdir -p src/app/features/dashboard
mkdir -p src/app/features/products
mkdir -p src/app/features/orders
mkdir -p src/app/features/payments
mkdir -p src/app/features/shipments
mkdir -p src/app/features/login

# Shared module folders
mkdir -p src/app/shared/components
mkdir -p src/app/shared/models
mkdir -p src/app/shared/utils
mkdir -p src/app/shared/graphql

# Assets folders
mkdir -p src/assets/images
mkdir -p src/assets/icons
```

---

## Running the Application

### Start Backend (Required)

From the repository root:

```bash
# Start Aspire orchestration (includes API and database)
cd Astro.AppHost
dotnet run
```

The API will be available at `http://localhost:5000/graphql`.

### Start Frontend Development Server

```bash
# From client directory
cd client

# Generate GraphQL types (requires backend running)
npm run codegen

# Start development server
ng serve

# Or with specific port
ng serve --port 4200
```

The frontend will be available at `http://localhost:4200`.

### Run Tests

```bash
# Unit tests
ng test

# Unit tests with coverage
ng test --code-coverage
```

---

## .NET Aspire Integration

To integrate the Angular client with Aspire orchestration, update `Astro.AppHost/AppHost.cs`:

```csharp
// Add after existing service definitions
var client = builder.AddNpmApp("client", "../client", "start")
    .WithReference(api)
    .WithHttpEndpoint(port: 4200, env: "PORT")
    .WaitFor(api)
    .WithExternalHttpEndpoints();
```

Then run everything via Aspire:

```bash
cd Astro.AppHost
dotnet run
```

---

## Verification Checklist

After setup, verify:

- [ ] `ng serve` starts without errors
- [ ] Dark theme is applied (dark background)
- [ ] Proxy to GraphQL works (`/graphql` endpoint accessible)
- [ ] `npm run codegen` generates TypeScript types
- [ ] Angular Material components render correctly
- [ ] Browser console shows no errors

---

## Common Issues

### CORS Errors

If you see CORS errors, ensure:
1. Proxy configuration is correct
2. Backend CORS is configured for `http://localhost:4200`

### GraphQL Codegen Fails

Ensure the backend is running before running `npm run codegen`.

### Material Theme Not Applied

Check that `_theme.scss` is imported in `styles.scss` and `angular.json` includes the styles path.

---

## Next Steps

1. Implement authentication service and login page
2. Create layout shell with sidebar navigation
3. Build dashboard with metric widgets and charts
4. Implement entity management pages (Products, Orders, Payments, Shipments)
5. Add unit tests for services and components

Refer to `tasks.md` (generated by `/speckit.tasks`) for detailed implementation tasks.
