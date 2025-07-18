import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItemResponse, CartItemConfig } from '../../services/interfaces/cart.interfaces';
import { LoggerService } from '../../services/core/logger.service';

interface ItemState {
  id: number;
  title: string;
  description: string;
  image: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  isLoading: boolean;
  isRemoving: boolean;
  formattedPrice: string;
  formattedSubtotal: string;
  product_metadata_id: number;
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
  logger = inject(LoggerService);

  @Input() set item(value: CartItemResponse | null) {
    this.updateItemState(value ?? {
      product_metadata_id: 0,
      unit_price: 0,
      qty: 1,
      currency: 'USD',
      config: { title: '', description: '', imageUrl: '/media/placeholder.png' }
    });
  }
  @Input() set loading(value: boolean) {
    this.updateItemState({ isLoading: value });
  }
  @Input() set isRemoving(value: boolean) {
    this.updateItemState({ isRemoving: value });
  }

  @Output() quantityChange = new EventEmitter<{ itemId: number; quantity: number }>();
  @Output() remove = new EventEmitter<number>();

  #itemState: ItemState = {
    id: 0,
    title: '',
    description: '',
    image: '/media/placeholder.png',
    unitPrice: 0,
    currency: 'USD',
    quantity: 1,
    isLoading: false,
    isRemoving: false,
    formattedPrice: '',
    formattedSubtotal: '',
    product_metadata_id: 0
  };

  get itemState(): ItemState {
    return this.#itemState;
  }

  private updateItemState(newState: Partial<ItemState> | CartItemResponse): void {
    if ('unit_price' in newState) {
      const item = newState as CartItemResponse;
      const config = item.config as CartItemConfig | undefined;
      const id = (item as any).id ?? item.product_metadata_id;

      this.#itemState = {
        id,
        title: config?.title ?? 'Producto sin título',
        description: config?.description ?? '',
        image: config?.imageUrl ?? '/media/placeholder.png',
        unitPrice: item.unit_price ?? 0,
        currency: item.currency ?? 'USD',
        quantity: item.qty ?? 1,
        isLoading: this.#itemState.isLoading,
        isRemoving: this.#itemState.isRemoving,
        formattedPrice: this.formatCurrency(item.unit_price ?? 0, item.currency),
        formattedSubtotal: this.formatCurrency(
          (item.unit_price ?? 0) * (item.qty ?? 1),
          item.currency
        ),
        product_metadata_id: item.product_metadata_id ?? 0
      };
      this.logger.debug('[CartItemComponent] Estado actualizado:', this.#itemState);
    } else {
      this.#itemState = {
        ...this.#itemState,
        ...(newState as Partial<ItemState>)
      };
      this.logger.debug('[CartItemComponent] Estado parcial actualizado:', this.#itemState);
    }
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return value.toLocaleString('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  changeQuantity(newQuantity: number): void {
    if (newQuantity >= 1 && newQuantity <= 99) {
      this.quantityChange.emit({ itemId: this.#itemState.id, quantity: newQuantity });
    }
  }

  onQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const qty = parseInt(input.value, 10) || 1;
    this.changeQuantity(Math.min(Math.max(qty, 1), 99));
  }

  removeItem(): void {
    this.remove.emit(this.#itemState.id);
  }
}