import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartResponse } from '../../services/interfaces/cart.interfaces';

interface SummaryState {
  isLoading: boolean;
  isCheckoutLoading: boolean;
  hasItems: boolean;
  isEmpty: boolean;
  totalItems: number;
  formattedTotal: string;
}

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
  @Input() set loading(value: boolean) {
    this.updateSummaryState({ isLoading: value });
  }
  @Input() set checkoutLoading(value: boolean) {
    this.updateSummaryState({ isCheckoutLoading: value });
  }

  @Output() checkout = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() continueShopping = new EventEmitter<void>();

  #summaryState: SummaryState = {
    isLoading: false,
    isCheckoutLoading: false,
    hasItems: false,
    isEmpty: true,
    totalItems: 0,
    formattedTotal: '$0.00'
  };

  get summaryState(): SummaryState {
    return this.#summaryState;
  }

  private updateSummaryState(newState: Partial<SummaryState>): void {
    this.#summaryState = {
      ...this.#summaryState,
      ...newState,
      totalItems: this.cart?.items_cnt ?? this.#summaryState.totalItems,
      hasItems: (this.cart?.items_cnt ?? this.#summaryState.totalItems) > 0,
      isEmpty: !(this.cart?.items_cnt ?? this.#summaryState.totalItems) && !newState.isLoading,
      formattedTotal: this.formatCurrency(this.cart?.total ?? 0, this.cart?.currency)
    };
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return value.toLocaleString('es-ES', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  onCheckout(): void {
    if (this.#summaryState.hasItems && !this.#summaryState.isCheckoutLoading) {
      this.checkout.emit();
    }
  }

  onClearCart(): void {
    if (this.#summaryState.hasItems && !this.#summaryState.isLoading) {
      this.clear.emit();
    }
  }

  onContinueShopping(): void {
    this.continueShopping.emit();
  }
}