import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ProductCard } from "../product-card"
import type { Product, TravelPackage } from "../../../interfaces/product.interface"

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: "./product-list.html",
  styleUrls: ["./product-list.scss"],
})
export class ProductList {
  @Input() mode: 'products' | 'packages' | 'all' = 'all'
  favoriteIds = new Set<number>()
  
  // Productos
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
      title: "Loft en Barcelona",
      description: "2-5 huéspedes • 2 dormitorios • 3 camas",
      price: 1499,
      imageUrl:
        "https://hips.hearstapps.com/hmg-prod/images/loft-industrial-en-el-born-barcelona-salon-6555dcfcd95e0.jpg",
    },
    {
      id: 5,
      title: "Estudio en Amsterdam",
      description: "1-2 huéspedes • Estudio • 1 cama",
      price: 799,
      imageUrl:
        "https://studentexperience.com/uploads/images/location/original/2-student-experience-ndsm-studio-2.jpg",
    },
    {
      id: 6,
      title: "Casa rural en Toscana",
      description: "4-6 huéspedes • 3 dormitorios • 4 camas",
      price: 1799,
      imageUrl:
        "https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
  ]

  // Paquetes
  packages: TravelPackage[] = [
    {
      id: 101,
      title: "París Romántico - 5 días",
      description: "Escapada perfecta para parejas con todo incluido",
      price: 1299,
      originalPrice: 1599,
      discount: 18.8,
      imageUrl:
        "https://dam.melia.com/melia/file/sBmHxZdXewt3CN5jAfAD.jpg?im=RegionOfInterestCrop=(1600,1116),regionOfInterest=(2061.0,1436.5)",
      rating: 4.8,
      reviewsCount: 127,
      features: ["Vuelos", "Hoteles 4*", "Desayuno", "Guía español"],
      badge: "Más vendido",
      destination: "París, Francia",
      duration: "5 días / 4 noches",
      maxPeople: 2,
    },
    {
      id: 102,
      title: "Londres Completo",
      description: "Descubre la capital británica con este paquete completo",
      price: 899,
      imageUrl:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      rating: 4.5,
      reviewsCount: 89,
      features: ["Vuelos", "Hotel", "Traslados"],
      destination: "Londres, Reino Unido",
      duration: "4 días / 3 noches",
      maxPeople: 4,
    },
    {
      id: 103,
      title: "Roma Imperial",
      description: "Vive la historia de Roma con guías especializados",
      price: 1199,
      originalPrice: 1399,
      discount: 14.3,
      imageUrl:
        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      rating: 4.9,
      reviewsCount: 203,
      features: ["Vuelos", "Hoteles 5*", "Comidas", "Guía", "Seguro"],
      badge: "Premium",
      destination: "Roma, Italia",
      duration: "6 días / 5 noches",
      maxPeople: 6,
    },
    {
      id: 104,
      title: "Aventura en Barcelona",
      description: "Explora la vibrante ciudad con actividades únicas",
      price: 999,
      originalPrice: 1199,
      discount: 16.7,
      imageUrl:
        "https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      rating: 4.6,
      reviewsCount: 95,
      features: ["Vuelos", "Hotel 3*", "Tours guiados", "Desayuno"],
      badge: "Oferta especial",
      destination: "Barcelona, España",
      duration: "4 días / 3 noches",
      maxPeople: 3,
    },
    {
      id: 105,
      title: "Amsterdam Cultural",
      description: "Sumérgete en la cultura y los canales de Amsterdam",
      price: 1099,
      imageUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2e/b4/19/64/caption.jpg?w=700&h=500&s=1",
      rating: 4.7,
      reviewsCount: 112,
      features: ["Vuelos", "Hotel", "Paseo en barco", "Entradas a museos"],
      destination: "Amsterdam, Países Bajos",
      duration: "5 días / 4 noches",
      maxPeople: 4,
    },
    {
      id: 106,
      title: "Toscana Clásica",
      description: "Disfruta del encanto rural y la gastronomía italiana",
      price: 1499,
      originalPrice: 1699,
      discount: 11.8,
      imageUrl:
        "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      rating: 4.9,
      reviewsCount: 150,
      features: ["Vuelos", "Hoteles boutique", "Cata de vinos", "Guía"],
      badge: "Exclusivo",
      destination: "Toscana, Italia",
      duration: "7 días / 6 noches",
      maxPeople: 5,
    },
  ]

  trackByProductId(index: number, product: Product): number {
    return product.id
  }

  trackByPackageId(index: number, packageItem: TravelPackage): number {
    return packageItem.id
  }

  onAddToCart(product: Product) {
    console.log("Producto agregado al carrito:", product)
    // implementar logica de carrito
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