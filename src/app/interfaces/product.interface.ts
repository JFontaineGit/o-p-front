// Interfaz base para productos 
export interface Product {
  id: number
  title: string
  description: string
  price: number
  imageUrl: string
}

// Interfaz extendida para productos con descuentos y badges
export interface ProductWithExtras extends Product {
  originalPrice?: number
  discount?: number
  badge?: string
}

// Interfaz específica para paquetes turísticos
export interface TravelPackage extends ProductWithExtras {
  rating?: number
  reviewsCount?: number
  features?: string[]
  destination?: string
  duration?: string
  maxPeople?: number
}

// Interfaz unificada que puede ser cualquiera de los dos tipos
export type ProductCardData = Product | ProductWithExtras | TravelPackage

// Interfaz de carrito
export interface CartItem extends Product {
  quantity?: number
}

// Interfaz extendida para articulos que sean paquetes (carrito)
export interface CartItemExtended extends TravelPackage {
  quantity?: number
}

// Type guards para verificar el tipo de producto
export function isProductWithExtras(product: ProductCardData): product is ProductWithExtras {
  return "originalPrice" in product || "discount" in product || "badge" in product
}

export function isTravelPackage(product: ProductCardData): product is TravelPackage {
  return "rating" in product || "features" in product || "destination" in product
}

// Función auxiliar para obtener el tipo de producto
export function getProductType(product: ProductCardData): "product" | "package" {
  return isTravelPackage(product) ? "package" : "product"
}
