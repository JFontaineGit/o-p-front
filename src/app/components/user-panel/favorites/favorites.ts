import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FavoriteCard } from "../favorite-card/favorite-card"
import type { Favorite } from "../interfaces/user-panel.interfaces"


@Component({
  selector: "app-favorites",
  standalone: true,
  imports: [CommonModule, FavoriteCard],
  templateUrl: "./favorites.html",
  styleUrls: ["./favorites.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Favorites {
  @Input({ required: true }) favorites: Favorite[] = []
  @Input() isLoading = false
  @Input() showRemoveButton = true
  @Input() maxDisplay = 6
  @Input() showViewAll = true

  @Output() remove = new EventEmitter<string>()
  @Output() click = new EventEmitter<Favorite>()
  @Output() viewAll = new EventEmitter<void>()

  /**
   * Maneja la eliminación de un favorito
   */
  onRemoveFavorite(favoriteId: string): void {
    this.remove.emit(favoriteId)
  }

  /**
   * Maneja el click en un favorito
   */
  onFavoriteClick(favorite: Favorite): void {
    this.click.emit(favorite)
  }

  /**
   * Maneja el evento de ver todos los favoritos
   */
  onViewAll(): void {
    this.viewAll.emit()
  }

  /**
   * Obtiene los favoritos a mostrar (limitados por maxDisplay)
   */
  getDisplayedFavorites(): Favorite[] {
    return this.favorites.slice(0, this.maxDisplay)
  }

  /**
   * Verifica si hay más favoritos para mostrar
   */
  hasMoreFavorites(): boolean {
    return this.favorites.length > this.maxDisplay
  }

  /**
   * Obtiene el mensaje del estado vacío
   */
  getEmptyStateMessage(): string {
    return "Guarda destinos y paquetes que te interesen para encontrarlos fácilmente aquí."
  }

  /**
   * Función de tracking para optimizar *ngFor
   */
  trackByFavoriteId(index: number, item: Favorite): string {
    return item.id
  }

  /**
   * Genera array para skeleton loading
   */
  getSkeletonArray(): number[] {
    return Array(Math.min(this.maxDisplay, 6))
      .fill(0)
      .map((_, i) => i)
  }

  /**
   * Obtiene estadísticas de favoritos
   */
  getFavoritesStats() {
    return {
      total: this.favorites.length,
      displayed: this.getDisplayedFavorites().length,
      hidden: Math.max(0, this.favorites.length - this.maxDisplay),
    }
  }
}
