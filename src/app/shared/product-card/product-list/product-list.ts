import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ProductCard } from "../product-card"
import type { Product } from "../../../interfaces/product.interface"

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: "./product-list.html",
  styleUrls: ["./product-list.scss"],
})
export class ProductList {
  favoriteIds = new Set<number>()

  products: Product[] = [
    {
      id: 1,
      title: "Habitación completa en París",
      description: "2-4 huéspedes • 1 dormitorio • 1 cama",
      price: 1299,
      imageUrl:
        "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      title: "Departamento en París",
      description: "1-2 huéspedes • Estudio • 1 cama",
      price: 899,
      imageUrl:
        "https://images.unsplash.com/photo-1586611292717-f828b167408c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      title: "Apartamento en París",
      description: "2-3 huéspedes • 1 dormitorio • 1 cama",
      price: 1099,
      imageUrl:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 4,
      title: "Habitación en Calais",
      description: "1-2 huéspedes • 1 dormitorio • 1 cama",
      price: 799,
      imageUrl:
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 5,
      title: "Habitación en Boulogne",
      description: "2-4 huéspedes • 2 dormitorios • 2 camas",
      price: 1199,
      imageUrl:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 6,
      title: "Habitación en Montreuil",
      description: "1-3 huéspedes • 1 dormitorio • 1 cama",
      price: 999,
      imageUrl:
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
  ]

  trackByProductId(index: number, product: Product): number {
    return product.id
  }

  onAddToCart(product: Product) {
    console.log("Producto agregado al carrito:", product)
    // Aquí implementarías la lógica del carrito
  }

  onToggleFavorite(event: { id: number; isFavorite: boolean }) {
    if (event.isFavorite) {
      this.favoriteIds.add(event.id)
    } else {
      this.favoriteIds.delete(event.id)
    }
    console.log("Favoritos actualizados:", Array.from(this.favoriteIds))
  }
}
