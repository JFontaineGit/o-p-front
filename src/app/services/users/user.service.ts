import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, timeout, retry } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { StorageService } from '../core/storage.service';
import { USER_ENDPOINTS } from './user-endpoints';
import { UserRead, UserMe, UserUpdate, SuccessResponse } from '../interfaces/user.interfaces';
import { ErrorResponse } from '../interfaces/auth.interfaces';

/**
 * Servicio para manejar operaciones relacionadas con usuarios.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
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
  private isLoggedIn(): boolean {
    return !!this.storage.getToken();
  }

  /**
   * Obtiene todos los usuarios (requiere autenticación).
   * @returns Observable con la lista de usuarios o un array vacío si no está autenticado.
   */
  getAll(): Observable<UserRead[]> {
    if (!this.isLoggedIn()) {
      this.logger.debug('Usuario no autenticado, retornando array vacío');
      return of([]);
    }
    return this.apiService.get<UserRead[]>(USER_ENDPOINTS.LIST_USERS).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.RETRY_COUNT),
      tap(() => this.logger.debug('Usuarios obtenidos exitosamente')),
      catchError(error => {
        this.logger.error('Obtener todos los usuarios falló', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id - El ID del usuario.
   * @returns Observable con los datos del usuario o null si no está autenticado o no se encuentra.
   */
  getById(id: string | number): Observable<UserRead | null> {
    if (!this.isLoggedIn()) {
      this.logger.debug('Usuario no autenticado, retornando null');
      return of(null);
    }
    return this.apiService.get<UserRead>(USER_ENDPOINTS.GET_USER(Number(id))).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.RETRY_COUNT),
      tap(() => this.logger.debug(`Usuario ${id} obtenido exitosamente`)),
      catchError(error => {
        this.logger.error(`Obtener usuario ${id} falló`, error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene los datos del usuario autenticado (cliente/browser).
   * @returns Observable con los datos del usuario o null si no está autenticado.
   */
  getMe(): Observable<UserMe | null> {
    if (!this.isLoggedIn()) {
      this.logger.debug('Usuario no autenticado, retornando null');
      return of(null);
    }
    return this.apiService.get<UserMe>(USER_ENDPOINTS.GET_ME).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.RETRY_COUNT),
      tap(() => this.logger.debug('Datos del usuario autenticado obtenidos exitosamente')),
      catchError(error => {
        this.logger.error('Obtener datos del usuario autenticado falló', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza un usuario por su ID.
   * @param id - El ID del usuario.
   * @param data - Datos de actualización del usuario.
   * @returns Observable con los datos del usuario actualizado.
   */
  update(id: string | number, data: UserUpdate): Observable<UserRead> {
    return this.apiService.put<UserRead>(USER_ENDPOINTS.UPDATE_USER(Number(id)), data).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.RETRY_COUNT),
      tap(() => this.logger.debug(`Usuario ${id} actualizado exitosamente`)),
      catchError(error => this.handleError(`Actualizar usuario ${id}`, error))
    );
  }

  /**
   * Elimina un usuario por su ID.
   * @param id - El ID del usuario.
   * @returns Observable con la respuesta de eliminación.
   */
  delete(id: string | number): Observable<SuccessResponse> {
    return this.apiService.delete<SuccessResponse>(USER_ENDPOINTS.DELETE_USER(Number(id))).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.RETRY_COUNT),
      tap(() => this.logger.debug(`Usuario ${id} eliminado exitosamente`)),
      catchError(error => this.handleError(`Eliminar usuario ${id}`, error))
    );
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