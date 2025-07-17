// Misma importación que tenías
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
      mergedItems = this.#cartState.items;
    }

    this.#cartState = {
      ...this.#cartState,
      ...newState,
      items: mergedItems,
      itemCount: mergedItems.length,
      hasItems: mergedItems.length > 0,
      isEmpty: !mergedItems.length && !(newState.isLoading ?? this.#cartState.isLoading)
    };

    this.#cdr.markForCheck();
  }

  private loadCart(): void {
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

          this.updateCartState({ cart: normalizedCart });
          this.sortItems(this.#cartState.currentSort);
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
          this.updateCartState({ cart: { ...updatedCart, items: normalizedItems } });
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
        const updatedItems = this.#cartState.items.map(item =>
          item.id === itemId ? { ...item, isRemoving: true } : item
        );
        this.updateCartState({ items: updatedItems });

        this.#cartService.deleteCartItem(itemId)
          .pipe(
            takeUntil(this.#destroy$),
            finalize(() => {
              const finalizedItems = this.#cartState.items.map(item =>
                item.id === itemId ? { ...item, isRemoving: false } : item
              );
              this.updateCartState({ items: finalizedItems });
            }),
            catchError(error => {
              this.#notificationService.error('Error al eliminar el paquete');
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
              this.updateCartState({ cart: { ...updatedCart, items: normalizedItems } });
              this.#notificationService.success('Paquete eliminado');
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
              return of(null);
            })
          )
          .subscribe(() => {
            this.loadCart();
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
          error: () => {
            this.updateCartState({
              error: 'Error al procesar el pago.'
            });
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
    this.#router.navigate(['/destinos'], { queryParams: { filter: destination } });
  }

  trackByItemId(_: number, item: ExtendedCartItemResponse): number {
    return item.id;
  }
}