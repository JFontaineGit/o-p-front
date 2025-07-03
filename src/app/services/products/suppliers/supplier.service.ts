import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry, switchMap, tap, timeout } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { LoggerService } from '../../core/logger.service';
import { StorageService, StorageKeys } from '../../core/storage.service';
import { SUPPLIER_ENDPOINTS } from './supplier-endpoints';
import { SupplierCreate, SupplierUpdate, SupplierResponse } from '../../interfaces/supplier.interfaces';
import { environment } from '../../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Servicio para gestionar operaciones CRUD de proveedores.
 * Interactúa con la API a través de ApiService y maneja errores de forma centralizada.
 */
@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly apiTimeout = environment.apiTimeout;
  private readonly retryAttempts = environment.retryAttempts;
  private readonly retryDelay = environment.retryDelay;

  constructor(
    private apiService: ApiService,
    private logger: LoggerService,
    private storageService: StorageService
  ) {}

  /**
   * Crea un nuevo proveedor en la API.
   * @param supplier Datos del proveedor a crear.
   * @returns Observable con la respuesta del proveedor creado.
   */
  createSupplier(supplier: SupplierCreate): Observable<SupplierResponse> {
    return this.apiService
      .post<SupplierResponse, SupplierCreate>(SUPPLIER_ENDPOINTS.CREATE, supplier)
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Proveedor creado', { id: response.id })),
        catchError(this.handleError<SupplierResponse>('createSupplier'))
      );
  }

  /**
   * Obtiene un proveedor por su ID.
   * @param id ID del proveedor.
   * @returns Observable con los datos del proveedor.
   */
  getSupplier(id: number): Observable<SupplierResponse> {
    return this.apiService
      .get<SupplierResponse>(SUPPLIER_ENDPOINTS.GET.replace('{id}', id.toString()))
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Proveedor obtenido', { id })),
        catchError(this.handleError<SupplierResponse>('getSupplier'))
      );
  }

  /**
   * Lista todos los proveedores.
   * @returns Observable con un array de proveedores.
   */
  listSuppliers(): Observable<SupplierResponse[]> {
    return this.apiService.get<SupplierResponse[]>(SUPPLIER_ENDPOINTS.LIST).pipe(
      timeout(this.apiTimeout),
      retry({ count: this.retryAttempts, delay: this.retryDelay }),
      tap((response) => this.logger.debug('Proveedores listados', { count: response.length })),
      catchError(this.handleError<SupplierResponse[]>('listSuppliers'))
    );
  }

  /**
   * Actualiza un proveedor existente.
   * @param id ID del proveedor a actualizar.
   * @param supplier Datos actualizados del proveedor.
   * @returns Observable con la respuesta del proveedor actualizado.
   */
  updateSupplier(id: number, supplier: SupplierUpdate): Observable<SupplierResponse> {
    return this.apiService
      .patch<SupplierResponse, SupplierUpdate>(
        SUPPLIER_ENDPOINTS.UPDATE.replace('{id}', id.toString()),
        supplier
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Proveedor actualizado', { id })),
        catchError(this.handleError<SupplierResponse>('updateSupplier'))
      );
  }

  /**
   * Elimina un proveedor por su ID.
   * @param id ID del proveedor a eliminar.
   * @returns Observable con la respuesta de la eliminación.
   */
  deleteSupplier(id: number): Observable<void> {
    return this.apiService
      .delete<void>(SUPPLIER_ENDPOINTS.DELETE.replace('{id}', id.toString()))
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Proveedor eliminado', { id })),
        catchError(this.handleError<void>('deleteSupplier'))
      );
  }

  /**
   * Lista los proveedores eliminados.
   * @returns Observable con un array de proveedores eliminados.
   */
  listDeletedSuppliers(): Observable<SupplierResponse[]> {
    return this.apiService.get<SupplierResponse[]>(SUPPLIER_ENDPOINTS.LIST_DELETED).pipe(
      timeout(this.apiTimeout),
      retry({ count: this.retryAttempts, delay: this.retryDelay }),
      tap((response) => this.logger.debug('Proveedores eliminados listados', { count: response.length })),
      catchError(this.handleError<SupplierResponse[]>('listDeletedSuppliers'))
    );
  }

  /**
   * Restaura un proveedor eliminado por su ID.
   * @param id ID del proveedor a restaurar.
   * @returns Observable con la respuesta del proveedor restaurado.
   */
  restoreSupplier(id: number): Observable<SupplierResponse> {
    return this.apiService
      .patch<SupplierResponse>(SUPPLIER_ENDPOINTS.RESTORE.replace('{id}', id.toString()), {})
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Proveedor restaurado', { id })),
        catchError(this.handleError<SupplierResponse>('restoreSupplier'))
      );
  }

  /**
   * Maneja errores de las operaciones HTTP de manera consistente.
   * @param operation Nombre de la operación que falló.
   * @returns Función que maneja el error y retorna un Observable con el error.
   */
  private handleError<T>(operation: string): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {
      this.logger.error(`${operation} falló`, error);
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.storageService.clearStorage();
        this.logger.debug('Sesión limpiada debido a error 401');
      }
      return throwError(() => new Error(`Error en ${operation}: ${error.message || 'Error desconocido'}`));
    };
  }
}