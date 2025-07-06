import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItemResponse } from '../../services/interfaces/cart.interfaces';

interface ItemState {
  id: number;
  title: string;
  description: string;
  image: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  isLoading: boolean;
  formattedPrice: string;
  formattedSubtotal: string;
}

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-item.html',
  styleUrls: ['./cart-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartItemComponent {
  @Input() set item(value: CartItemResponse | null) {
    this.updateItemState(value);
  }
  @Input() set loading(value: boolean) {
    this.updateItemState({ isLoading: value });
  }

  @Output() quantityChange = new EventEmitter<{ itemId: number; quantity: number }>();
  @Output() remove = new EventEmitter<number>();

  #itemState: ItemState = {
    id: 0,
    title: 'Producto',
    description: '',
    image: '/assets/images/placeholder.jpg',
    unitPrice: 0,
    currency: 'USD',
    quantity: 1,
    isLoading: false,
    formattedPrice: '$0.00',
    formattedSubtotal: '$0.00'
  };

  get itemState(): ItemState {
    return this.#itemState;
  }

  private updateItemState(newState: Partial<ItemState> | CartItemResponse | null): void {
    if (!newState || !('id' in newState)) {
      this.#itemState = { ...this.#itemState, ...newState };
      return;
    }

    const item = newState as CartItemResponse;
    this.#itemState = {
      id: item.id,
      title: item.config?.title || 'Producto',
      description: item.config?.description || '',
      image: item.config?.imageUrl || '/assets/images/placeholder.jpg',
      unitPrice: item.unit_price,
      currency: item.currency || 'USD',
      quantity: item.qty,
      isLoading: this.#itemState.isLoading,
      formattedPrice: this.formatCurrency(item.unit_price, item.currency),
      formattedSubtotal: this.formatCurrency(item.unit_price * item.qty, item.currency),
      ...newState
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

  changeQuantity(newQuantity: number): void {
    if (newQuantity >= 1) {
      this.quantityChange.emit({ itemId: this.#itemState.id, quantity: newQuantity });
    }
  }

  onQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    if (!isNaN(newQuantity)) {
      this.changeQuantity(newQuantity);
    }
  }

  removeItem(): void {
    this.remove.emit(this.#itemState.id);
  }
}