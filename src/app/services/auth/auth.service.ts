import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap, timeout, retry } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { StorageService } from '../core/storage.service';
import { AUTH_ENDPOINTS } from './auth-endpoints';
import {
  Auth,
  UserRegister,
  TokenUserResponse,
  RefreshTokenResponse,
  ErrorResponse,
} from '../interfaces/auth.interfaces';
import { UserRead, UserMe } from '../interfaces/user.interfaces';
import { HttpHeaders } from '@angular/common/http';
import { UserService } from '../users/user.service';

interface AuthState {
  isLoggedIn: boolean;
  user: UserMe | null;
}

/**
 * Servicio para manejar operaciones relacionadas con autenticación.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TIMEOUT_MS = 10000;
  private readonly RETRY_COUNT = 2;
  private authState$ = new BehaviorSubject<AuthState>({ isLoggedIn: false, user: null });

  constructor(
    private readonly apiService: ApiService,
    private readonly logger: LoggerService,
    private readonly storage: StorageService,
    private readonly userService: UserService
  ) {
    // Inicializar el estado de autenticación al crear el servicio
    this.checkInitialAuthState();
  }

  /**
   * Verifica el estado inicial de autenticación al cargar el servicio.
   */
  private checkInitialAuthState() {
    if (this.isLoggedIn()) {
      this.userService.getMe().pipe(
        tap((user) => {
          this.authState$.next({ isLoggedIn: true, user });
          this.logger.debug('Estado inicial: usuario autenticado', user);
        }),
        catchError((error) => {
          this.logger.error('Error al verificar estado inicial', error);
          this.storage.clearStorage();
          this.authState$.next({ isLoggedIn: false, user: null });
          return of(null);
        })
      ).subscribe();
    } else {
      this.authState$.next({ isLoggedIn: false, user: null });
      this.logger.debug('Estado inicial: usuario no autenticado');
    }
  }

  /**
   * Obtiene el estado de autenticación como un Observable.
   * @returns Observable con el estado de autenticación (isLoggedIn y user).
   */
  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  /**
   * Actualiza el estado de autenticación.
   * @param state Nuevo estado de autenticación.
   */
  updateAuthState(state: AuthState) {
    this.authState$.next(state);
    this.logger.debug('Estado de autenticación actualizado:', state);
  }

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
      catchError((error) => this.handleError('Registro de usuario', error))
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
      switchMap((response) => {
        if (response.data?.access_token) {
          this.storage.setToken(response.data.access_token);
          if (response.data.refresh_token) {
            this.storage.setRefreshToken(response.data.refresh_token);
          }
          this.logger.debug('Inicio de sesión exitoso');
          // Cargar datos del usuario después del login
          return this.userService.getMe().pipe(
            tap((user) => {
              this.authState$.next({ isLoggedIn: true, user });
              this.logger.debug('Datos del usuario cargados tras login:', user);
            }),
            switchMap(() => of(response))
          );
        }
        return of(response);
      }),
      catchError((error) => {
        this.authState$.next({ isLoggedIn: false, user: null });
        return this.handleError('Inicio de sesión', error);
      })
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
      this.authState$.next({ isLoggedIn: false, user: null });
      this.logger.error('No hay refresh token disponible');
      return throwError(() => new Error('No hay refresh token disponible'));
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + refreshToken,
    });
    return this.apiService.get<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH, { headers }).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.RETRY_COUNT),
      tap((response) => {
        if (response.data?.access_token) {
          this.storage.setToken(response.data.access_token);
          this.logger.debug('Token refrescado exitosamente');
          // Actualizar datos del usuario después de refrescar el token
          this.userService.getMe().pipe(
            tap((user) => {
              this.authState$.next({ isLoggedIn: true, user });
              this.logger.debug('Datos del usuario actualizados tras refresh:', user);
            }),
            catchError((error) => {
              this.logger.error('Error al actualizar datos del usuario tras refresh', error);
              this.storage.clearStorage();
              this.authState$.next({ isLoggedIn: false, user: null });
              return of(null);
            })
          ).subscribe();
        }
      }),
      catchError((error) => {
        this.storage.clearStorage();
        this.authState$.next({ isLoggedIn: false, user: null });
        return this.handleError('Refrescar token', error);
      })
    );
  }

  /**
   * Cierra la sesión del usuario limpiando el almacenamiento.
   * @returns Observable que completa al cerrar sesión.
   */
  logout(): Observable<void> {
    this.storage.clearStorage();
    this.authState$.next({ isLoggedIn: false, user: null });
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
          this.authState$.next({ isLoggedIn: false, user: null });
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