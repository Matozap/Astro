# Research: Payment Commands

**Feature**: Payment Commands
**Date**: 2026-01-15
**Status**: Complete

## Research Summary

This document captures patterns and best practices discovered during codebase analysis to inform the payment commands implementation.

---

## 1. Backend API Analysis

### Decision: Use Existing Backend Mutations
**Rationale**: Backend GraphQL mutations for payment operations already exist and are fully functional.
**Alternatives Considered**: None - reuse existing implementation.

### Existing Mutations (server/Astro.Api/Payments/GraphQL/Mutation.cs)

```csharp
// CreatePayment mutation
[Error<ValidationException>]
[Error<OrderNotFoundException>]
public async Task<Payment> CreatePayment(
    CreatePaymentCommand command,  // { OrderId, Amount, Currency, PaymentMethod }
    ...
)

// UpdatePaymentStatus mutation
[Error<ValidationException>]
[Error<PaymentNotFoundException>]
public async Task<Payment> UpdatePaymentStatus(
    UpdatePaymentStatusCommand command,  // { PaymentId, NewStatus }
    ...
)
```

### Key Backend Behaviors
- `CreatePayment`: Validates order exists, creates payment with Pending status
- `UpdatePaymentStatus`: Validates payment exists, validates status transition (Pending → Successful/Failed only)
- Both mutations publish subscription events for real-time updates

---

## 2. Frontend Pattern Analysis

### Decision: Separate Routed Page for Create
**Rationale**: Products and Orders both use separate routed pages for create operations, not dialogs.
**Alternatives Considered**: Dialog-based create (rejected - inconsistent with existing patterns).

**Reference Files**:
- `client/src/app/features/products/product-create/product-create.component.ts`
- `client/src/app/features/orders/components/order-create/order-create.component.ts`

### Create Component Pattern
```typescript
@Component({
  standalone: true,
  imports: [...],
})
export class ProductCreateComponent {
  private readonly service = inject(ProductService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  isSubmitting = signal(false);

  onFormSubmit(formValue: FormValue): void {
    this.isSubmitting.set(true);
    this.service.create(command).subscribe({
      next: () => {
        this.notificationService.success('Created successfully');
        this.router.navigate(['/list']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        // Extract GraphQL error message
        this.notificationService.error(errorMessage);
      },
    });
  }

  onFormCancel(): void {
    this.router.navigate(['/list']);
  }
}
```

---

## 3. Status Update Pattern

### Decision: Mat-Menu Dropdown with Confirmation Dialog
**Rationale**: Orders use mat-menu for status transitions; Products use MatDialog for destructive confirmations.
**Alternatives Considered**: Inline buttons (rejected - less scalable for multiple status options).

**Reference Files**:
- `client/src/app/features/orders/order-detail/order-detail.component.ts` (mat-menu pattern)
- `client/src/app/features/products/dialogs/delete-confirm-dialog/` (dialog pattern)

### Status Menu Pattern (from OrderDetailComponent)
```typescript
canUpdateStatus(): boolean {
  const entity = this.entity();
  if (!entity) return false;
  return !['TERMINAL_STATUS_1', 'TERMINAL_STATUS_2'].includes(entity.status);
}

getAvailableStatuses(): Status[] {
  const entity = this.entity();
  if (!entity) return [];
  const statusTransitions: Record<Status, Status[]> = {
    'INITIAL': ['NEXT_1', 'NEXT_2'],
    'TERMINAL': [],
  };
  return statusTransitions[entity.status] || [];
}

updateStatus(newStatus: Status): void {
  this.updatingStatus.set(true);
  this.service.updateStatus(entity.id, newStatus).subscribe({
    next: (updated) => {
      this.entity.set({ ...entity, ...updated });
      this.notificationService.success(`Status updated to ${newStatus}`);
    },
    error: (error) => {
      this.notificationService.error(errorMessage);
    },
  });
}
```

### Confirmation Dialog Pattern (from DeleteConfirmDialog)
```typescript
export interface DialogData {
  entityName: string;
  entityIdentifier: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
```

---

## 4. GraphQL Mutation Pattern

### Decision: Follow HotChocolate Mutation Conventions
**Rationale**: Existing mutations use `input: { command: $command }` wrapper pattern.
**Alternatives Considered**: None - must match backend schema.

**Reference**: `client/src/app/features/products/graphql/product.mutations.ts`

### Mutation Pattern
```typescript
export const CREATE_ENTITY = gql`
  mutation CreateEntity($command: CreateEntityCommandInput!) {
    createEntity(input: { command: $command }) {
      entity {
        id
        // ... fields
      }
    }
  }
`;
```

### Service Mutation Pattern
```typescript
createEntity(input: CreateInput): Observable<Entity> {
  return this.apollo
    .mutate<{ createEntity: { entity: Entity } }>({
      mutation: CREATE_ENTITY,
      variables: { command: input },
      refetchQueries: [{ query: GET_ENTITIES }],
    })
    .pipe(
      map((result) => {
        if (!result.data?.createEntity?.entity) {
          throw new Error('No data returned');
        }
        return result.data.createEntity.entity;
      }),
      catchError((error) => { throw error; })
    );
}
```

---

## 5. Form Validation Pattern

### Decision: Reactive Forms with Field-Level Validation
**Rationale**: Consistent with existing products/orders forms.
**Alternatives Considered**: Template-driven forms (rejected - less control over validation).

### Form Validation Pattern
```typescript
this.form = this.fb.group({
  orderId: ['', [Validators.required]],
  amount: [null, [Validators.required, Validators.min(0.01)]],
  currency: ['USD', [Validators.required]],
  paymentMethod: ['', [Validators.required]],
});

getErrorMessage(fieldName: string): string {
  const control = this.form.get(fieldName);
  if (control?.hasError('required')) {
    return `${fieldName} is required`;
  }
  if (control?.hasError('min')) {
    return 'Amount must be greater than 0';
  }
  return '';
}
```

---

## 6. Unit Testing Pattern

### Decision: Jasmine/Karma with Mocked Services
**Rationale**: Existing spec files use this pattern.
**Alternatives Considered**: Jest (rejected - not configured in project).

**Reference**: `client/src/app/features/payments/payment-detail/payment-detail.component.spec.ts`

### Test Pattern
```typescript
describe('ComponentName', () => {
  let component: ComponentType;
  let fixture: ComponentFixture<ComponentType>;
  let serviceSpy: jasmine.SpyObj<ServiceType>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ServiceType', ['method1', 'method2']);

    await TestBed.configureTestingModule({
      imports: [ComponentType],
      providers: [
        { provide: ServiceType, useValue: serviceSpy },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['success', 'error']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentType);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## 7. Payment Status State Machine

### Decision: Replicate Backend State Machine in Frontend
**Rationale**: Frontend must only show valid transitions.

### Payment Status Transitions
```
Pending → Successful (terminal)
Pending → Failed (terminal)
Successful → (no transitions - terminal)
Failed → (no transitions - terminal)
```

### Implementation
```typescript
const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  'Pending': ['Successful', 'Failed'],
  'Successful': [],  // Terminal
  'Failed': [],      // Terminal
};

canUpdateStatus(status: PaymentStatus): boolean {
  return PAYMENT_STATUS_TRANSITIONS[status].length > 0;
}

getAvailableStatuses(currentStatus: PaymentStatus): PaymentStatus[] {
  return PAYMENT_STATUS_TRANSITIONS[currentStatus];
}
```

---

## 8. Order Selection Pattern

### Decision: Mat-Autocomplete with Search
**Rationale**: Orders have orderNumber for easy identification; autocomplete provides good UX.
**Alternatives Considered**: Simple dropdown (rejected - not scalable for many orders).

### Implementation Approach
```typescript
// Use existing order service to fetch orders
// Filter by search text matching orderNumber or customerName
// Display: "#{orderNumber} - {customerName}"
// Store: orderId
```

---

## Research Findings Summary

| Topic | Decision | Pattern Source |
|-------|----------|----------------|
| Create Form | Separate routed page | ProductCreateComponent |
| Status Update | Mat-menu + confirmation dialog | OrderDetailComponent + DeleteConfirmDialog |
| GraphQL Mutations | HotChocolate input wrapper | product.mutations.ts |
| Form Validation | Reactive forms + field errors | ProductFormComponent |
| Unit Tests | Jasmine/Karma + mocked services | payment-detail.component.spec.ts |
| State Machine | Pending → Successful/Failed only | Backend domain model |
| Order Selection | Mat-autocomplete | Existing patterns |

All unknowns resolved. Ready for Phase 1 design.
