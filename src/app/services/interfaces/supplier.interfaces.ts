/**
 * Interfaz para crear un nuevo proveedor.
 */
export interface SupplierCreate {
  first_name: string;
  last_name: string;
  organization_name: string;
  description: string;
  street: string;
  street_number: number;
  city: string;
  country: string;
  email: string;
  telephone: string;
  website: string;
  currency?: string;
}

/**
 * Interfaz para actualizar un proveedor existente.
 */
export interface SupplierUpdate {
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  description?: string;
  street?: string;
  street_number?: number;
  city?: string;
  country?: string;
  email?: string;
  telephone?: string;
  website?: string;
  currency?: string;
}

/**
 * Interfaz para la respuesta de la API al leer un proveedor.
 */
export interface SupplierResponse {
  id: number;
  name: string;
  description: string;
  street: string;
  street_number: number;
  city: string;
  country: string;
  email: string;
  telephone: string;
  website: string;
  currency: string;
}