import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, of, forkJoin } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { CartItemComponent } from '../../shared/cart-item/cart-item';
import { CartSummaryComponent } from '../../shared/cart-summary/cart-summary';
import { CartService } from '../../services/carts/cart.service';
import { NotificationService } from '../../core/notification/services/notification.service';
import { AuthService } from '../../services/auth/auth.service';
import { OrderPaymentService } from '../../services/orders/order.service';
import { LoggerService } from '../../services/core/logger.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import {
  CartResponse, CartItemResponse, CartItemQtyPatch
} from '../../services/interfaces/cart.interfaces';
import {
  StripeResponse, PaymentMethodIn
} from '../../services/interfaces/order-payment.interfaces';
import { TransferState, makeStateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

const CART_STATE_KEY = makeStateKey<CartResponse>('cartState');

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

interface ExtendedCartItemResponse extends CartItemResponse {
  id: number;
  isRemoving: boolean;
}

interface CartState {
  cart: CartResponse | null;
  items: ExtendedCartItemResponse[];
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

  #orderPaymentService = inject(OrderPaymentService);
  #loggerService = inject(LoggerService);
  #router = inject(Router);
  #cartService = inject(CartService);
  #notificationService = inject(NotificationService);
  #authService = inject(AuthService);
  #cdr = inject(ChangeDetectorRef);
  #dialog = inject(MatDialog);
  #transferState = inject(TransferState);
  #platformId = inject(PLATFORM_ID);

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
    let mergedItems: ExtendedCartItemResponse[] = [];

    if (newState.cart?.items) {
      mergedItems = newState.cart.items.map(item => ({
        ...item,
        id: (item as any).id ?? item.product_metadata_id,
        isRemoving: false,
      }));
    } else if (newState.items) {
      mergedItems = newState.items.map(item => ({
        ...item,
        id: (item as any).id ?? item.product_metadata_id,
        isRemoving: item.isRemoving ?? false
      }));
    } else {
      mergedItems = [...this.#cartState.items]; // Crear una copia para inmutabilidad
    }

    this.#cartState = {
      ...this.#cartState,
      ...newState,
      items: mergedItems,
      itemCount: mergedItems.length,
      hasItems: mergedItems.length > 0,
      isEmpty: !mergedItems.length && !(newState.isLoading ?? this.#cartState.isLoading)
    };

    this.#loggerService.debug('Estado del carrito actualizado:', this.#cartState);
    // Usar detectChanges en lugar de markForCheck para forzar la actualización inmediata
    if (isPlatformBrowser(this.#platformId)) {
      this.#cdr.detectChanges();
    }
  }

  private loadCart(): void {
    if (this.#transferState.hasKey(CART_STATE_KEY)) {
      const cart = this.#transferState.get(CART_STATE_KEY, null);
      if (cart) {
        this.updateCartState({ cart });
        this.sortItems(this.#cartState.currentSort);
        this.#loggerService.debug('Carrito cargado desde TransferState:', cart);
        return;
      }
    }

    if (!this.#authService.isLoggedIn()) {
      this.updateCartState({ error: 'Debes iniciar sesión para ver el carrito.' });
      this.#router.navigate(['/login']);
      return;
    }

    this.updateCartState({ isLoading: true, error: null });

    this.#cartService.getCart()
      .pipe(
        takeUntil(this.#destroy$),
        finalize(() => this.updateCartState({ isLoading: false })),
        catchError(error => {
          this.updateCartState({ error: 'Error al cargar el carrito. Por favor, intenta de nuevo.' });
          this.#notificationService.error('Error al cargar el carrito');
          this.#loggerService.error('Error al cargar el carrito', error);
          return of(null);
        })
      )
      .subscribe(cart => {
        if (cart) {
          const normalizedItems = cart.items.map(item => ({
            ...item,
            id: (item as any).id ?? item.product_metadata_id,
            isRemoving: false
          }));
          const normalizedCart: CartResponse = {
            ...cart,
            items: normalizedItems
          };
          this.#transferState.set(CART_STATE_KEY, normalizedCart);
          this.updateCartState({ cart: normalizedCart });
          this.sortItems(this.#cartState.currentSort);
          this.#loggerService.debug('Carrito cargado desde el backend:', normalizedCart);
        }
      });
  }

  onQuantityChange(event: { itemId: number; quantity: number }): void {
    if (!this.#cartState.cart || event.quantity < 0) return;

    const patch: CartItemQtyPatch = { qty: event.quantity };
    this.#cartService.updateCartItemQty(event.itemId, patch)
      .pipe(
        takeUntil(this.#destroy$),
        catchError(error => {
          this.#notificationService.error('Error al actualizar la cantidad');
          this.#loggerService.error('Error al actualizar la cantidad del ítem', error);
          return of(null);
        })
      )
      .subscribe(updatedCart => {
        if (updatedCart) {
          const normalizedItems = updatedCart.items.map(item => ({
            ...item,
            id: (item as any).id ?? item.product_metadata_id,
            isRemoving: false
          }));
          const normalizedCart: CartResponse = {
            ...updatedCart,
            items: normalizedItems
          };
          this.updateCartState({ cart: normalizedCart });
          this.#transferState.set(CART_STATE_KEY, normalizedCart);
          this.#loggerService.debug('Carrito actualizado tras cambio de cantidad:', normalizedCart);
        }
      });
  }

  onRemoveItem(itemId: number): void {
    if (!this.#cartState.cart) return;

    const dialogRef = this.#dialog.open(ConfirmDialog, {
      data: {
        title: '¿Eliminar paquete?',
        message: '¿Estás seguro de que quieres eliminar este paquete de tu carrito?'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // Eliminación optimista: Remover el ítem inmediatamente
        const updatedItems = [...this.#cartState.items].filter(item => item.id !== itemId);
        const updatedCart = {
          ...this.#cartState.cart!,
          items: updatedItems,
          items_cnt: updatedItems.length,
          total: updatedItems.reduce((sum, item) => sum + item.unit_price * item.qty, 0)
        };
        this.updateCartState({ cart: updatedCart });
        this.#loggerService.debug('Eliminación optimista aplicada, nuevo estado:', this.#cartState);

        this.#cartService.deleteCartItem(itemId)
          .pipe(
            takeUntil(this.#destroy$),
            catchError(error => {
              // Si falla, restaurar el carrito
              this.#notificationService.error('Error al eliminar el paquete');
              this.#loggerService.error('Error al eliminar el ítem del carrito', error);
              this.loadCart(); // Recargar el carrito para restaurar el estado
              return of(null);
            })
          )
          .subscribe(response => {
            if (response) {
              // Caso: Respuesta 200 con carrito actualizado
              const normalizedItems = response.items.map(item => ({
                ...item,
                id: (item as any).id ?? item.product_metadata_id,
                isRemoving: false
              }));
              const normalizedCart: CartResponse = {
                ...response,
                items: normalizedItems
              };
              this.updateCartState({ cart: normalizedCart });
              this.#transferState.set(CART_STATE_KEY, normalizedCart);
              this.#loggerService.debug('Carrito actualizado desde el backend:', normalizedCart);
            }
            // Notificar éxito incluso en caso de 204
            this.#notificationService.success('Paquete eliminado');
            if (isPlatformBrowser(this.#platformId)) {
              this.#cdr.detectChanges();
            }
          });
      }
    });
  }

  onClearCart(): void {
    if (!this.#cartState.cart || !this.#cartState.hasItems) return;

    const dialogRef = this.#dialog.open(ConfirmDialog, {
      data: {
        title: '¿Vaciar carrito?',
        message: '¿Estás seguro de que quieres vaciar todo el carrito?'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const deleteObservables = this.#cartState.items.map(item =>
          this.#cartService.deleteCartItem(item.id)
        );
        forkJoin(deleteObservables)
          .pipe(
            takeUntil(this.#destroy$),
            catchError(error => {
              this.#notificationService.error('Error al vaciar el carrito');
              this.#loggerService.error('Error al vaciar el carrito', error);
              return of(null);
            })
          )
          .subscribe(() => {
            this.loadCart();
            this.#transferState.remove(CART_STATE_KEY);
            this.#notificationService.success('Carrito vaciado');
          });
      }
    });
  }

  onReserveNow(): void {
    if (!this.#cartState.cart || !this.#cartState.hasItems) {
      this.#notificationService.error('El carrito está vacío.');
      return;
    }

    this.updateCartState({ isCheckoutLoading: true });

    this.#cartService.checkoutCart()
      .pipe(
        takeUntil(this.#destroy$),
        catchError(err => {
          this.updateCartState({
            error: 'Error al procesar el checkout.'
          });
          this.#notificationService.error('Error al procesar el checkout');
          this.#loggerService.error('Error al procesar el checkout', err);
          return of(null);
        })
      )
      .subscribe(checkoutResponse => {
        if (!checkoutResponse?.order_id) {
          this.updateCartState({ isCheckoutLoading: false });
          return;
        }

        const paymentMethod: PaymentMethodIn = { payment_method: 'card' };
        const idempotencyKey = crypto.randomUUID();

        this.#orderPaymentService.payOrder(checkoutResponse.order_id, paymentMethod, idempotencyKey).subscribe({
          next: (res: StripeResponse) => {
            window.location.href = res.session_url;
          },
          error: (err) => {
            this.updateCartState({
              error: 'Error al procesar el pago.'
            });
            this.#notificationService.error('Error al procesar el pago');
            this.#loggerService.error('Error al procesar el pago', err);
          },
          complete: () => {
            this.updateCartState({ isCheckoutLoading: false });
          }
        });
      });
  }

  onContinueShopping(): void {
    this.#router.navigate(['/packets']);
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
    const items = [...this.#cartState.items]; // Crear una copia para inmutabilidad
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
    this.#router.navigate(['/destinos'], { queryParams: { filter: destination } });
  }

  trackByItemId(_: number, item: ExtendedCartItemResponse): number {
    return item.id;
  }
}