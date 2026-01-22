# Quickstart: Shipment Commands

**Feature**: Shipment Commands
**Date**: 2026-01-21

## Overview

This guide provides step-by-step instructions for implementing shipment create and update functionality in the Angular frontend. The backend GraphQL mutations already exist.

---

## Prerequisites

- Node.js 20+ and npm installed
- Angular CLI installed globally
- Backend API running (via `dotnet run` in Astro.AppHost or `dotnet aspire run`)
- Existing shipments feature module at `client/src/app/features/shipments/`

---

## Quick Setup

```bash
# Navigate to client directory
cd client

# Install dependencies (if not already done)
npm install

# Start development server
ng serve

# Run tests
ng test --watch=false
```

---

## Implementation Steps

### Step 1: Add GraphQL Mutations

Create `client/src/app/features/shipments/graphql/shipment.mutations.ts`:

```typescript
import { gql } from 'apollo-angular';

export const CREATE_SHIPMENT = gql`
  mutation CreateShipment($command: CreateShipmentCommandInput!) {
    createShipment(input: { command: $command }) {
      shipment {
        id
        orderId
        trackingNumber
        carrier
        status
        // ... (see contracts/mutations.graphql for full query)
      }
    }
  }
`;

export const UPDATE_SHIPMENT = gql`
  mutation UpdateShipment($command: UpdateShipmentCommandInput!) {
    updateShipment(input: { command: $command }) {
      shipment {
        id
        trackingNumber
        carrier
        status
        trackingDetails { ... }
        updatedAt
      }
    }
  }
`;
```

### Step 2: Extend Shipment Model

Add to `client/src/app/shared/models/shipment.model.ts`:

```typescript
// Input types for mutations
export interface CreateShipmentInput {
  orderId: string;
  carrier: string;
  trackingNumber?: string;
  originStreet: string;
  // ... (see data-model.md for full interface)
  items: CreateShipmentItemInput[];
}

export interface UpdateShipmentInput {
  id: string;
  carrier?: string;
  trackingNumber?: string;
  status?: ShipmentStatus;
  statusLocation?: string;
  statusNotes?: string;
  modifiedBy: string;
}

// Status transitions
export const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  'Pending': ['Shipped'],
  'Shipped': ['InTransit', 'Delayed', 'FailedDelivery'],
  // ... (see data-model.md for full map)
};
```

### Step 3: Extend Shipment Service

Update `client/src/app/features/shipments/services/shipment.service.ts`:

```typescript
import { CREATE_SHIPMENT, UPDATE_SHIPMENT } from '../graphql/shipment.mutations';

@Injectable({ providedIn: 'root' })
export class ShipmentService {
  // ... existing code ...

  createShipment(input: CreateShipmentInput): Observable<Shipment> {
    return this.apollo
      .mutate<{ createShipment: { shipment: Shipment } }>({
        mutation: CREATE_SHIPMENT,
        variables: { command: input },
        refetchQueries: [{ query: GET_SHIPMENTS }],
      })
      .pipe(
        map((result) => {
          if (!result.data?.createShipment?.shipment) {
            throw new Error('No data returned');
          }
          return result.data.createShipment.shipment;
        })
      );
  }

  updateShipment(input: UpdateShipmentInput): Observable<Shipment> {
    return this.apollo
      .mutate<{ updateShipment: { shipment: Shipment } }>({
        mutation: UPDATE_SHIPMENT,
        variables: { command: input },
      })
      .pipe(
        map((result) => {
          if (!result.data?.updateShipment?.shipment) {
            throw new Error('No data returned');
          }
          return result.data.updateShipment.shipment;
        })
      );
  }
}
```

### Step 4: Create Shipment Create Component

Generate component:
```bash
ng generate component features/shipments/components/shipment-create --standalone
```

Key implementation points:
- Use `FormBuilder` for reactive form with all required fields
- Use `mat-autocomplete` for order selection (load from OrderService)
- Auto-populate destination address from selected order
- Manage item selection from order details
- Show loading state during submission
- Handle validation and GraphQL errors

### Step 5: Create Status Update Dialog

Generate component:
```bash
ng generate component features/shipments/dialogs/status-update-dialog --standalone
```

Key implementation points:
- Accept `StatusUpdateDialogData` with current shipment and new status
- Show location and notes input fields
- Return `StatusUpdateDialogResult` on confirm

### Step 6: Create Shipment Edit Dialog

Generate component:
```bash
ng generate component features/shipments/dialogs/shipment-edit-dialog --standalone
```

Key implementation points:
- Accept `ShipmentEditDialogData` with current shipment
- Allow editing carrier and tracking number
- Only accessible for shipments in "Pending" status

### Step 7: Update Shipments List

Add "Create Shipment" button to `shipments-list.component.html`:

```html
<button mat-raised-button color="primary" routerLink="/shipments/create">
  <mat-icon>add</mat-icon>
  Create Shipment
</button>
```

### Step 8: Update Shipment Detail

Add update actions to `shipment-detail.component.ts`:

```typescript
// Add status update menu
canUpdateStatus(): boolean {
  const shipment = this.shipment();
  return shipment && !isTerminalStatus(shipment.status);
}

getAvailableStatuses(): ShipmentStatus[] {
  const shipment = this.shipment();
  return shipment ? getAvailableTransitions(shipment.status) : [];
}

// Add edit button for pending shipments
canEditShipment(): boolean {
  return this.shipment()?.status === 'Pending';
}
```

### Step 9: Update Routes

Update `shipments.routes.ts`:

```typescript
export const SHIPMENT_ROUTES: Route[] = [
  { path: '', component: ShipmentsListComponent },
  { path: 'create', component: ShipmentCreateComponent },
  { path: ':id', component: ShipmentDetailComponent },
];
```

### Step 10: Add Unit Tests

Create test files for each new component following existing patterns:

- `shipment-create.component.spec.ts`
- `status-update-dialog.component.spec.ts`
- `shipment-edit-dialog.component.spec.ts`
- `shipments-list.component.spec.ts`
- `shipment-detail.component.spec.ts`
- `shipment.service.spec.ts`

Test categories:
- initialization
- form validation
- submission success
- submission error
- cancel navigation
- error handling

---

## Testing Commands

```bash
# Run all tests
ng test --watch=false

# Run tests with coverage
ng test --watch=false --code-coverage

# Run specific test file
ng test --watch=false --include="**/shipment-create.component.spec.ts"

# Run tests in watch mode during development
ng test
```

---

## Verification Checklist

- [ ] Create shipment form displays all required fields
- [ ] Order selection auto-populates destination address
- [ ] Items can be added/removed from shipment
- [ ] Form validation prevents submission with invalid data
- [ ] Successful creation navigates to detail view
- [ ] Status update dialog shows available transitions
- [ ] Status update includes location and notes
- [ ] Edit dialog only available for Pending shipments
- [ ] Error messages display correctly
- [ ] All unit tests pass

---

## File Structure After Implementation

```
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
│   ├── shipment.queries.ts
│   └── shipment.mutations.ts
├── services/
│   ├── shipment.service.ts
│   └── shipment.service.spec.ts
├── shipments-list/
│   ├── shipments-list.component.ts
│   ├── shipments-list.component.html
│   ├── shipments-list.component.scss
│   └── shipments-list.component.spec.ts
├── shipment-detail/
│   ├── shipment-detail.component.ts
│   ├── shipment-detail.component.html
│   ├── shipment-detail.component.scss
│   └── shipment-detail.component.spec.ts
└── shipments.routes.ts
```

---

## Common Issues & Solutions

### Issue: Apollo cache not updating after mutation
**Solution**: Use `refetchQueries` option in mutation call to refresh list data.

### Issue: Form validation not showing errors
**Solution**: Mark fields as touched before checking validation: `Object.keys(form.controls).forEach(key => form.get(key)?.markAsTouched());`

### Issue: Status transition rejected by backend
**Solution**: Ensure frontend state machine matches backend (see `SHIPMENT_STATUS_TRANSITIONS`).

### Issue: Order details not loading
**Solution**: Ensure OrderService is properly injected and `getOrders()` is called with appropriate filters.
