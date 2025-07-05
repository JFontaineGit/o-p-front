/**
 * Credenciales para login.
 */
export interface Auth {
  email: string;
  password: string;
}

/**
 * Datos para registro de usuario.
 */
export interface UserRegister {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  telephone: string;
  born_date?: string;
  state?: string;
}

/**
 * Respuesta de login con tokens.
 */
export interface TokenUserResponse {
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

/**
 * Respuesta de refresh token.
 */
export interface RefreshTokenResponse {
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

/**
 * Respuesta de error para operaciones de autenticación.
 */
export interface ErrorResponse {
  message: string;
  detail?: string;
}