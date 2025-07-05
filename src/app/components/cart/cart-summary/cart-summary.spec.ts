import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartSummaryComponent } from './cart-summary';
import { CartResponse } from '../../../services/interfaces/cart.interfaces';

describe('CartSummaryComponent', () => {
  let component: CartSummaryComponent;
  let fixture: ComponentFixture<CartSummaryComponent>;

  const mockCart: CartResponse = {
    id: 1,
    status: 'active',
    items_cnt: 3,
    total: 89.97,
    currency: 'USD',
    updated_at: '2024-01-01T00:00:00Z',
    items: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartSummaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CartSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state when cart has no items', () => {
    component.cart = { ...mockCart, items_cnt: 0, total: 0 };
    fixture.detectChanges();
    
    const emptyState = fixture.nativeElement.querySelector('.cart-summary__empty');
    expect(emptyState).toBeTruthy();
    
    const emptyTitle = fixture.nativeElement.querySelector('.empty-title');
    expect(emptyTitle.textContent).toContain('Tu carrito está vacío');
  });

  it('should display cart summary when cart has items', () => {
    component.cart = mockCart;
    fixture.detectChanges();
    
    const summaryDetails = fixture.nativeElement.querySelector('.cart-summary__details');
    expect(summaryDetails).toBeTruthy();
    
    const totalItems = fixture.nativeElement.querySelector('.cart-summary__items-count');
    expect(totalItems.textContent).toContain('3 artículos');
  });

  it('should format subtotal correctly', () => {
    component.cart = mockCart;
    fixture.detectChanges();
    
    expect(component.formattedSubtotal).toBe('USD 89.97');
  });

  it('should format total correctly', () => {
    component.cart = mockCart;
    fixture.detectChanges();
    
    expect(component.formattedTotal).toBe('USD 89.97');
  });

  it('should return correct currency', () => {
    component.cart = mockCart;
    fixture.detectChanges();
    
    expect(component.currency).toBe('USD');
  });

  it('should return default currency when cart is null', () => {
    component.cart = null;
    fixture.detectChanges();
    
    expect(component.currency).toBe('USD');
  });

  it('should return correct total items count', () => {
    component.cart = mockCart;
    fixture.detectChanges();
    
    expect(component.totalItems).toBe(3);
  });

  it('should return 0 items when cart is null', () => {
    component.cart = null;
    fixture.detectChanges();
    
    expect(component.totalItems).toBe(0);
  });

  it('should return correct subtotal', () => {
    component.cart = mockCart;
    fixture.detectChanges();
    
    expect(component.subtotal).toBe(89.97);
  });

  it('should return 0 subtotal when cart is null', () => {
    component.cart = null;
    fixture.detectChanges();
    
    expect(component.subtotal).toBe(0);
  });

  it('should emit checkout event when checkout button is clicked', () => {
    spyOn(component.checkout, 'emit');
    component.cart = mockCart;
    fixture.detectChanges();
    
    const checkoutButton = fixture.nativeElement.querySelector('.btn--primary');
    checkoutButton.click();
    
    expect(component.checkout.emit).toHaveBeenCalled();
  });

  it('should emit continueShopping event when continue shopping button is clicked', () => {
    spyOn(component.continueShopping, 'emit');
    component.cart = mockCart;
    fixture.detectChanges();
    
    const continueButton = fixture.nativeElement.querySelector('.btn--secondary');
    continueButton.click();
    
    expect(component.continueShopping.emit).toHaveBeenCalled();
  });

  it('should emit continueShopping event from empty state', () => {
    spyOn(component.continueShopping, 'emit');
    component.cart = { ...mockCart, items_cnt: 0, total: 0 };
    fixture.detectChanges();
    
    const continueButton = fixture.nativeElement.querySelector('.btn--primary');
    continueButton.click();
    
    expect(component.continueShopping.emit).toHaveBeenCalled();
  });

  it('should not emit checkout when cart is empty', () => {
    spyOn(component.checkout, 'emit');
    component.cart = { ...mockCart, items_cnt: 0, total: 0 };
    fixture.detectChanges();
    
    component.onCheckout();
    
    expect(component.checkout.emit).not.toHaveBeenCalled();
  });

  it('should not emit checkout when checkout is loading', () => {
    spyOn(component.checkout, 'emit');
    component.cart = mockCart;
    component.checkoutLoading = true;
    fixture.detectChanges();
    
    component.onCheckout();
    
    expect(component.checkout.emit).not.toHaveBeenCalled();
  });

  it('should disable checkout button when loading', () => {
    component.cart = mockCart;
    component.loading = true;
    fixture.detectChanges();
    
    const checkoutButton = fixture.nativeElement.querySelector('.btn--primary');
    expect(checkoutButton.disabled).toBe(true);
  });

  it('should disable checkout button when checkout is loading', () => {
    component.cart = mockCart;
    component.checkoutLoading = true;
    fixture.detectChanges();
    
    const checkoutButton = fixture.nativeElement.querySelector('.btn--primary');
    expect(checkoutButton.disabled).toBe(true);
  });

  it('should show loading spinner when checkout is loading', () => {
    component.cart = mockCart;
    component.checkoutLoading = true;
    fixture.detectChanges();
    
    const loadingSpinner = fixture.nativeElement.querySelector('.loading-spinner');
    expect(loadingSpinner).toBeTruthy();
  });

  it('should show "Procesando..." text when checkout is loading', () => {
    component.cart = mockCart;
    component.checkoutLoading = true;
    fixture.detectChanges();
    
    const checkoutButton = fixture.nativeElement.querySelector('.btn--primary');
    expect(checkoutButton.textContent).toContain('Procesando...');
  });

  it('should format number with Spanish locale', () => {
    const result = component.formatNumber(1234.56);
    expect(result).toBe('1.234,56');
  });

  it('should display singular "artículo" when there is 1 item', () => {
    component.cart = { ...mockCart, items_cnt: 1 };
    fixture.detectChanges();
    
    const itemsCount = fixture.nativeElement.querySelector('.cart-summary__items-count');
    expect(itemsCount.textContent).toContain('1 artículo');
  });

  it('should display plural "artículos" when there are multiple items', () => {
    component.cart = mockCart;
    fixture.detectChanges();
    
    const itemsCount = fixture.nativeElement.querySelector('.cart-summary__items-count');
    expect(itemsCount.textContent).toContain('3 artículos');
  });

  it('should show loading skeleton when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();
    
    const loadingSkeleton = fixture.nativeElement.querySelector('.cart-summary__loading');
    expect(loadingSkeleton).toBeTruthy();
  });

  it('should apply loading class when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();
    
    const cartSummary = fixture.nativeElement.querySelector('.cart-summary');
    expect(cartSummary.classList).toContain('cart-summary--loading');
  });
});
