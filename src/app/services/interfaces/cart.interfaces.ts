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
 * Interfaz para la respuesta de creación de una orden.
 */
export interface OrderCreatedResponse {
  order_id: number;
  total: number;
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

/**
 * Interfaz para un componente de un paquete.
 */
export interface ComponentPackageResponse {
  id: number;
  product_metadata_id: number;
  order: number;
  quantity?: number;
  title?: string;
  start_date?: string;
  end_date?: string;
  product_type: string;
  product_name: string;
  currency: string;
}

/**
 * Interfaz para la respuesta de un paquete.
 */
export interface PackageResponse {
  id: number;
  name: string;
  description: string;
  cover_image?: string;
  base_price?: number;
  taxes?: number;
  final_price: number;
  rating_average: number;
  total_reviews: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  duration_days?: number;
  currency: string;
  images?: { id: number; image: string; description?: string; uploaded_at: string }[];
}

/**
 * Interfaz para la respuesta detallada de un paquete.
 */
export interface PackageDetailResponse extends PackageResponse {
  components: ComponentPackageResponse[];
}

/**
 * Interfaz para agregar un paquete al carrito.
 */
export interface CartPackageAdd {
  package_id: number;
  availability_id: number;
  qty: number;
  config: CartItemConfig;
}