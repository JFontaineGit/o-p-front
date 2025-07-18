import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardMode = 'product' | 'package';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  @Input() title = '';
  @Input() description = '';
  @Input() price = 0;
  @Input() imageUrl = '';
  @Input() id = 0;
  @Input() availability_id?: number;
  @Input() currency = 'USD'; // Añadido con valor por defecto
  @Input() isFavorite = false;
  @Input() isAddingToCart = false;

  @Input() mode: CardMode = 'product';
  @Input() originalPrice?: number;
  @Input() discount?: number;
  @Input() rating?: number;
  @Input() reviewsCount?: number;
  @Input() features?: string[];
  @Input() badge?: string;
  @Input() destination?: string;
  @Input() duration?: string;
  @Input() maxPeople?: number;
  @Output() addToCart = new EventEmitter<{
    id: number;
    availability_id?: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    currency: string;
    destination?: string;
    duration?: string;
    maxPeople?: number;
    features?: string[];
  }>();
  @Output() toggleFavorite = new EventEmitter<{ id: number; isFavorite: boolean }>();

  @HostBinding('class') get hostClasses(): string {
    return `product-card-host product-card-host--${this.mode}`;
  }

  constructor() {}

  onAddToCart() {
    if (this.availability_id === undefined && this.mode === 'product') {
      return; // No emitir evento si no hay disponibilidad para productos
    }

    this.addToCart.emit({
      id: this.id,
      availability_id: this.availability_id,
      title: this.title,
      description: this.description,
      price: this.price,
      imageUrl: this.imageUrl,
      currency: this.currency, // Añadido para cumplir con CardItem
      ...(this.mode === 'package' && {
        destination: this.destination,
        duration: this.duration,
        maxPeople: this.maxPeople,
        features: this.features,
      }),
    });
  }

  onToggleFavorite() {
    this.isFavorite = !this.isFavorite;
    this.toggleFavorite.emit({
      id: this.id,
      isFavorite: this.isFavorite,
    });
  }

  get formattedPrice(): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
    }).format(this.price);
  }

  get formattedOriginalPrice(): string | null {
    if (!this.originalPrice) return null;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
    }).format(this.originalPrice);
  }

  get discountPercentage(): string | null {
    if (!this.discount) return null;
    return `-${Math.round(this.discount)}%`;
  }

  get hasDiscount(): boolean {
    return !!(this.originalPrice && this.discount && this.originalPrice > this.price);
  }

  get showRating(): boolean {
    return this.mode === 'package' && !!(this.rating && this.rating > 0);
  }

  get ratingStars(): number[] {
    if (!this.rating) return [];
    const fullStars = Math.floor(this.rating);
    return Array(5)
      .fill(0)
      .map((_, i) => (i < fullStars ? 1 : 0));
  }

  get hasFeatures(): boolean {
    return !!(this.features && this.features.length > 0);
  }

  get displayFeatures(): string[] {
    return this.features?.slice(0, 3) || [];
  }

  get packageInfo(): Array<{ icon: string; text: string }> {
    const info: Array<{ icon: string; text: string }> = [];

    if (this.destination) {
      info.push({ icon: 'location_on', text: this.destination });
    }

    if (this.duration) {
      info.push({ icon: 'schedule', text: this.duration });
    }

    if (this.maxPeople) {
      info.push({ icon: 'group', text: `${this.maxPeople} personas` });
    }

    return info;
  }

  get featureIcons(): Record<string, string> {
    return {
      Vuelos: 'flight',
      Hoteles: 'hotel',
      Hotel: 'hotel',
      'Hoteles 4*': 'hotel',
      'Hoteles 5*': 'hotel',
      'Guía español': 'person',
      Guía: 'person',
      Desayuno: 'restaurant',
      Comidas: 'restaurant',
      Transporte: 'directions_bus',
      Traslados: 'directions_bus',
      Seguro: 'security',
      WiFi: 'wifi',
      Piscina: 'pool',
      Spa: 'spa',
      Gimnasio: 'fitness_center',
    };
  }

  getFeatureIcon(feature: string): string {
    const exactMatch = this.featureIcons[feature];
    if (exactMatch) return exactMatch;

    const partialMatch = Object.keys(this.featureIcons).find(
      (key) => feature.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(feature.toLowerCase())
    );

    return partialMatch ? this.featureIcons[partialMatch] : 'check_circle';
  }

  get isAddToCartDisabled(): boolean {
    return this.mode === 'product' && this.availability_id === undefined;
  }
}