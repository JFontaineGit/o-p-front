import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCard } from '../product-card';
import { CartService } from '../../../services/carts/cart.service';
import { PackageService } from '../../../services/products/packages/package.service';
import { ProductService } from '../../../services/products/product.service';
import { LoggerService } from '../../../services/core/logger.service';
import { NotificationService } from '../../../core/notification/services/notification.service';
import { CartItemAdd } from '../../../services/interfaces/cart.interfaces';
import { PackageResponse } from '../../../services/interfaces/package.interfaces';
import { ProductMetadataResponse } from '../../../services/interfaces/product.interfaces';
import { HttpParams } from '@angular/common/http';

// Interfaz genérica para cubrir Product y TravelPackage en ProductCard
interface CardItem {
  id: number;
  availability_id?: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  currency: string;
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
  availability_id: number;
  title: string;
  price: number;
  currency: string;
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
  availability_id?: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  currency: string;
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
    private logger: LoggerService,
    private notificationService: NotificationService
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
    const params = new HttpParams();
    this.productService.listProducts(params).subscribe({
      next: (products: ProductMetadataResponse[]) => {
        this.products = products.map((prod) => {
          let title: string;
          let description: string;
          let imageUrl: string;
          let availability_id: number | undefined;
          let currency: string;

          switch (prod.product_type) {
            case 'activity':
              title = (prod.product as any).name ?? 'Actividad sin nombre';
              description = (prod.product as any).description ?? 'Sin descripción disponible';
              imageUrl = (prod.product as any).image ?? 'https://via.placeholder.com/400x300?text=Actividad';
              availability_id = (prod.product as any).availability_id?.[0]?.id;
              currency = prod.currency ?? 'USD';
              break;
            case 'lodgment':
              title = (prod.product as any).name ?? 'Alojamiento sin nombre';
              description = (prod.product as any).description ?? 'Sin descripción disponible';
              imageUrl = (prod.product as any).image ?? 'https://via.placeholder.com/400x300?text=Alojamiento';
              availability_id = undefined;
              currency = prod.currency ?? 'USD';
              break;
            case 'transportation':
              title = (prod.product as any).type
                ? `${(prod.product as any).type} de ${(prod.product as any).origin?.city ?? 'Origen desconocido'} a ${(prod.product as any).destination?.city ?? 'Destino desconocido'}`
                : 'Transporte sin nombre';
              description = (prod.product as any).description ?? 'Sin descripción disponible';
              imageUrl = (prod.product as any).image ?? 'https://via.placeholder.com/400x300?text=Transporte';
              availability_id = (prod.product as any).availability_id?.[0]?.id;
              currency = prod.currency ?? 'USD';
              break;
            case 'flight':
              title =
                `Vuelo de ${(prod.product as any).origin?.city ?? 'Origen desconocido'} a ${(prod.product as any).destination?.city ?? 'Destino desconocido'}` ||
                'Vuelo sin nombre';
              description = (prod.product as any).description ?? 'Sin descripción disponible';
              imageUrl = (prod.product as any).image ?? 'https://via.placeholder.com/400x300?text=Vuelo';
              availability_id = (prod.product as any).availability_id;
              currency = prod.currency ?? 'USD';
              break;
            default:
              title = 'Producto sin nombre';
              description = 'Sin descripción disponible';
              imageUrl = 'https://via.placeholder.com/400x300?text=Producto';
              availability_id = undefined;
              currency = 'USD';
          }

          return {
            ...prod,
            availability_id,
            title,
            description,
            price: prod.unit_price ?? 0,
            imageUrl,
            currency,
          };
        });
        this.noProductsMessage = this.products.length === 0 ? 'No hay productos disponibles en este momento.' : null;
      },
      error: (error: unknown) => {
        this.logger.error('Error al cargar los productos', error);
        this.noProductsMessage = 'Error al cargar los productos. Por favor, intenta de nuevo.';
        this.notificationService.error('Error al cargar los productos', { duration: 5000 });
      },
    });
  }

  private loadPackages(): void {
    this.packageService.listPackages().subscribe({
      next: (packages: PackageResponse[]) => {
        this.packages = packages.map((pkg) => {
          const basePrice = pkg.base_price ?? 0;
          const taxes = pkg.taxes ?? 0;
          const finalPrice = pkg.final_price ?? 0;

          return {
            ...pkg,
            availability_id: (pkg as any).availability_id || pkg.id,
            title: pkg.name ?? 'Paquete sin nombre',
            price: finalPrice,
            currency: pkg.currency ?? 'USD',
            rating: pkg.rating_average ?? 0,
            reviewsCount: pkg.total_reviews ?? 0,
            imageUrl: 'https://via.placeholder.com/400x300?text=Paquete+Turístico', // Eliminada referencia a main_image
            originalPrice: basePrice && taxes ? basePrice + taxes : undefined,
            discount:
              basePrice && finalPrice && finalPrice < basePrice ? ((basePrice - finalPrice) / basePrice) * 100 : undefined,
            features: [],
            badge: pkg.rating_average && pkg.rating_average >= 4.8 ? 'Más vendido' : undefined,
            destination: undefined,
            duration: pkg.duration_days ? `${pkg.duration_days} días` : undefined,
            maxPeople: undefined,
          };
        });
        this.noPackagesMessage = this.packages.length === 0 ? 'No hay paquetes disponibles en este momento.' : null;
      },
      error: (error: unknown) => {
        this.logger.error('Error al cargar los paquetes', error);
        this.noPackagesMessage = 'Error al cargar los paquetes. Por favor, intenta de nuevo.';
        this.notificationService.error('Error al cargar los paquetes', { duration: 5000 });
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

    if (item.availability_id === undefined) {
      this.notificationService.error('No hay disponibilidad para este producto.', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      return;
    }

    this.addingToCart.add(item.id);

    const cartItem: CartItemAdd = {
      availability_id: item.availability_id,
      product_metadata_id: item.id,
      qty: 1,
      unit_price: item.price,
      currency: item.currency,
      config: {
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
      },
    };

    this.cartService.addCartItem(cartItem).subscribe({
      next: () => {
        this.notificationService.success(`¡${item.title} agregado al carrito!`, {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        this.addingToCart.delete(item.id);
      },
      error: (error: Error) => {
        this.logger.error('Error al agregar al carrito', error);
        this.addingToCart.delete(item.id);
      },
    });
  }

  onAddPackageToCart(item: CardItem) {
    if (this.addingToCart.has(item.id)) return;

    this.addingToCart.add(item.id);

    const cartItem: CartItemAdd = {
      availability_id: item.availability_id!,
      product_metadata_id: item.id,
      qty: 1,
      unit_price: item.price,
      currency: item.currency,
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
        this.notificationService.success(`¡${item.title} agregado al carrito!`, {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        this.addingToCart.delete(item.id);
      },
      error: (error: Error) => {
        this.logger.error('Error al agregar al carrito', error);
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
      this.notificationService.success('Añadido a favoritos', { duration: 3000 });
    } else {
      this.favoriteIds.delete(event.id);
      this.notificationService.info('Eliminado de favoritos', { duration: 3000 });
    }
    this.logger.debug('Favoritos actualizados', Array.from(this.favoriteIds));
  }
}