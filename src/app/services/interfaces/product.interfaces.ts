/**
 * Tipos para el tipo de producto.
 */
export type ProductType = 'activity' | 'flight' | 'lodgment' | 'transportation';

/**
 * Interfaz para disponibilidad de actividad anidada (para creación).
 */
export interface ActivityAvailabilityCreate {
  event_date: string;
  start_time: string;
  total_seats: number;
  reserved_seats: number;
  price: number;
  currency: string;
}

/**
 * Interfaz para disponibilidad de actividad anidada (respuesta).
 */
export interface ActivityAvailability {
  id: number;
  activity_id: number;
  event_date: string;
  start_time: string;
  total_seats: number;
  reserved_seats: number;
  price: number;
  currency: string;
  state: string;
}

/**
 * Interfaz para crear una actividad completa.
 */
export interface ActivityCompleteCreate {
  name: string;
  description: string;
  location_id: number;
  date: string;
  start_time: string;
  duration_hours: number;
  include_guide: boolean;
  maximum_spaces: number;
  difficulty_level: 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Extreme';
  language: string;
  available_slots: number;
  availabilities: ActivityAvailabilityCreate[];
  currency: string;
}

/**
 * Interfaz para una actividad.
 */
export interface Activity {
  id: number;
  name: string;
  description: string;
  location: {
    country: string;
    state: string;
    city: string;
  };
  date: string;
  start_time: string;
  duration_hours: number;
  include_guide: boolean;
  maximum_spaces: number;
  difficulty_level: 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Extreme';
  language: string;
  available_slots: number;
  availability_id: ActivityAvailability[];
}

/**
 * Interfaz para disponibilidad de habitación anidada (para creación).
 */
export interface RoomAvailabilityCreate {
  start_date: string;
  end_date: string;
  available_quantity: number;
  price_override?: number;
  currency: string;
  is_blocked: boolean;
  minimum_stay: number;
}

/**
 * Interfaz para disponibilidad de habitación anidada (respuesta).
 */
export interface RoomAvailability {
  id?: number;
  start_date: string;
  end_date: string;
  available_quantity: number;
  price_override?: number;
  currency: string;
  is_blocked: boolean;
  minimum_stay: number;
}

/**
 * Interfaz para habitación anidada.
 */
export interface Room {
  room_type: 'single' | 'double' | 'triple' | 'quadruple' | 'suite' | 'family' | 'dormitory' | 'studio';
  name?: string;
  description?: string;
  capacity: number;
  has_private_bathroom: boolean;
  has_balcony: boolean;
  has_air_conditioning: boolean;
  has_wifi: boolean;
  base_price_per_night: number;
  currency: string;
  availabilities: RoomAvailability[];
}

/**
 * Interfaz para crear un alojamiento completo.
 */
export interface LodgmentCompleteCreate {
  name: string;
  description?: string;
  location_id: number;
  type: 'hotel' | 'hostel' | 'apartment' | 'house' | 'cabin' | 'resort' | 'bed_and_breakfast' | 'villa' | 'camping';
  max_guests: number;
  contact_phone?: string;
  contact_email?: string;
  amenities: string[];
  date_checkin: string;
  date_checkout: string;
  currency: string;
  rooms: Room[];
}

/**
 * Interfaz para un alojamiento.
 */
export interface Lodgment {
  id: number;
  name: string;
  description?: string;
  location: {
    country: string;
    state: string;
    city: string;
  };
  type: 'hotel' | 'hostel' | 'apartment' | 'house' | 'cabin' | 'resort' | 'bed_and_breakfast' | 'villa' | 'camping';
  max_guests: number;
  contact_phone?: string;
  contact_email?: string;
  amenities: string[];
  date_checkin: string;
  date_checkout: string;
  currency: string;
  rooms: Room[];
}

/**
 * Interfaz para disponibilidad de transporte anidada (para creación).
 */
export interface TransportationAvailabilityCreate {
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  total_seats: number;
  reserved_seats: number;
  price: number;
  currency: string;
  state: string;
}

/**
 * Interfaz para disponibilidad de transporte anidada (respuesta).
 */
export interface TransportationAvailability {
  id: number;
  transportation_id: number;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  total_seats: number;
  reserved_seats: number;
  price: number;
  currency: string;
  state: string;
}

/**
 * Interfaz para crear un transporte completo.
 */
export interface TransportationCompleteCreate {
  origin_id: number;
  destination_id: number;
  type: string;
  description: string;
  notes?: string;
  capacity: number;
  currency: string;
  availabilities: TransportationAvailabilityCreate[];
}

/**
 * Interfaz para un transporte.
 */
export interface Transportation {
  id: number;
  origin: {
    country: string;
    state: string;
    city: string;
  };
  destination: {
    country: string;
    state: string;
    city: string;
  };
  type: string;
  description: string;
  notes?: string;
  capacity: number;
  availability_id: TransportationAvailability[];
  is_active: boolean;
}

/**
 * Interfaz para un vuelo.
 */
export interface Flight {
  id: number;
  airline: string;
  flight_number: string;
  origin: {
    country: string;
    state: string;
    city: string;
  };
  destination: {
    country: string;
    state: string;
    city: string;
  };
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  duration_hours: number;
  class_flight: string;
  available_seats: number;
  luggage_info: string;
  aircraft_type: string;
  terminal: string;
  gate: string;
  notes: string;
  availability_id: number;
}

/**
 * Interfaz genérica para productos.
 */
export interface GenericProduct {
  id: number;
  [key: string]: any;
}

/**
 * Interfaz para metadatos de producto.
 */
export interface ProductMetadataResponse {
  id: number;
  unit_price: number;
  currency: string;
  product_type: ProductType;
  product: Activity | Lodgment | Transportation | Flight;
}

/**
 * Interfaz para metadatos de alojamiento con detalles.
 */
export interface ProductMetadataLodgmentDetailResponse {
  id: number;
  unit_price: number;
  currency: string;
  product_type: 'lodgment';
  product: Lodgment;
}

/**
 * Interfaz para crear metadatos de producto.
 */
export interface ProductMetadataCreate {
  product_type: ProductType;
  unit_price: number;
  currency: string;
  supplier_id: number;
  product: ActivityCompleteCreate | LodgmentCompleteCreate | TransportationCompleteCreate | GenericProduct;
}

/**
 * Interfaz para actualizar metadatos de producto.
 */
export interface ProductMetadataUpdate {
  unit_price?: number;
  currency?: string;
  supplier_id?: number;
  product?: ActivityCompleteCreate | LodgmentCompleteCreate | TransportationCompleteCreate | GenericProduct;
}

/**
 * Interfaz para respuesta de cotización.
 */
export interface QuoteResponse {
  price: number;
  currency: string;
  available: boolean;
  [key: string]: any;
}

/**
 * Interfaz para respuesta de verificación de disponibilidad.
 */
export interface CheckResponse {
  available: boolean;
  [key: string]: any;
}

/**
 * Interfaz para respuesta de lista de productos.
 */
export interface ProductListResponse {
  items: ProductMetadataResponse[];
  count: number;
}