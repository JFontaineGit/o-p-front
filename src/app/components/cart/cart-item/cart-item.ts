import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItemResponse } from '../../../services/interfaces/cart.interfaces';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-item.html',
  styleUrls: ['./cart-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartItemComponent {
  @Input() item!: CartItemResponse;
  @Input() loading = false;
  
  @Output() quantityChange = new EventEmitter<{ itemId: number, quantity: number }>();
  @Output() remove = new EventEmitter<number>();

  onQuantityChange(newQuantity: number) {
    if (newQuantity >= 0) {
      this.quantityChange.emit({ itemId: this.item.id, quantity: newQuantity });
    }
  }

  onRemove() {
    this.remove.emit(this.item.id);
  }

  trackById(index: number, item: CartItemResponse): number {
    return item.id;
  }

  // Getters para facilitar el acceso a datos del item
  get productTitle(): string {
    return this.item.config?.title || 'Producto';
  }

  get productDescription(): string {
    return this.item.config?.description || '';
  }

  get productImage(): string {
    return this.item.config?.imageUrl || '/assets/images/placeholder.jpg';
  }

  get subtotal(): number {
    return this.item.unit_price * this.item.qty;
  }

  get formattedPrice(): string {
    return `${this.item.currency} ${this.item.unit_price.toFixed(2)}`;
  }

  get formattedSubtotal(): string {
    return `${this.item.currency} ${this.subtotal.toFixed(2)}`;
  }
}
