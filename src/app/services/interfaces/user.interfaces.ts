/**
 * Datos de un usuario.
 */
export interface UserRead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  born_date?: string;
  state: string;
  created_at: string;
  is_staff: boolean;
}

/**
 * Datos del usuario autenticado (cliente/browser).
 */
export interface UserMe extends UserRead {}

/**
 * Datos para actualización de usuario.
 */
export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  telephone?: string;
  born_date?: string;
  state?: string;
}

/**
 * Respuesta de éxito para operaciones de usuario.
 */
export interface SuccessResponse {
  message: string;
  data?: {
    user_id: number;
  };
}