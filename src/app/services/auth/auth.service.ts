import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { StorageService } from '../core/storage.service';
import { AUTH_ENDPOINTS } from './auth-endpoints';
import { TokenUserResponse, UserRead, Auth, UserRegister, RefreshTokenResponse, UserUpdate, SuccessResponse } from '../interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly apiService: ApiService,
    private readonly logger: LoggerService,
    private readonly storage: StorageService
  ) {}

  /**
   * Verifica si el usuario está autenticado.
   * @returns true si hay un token válido, false en caso contrario.
   */
  isLoggedIn(): boolean {
    return !!this.storage.getToken();
  }

  /**
   * Registra un nuevo usuario.
   * @param user Datos del usuario a registrar.
   * @returns Observable con los datos del usuario creado.
   */
  register(user: UserRegister): Observable<UserRead> {
    return this.apiService.post<UserRead>(AUTH_ENDPOINTS.REGISTER, user).pipe(
      catchError(error => this.handleError('User Register', error))
    );
  }

  /**
   * Inicia sesión con las credenciales de un usuario.
   * @param credentials Credenciales del usuario (email, password).
   * @returns Observable con la respuesta de autenticación (tokens).
   */
  login(credentials: Auth): Observable<TokenUserResponse> {
    return this.apiService.post<TokenUserResponse>(AUTH_ENDPOINTS.LOGIN, credentials).pipe(
      tap(response => {
        if (response.access_token) {
          this.storage.setToken(response.access_token);
          if (response.refresh_token) {
            this.storage.setItem('refresh_token', response.refresh_token);
          }
        }
      }),
      catchError(error => this.handleError('User Login', error))
    );
  }

  /**
   * Inicia sesión con las credenciales de un doctor (si aplica).
   * @param credentials Credenciales del doctor (email, password).
   * @returns Observable con la respuesta de autenticación (tokens).
   */
  doctorLogin(credentials: Auth): Observable<TokenUserResponse> {
    // Asumiendo que los doctores usan el mismo endpoint /users/login
    return this.login(credentials); // Reutiliza login, ya que no hay endpoint específico
    // Si hay un endpoint separado para doctores, actualizar con AUTH_ENDPOINTS.DOC_LOGIN
  }

  /**
   * Obtiene los datos de un usuario específico.
   * @param id ID del usuario.
   * @returns Observable con los datos del usuario o null si no está autenticado.
   */
  getUser(id: number): Observable<UserRead | null> {
    if (!this.isLoggedIn()) {
      return of(null);
    }
    return this.apiService.get<UserRead>(AUTH_ENDPOINTS.GET_USER(id)).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Lista todos los usuarios (requiere autenticación).
   * @returns Observable con la lista de usuarios.
   */
  listUsers(): Observable<UserRead[]> {
    if (!this.isLoggedIn()) {
      return of([]);
    }
    return this.apiService.get<UserRead[]>(AUTH_ENDPOINTS.LIST_USERS).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Actualiza los datos de un usuario.
   * @param id ID del usuario.
   * @param data Datos a actualizar.
   * @returns Observable con los datos del usuario actualizado.
   */
  updateUser(id: number, data: UserUpdate): Observable<UserRead> {
    return this.apiService.put<UserRead>(AUTH_ENDPOINTS.UPDATE_USER(id), data).pipe(
      catchError(error => this.handleError('Update User', error))
    );
  }

  /**
   * Elimina un usuario.
   * @param id ID del usuario.
   * @returns Observable con la respuesta de eliminación.
   */
  deleteUser(id: number): Observable<SuccessResponse> {
    return this.apiService.delete<SuccessResponse>(AUTH_ENDPOINTS.DELETE_USER(id)).pipe(
      catchError(error => this.handleError('Delete User', error))
    );
  }

  /**
   * Cierra la sesión del usuario.
   * @returns Observable que completa al cerrar sesión.
   */
  logout(): Observable<void> {
    this.storage.clearStorage();
    return of(undefined);
    // Nota: No hay endpoint /logout en la API, se limpia el almacenamiento local
  }

  /**
   * Refresca el token de acceso usando el refresh token.
   * @returns Observable con el nuevo access token.
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.storage.getItem('refresh_token');
    if (!refreshToken) {
      this.storage.clearStorage();
      return throwError(() => new Error('No refresh token available'));
    }
    return this.apiService.post<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH, { refresh_token: refreshToken }).pipe(
      tap(response => {
        if (response.access_token) {
          this.storage.setToken(response.access_token);
        }
      }),
      catchError(error => this.handleError('Refresh Token', error))
    );
  }

  /**
   * Maneja errores de las peticiones HTTP.
   * @param operation Nombre de la operación que falló.
   * @param error Objeto de error.
   * @returns Observable con el error transformado.
   */
  private handleError(operation: string, error: unknown): Observable<never> {
    this.logger.error(`${operation} failed`, error);

    let errorMessage = 'Ocurrió un error inesperado';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'status' in error) {
      const httpError = error as { status: number; error?: { message?: string; detail?: string } };
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