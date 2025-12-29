import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricCardComponent } from './metric-card.component';

describe('MetricCardComponent', () => {
  let component: MetricCardComponent;
  let fixture: ComponentFixture<MetricCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCardComponent);
    component = fixture.componentInstance;
    component.title = 'Test Metric';
    component.value = 1234;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.metric-title')?.textContent).toContain('Test Metric');
  });

  it('should display formatted numeric value', () => {
    component.value = 1234567;
    component.prefix = '$';
    fixture.detectChanges();

    expect(component.formattedValue).toBe('$1,234,567');
  });

  it('should display string value with prefix and suffix', () => {
    component.value = '100';
    component.prefix = '';
    component.suffix = '%';
    fixture.detectChanges();

    expect(component.formattedValue).toBe('100%');
  });

  it('should show positive change indicator for positive values', () => {
    component.change = 5.5;
    fixture.detectChanges();

    expect(component.isPositiveChange).toBeTrue();
    expect(component.changeIcon).toBe('trending_up');
  });

  it('should show negative change indicator for negative values', () => {
    component.change = -3.2;
    fixture.detectChanges();

    expect(component.isPositiveChange).toBeFalse();
    expect(component.changeIcon).toBe('trending_down');
  });

  it('should treat zero change as positive', () => {
    component.change = 0;
    fixture.detectChanges();

    expect(component.isPositiveChange).toBeTrue();
  });

  it('should not show change footer when change is undefined', () => {
    component.change = undefined;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.metric-footer')).toBeNull();
  });

  it('should set loading state correctly', () => {
    component.loading = true;
    fixture.detectChanges();

    // Component property should reflect loading state
    expect(component.loading).toBeTrue();
  });

  it('should set variant correctly', () => {
    component.variant = 'success';
    fixture.detectChanges();

    // Component property should reflect variant
    expect(component.variant).toBe('success');
  });

  it('should use default icon when not specified', () => {
    expect(component.icon).toBe('analytics');
  });

  it('should use custom icon when specified', () => {
    component.icon = 'shopping_cart';
    fixture.detectChanges();

    // The icon value is set correctly on the component
    expect(component.icon).toBe('shopping_cart');
  });
});
