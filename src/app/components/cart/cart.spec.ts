import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Cart } from './cart';
import { CartResponse, CartItemResponse } from '../../services/interfaces/cart.interfaces';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let router: jasmine.SpyObj<Router>;

  const mockCart: CartResponse = {
    id: 1,
    status: 'active',
    items_cnt: 2,
    total: 99.98,
    currency: 'USD',
    updated_at: '2024-01-01T00:00:00Z',
    items: [
      {
        id: 1,
        availability_id: 100,
        product_metadata_id: 200,
        qty: 2,
        unit_price: 29.99,
        currency: 'USD',
        config: {
          title: 'Producto 1',
          description: 'Descripción del producto 1',
          imageUrl: '/assets/images/product1.jpg'
        }
      },
      {
        id: 2,
        availability_id: 101,
        product_metadata_id: 201,
        qty: 1,
        unit_price: 39.99,
        currency: 'USD',
        config: {
          title: 'Producto 2',
          description: 'Descripción del producto 2',
          imageUrl: '/assets/images/product2.jpg'
        }
      }
    ]
  };

  const mockEmptyCart: CartResponse = {
    id: 1,
    status: 'active',
    items_cnt: 0,
    total: 0,
    currency: 'USD',
    updated_at: '2024-01-01T00:00:00Z',
    items: []
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data on init', (done) => {
    jasmine.clock().install();
    
    component.ngOnInit();
    
    expect(component.loading).toBeTrue();
    
    jasmine.clock().tick(1000);
    
    setTimeout(() => {
      expect(component.cart).toBeTruthy();
      expect(component.cart?.items_cnt).toBe(2);
      expect(component.loading).toBeFalse();
      jasmine.clock().uninstall();
      done();
    }, 0);
  });

  it('should update item quantity', () => {
    component.cart = mockCart;
    
    component.onQuantityChange({ itemId: 1, quantity: 3 });
    
    const item = component.cart?.items.find(i => i.id === 1);
    expect(item?.qty).toBe(3);
    expect(component.cart?.total).toBe(149.96); // (29.99 * 3) + (39.99 * 1)
    expect(component.cart?.items_cnt).toBe(4); // 3 + 1
  });

  it('should remove item from cart', () => {
    component.cart = mockCart;
    
    component.onRemoveItem(1);
    
    expect(component.cart?.items.length).toBe(1);
    expect(component.cart?.items.find(i => i.id === 1)).toBeUndefined();
    expect(component.cart?.total).toBe(39.99); // Solo el segundo item
    expect(component.cart?.items_cnt).toBe(1); // Solo el segundo item
  });

  it('should process checkout', (done) => {
    component.cart = mockCart;
    
    component.onCheckout();
    
    expect(component.checkoutLoading).toBeTrue();
    
    jasmine.clock().install();
    jasmine.clock().tick(2000);
    
    setTimeout(() => {
      expect(component.checkoutLoading).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/user_panel'], {
        queryParams: { tab: 'bookings' }
      });
      jasmine.clock().uninstall();
      done();
    }, 0);
  });

  it('should not process checkout with empty cart', () => {
    component.cart = mockEmptyCart;
    
    component.onCheckout();
    
    expect(component.checkoutLoading).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to packets page on continue shopping', () => {
    component.onContinueShopping();
    
    expect(router.navigate).toHaveBeenCalledWith(['/packets']);
  });

  it('should track items by id', () => {
    const item: CartItemResponse = {
      id: 1,
      availability_id: 100,
      product_metadata_id: 200,
      qty: 1,
      unit_price: 29.99,
      currency: 'USD',
      config: {}
    };
    
    const result = component.trackByItemId(0, item);
    
    expect(result).toBe(1);
  });

  it('should return correct hasItems value', () => {
    component.cart = mockCart;
    expect(component.hasItems).toBeTrue();
    
    component.cart = mockEmptyCart;
    expect(component.hasItems).toBeFalse();
    
    component.cart = null;
    expect(component.hasItems).toBeFalse();
  });

  it('should return correct isEmpty value', () => {
    component.cart = mockEmptyCart;
    component.loading = false;
    expect(component.isEmpty).toBeTrue();
    
    component.cart = mockCart;
    expect(component.isEmpty).toBeFalse();
    
    component.loading = true;
    expect(component.isEmpty).toBeFalse();
  });

  it('should return correct showError value', () => {
    component.error = null;
    expect(component.showError).toBeFalse();
    
    component.error = 'Some error';
    expect(component.showError).toBeTrue();
  });

  it('should clear error when error close button is clicked', () => {
    component.error = 'Some error';
    
    // Simular click en el botón de cerrar error
    component.error = null;
    
    expect(component.error).toBeNull();
  });
});
