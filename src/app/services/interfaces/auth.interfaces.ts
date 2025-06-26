// Credenciales para login
export interface Auth {
  email: string;
  password: string;
}

// Datos para registro de usuario
export interface UserRegister {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  telephone: string;
  born_date?: string; 
  state?: string; 
}

// Respuesta de login
export interface TokenUserResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  data: {
    id: number;
    email: string;
  };
}

// Respuesta de refresh token
export interface RefreshTokenResponse {
  message: string;
  access_token: string;
}

// Datos de un usuario
export interface UserRead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  born_date?: string;
  state?: string;
  created_at: string;
  is_staff: boolean;
}

// Respuesta de error
export interface ErrorResponse {
  message: string;
  detail?: string;
}

// Respuesta de eliminación
export interface SuccessResponse {
  message: string;
  data: {
    user_id: number;
  };
}

// Datos para actualización de usuario
export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  telephone?: string;
  born_date?: string;
  state?: string;
}