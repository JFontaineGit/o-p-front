import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject} from '@angular/core';
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
    console.log('Valor del item recibido:', value); // <-- Revisión
    console.trace();
    this.updateItemState(value);
  }
  @Input() set loading(value: boolean) {
    this.updateItemState({ isLoading: value });
  }

  @Output() quantityChange = new EventEmitter<{ itemId: number; quantity: number }>();
  @Output() remove = new EventEmitter<number>();

  #itemState: ItemState = {
    id: 0,
    title: '',
    description: '',
    image: '',
    unitPrice: 0,
    currency: 'USD',
    quantity: 1,
    isLoading: false,
    formattedPrice: '',
    formattedSubtotal: '',
    product_metadata_id: 0
  };

  get itemState(): ItemState {
    return this.#itemState;
  }

  private updateItemState(newState: Partial<ItemState> | CartItemResponse | null): void {
    // Si viene un CartItemResponse, extraemos sus campos
    if (newState && 'unit_price' in newState) {
      console.log('[CartItemComponent] antes de updateItemState:', this.#itemState, 'nuevo value:', newState.id);
      this.logger.debug('[CartItemComponent] antes de updateItemState:'+ this.#itemState + 'nuevo value:' + newState.id)
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
        formattedPrice: this.formatCurrency(item.unit_price ?? 0, item.currency),
        formattedSubtotal: this.formatCurrency(
          (item.unit_price ?? 0) * (item.qty ?? 1),
          item.currency
        ),
        product_metadata_id: item.product_metadata_id ?? 0
      };
      console.log('[CartItemComponent] después de updateItemState:', this.#itemState);
      this.logger.debug('[CartItemComponent] después de updateItemState:', this.#itemState);
      return;
    }

    // Sino mezclamos estados parciales
    this.#itemState = {
      ...this.#itemState,
      ...(newState as Partial<ItemState>)
    };
    console.log('[CartItemComponent2] después de updateItemState:', this.#itemState);
    this.logger.debug('[CartItemComponent2] después de updateItemState:', this.#itemState);
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