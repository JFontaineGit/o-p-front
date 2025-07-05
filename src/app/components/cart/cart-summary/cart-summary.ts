import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartResponse } from '../../../services/interfaces/cart.interfaces';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-summary.html',
  styleUrls: ['./cart-summary.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartSummaryComponent {
  @Input() cart: CartResponse | null = null;
  @Input() loading = false;
  @Input() checkoutLoading = false;
  
  @Output() checkout = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() continueShopping = new EventEmitter<void>();

  get hasItems(): boolean {
    return (this.cart?.items_cnt ?? 0) > 0;
  }

  get totalItems(): number {
    return this.cart?.items_cnt || 0;
  }

  get subtotal(): number {
    return this.cart?.total || 0;
  }

  get formattedSubtotal(): string {
    if (!this.cart) return '$0.00';
    return `${this.cart.currency} ${this.cart.total.toFixed(2)}`;
  }

  get formattedTotal(): string {
    return this.formattedSubtotal; // Por ahora sin impuestos ni descuentos
  }

  get currency(): string {
    return this.cart?.currency || 'USD';
  }

  onCheckout(): void {
    if (this.hasItems && !this.checkoutLoading) {
      this.checkout.emit();
    }
  }

  onClearCart(): void {
    if (this.hasItems && !this.loading) {
      this.clear.emit();
    }
  }

  onContinueShopping(): void {
    this.continueShopping.emit();
  }

  // Método para formatear números con separadores de miles
  formatNumber(value: number): string {
    return value.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
