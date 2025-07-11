/**
 * Interfaz para la configuración de un ítem del carrito.
 */
export interface CartItemConfig {
  title: string;
  description: string;
  imageUrl: string;
  destination?: string;
  duration?: string;
  maxPeople?: number;
  features?: string[];
}

/**
 * Interfaz para un ítem del carrito en la respuesta de la API.
 */
export interface CartItemResponse {
  id: number;
  availability_id: number;
  product_metadata_id: number;
  qty: number;
  unit_price: number;
  currency: string;
  config: CartItemConfig | { [key: string]: any };
}

/**
 * Interfaz para la respuesta del carrito.
 */
export interface CartResponse {
  id: number;
  status: string;
  items_cnt: number;
  total: number;
  currency: string;
  updated_at: string;
  items: CartItemResponse[];
}

/**
 * Interfaz para agregar un ítem al carrito.
 */
export interface CartItemAdd {
  availability_id: number;
  product_metadata_id: number;
  qty: number;
  unit_price: number;
  currency: string;
  config: CartItemConfig;
}

/**
 * Interfaz para actualizar la cantidad de un ítem en el carrito.
 */
export interface CartItemQtyPatch {
  qty: number;
}