import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Favorite } from '../interfaces/user-panel.interfaces';

@Component({
  selector: 'app-user-favorite-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-card.html',
  styleUrls: ['./favorite-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoriteCard {
  
  @Input({ required: true }) favorite!: Favorite;
  @Input() showRemoveButton = true;
  
  @Output() remove = new EventEmitter<string>();
  @Output() click = new EventEmitter<Favorite>();

  /**
   * Emite evento para eliminar favorito
   */
  onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.favorite.id);
  }

  /**
   * Emite evento al hacer click en la tarjeta
   */
  onClick(): void {
    this.click.emit(this.favorite);
  }

  /**
   * Formatea el precio con moneda
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}