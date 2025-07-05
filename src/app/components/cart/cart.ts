import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize, catchError, of, forkJoin } from 'rxjs';
import { CartItemComponent } from './cart-item/cart-item';
import { CartSummaryComponent } from './cart-summary/cart-summary';
import { CartService } from '../../services/carts/cart.service';
import { CartResponse, CartItemResponse, CartItemQtyPatch } from '../../services/interfaces/cart.interfaces';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CartItemComponent, CartSummaryComponent],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Cart implements OnInit, OnDestroy {
  cart: CartResponse | null = null;
  loading = false;
  checkoutLoading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();
    
    this.cartService.getCart()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.error = 'Error al cargar el carrito. Por favor, intenta de nuevo.';
          console.error('Error loading cart:', error);
          return of(null);
        })
      )
      .subscribe((cart) => {
        if (cart) {
          this.cart = cart;
        }
      });
  }

  onQuantityChange(event: { itemId: number, quantity: number }): void {
    if (!this.cart || event.quantity < 0) return;

    const patch: CartItemQtyPatch = { qty: event.quantity };
    
    this.cartService.updateCartItemQty(event.itemId, patch)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          alert('Error al actualizar la cantidad. Por favor, intenta de nuevo.');
          console.error('Error updating quantity:', error);
          return of(null);
        })
      )
      .subscribe((updatedCart) => {
        if (updatedCart) {
          this.cart = updatedCart;
          this.cdr.markForCheck();
        }
      });
  }

  onRemoveItem(itemId: number): void {
    if (!this.cart) return;

    this.cartService.deleteCartItem(itemId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          alert('Error al eliminar el producto. Por favor, intenta de nuevo.');
          console.error('Error removing item:', error);
          return of(null);
        })
      )
      .subscribe((updatedCart) => {
        if (updatedCart) {
          this.cart = updatedCart;
          this.cdr.markForCheck();
        }
      });
  }

  onClearCart(): void {
    if (!this.cart || this.cart.items_cnt === 0) return;

    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      // Implementar lógica para vaciar carrito
      // Por ahora, eliminamos todos los items uno por uno
      const deleteObservables = this.cart.items.map(item => 
        this.cartService.deleteCartItem(item.id)
      );

      forkJoin(deleteObservables)
        .pipe(
          takeUntil(this.destroy$),
          catchError((error) => {
            alert('Error al vaciar el carrito. Por favor, intenta de nuevo.');
            console.error('Error clearing cart:', error);
            return of(null);
          })
        )
        .subscribe(() => {
          this.loadCart(); // Recargar carrito
        });
    }
  }

  onCheckout(): void {
    if (!this.cart || this.cart.items_cnt === 0) return;

    this.checkoutLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.cartService.checkoutCart()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.checkoutLoading = false;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.error = 'Error al procesar el pedido. Por favor, intenta de nuevo.';
          console.error('Error during checkout:', error);
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result) {
          alert('¡Pedido procesado con éxito!');
          this.router.navigate(['/user_panel'], { 
            queryParams: { tab: 'bookings' } 
          });
        }
      });
  }

  onContinueShopping(): void {
    this.router.navigate(['/packets']);
  }

  onRetry(): void {
    this.loadCart();
  }

  trackByItemId(index: number, item: CartItemResponse): number {
    return item.id;
  }

  get hasItems(): boolean {
    return (this.cart?.items_cnt ?? 0) > 0;
  }

  get isEmpty(): boolean {
    return !this.hasItems && !this.loading;
  }

  get showError(): boolean {
    return !!this.error;
  }
}
