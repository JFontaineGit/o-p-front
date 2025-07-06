import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize, catchError, of, forkJoin } from 'rxjs';
import { CartItemComponent } from '../../shared/cart-item/cart-item';
import { CartSummaryComponent } from '../../shared/cart-summary/cart-summary';
import { CartService } from '../../services/carts/cart.service';
import { NotificationService } from '../../core/notification/services/notification.service';
import { CartResponse, CartItemResponse, CartItemQtyPatch } from '../../services/interfaces/cart.interfaces';

interface SortOption {
  value: 'price-asc' | 'price-desc' | 'name';
  label: string;
  icon: string;
}

interface Destination {
  key: string;
  label: string;
  icon: string;
}

interface CartState {
  cart: CartResponse | null;
  items: CartItemResponse[];
  isLoading: boolean;
  isCheckoutLoading: boolean;
  error: string | null;
  showSortOptions: boolean;
  currentSort: SortOption['value'];
  itemCount: number;
  hasItems: boolean;
  isEmpty: boolean;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CartItemComponent, CartSummaryComponent],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit, OnDestroy {
  #destroy$ = new Subject<void>();
  #cartState: CartState = {
    cart: null,
    items: [],
    isLoading: false,
    isCheckoutLoading: false,
    error: null,
    showSortOptions: false,
    currentSort: 'name',
    itemCount: 0,
    hasItems: false,
    isEmpty: true
  };

  readonly sortOptions: SortOption[] = [
    { value: 'price-asc', label: 'Precio: Menor a Mayor', icon: 'trending_up' },
    { value: 'price-desc', label: 'Precio: Mayor a Menor', icon: 'trending_down' },
    { value: 'name', label: 'Nombre A-Z', icon: 'sort_by_alpha' }
  ];

  readonly suggestedDestinations: Destination[] = [
    { key: 'caribe', label: 'Caribe', icon: 'beach_access' },
    { key: 'europa', label: 'Europa', icon: 'castle' },
    { key: 'asia', label: 'Asia', icon: 'temple_buddhist' },
    { key: 'aventura', label: 'Aventura', icon: 'hiking' }
  ];

  constructor(
    private router: Router,
    private cartService: CartService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  get cartState(): CartState {
    return this.#cartState;
  }

  private updateCartState(newState: Partial<CartState>): void {
    this.#cartState = {
      ...this.#cartState,
      ...newState,
      itemCount: newState.cart?.items_cnt ?? this.#cartState.itemCount,
      hasItems: (newState.cart?.items_cnt ?? this.#cartState.itemCount) > 0,
      isEmpty: !(newState.cart?.items_cnt ?? this.#cartState.itemCount) && !newState.isLoading,
      items: newState.cart?.items ?? this.#cartState.items
    };
    this.cdr.markForCheck();
  }

  private loadCart(): void {
    this.updateCartState({ isLoading: true, error: null });
    this.cartService.getCart()
      .pipe(
        takeUntil(this.#destroy$),
        finalize(() => this.updateCartState({ isLoading: false })),
        catchError((error) => {
          this.updateCartState({ error: 'Error al cargar el carrito. Por favor, intenta de nuevo.' });
          this.notificationService.error('Error al cargar el carrito');
          console.error('Error loading cart:', error);
          return of(null);
        })
      )
      .subscribe(cart => {
        if (cart) {
          this.updateCartState({ cart });
          this.sortItems(this.#cartState.currentSort);
        }
      });
  }

  onQuantityChange(event: { itemId: number; quantity: number }): void {
    if (!this.#cartState.cart || event.quantity < 0) return;

    const patch: CartItemQtyPatch = { qty: event.quantity };
    this.cartService.updateCartItemQty(event.itemId, patch)
      .pipe(
        takeUntil(this.#destroy$),
        catchError((error) => {
          this.notificationService.error('Error al actualizar la cantidad');
          console.error('Error updating quantity:', error);
          return of(null);
        })
      )
      .subscribe(updatedCart => {
        if (updatedCart) {
          this.updateCartState({ cart: updatedCart });
        }
      });
  }

  onRemoveItem(itemId: number): void {
    if (!this.#cartState.cart) return;

    this.cartService.deleteCartItem(itemId)
      .pipe(
        takeUntil(this.#destroy$),
        catchError((error) => {
          this.notificationService.error('Error al eliminar el producto');
          console.error('Error removing item:', error);
          return of(null);
        })
      )
      .subscribe(updatedCart => {
        if (updatedCart) {
          this.updateCartState({ cart: updatedCart });
        }
      });
  }

  onClearCart(): void {
    if (!this.#cartState.cart || !this.#cartState.hasItems) return;

    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      const deleteObservables = this.#cartState.items.map(item => 
        this.cartService.deleteCartItem(item.id)
      );
      forkJoin(deleteObservables)
        .pipe(
          takeUntil(this.#destroy$),
          catchError((error) => {
            this.notificationService.error('Error al vaciar el carrito');
            console.error('Error clearing cart:', error);
            return of(null);
          })
        )
        .subscribe(() => {
          this.loadCart();
          this.notificationService.success('Carrito vaciado');
        });
    }
  }

  onCheckout(): void {
    if (!this.#cartState.cart || !this.#cartState.hasItems) return;

    this.updateCartState({ isCheckoutLoading: true, error: null });
    this.cartService.checkoutCart()
      .pipe(
        takeUntil(this.#destroy$),
        finalize(() => this.updateCartState({ isCheckoutLoading: false })),
        catchError((error) => {
          this.updateCartState({ error: 'Error al procesar el pedido. Por favor, intenta de nuevo.' });
          this.notificationService.error('Error al procesar el pedido');
          console.error('Error during checkout:', error);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          this.notificationService.success('¡Pedido procesado con éxito!');
          this.router.navigate(['/user_panel'], { queryParams: { tab: 'bookings' } });
        }
      });
  }

  onContinueShopping(): void {
    this.router.navigate(['/packets']);
  }

  onRetry(): void {
    this.loadCart();
  }

  clearError(): void {
    this.updateCartState({ error: null });
  }

  toggleSortOptions(): void {
    this.updateCartState({ showSortOptions: !this.#cartState.showSortOptions });
  }

  sortItems(sortBy: SortOption['value']): void {
    if (!this.#cartState.cart) return;

    const items = [...this.#cartState.items];
    switch (sortBy) {
      case 'price-asc':
        items.sort((a, b) => a.unit_price - b.unit_price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.unit_price - a.unit_price);
        break;
      case 'name':
        items.sort((a, b) => (a.config?.title || '').localeCompare(b.config?.title || ''));
        break;
    }
    this.updateCartState({ currentSort: sortBy, items });
  }

  exploreDestination(destination: string): void {
    this.router.navigate(['/destinos'], { queryParams: { filter: destination } });
  }

  trackByItemId(_: number, item: CartItemResponse): number {
    return item.id;
  }
}