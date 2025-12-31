import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from '../services/product.service';
import { Product } from '../../../shared/models/product.model';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    id: '1',
    sku: 'PRD-001',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: { amount: 149.99, currency: 'USD' },
    stockQuantity: 150,
    lowStockThreshold: 20,
    isActive: true,
    isLowStock: false,
    details: [{ id: '1', key: 'Brand', value: 'AudioPro' }],
    images: [{ id: '1', url: '/assets/products/headphones.jpg', altText: 'Headphones', isPrimary: true, storageMode: 'Url' }],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'admin',
    modifiedBy: 'admin',
  };

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('ProductService', ['getProductById']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
            },
          },
        },
        { provide: ProductService, useValue: mockProductService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  describe('with valid product ID', () => {
    beforeEach(fakeAsync(() => {
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load product on init', () => {
      expect(mockProductService.getProductById).toHaveBeenCalledWith('1');
      expect(component.product()).toEqual(mockProduct);
      expect(component.loading()).toBeFalse();
    });

    it('should navigate back to products list', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should return In Stock status for product with high stock', () => {
      const status = component.getStockStatus();
      expect(status.label).toBe('In Stock');
      expect(status.variant).toBe('success');
    });

    it('should return Active status for active product', () => {
      const status = component.getActiveStatus();
      expect(status.label).toBe('Active');
      expect(status.variant).toBe('success');
    });

    it('should return primary image URL', () => {
      const imageUrl = component.getPrimaryImage();
      expect(imageUrl).toBe('/assets/products/headphones.jpg');
    });
  });

  describe('with low stock product', () => {
    beforeEach(fakeAsync(() => {
      const lowStockProduct = { ...mockProduct, stockQuantity: 10, isLowStock: true };
      mockProductService.getProductById.and.returnValue(of(lowStockProduct));
      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should return Low Stock status', () => {
      const status = component.getStockStatus();
      expect(status.label).toBe('Low Stock');
      expect(status.variant).toBe('warning');
    });
  });

  describe('with out of stock product', () => {
    beforeEach(fakeAsync(() => {
      const outOfStockProduct = { ...mockProduct, stockQuantity: 0, isLowStock: true };
      mockProductService.getProductById.and.returnValue(of(outOfStockProduct));
      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should return Out of Stock status', () => {
      const status = component.getStockStatus();
      expect(status.label).toBe('Out of Stock');
      expect(status.variant).toBe('error');
    });
  });

  describe('with inactive product', () => {
    beforeEach(fakeAsync(() => {
      const inactiveProduct = { ...mockProduct, isActive: false };
      mockProductService.getProductById.and.returnValue(of(inactiveProduct));
      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should return Inactive status', () => {
      const status = component.getActiveStatus();
      expect(status.label).toBe('Inactive');
      expect(status.variant).toBe('error');
    });
  });

  describe('with product without images', () => {
    beforeEach(fakeAsync(() => {
      const noImageProduct = { ...mockProduct, images: [] };
      mockProductService.getProductById.and.returnValue(of(noImageProduct));
      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should return null for primary image', () => {
      const imageUrl = component.getPrimaryImage();
      expect(imageUrl).toBeNull();
    });
  });

  describe('with product without primary image', () => {
    beforeEach(fakeAsync(() => {
      const noPrimaryProduct = {
        ...mockProduct,
        images: [{ id: '1', url: '/assets/first.jpg', altText: 'First', isPrimary: false, storageMode: 'Url' as const }],
      };
      mockProductService.getProductById.and.returnValue(of(noPrimaryProduct));
      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should return first image if no primary', () => {
      const imageUrl = component.getPrimaryImage();
      expect(imageUrl).toBe('/assets/first.jpg');
    });
  });

  describe('with no product ID', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ProductDetailComponent, NoopAnimationsModule],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: convertToParamMap({}),
              },
            },
          },
          { provide: ProductService, useValue: mockProductService },
          { provide: Router, useValue: mockRouter },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should not load product when no ID provided', () => {
      expect(mockProductService.getProductById).not.toHaveBeenCalled();
      expect(component.product()).toBeNull();
      expect(component.loading()).toBeFalse();
    });
  });

  describe('with product not found', () => {
    beforeEach(fakeAsync(() => {
      mockProductService.getProductById.and.returnValue(of(null));
      fixture = TestBed.createComponent(ProductDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
    }));

    it('should handle null product response', () => {
      expect(component.product()).toBeNull();
      expect(component.loading()).toBeFalse();
    });

    it('should return default stock status when product is null', () => {
      const status = component.getStockStatus();
      expect(status.label).toBe('Unknown');
      expect(status.variant).toBe('warning');
    });

    it('should return default active status when product is null', () => {
      const status = component.getActiveStatus();
      expect(status.label).toBe('Unknown');
      expect(status.variant).toBe('error');
    });

    it('should return null for primary image when product is null', () => {
      const imageUrl = component.getPrimaryImage();
      expect(imageUrl).toBeNull();
    });
  });
});
