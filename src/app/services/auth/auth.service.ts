import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, timeout, retry } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { StorageService } from '../core/storage.service';
import { AUTH_ENDPOINTS } from './auth-endpoints';
import { Auth, UserRegister, TokenUserResponse, RefreshTokenResponse, ErrorResponse } from '../interfaces/auth.interfaces';
import { UserRead } from '../interfaces/user.interfaces';
/**
 * Servicio para manejar operaciones relacionadas con autenticación.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TIMEOUT_MS = 10000;
  private readonly RETRY_COUNT = 2;

  constructor(
    private readonly apiService: ApiService,
    private readonly logger: LoggerService,
    private readonly storage: StorageService
  ) {}

  /**
   * Verifica si el usuario está autenticado.
   * @returns true si existe un token válido, false en caso contrario.
   */
  isLoggedIn(): boolean {
    return !!this.storage.getToken();
  }

  /**
   * Registra un nuevo usuario.
   * @param user - Datos de registro del usuario.
   * @returns Observable con los datos del usuario creado.
   */
  register(user: UserRegister): Observable<UserRead> {
    return this.apiService.post<UserRead>(AUTH_ENDPOINTS.REGISTER, user).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.RETRY_COUNT),
      tap(() => this.logger.debug('Usuario registrado exitosamente')),
      catchError(error => this.handleError('Registro de usuario', error))
    );
  }

  /**
   * Inicia sesión con las credenciales del usuario.
   * @param credentials - Credenciales del usuario (email, password).
   * @returns Observable con la respuesta de autenticación (tokens).
   */
  login(credentials: Auth): Observable<TokenUserResponse> {
    return this.apiService.post<TokenUserResponse>(AUTH_ENDPOINTS.LOGIN, credentials).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.RETRY_COUNT),
      tap(response => {
        if (response.access_token) {
          this.storage.setToken(response.access_token);
          if (response.refresh_token) {
            this.storage.setRefreshToken(response.refresh_token);
          }
          this.logger.debug('Inicio de sesión exitoso');
        }
      }),
      catchError(error => this.handleError('Inicio de sesión', error))
    );
  }

  /**
   * Refresca el token de acceso usando el refresh token.
   * @returns Observable con el nuevo token de acceso.
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      this.storage.clearStorage();
      this.logger.error('No hay refresh token disponible');
      return throwError(() => new Error('No hay refresh token disponible'));
    }
    return this.apiService.post<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH, { refresh_token: refreshToken }).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.RETRY_COUNT),
      tap(response => {
        if (response.access_token) {
          this.storage.setToken(response.access_token);
          this.logger.debug('Token refrescado exitosamente');
        }
      }),
      catchError(error => this.handleError('Refrescar token', error))
    );
  }

  /**
   * Cierra la sesión del usuario limpiando el almacenamiento.
   * @returns Observable que completa al cerrar sesión.
   */
  logout(): Observable<void> {
    this.storage.clearStorage();
    this.logger.debug('Sesión cerrada exitosamente');
    return of(void 0);
  }

  /**
   * Maneja errores de las peticiones HTTP.
   * @param operation - Nombre de la operación que falló.
   * @param error - Objeto de error.
   * @returns Observable con el error transformado.
   */
  private handleError(operation: string, error: unknown): Observable<never> {
    this.logger.error(`${operation} falló`, error);

    let errorMessage = 'Ocurrió un error inesperado';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'status' in error) {
      const httpError = error as { status: number; error?: ErrorResponse };
      switch (httpError.status) {
        case 400:
          errorMessage = httpError.error?.message || httpError.error?.detail || 'Datos de solicitud inválidos';
          break;
        case 401:
          errorMessage = httpError.error?.message || 'Credenciales inválidas o token expirado';
          this.storage.clearStorage();
          break;
        case 403:
          errorMessage = httpError.error?.message || 'Acción no permitida';
          break;
        case 404:
          errorMessage = httpError.error?.message || 'Recurso no encontrado';
          break;
        default:
          errorMessage = httpError.error?.message || 'Error del servidor';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}