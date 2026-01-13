import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { OrderCreateComponent } from './order-create.component';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../../products/services/product.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Product } from '../../../../shared/models/product.model';
import { Order } from '../../../../shared/models/order.model';
import { signal } from '@angular/core';

describe('OrderCreateComponent', () => {
  let component: OrderCreateComponent;
  let fixture: ComponentFixture<OrderCreateComponent>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockProducts: Product[] = [
    {
      id: 'prod-1',
      sku: 'SKU-001',
      name: 'Product 1',
      description: 'Test product 1',
      price: { amount: 100, currency: 'USD' },
      stockQuantity: 50,
      lowStockThreshold: 10,
      isActive: true,
      isLowStock: false,
      details: [],
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'admin',
      modifiedBy: 'admin',
    },
    {
      id: 'prod-2',
      sku: 'SKU-002',
      name: 'Product 2',
      description: 'Test product 2',
      price: { amount: 200, currency: 'USD' },
      stockQuantity: 30,
      lowStockThreshold: 10,
      isActive: true,
      isLowStock: false,
      details: [],
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'admin',
      modifiedBy: 'admin',
    },
    {
      id: 'prod-3',
      sku: 'SKU-003',
      name: 'Inactive Product',
      description: 'Inactive test product',
      price: { amount: 150, currency: 'USD' },
      stockQuantity: 20,
      lowStockThreshold: 10,
      isActive: false,
      isLowStock: false,
      details: [],
      images: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'admin',
      modifiedBy: 'admin',
    },
  ];

  const mockOrder: Order = {
    id: 'order-123',
    orderNumber: 'ORD-2024-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    shippingAddress: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
    },
    status: 'Pending',
    totalAmount: { amount: 300, currency: 'USD' },
    notes: 'Test order',
    details: [],
    itemCount: 3,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin@astro.com',
    modifiedBy: 'admin@astro.com',
  };

  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', ['createOrder']);
    mockProductService = jasmine.createSpyObj('ProductService', ['getProducts']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['currentUser']);

    mockProductService.getProducts.and.returnValue(of({
      items: mockProducts,
      totalCount: 3,
      page: 0,
      pageSize: 1000,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    }));

    mockAuthService.currentUser.and.returnValue({
      id: 'user-1',
      email: 'admin@astro.com',
      name: 'Admin User',
      role: 'Admin',
    });

    await TestBed.configureTestingModule({
      imports: [OrderCreateComponent, NoopAnimationsModule],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        { provide: ProductService, useValue: mockProductService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.orderForm).toBeDefined();
      expect(component.orderForm.get('customerName')?.value).toBe('');
      expect(component.orderForm.get('customerEmail')?.value).toBe('');
      expect(component.orderForm.get('street')?.value).toBe('');
      expect(component.orderForm.get('city')?.value).toBe('');
      expect(component.orderForm.get('state')?.value).toBe('');
      expect(component.orderForm.get('postalCode')?.value).toBe('');
      expect(component.orderForm.get('country')?.value).toBe('');
      expect(component.orderForm.get('notes')?.value).toBe('');
    });

    it('should load active products on init', () => {
      expect(mockProductService.getProducts).toHaveBeenCalledWith({ page: 0, pageSize: 1000 });
      expect(component.products.length).toBe(2); // Only active products
      expect(component.products[0].id).toBe('prod-1');
      expect(component.products[1].id).toBe('prod-2');
    });

    it('should initialize with empty selected products', () => {
      expect(component.selectedProducts.length).toBe(0);
    });

    it('should initialize order total as 0', () => {
      expect(component.orderTotal()).toBe(0);
    });

    it('should initialize isSubmitting as false', () => {
      expect(component.isSubmitting()).toBeFalse();
    });

    it('should handle error when loading products fails', () => {
      const errorProductService = jasmine.createSpyObj('ProductService', ['getProducts']);
      errorProductService.getProducts.and.returnValue(throwError(() => new Error('Load error')));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [OrderCreateComponent, NoopAnimationsModule],
        providers: [
          { provide: OrderService, useValue: mockOrderService },
          { provide: ProductService, useValue: errorProductService },
          { provide: NotificationService, useValue: mockNotificationService },
          { provide: Router, useValue: mockRouter },
          { provide: AuthService, useValue: mockAuthService },
        ],
      });

      const errorFixture = TestBed.createComponent(OrderCreateComponent);
      errorFixture.detectChanges();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Failed to load products');
    });
  });

  describe('form validation', () => {
    it('should require customer name', () => {
      const control = component.orderForm.get('customerName');
      expect(control?.hasError('required')).toBeTrue();

      control?.setValue('John Doe');
      expect(control?.hasError('required')).toBeFalse();
    });

    it('should require valid email', () => {
      const control = component.orderForm.get('customerEmail');
      expect(control?.hasError('required')).toBeTrue();

      control?.setValue('invalid-email');
      expect(control?.hasError('email')).toBeTrue();

      control?.setValue('valid@email.com');
      expect(control?.hasError('email')).toBeFalse();
    });

    it('should enforce max length on customer name', () => {
      const control = component.orderForm.get('customerName');
      control?.setValue('a'.repeat(201));
      expect(control?.hasError('maxlength')).toBeTrue();

      control?.setValue('a'.repeat(200));
      expect(control?.hasError('maxlength')).toBeFalse();
    });

    it('should require all address fields', () => {
      expect(component.orderForm.get('street')?.hasError('required')).toBeTrue();
      expect(component.orderForm.get('city')?.hasError('required')).toBeTrue();
      expect(component.orderForm.get('state')?.hasError('required')).toBeTrue();
      expect(component.orderForm.get('postalCode')?.hasError('required')).toBeTrue();
      expect(component.orderForm.get('country')?.hasError('required')).toBeTrue();
    });

    it('should make notes field optional', () => {
      const control = component.orderForm.get('notes');
      expect(control?.hasError('required')).toBeFalse();
    });
  });

  describe('product selection', () => {
    it('should filter products by name', fakeAsync(() => {
      component.productSearchControl.setValue('Product 1');
      tick();

      component.filteredProducts?.subscribe(filtered => {
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe('Product 1');
      });
    }));

    it('should filter products by SKU', (done) => {
      component.productSearchControl.setValue('SKU-002');

      component.filteredProducts?.subscribe(filtered => {
        expect(filtered.length).toBe(1);
        expect(filtered[0].sku).toBe('SKU-002');
        expect(filtered[0].name).toBe('Product 2');
        done();
      });
    });

    it('should add new product to selected products', () => {
      component.onProductSelected(mockProducts[0]);

      expect(component.selectedProducts.length).toBe(1);
      expect(component.selectedProducts[0].productId).toBe('prod-1');
      expect(component.selectedProducts[0].quantity).toBe(1);
      expect(component.selectedProducts[0].unitPrice).toBe(100);
      expect(component.selectedProducts[0].lineTotal).toBe(100);
    });

    it('should increment quantity if product already selected', () => {
      component.onProductSelected(mockProducts[0]);
      component.onProductSelected(mockProducts[0]);

      expect(component.selectedProducts.length).toBe(1);
      expect(component.selectedProducts[0].quantity).toBe(2);
      expect(component.selectedProducts[0].lineTotal).toBe(200);
    });

    it('should clear search control after product selection', () => {
      component.productSearchControl.setValue('Product 1');
      component.onProductSelected(mockProducts[0]);

      expect(component.productSearchControl.value).toBe('');
    });

    it('should calculate total when product is added', () => {
      component.onProductSelected(mockProducts[0]);
      expect(component.orderTotal()).toBe(100);

      component.onProductSelected(mockProducts[1]);
      expect(component.orderTotal()).toBe(300);
    });

    it('should display product correctly', () => {
      const display = component.displayProduct(mockProducts[0]);
      expect(display).toBe('Product 1 (SKU-001)');
    });
  });

  describe('product quantity management', () => {
    beforeEach(() => {
      component.onProductSelected(mockProducts[0]);
      component.onProductSelected(mockProducts[1]);
    });

    it('should update quantity and line total', () => {
      component.onQuantityChange(0, 5);

      expect(component.selectedProducts[0].quantity).toBe(5);
      expect(component.selectedProducts[0].lineTotal).toBe(500);
      expect(component.orderTotal()).toBe(700);
    });

    it('should not update quantity if value is 0 or negative', () => {
      const originalQuantity = component.selectedProducts[0].quantity;
      component.onQuantityChange(0, 0);
      expect(component.selectedProducts[0].quantity).toBe(originalQuantity);

      component.onQuantityChange(0, -1);
      expect(component.selectedProducts[0].quantity).toBe(originalQuantity);
    });

    it('should remove product from selected products', () => {
      expect(component.selectedProducts.length).toBe(2);

      component.removeProduct(0);

      expect(component.selectedProducts.length).toBe(1);
      expect(component.selectedProducts[0].productId).toBe('prod-2');
      expect(component.orderTotal()).toBe(200);
    });
  });

  describe('form submission', () => {
    beforeEach(() => {
      component.orderForm.patchValue({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA',
        notes: 'Test order',
      });
      component.onProductSelected(mockProducts[0]);
    });

    it('should show error if form is invalid', () => {
      component.orderForm.patchValue({ customerName: '' });
      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Please fill in all required fields');
      expect(mockOrderService.createOrder).not.toHaveBeenCalled();
    });

    it('should mark all controls as touched when form is invalid', () => {
      component.orderForm.patchValue({ customerName: '' });
      component.onSubmit();

      Object.keys(component.orderForm.controls).forEach(key => {
        expect(component.orderForm.get(key)?.touched).toBeTrue();
      });
    });

    it('should show error if no products selected', () => {
      component.selectedProducts = [];
      component.onSubmit();

      expect(mockNotificationService.error).toHaveBeenCalledWith('Please add at least one product to the order');
      expect(mockOrderService.createOrder).not.toHaveBeenCalled();
    });

    it('should create order successfully', fakeAsync(() => {
      mockOrderService.createOrder.and.returnValue(of(mockOrder));

      component.onSubmit();
      expect(component.isSubmitting()).toBeTrue();

      tick();

      expect(mockOrderService.createOrder).toHaveBeenCalledWith({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA',
        notes: 'Test order',
        orderDetails: [{ productId: 'prod-1', quantity: 1 }],
        createdBy: 'admin@astro.com',
      });

      expect(component.isSubmitting()).toBeFalse();
      expect(mockNotificationService.success).toHaveBeenCalledWith('Order created successfully');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders', 'order-123']);
    }));

    it('should use system as createdBy when user is not authenticated', fakeAsync(() => {
      mockAuthService.currentUser.and.returnValue(null);
      mockOrderService.createOrder.and.returnValue(of(mockOrder));

      component.onSubmit();
      tick();

      const callArgs = mockOrderService.createOrder.calls.mostRecent().args[0];
      expect(callArgs.createdBy).toBe('system');
    }));

    it('should handle generic error on submission', fakeAsync(() => {
      mockOrderService.createOrder.and.returnValue(
        throwError(() => ({ message: 'Network error' }))
      );

      component.onSubmit();
      tick();

      expect(component.isSubmitting()).toBeFalse();
      expect(mockNotificationService.error).toHaveBeenCalledWith('Network error');
    }));

    it('should handle GraphQL errors on submission', fakeAsync(() => {
      mockOrderService.createOrder.and.returnValue(
        throwError(() => ({
          graphQLErrors: [{ message: 'Invalid order data' }],
        }))
      );

      component.onSubmit();
      tick();

      expect(component.isSubmitting()).toBeFalse();
      expect(mockNotificationService.error).toHaveBeenCalledWith('Invalid order data');
    }));

    it('should handle GraphQL validation errors', fakeAsync(() => {
      mockOrderService.createOrder.and.returnValue(
        throwError(() => ({
          graphQLErrors: [{
            message: 'Validation failed',
            extensions: {
              validationErrors: [
                { field: 'customerEmail', message: 'Invalid email format' },
                { field: 'postalCode', message: 'Invalid postal code' },
              ],
            },
          }],
        }))
      );

      component.onSubmit();
      tick();

      expect(component.isSubmitting()).toBeFalse();
      expect(mockNotificationService.error).toHaveBeenCalledWith('Invalid email format, Invalid postal code');
    }));

    it('should handle error without message', fakeAsync(() => {
      mockOrderService.createOrder.and.returnValue(
        throwError(() => ({}))
      );

      component.onSubmit();
      tick();

      expect(component.isSubmitting()).toBeFalse();
      expect(mockNotificationService.error).toHaveBeenCalledWith('Failed to create order');
    }));
  });

  describe('navigation', () => {
    it('should navigate to orders list on cancel', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders']);
    });
  });

  describe('error messages', () => {
    it('should return required error message', () => {
      component.orderForm.get('customerName')?.markAsTouched();
      const message = component.getErrorMessage('customerName');
      expect(message).toBe('Customer name is required');
    });

    it('should return email error message', () => {
      component.orderForm.get('customerEmail')?.setValue('invalid');
      component.orderForm.get('customerEmail')?.markAsTouched();
      const message = component.getErrorMessage('customerEmail');
      expect(message).toBe('Invalid email format');
    });

    it('should return maxlength error message', () => {
      component.orderForm.get('customerName')?.setValue('a'.repeat(201));
      component.orderForm.get('customerName')?.markAsTouched();
      const message = component.getErrorMessage('customerName');
      expect(message).toBe('Maximum length is 200 characters');
    });

    it('should return empty string when no errors', () => {
      component.orderForm.get('customerName')?.setValue('John Doe');
      const message = component.getErrorMessage('customerName');
      expect(message).toBe('');
    });
  });
});
