import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../product-card';
import { CartService } from '../../../services/carts/cart.service';
import { PackageService } from '../../../services/products/packages/package.service';
import { ProductService } from '../../../services/products/product.service';
import { LoggerService } from '../../../services/core/logger.service';
import { CartItemAdd } from '../../../services/interfaces/cart.interfaces';
import { PackageResponse } from '../../../services/interfaces/package.interfaces';
import { ProductMetadataResponse, ProductType } from '../../../services/interfaces/product.interfaces';
import { HttpParams } from '@angular/common/http';

// Interfaz genérica para cubrir Product y TravelPackage en ProductCard
interface CardItem {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  rating?: number;
  reviewsCount?: number;
  originalPrice?: number;
  discount?: number;
  features?: string[];
  badge?: string;
  destination?: string;
  duration?: string;
  maxPeople?: number;
}

// Interfaz para paquetes, extendiendo PackageResponse
interface TravelPackage extends PackageResponse {
  title: string;
  price: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  originalPrice?: number;
  discount?: number;
  features?: string[];
  badge?: string;
  destination?: string;
  duration?: string;
  maxPeople?: number;
}

// Interfaz para productos, extendiendo ProductMetadataResponse
interface Product extends ProductMetadataResponse {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'],
})
export class ProductList implements OnInit {
  @Input() mode: 'products' | 'packages' | 'all' = 'all';
  favoriteIds = new Set<number>();
  addingToCart = new Set<number>();
  products: Product[] = [];
  packages: TravelPackage[] = [];
  noProductsMessage: string | null = null;
  noPackagesMessage: string | null = null;

  constructor(
    private cartService: CartService,
    private packageService: PackageService,
    private productService: ProductService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    if (this.mode === 'products' || this.mode === 'all') {
      this.loadProducts();
    }
    if (this.mode === 'packages' || this.mode === 'all') {
      this.loadPackages();
    }
  }

  private loadProducts(): void {
    const params = new HttpParams(); // Ajusta según parámetros requeridos
    this.productService.listProducts(params).subscribe({
      next: (products: ProductMetadataResponse[]) => {
        this.products = products.map((prod) => {
          let title: string;
          let description: string;
          let imageUrl: string;

          switch (prod.product_type) {
            case 'activity':
              title = prod.product['name'] ?? 'Actividad sin nombre';
              description = prod.product['description'] ?? 'Sin descripción disponible';
              imageUrl = prod.product['image'] ?? 'https://via.placeholder.com/400x300?text=Actividad';
              break;
            case 'lodgment':
              title = prod.product['name'] ?? 'Alojamiento sin nombre';
              description = prod.product['description'] ?? 'Sin descripción disponible';
              imageUrl = prod.product['image'] ?? 'https://via.placeholder.com/400x300?text=Alojamiento';
              break;
            case 'transportation':
              title = prod.product['type']
                ? `${prod.product['type']} de ${prod.product['origin_id'] ?? 'Origen desconocido'} a ${prod.product['destination_id'] ?? 'Destino desconocido'}`
                : 'Transporte sin nombre';
              description = prod.product['description'] ?? 'Sin descripción disponible';
              imageUrl = prod.product['image'] ?? 'https://via.placeholder.com/400x300?text=Transporte';
              break;
            case 'flight':
              title = `Vuelo de ${prod.product['origin_id'] ?? 'Origen desconocido'} a ${prod.product['destination_id'] ?? 'Destino desconocido'}` || 'Vuelo sin nombre';
              description = prod.product['description'] ?? 'Sin descripción disponible';
              imageUrl = prod.product['image'] ?? 'https://via.placeholder.com/400x300?text=Vuelo';
              break;
            default:
              title = 'Producto sin nombre';
              description = 'Sin descripción disponible';
              imageUrl = 'https://via.placeholder.com/400x300?text=Producto';
          }

          return {
            ...prod,
            title,
            description,
            price: prod.unit_price ?? 0,
            imageUrl,
          };
        });
        this.noProductsMessage = this.products.length === 0 ? 'No hay productos disponibles en este momento.' : null;
      },
      error: (error: unknown) => {
        this.logger.error('Error al cargar los productos', error);
        this.noProductsMessage = 'Error al cargar los productos. Por favor, intenta de nuevo.';
      },
    });
  }

  private loadPackages(): void {
    this.packageService.listPackages().subscribe({
      next: (packages: PackageResponse[]) => {
        this.packages = packages.map((pkg) => ({
          ...pkg,
          title: pkg.name ?? 'Paquete sin nombre',
          price: pkg.final_price ?? 0,
          rating: pkg.rating_average ?? 0,
          reviewsCount: pkg.total_reviews ?? 0,
          imageUrl: pkg.cover_image ? `https://api.example.com/images/${pkg.cover_image}` : 'https://via.placeholder.com/400x300?text=Paquete+Turístico',
          originalPrice: pkg.base_price && pkg.taxes ? pkg.base_price + pkg.taxes : undefined,
          discount: pkg.base_price && pkg.final_price && pkg.final_price < pkg.base_price ? ((pkg.base_price - pkg.final_price) / pkg.base_price) * 100 : undefined,
          features: [],
          badge: pkg.rating_average && pkg.rating_average >= 4.8 ? 'Más vendido' : undefined,
          destination: undefined,
          duration: pkg.duration_days ? `${pkg.duration_days} días` : undefined,
          maxPeople: undefined,
        }));
        this.noPackagesMessage = this.packages.length === 0 ? 'No hay paquetes disponibles en este momento.' : null;
      },
      error: (error: unknown) => {
        this.logger.error('Error al cargar los paquetes', error);
        this.noPackagesMessage = 'Error al cargar los paquetes. Por favor, intenta de nuevo.';
      },
    });
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackByPackageId(index: number, packageItem: TravelPackage): number {
    return packageItem.id;
  }

  onAddToCart(item: CardItem) {
    if (this.addingToCart.has(item.id)) return;

    this.addingToCart.add(item.id);

    const cartItem: CartItemAdd = {
      availability_id: item.id,
      product_metadata_id: item.id,
      qty: 1,
      unit_price: item.price,
      config: {
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
      },
    };

    this.cartService.addCartItem(cartItem).subscribe({
      next: () => {
        alert(`¡${item.title} agregado al carrito!`);
        this.addingToCart.delete(item.id);
      },
      error: (error: unknown) => {
        this.logger.error('Error adding to cart', error);
        alert('Error al agregar al carrito. Por favor, intenta de nuevo.');
        this.addingToCart.delete(item.id);
      },
    });
  }

  onAddPackageToCart(item: CardItem) {
    if (this.addingToCart.has(item.id)) return;

    this.addingToCart.add(item.id);

    const cartItem: CartItemAdd = {
      availability_id: item.id,
      product_metadata_id: item.id,
      qty: 1,
      unit_price: item.price,
      config: {
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        destination: item.destination,
        duration: item.duration,
        maxPeople: item.maxPeople,
        features: item.features,
      },
    };

    this.cartService.addCartItem(cartItem).subscribe({
      next: () => {
        alert(`¡${item.title} agregado al carrito!`);
        this.addingToCart.delete(item.id);
      },
      error: (error: unknown) => {
        this.logger.error('Error adding package to cart', error);
        alert('Error al agregar al carrito. Por favor, intenta de nuevo.');
        this.addingToCart.delete(item.id);
      },
    });
  }

  isAddingToCart(id: number): boolean {
    return this.addingToCart.has(id);
  }

  onToggleFavorite(event: { id: number; isFavorite: boolean }) {
    if (event.isFavorite) {
      this.favoriteIds.add(event.id);
    } else {
      this.favoriteIds.delete(event.id);
    }
    this.logger.debug('Favoritos actualizados', Array.from(this.favoriteIds));
  }
}