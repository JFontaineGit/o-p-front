import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import type { Product } from "../../interfaces/product.interface"

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./product-card.html",
  styleUrls: ["./product-card.scss"],
})
export class ProductCard {
  @Input() title = ""
  @Input() description = ""
  @Input() price = 0
  @Input() imageUrl = ""
  @Input() id = 0
  @Input() isFavorite = false

  @Output() addToCart = new EventEmitter<Product>()
  @Output() toggleFavorite = new EventEmitter<{ id: number; isFavorite: boolean }>()

  constructor() {}

  onAddToCart() {
    const product: Product = {
      id: this.id,
      title: this.title,
      description: this.description,
      price: this.price,
      imageUrl: this.imageUrl,
    }
    this.addToCart.emit(product)
  }

  onToggleFavorite() {
    this.isFavorite = !this.isFavorite
    this.toggleFavorite.emit({
      id: this.id,
      isFavorite: this.isFavorite,
    })
  }

  // Formatear precio con símbolo de euro
  get formattedPrice(): string {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(this.price)
  }
}
