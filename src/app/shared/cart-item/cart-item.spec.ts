import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartItemComponent } from './cart-item';
import { CartItemResponse } from '../../services/interfaces/cart.interfaces';

describe('CartItemComponent', () => {
  let component: CartItemComponent;
  let fixture: ComponentFixture<CartItemComponent>;

  const mockCartItem: CartItemResponse = {
    id: 1,
    availability_id: 100,
    product_metadata_id: 200,
    qty: 2,
    unit_price: 29.99,
    currency: 'USD',
    config: {
      title: 'Producto de prueba',
      description: 'Descripción del producto de prueba',
      imageUrl: '/assets/images/test.jpg'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CartItemComponent);
    component = fixture.componentInstance;
    component.item = mockCartItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display product title', () => {
    const titleElement = fixture.nativeElement.querySelector('.cart-item__title');
    expect(titleElement.textContent).toContain('Producto de prueba');
  });

  it('should display product description', () => {
    const descriptionElement = fixture.nativeElement.querySelector('.cart-item__description');
    expect(descriptionElement.textContent).toContain('Descripción del producto de prueba');
  });

  it('should display formatted price', () => {
    const priceElement = fixture.nativeElement.querySelector('.price-amount');
    expect(priceElement.textContent).toContain('29.99');
  });

  it('should display formatted subtotal', () => {
    const subtotalElement = fixture.nativeElement.querySelector('.subtotal-amount');
    expect(subtotalElement.textContent).toContain('59.98'); // 29.99 * 2
  });

  it('should display quantity input with correct value', () => {
    const quantityInput = fixture.nativeElement.querySelector('.quantity-input');
    expect(quantityInput.value).toBe('2');
  });

  it('should emit quantityChange when quantity is changed', () => {
    spyOn(component.quantityChange, 'emit');
    const quantityInput = fixture.nativeElement.querySelector('.quantity-input');
    
    quantityInput.value = '3';
    quantityInput.dispatchEvent(new Event('change'));
    
    expect(component.quantityChange.emit).toHaveBeenCalledWith({ itemId: 1, quantity: 3 });
  });

  it('should emit remove when remove button is clicked', () => {
    spyOn(component.remove, 'emit');
    const removeButton = fixture.nativeElement.querySelector('.cart-item__remove');
    
    removeButton.click();
    
    expect(component.remove.emit).toHaveBeenCalledWith(1);
  });

  it('should disable decrease button when quantity is 1', () => {
    component.item.qty = 1;
    fixture.detectChanges();
    
    const decreaseButton = fixture.nativeElement.querySelector('.quantity-btn--decrease');
    expect(decreaseButton.disabled).toBe(true);
  });

  it('should enable decrease button when quantity is greater than 1', () => {
    component.item.qty = 2;
    fixture.detectChanges();
    
    const decreaseButton = fixture.nativeElement.querySelector('.quantity-btn--decrease');
    expect(decreaseButton.disabled).toBe(false);
  });

  it('should apply loading class when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();
    
    const cartItem = fixture.nativeElement.querySelector('.cart-item');
    expect(cartItem.classList).toContain('cart-item--loading');
  });

  it('should disable all interactive elements when loading', () => {
    component.loading = true;
    fixture.detectChanges();
    
    const quantityInput = fixture.nativeElement.querySelector('.quantity-input');
    const removeButton = fixture.nativeElement.querySelector('.cart-item__remove');
    const increaseButton = fixture.nativeElement.querySelector('.quantity-btn--increase');
    const decreaseButton = fixture.nativeElement.querySelector('.quantity-btn--decrease');
    
    expect(quantityInput.disabled).toBe(true);
    expect(removeButton.disabled).toBe(true);
    expect(increaseButton.disabled).toBe(true);
    expect(decreaseButton.disabled).toBe(true);
  });

  it('should use default values when config is missing', () => {
    component.item = {
      id: 1,
      availability_id: 100,
      product_metadata_id: 200,
      qty: 1,
      unit_price: 10,
      currency: 'USD',
      config: undefined
    };
    fixture.detectChanges();
    
    expect(component.productTitle).toBe('Producto');
    expect(component.productDescription).toBe('');
    expect(component.productImage).toBe('/assets/images/placeholder.jpg');
  });

  it('should track items by id', () => {
    const result = component.trackById(0, mockCartItem);
    expect(result).toBe(1);
  });

  it('should not emit quantityChange for negative quantities', () => {
    spyOn(component.quantityChange, 'emit');
    
    component.onQuantityChange(-1);
    
    expect(component.quantityChange.emit).not.toHaveBeenCalled();
  });

  it('should emit quantityChange for valid quantities', () => {
    spyOn(component.quantityChange, 'emit');
    
    component.onQuantityChange(5);
    
    expect(component.quantityChange.emit).toHaveBeenCalledWith({ itemId: 1, quantity: 5 });
  });
});
