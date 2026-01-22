# Research: Shipment Commands

**Feature**: Shipment Commands
**Date**: 2026-01-21
**Status**: Complete

## Research Summary

This document captures patterns and best practices discovered during codebase analysis to inform the shipment commands implementation.

---

## 1. Backend API Analysis

### Decision: Use Existing Backend Mutations
**Rationale**: Backend GraphQL mutations for shipment operations already exist and are fully functional.
**Alternatives Considered**: None - reuse existing implementation.

### Existing Mutations (server/Astro.Api/Shipments/GraphQL/Mutation.cs)

```csharp
// CreateShipment mutation
[Error<ValidationException>]
public async Task<Shipment> CreateShipment(
    CreateShipmentCommand command,
    // { OrderId, Carrier, TrackingNumber?, OriginStreet, OriginCity, OriginState,
    //   OriginPostalCode, OriginCountry, DestinationStreet, DestinationCity,
    //   DestinationState, DestinationPostalCode, DestinationCountry, Weight,
    //   WeightUnit, Length, Width, Height, DimensionUnit, ShippingCost,
    //   EstimatedDeliveryDate?, CreatedBy, Items[] }
    ...
)

// UpdateShipment mutation
[Error<ValidationException>]
[Error<ShipmentNotFoundException>]
[Error<InvalidShipmentStatusTransitionException>]
public async Task<Shipment> UpdateShipment(
    UpdateShipmentCommand command,
    // { Id, Carrier?, TrackingNumber?, Status?, StatusLocation?, StatusNotes?, ModifiedBy }
    ...
)
```

### Key Backend Behaviors
- `CreateShipment`: Creates shipment with Pending status, validates order exists, requires at least one item
- `UpdateShipment`:
  - Carrier/TrackingNumber updates only allowed when status is Pending
  - Status updates follow state machine (see section 7)
  - Adds TrackingDetail entry on status change
- Both mutations publish subscription events for real-time updates

---

## 2. Frontend Pattern Analysis

### Decision: Separate Routed Page for Create
**Rationale**: Products, orders, and payments all use separate routed pages for create operations.
**Alternatives Considered**: Dialog-based create (rejected - inconsistent with existing patterns, too many fields).

**Reference Files**:
- `client/src/app/features/orders/components/order-create/order-create.component.ts`
- `client/src/app/features/payments/components/payment-create/payment-create.component.ts`

### Create Component Pattern
```typescript
@Component({
  standalone: true,
  imports: [...],
})
export class EntityCreateComponent implements OnInit {
  private readonly service = inject(EntityService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  entityForm!: FormGroup;
  isSubmitting = signal(false);

  ngOnInit(): void {
    this.initializeForm();
    this.loadDependencies();
  }

  onSubmit(): void {
    if (this.entityForm.invalid) {
      this.notificationService.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);
    const currentUser = this.authService.currentUser();
    const createdBy = currentUser?.email || 'system';

    this.service.create({ ...formValue, createdBy }).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.notificationService.success('Created successfully');
        this.router.navigate(['/entity', created.id]);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.notificationService.error(extractErrorMessage(error));
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/entities']);
  }
}
```

---

## 3. Status Update Pattern

### Decision: Mat-Menu Dropdown + Confirmation Dialog
**Rationale**: Orders use mat-menu for status transitions; Payments use MatDialog for confirmation.
**Alternatives Considered**: Inline buttons (rejected - shipment has 8 possible statuses, not scalable).

**Reference Files**:
- `client/src/app/features/orders/order-detail/order-detail.component.ts` (mat-menu pattern)
- `client/src/app/features/payments/dialogs/status-confirm-dialog/` (dialog pattern)

### Status Menu + Dialog Pattern
```typescript
// In detail component
canUpdateStatus(): boolean {
  const shipment = this.shipment();
  if (!shipment) return false;
  return !['Delivered', 'Returned'].includes(shipment.status);
}

getAvailableStatuses(): ShipmentStatus[] {
  const shipment = this.shipment();
  if (!shipment) return [];
  return SHIPMENT_STATUS_TRANSITIONS[shipment.status] || [];
}

openStatusDialog(newStatus: ShipmentStatus): void {
  const dialogRef = this.dialog.open(StatusUpdateDialogComponent, {
    data: {
      shipment: this.shipment(),
      newStatus
    },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.updateStatus(result.status, result.location, result.notes);
    }
  });
}
```

---

## 4. Shipment Edit Pattern (Carrier/Tracking)

### Decision: Separate Edit Dialog for Pending Shipments
**Rationale**: Carrier and tracking number can only be edited when status is Pending; separate from status flow.
**Alternatives Considered**: Inline editing (rejected - want confirmation before save).

### Implementation Approach
```typescript
// Only show edit button for Pending shipments
canEditShipment(): boolean {
  return this.shipment()?.status === 'Pending';
}

openEditDialog(): void {
  const dialogRef = this.dialog.open(ShipmentEditDialogComponent, {
    data: { shipment: this.shipment() },
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.updateShipment(result);
    }
  });
}
```

---

## 5. GraphQL Mutation Pattern

### Decision: Follow HotChocolate Mutation Conventions
**Rationale**: Existing mutations use `input: { command: $command }` wrapper pattern.
**Alternatives Considered**: None - must match backend schema.

**Reference**: `client/src/app/features/products/graphql/product.mutations.ts`

### Mutation Pattern
```typescript
export const CREATE_SHIPMENT = gql`
  mutation CreateShipment($command: CreateShipmentCommandInput!) {
    createShipment(input: { command: $command }) {
      shipment {
        id
        orderId
        trackingNumber
        carrier
        status
        // ... all fields needed
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
        trackingDetails {
          id
          timestamp
          location
          status
          description
        }
        updatedAt
      }
    }
  }
`;
```

### Service Mutation Pattern
```typescript
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
```

---

## 6. Form Validation Pattern

### Decision: Reactive Forms with Field-Level Validation
**Rationale**: Consistent with existing products/orders/payments forms.
**Alternatives Considered**: Template-driven forms (rejected - less control over validation).

### Create Shipment Form Structure
```typescript
this.shipmentForm = this.fb.group({
  // Order Selection
  orderId: ['', [Validators.required]],

  // Carrier Info
  carrier: ['', [Validators.required, Validators.maxLength(100)]],
  trackingNumber: ['', [Validators.minLength(5), Validators.maxLength(50)]],

  // Origin Address
  originStreet: ['', [Validators.required, Validators.maxLength(200)]],
  originCity: ['', [Validators.required, Validators.maxLength(100)]],
  originState: ['', [Validators.required, Validators.maxLength(100)]],
  originPostalCode: ['', [Validators.required, Validators.maxLength(20)]],
  originCountry: ['', [Validators.required, Validators.maxLength(100)]],

  // Destination Address
  destinationStreet: ['', [Validators.required, Validators.maxLength(200)]],
  destinationCity: ['', [Validators.required, Validators.maxLength(100)]],
  destinationState: ['', [Validators.required, Validators.maxLength(100)]],
  destinationPostalCode: ['', [Validators.required, Validators.maxLength(20)]],
  destinationCountry: ['', [Validators.required, Validators.maxLength(100)]],

  // Physical Properties
  weight: [null, [Validators.required, Validators.min(0)]],
  weightUnit: ['lb', [Validators.required]],
  length: [null, [Validators.required, Validators.min(0)]],
  width: [null, [Validators.required, Validators.min(0)]],
  height: [null, [Validators.required, Validators.min(0)]],
  dimensionUnit: ['in', [Validators.required]],

  // Cost & Delivery
  shippingCost: [null, [Validators.required, Validators.min(0)]],
  estimatedDeliveryDate: [null],
});
```

---

## 7. Shipment Status State Machine

### Decision: Replicate Backend State Machine in Frontend
**Rationale**: Frontend must only show valid transitions; prevents invalid API calls.

### Status Transitions (from ShipmentStatusExtensions.cs)
```
Pending → Shipped
Shipped → InTransit, Delayed, FailedDelivery
InTransit → OutForDelivery, Delayed, FailedDelivery
OutForDelivery → Delivered, FailedDelivery, Delayed
Delayed → InTransit, OutForDelivery, FailedDelivery
FailedDelivery → Returned, InTransit
Delivered → (terminal - no transitions)
Returned → (terminal - no transitions)
```

### Implementation
```typescript
export const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  'Pending': ['Shipped'],
  'Shipped': ['InTransit', 'Delayed', 'FailedDelivery'],
  'InTransit': ['OutForDelivery', 'Delayed', 'FailedDelivery'],
  'OutForDelivery': ['Delivered', 'FailedDelivery', 'Delayed'],
  'Delayed': ['InTransit', 'OutForDelivery', 'FailedDelivery'],
  'FailedDelivery': ['Returned', 'InTransit'],
  'Delivered': [],  // Terminal
  'Returned': [],   // Terminal
};

canUpdateStatus(status: ShipmentStatus): boolean {
  return SHIPMENT_STATUS_TRANSITIONS[status].length > 0;
}

getAvailableStatuses(currentStatus: ShipmentStatus): ShipmentStatus[] {
  return SHIPMENT_STATUS_TRANSITIONS[currentStatus];
}
```

---

## 8. Order Selection Pattern

### Decision: Mat-Autocomplete with Order Details Display
**Rationale**: Orders have orderNumber for easy identification; need to show order details and items for shipment creation.
**Alternatives Considered**: Simple dropdown (rejected - need to show order items for shipment item selection).

**Reference**: `client/src/app/features/payments/components/payment-create/payment-create.component.ts`

### Implementation Approach
```typescript
// Order selection with autocomplete
orderSearchControl = new FormControl<string | Order>('');
selectedOrder = signal<Order | null>(null);

private _filterOrders(orders: Order[], value: string | Order | null): Order[] {
  if (!value || typeof value !== 'string') return orders;
  const filterValue = value.toLowerCase();
  return orders.filter(order =>
    order.orderNumber.toLowerCase().includes(filterValue) ||
    order.customerName.toLowerCase().includes(filterValue)
  );
}

displayOrder(order: Order | string | null): string {
  if (!order) return '';
  if (typeof order === 'string') return order;
  return `${order.orderNumber} - ${order.customerName}`;
}

onOrderSelected(order: Order): void {
  this.selectedOrder.set(order);
  // Auto-populate destination from order shipping address
  this.shipmentForm.patchValue({
    destinationStreet: order.shippingAddress.street,
    destinationCity: order.shippingAddress.city,
    destinationState: order.shippingAddress.state,
    destinationPostalCode: order.shippingAddress.postalCode,
    destinationCountry: order.shippingAddress.country,
  });
  // Populate available items from order details
  this.availableItems.set(order.details);
}
```

---

## 9. Shipment Items Management

### Decision: Select Items from Order Details
**Rationale**: Shipment items come from order details; user selects which items to include in this shipment.
**Alternatives Considered**: Manual item entry (rejected - items must reference valid order details).

### Implementation Approach
```typescript
availableItems = signal<OrderDetail[]>([]);
selectedItems = signal<ShipmentItemInput[]>([]);

// Display available items from selected order
// User clicks to add items with quantity
addItem(orderDetail: OrderDetail): void {
  const existing = this.selectedItems().find(
    item => item.orderDetailId === orderDetail.id
  );

  if (existing) {
    // Increment quantity
    this.selectedItems.update(items =>
      items.map(item =>
        item.orderDetailId === orderDetail.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } else {
    // Add new item
    this.selectedItems.update(items => [...items, {
      orderDetailId: orderDetail.id,
      productId: orderDetail.productId,
      productName: orderDetail.productName,
      productSku: orderDetail.productSku,
      quantity: 1,
    }]);
  }
}

removeItem(orderDetailId: string): void {
  this.selectedItems.update(items =>
    items.filter(item => item.orderDetailId !== orderDetailId)
  );
}
```

---

## 10. Unit Testing Pattern

### Decision: Jasmine/Karma with Mocked Services
**Rationale**: Existing spec files use this pattern.
**Alternatives Considered**: Jest (rejected - not configured in project).

**Reference**: `client/src/app/features/payments/components/payment-create/payment-create.component.spec.ts`

### Test Pattern
```typescript
describe('ShipmentCreateComponent', () => {
  let component: ShipmentCreateComponent;
  let fixture: ComponentFixture<ShipmentCreateComponent>;
  let mockShipmentService: jasmine.SpyObj<ShipmentService>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockShipmentService = jasmine.createSpyObj('ShipmentService', ['createShipment', 'updateShipment']);
    mockOrderService = jasmine.createSpyObj('OrderService', ['getOrders']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ShipmentCreateComponent, NoopAnimationsModule],
      providers: [
        { provide: ShipmentService, useValue: mockShipmentService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
      ],
    }).compileComponents();
  });

  // Test categories:
  // - initialization
  // - form validation
  // - order selection
  // - item management
  // - submission success
  // - submission error
  // - cancel navigation
});
```

---

## Research Findings Summary

| Topic | Decision | Pattern Source |
|-------|----------|----------------|
| Create Form | Separate routed page | OrderCreateComponent, PaymentCreateComponent |
| Status Update | Mat-menu + confirmation dialog | OrderDetailComponent + StatusConfirmDialog |
| Shipment Edit | Separate dialog for Pending only | PaymentDetailComponent pattern |
| GraphQL Mutations | HotChocolate input wrapper | product.mutations.ts |
| Form Validation | Reactive forms + field errors | OrderCreateComponent |
| Unit Tests | Jasmine/Karma + mocked services | payment-create.component.spec.ts |
| Status Machine | 8 states with valid transitions | ShipmentStatusExtensions.cs |
| Order Selection | Mat-autocomplete with details | PaymentCreateComponent |
| Item Management | Select from order details | Custom (follows order pattern) |

All unknowns resolved. Ready for Phase 1 design.
