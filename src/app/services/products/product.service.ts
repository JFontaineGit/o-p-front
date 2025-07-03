import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap, timeout } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { StorageService } from '../core/storage.service';
import { PRODUCT_ENDPOINTS } from './product-endpoints';
import {
  ProductMetadataCreate,
  ProductMetadataUpdate,
  ProductMetadataResponse,
  ProductMetadataLodgmentDetailResponse,
  ActivityCompleteCreate,
  LodgmentCompleteCreate,
  TransportationCompleteCreate,
  ActivityAvailabilityCreate,
  RoomAvailabilityCreate,
  TransportationAvailabilityCreate,
  QuoteResponse,
  CheckResponse,
} from '../interfaces/product.interfaces';
import { environment } from '../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Servicio para gestionar operaciones CRUD y específicas de productos y sus metadatos.
 * Interactúa con la API a través de ApiService y maneja errores de forma centralizada.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiTimeout = environment.apiTimeout;
  private readonly retryAttempts = environment.retryAttempts;
  private readonly retryDelay = environment.retryDelay;

  constructor(
    private apiService: ApiService,
    private logger: LoggerService,
    private storageService: StorageService
  ) {}

  /**
   * Crea un nuevo producto con sus metadatos.
   * @param product Datos del producto a crear.
   * @returns Observable con la respuesta del producto creado.
   */
  createProduct(product: ProductMetadataCreate): Observable<ProductMetadataResponse> {
    return this.apiService
      .post<ProductMetadataResponse, ProductMetadataCreate>(PRODUCT_ENDPOINTS.CREATE, product)
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Producto creado', { id: response.id })),
        catchError(this.handleError<ProductMetadataResponse>('createProduct'))
      );
  }

  /**
   * Crea una actividad completa con disponibilidades.
   * @param activity Datos de la actividad completa a crear.
   * @returns Observable con la respuesta del producto creado.
   */
  createActivityComplete(activity: ActivityCompleteCreate): Observable<ProductMetadataResponse> {
    return this.apiService
      .post<ProductMetadataResponse, ActivityCompleteCreate>(
        PRODUCT_ENDPOINTS.CREATE_ACTIVITY_COMPLETE,
        activity
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Actividad completa creada', { id: response.id })),
        catchError(this.handleError<ProductMetadataResponse>('createActivityComplete'))
      );
  }

  /**
   * Crea un alojamiento completo con habitaciones y disponibilidades.
   * @param lodgment Datos del alojamiento completo a crear.
   * @returns Observable con la respuesta del producto creado.
   */
  createLodgmentComplete(lodgment: LodgmentCompleteCreate): Observable<ProductMetadataResponse> {
    return this.apiService
      .post<ProductMetadataResponse, LodgmentCompleteCreate>(
        PRODUCT_ENDPOINTS.CREATE_LODGMENT_COMPLETE,
        lodgment
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Alojamiento completo creado', { id: response.id })),
        catchError(this.handleError<ProductMetadataResponse>('createLodgmentComplete'))
      );
  }

  /**
   * Crea un transporte completo con disponibilidades.
   * @param transportation Datos del transporte completo a crear.
   * @returns Observable con la respuesta del producto creado.
   */
  createTransportationComplete(transportation: TransportationCompleteCreate): Observable<ProductMetadataResponse> {
    return this.apiService
      .post<ProductMetadataResponse, TransportationCompleteCreate>(
        PRODUCT_ENDPOINTS.CREATE_TRANSPORT_COMPLETE,
        transportation
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Transporte completo creado', { id: response.id })),
        catchError(this.handleError<ProductMetadataResponse>('createTransportationComplete'))
      );
  }

  /**
   * Obtiene un producto por su ID.
   * @param id ID del producto.
   * @returns Observable con los datos del producto.
   */
  getProduct(id: number): Observable<ProductMetadataResponse> {
    return this.apiService
      .get<ProductMetadataResponse>(PRODUCT_ENDPOINTS.GET.replace('{id}', id.toString()))
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Producto obtenido', { id })),
        catchError(this.handleError<ProductMetadataResponse>('getProduct'))
      );
  }

  /**
   * Lista todos los productos.
   * @param params Parámetros de consulta opcionales.
   * @returns Observable con un array de productos.
   */
  listProducts(params?: HttpParams): Observable<ProductMetadataResponse[]> {
    return this.apiService.get<ProductMetadataResponse[]>(PRODUCT_ENDPOINTS.LIST, { params }).pipe(
      timeout(this.apiTimeout),
      retry({ count: this.retryAttempts, delay: this.retryDelay }),
      tap((response) => this.logger.debug('Productos listados', { count: response.length })),
      catchError(this.handleError<ProductMetadataResponse[]>('listProducts'))
    );
  }

  /**
   * Actualiza un producto existente.
   * @param id ID del producto a actualizar.
   * @param product Datos actualizados del producto.
   * @returns Observable con la respuesta del producto actualizado.
   */
  updateProduct(id: number, product: ProductMetadataUpdate): Observable<ProductMetadataResponse> {
    return this.apiService
      .patch<ProductMetadataResponse, ProductMetadataUpdate>(
        PRODUCT_ENDPOINTS.UPDATE.replace('{id}', id.toString()),
        product
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Producto actualizado', { id })),
        catchError(this.handleError<ProductMetadataResponse>('updateProduct'))
      );
  }

  /**
   * Elimina un producto por su ID.
   * @param id ID del producto a eliminar.
   * @returns Observable con la respuesta de la eliminación.
   */
  deleteProduct(id: number): Observable<void> {
    return this.apiService
      .delete<void>(PRODUCT_ENDPOINTS.DELETE.replace('{id}', id.toString()))
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Producto eliminado', { id })),
        catchError(this.handleError<void>('deleteProduct'))
      );
  }

  /**
   * Crea una disponibilidad para un producto (actividad).
   * @param metadataId ID del producto.
   * @param availability Datos de la disponibilidad.
   * @returns Observable con la respuesta de la disponibilidad creada.
   */
  createActivityAvailability(
    metadataId: number,
    availability: ActivityAvailabilityCreate
  ): Observable<ProductMetadataResponse> {
    return this.apiService
      .post<ProductMetadataResponse, ActivityAvailabilityCreate>(
        PRODUCT_ENDPOINTS.CREATE_AVAILABILITY.replace('{id}', metadataId.toString()),
        availability
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de actividad creada', { metadataId })),
        catchError(this.handleError<ProductMetadataResponse>('createActivityAvailability'))
      );
  }

  /**
   * Obtiene las disponibilidades de un producto (actividad).
   * @param metadataId ID del producto.
   * @returns Observable con un array de disponibilidades.
   */
  getActivityAvailability(metadataId: number): Observable<ProductMetadataResponse[]> {
    return this.apiService
      .get<ProductMetadataResponse[]>(
        PRODUCT_ENDPOINTS.GET_AVAILABILITY.replace('{id}', metadataId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) =>
          this.logger.debug('Disponibilidades de actividad obtenidas', {
            metadataId,
            count: response.length,
          })
        ),
        catchError(this.handleError<ProductMetadataResponse[]>('getActivityAvailability'))
      );
  }

  /**
   * Actualiza una disponibilidad de actividad.
   * @param availabilityId ID de la disponibilidad.
   * @param availability Datos actualizados de la disponibilidad.
   * @returns Observable con la respuesta de la disponibilidad actualizada.
   */
  updateActivityAvailability(
    availabilityId: number,
    availability: ActivityAvailabilityCreate
  ): Observable<ProductMetadataResponse> {
    return this.apiService
      .patch<ProductMetadataResponse, ActivityAvailabilityCreate>(
        PRODUCT_ENDPOINTS.UPDATE_AVAILABILITY.replace('{id}', availabilityId.toString()),
        availability
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de actividad actualizada', { availabilityId })),
        catchError(this.handleError<ProductMetadataResponse>('updateActivityAvailability'))
      );
  }

  /**
   * Elimina una disponibilidad de actividad.
   * @param availabilityId ID de la disponibilidad a eliminar.
   * @returns Observable con la respuesta de la eliminación.
   */
  deleteActivityAvailability(availabilityId: number): Observable<void> {
    return this.apiService
      .delete<void>(PRODUCT_ENDPOINTS.DELETE_AVAILABILITY.replace('{id}', availabilityId.toString()))
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de actividad eliminada', { availabilityId })),
        catchError(this.handleError<void>('deleteActivityAvailability'))
      );
  }

  /**
   * Crea una disponibilidad de transporte.
   * @param metadataId ID del producto.
   * @param availability Datos de la disponibilidad.
   * @returns Observable con la respuesta de la disponibilidad creada.
   */
  createTransportationAvailability(
    metadataId: number,
    availability: TransportationAvailabilityCreate
  ): Observable<ProductMetadataResponse> {
    return this.apiService
      .post<ProductMetadataResponse, TransportationAvailabilityCreate>(
        PRODUCT_ENDPOINTS.CREATE_TRANSPORTATION_AVAILABILITY.replace('{id}', metadataId.toString()),
        availability
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de transporte creada', { metadataId })),
        catchError(this.handleError<ProductMetadataResponse>('createTransportationAvailability'))
      );
  }

  /**
   * Obtiene las disponibilidades de transporte.
   * @param metadataId ID del producto.
   * @returns Observable con un array de disponibilidades.
   */
  getTransportationAvailability(metadataId: number): Observable<ProductMetadataResponse[]> {
    return this.apiService
      .get<ProductMetadataResponse[]>(
        PRODUCT_ENDPOINTS.GET_TRANSPORTATION_AVAILABILITY.replace('{id}', metadataId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) =>
          this.logger.debug('Disponibilidades de transporte obtenidas', {
            metadataId,
            count: response.length,
          })
        ),
        catchError(this.handleError<ProductMetadataResponse[]>('getTransportationAvailability'))
      );
  }

  /**
   * Actualiza una disponibilidad de transporte.
   * @param availabilityId ID de la disponibilidad.
   * @param availability Datos actualizados de la disponibilidad.
   * @returns Observable con la respuesta de la disponibilidad actualizada.
   */
  updateTransportationAvailability(
    availabilityId: number,
    availability: TransportationAvailabilityCreate
  ): Observable<ProductMetadataResponse> {
    return this.apiService
      .patch<ProductMetadataResponse, TransportationAvailabilityCreate>(
        PRODUCT_ENDPOINTS.UPDATE_TRANSPORTATION_AVAILABILITY.replace('{id}', availabilityId.toString()),
        availability
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() =>
          this.logger.debug('Disponibilidad de transporte actualizada', { availabilityId })
        ),
        catchError(this.handleError<ProductMetadataResponse>('updateTransportationAvailability'))
      );
  }

  /**
   * Elimina una disponibilidad de transporte.
   * @param availabilityId ID de la disponibilidad a eliminar.
   * @returns Observable con la respuesta de la eliminación.
   */
  deleteTransportationAvailability(availabilityId: number): Observable<void> {
    return this.apiService
      .delete<void>(
        PRODUCT_ENDPOINTS.DELETE_TRANSPORTATION_AVAILABILITY.replace('{id}', availabilityId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de transporte eliminada', { availabilityId })),
        catchError(this.handleError<void>('deleteTransportationAvailability'))
      );
  }

  /**
   * Crea una disponibilidad de habitación.
   * @param availability Datos de la disponibilidad.
   * @returns Observable con la respuesta de la disponibilidad creada.
   */
  createRoomAvailability(availability: RoomAvailabilityCreate): Observable<ProductMetadataResponse> {
    return this.apiService
      .post<ProductMetadataResponse, RoomAvailabilityCreate>(
        PRODUCT_ENDPOINTS.CREATE_ROOM_AVAILABILITY,
        availability
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de habitación creada')),
        catchError(this.handleError<ProductMetadataResponse>('createRoomAvailability'))
      );
  }

  /**
   * Obtiene una disponibilidad de habitación por su ID.
   * @param availabilityId ID de la disponibilidad.
   * @returns Observable con los datos de la disponibilidad.
   */
  getRoomAvailability(availabilityId: number): Observable<ProductMetadataResponse> {
    return this.apiService
      .get<ProductMetadataResponse>(
        PRODUCT_ENDPOINTS.GET_ROOM_AVAILABILITY.replace('{id}', availabilityId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de habitación obtenida', { availabilityId })),
        catchError(this.handleError<ProductMetadataResponse>('getRoomAvailability'))
      );
  }

  /**
   * Actualiza una disponibilidad de habitación.
   * @param availabilityId ID de la disponibilidad.
   * @param availability Datos actualizados de la disponibilidad.
   * @returns Observable con la respuesta de la disponibilidad actualizada.
   */
  updateRoomAvailability(
    availabilityId: number,
    availability: RoomAvailabilityCreate
  ): Observable<ProductMetadataResponse> {
    return this.apiService
      .patch<ProductMetadataResponse, RoomAvailabilityCreate>(
        PRODUCT_ENDPOINTS.UPDATE_ROOM_AVAILABILITY.replace('{id}', availabilityId.toString()),
        availability
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de habitación actualizada', { availabilityId })),
        catchError(this.handleError<ProductMetadataResponse>('updateRoomAvailability'))
      );
  }

  /**
   * Elimina una disponibilidad de habitación.
   * @param availabilityId ID de la disponibilidad a eliminar.
   * @returns Observable con la respuesta de la eliminación.
   */
  deleteRoomAvailability(availabilityId: number): Observable<void> {
    return this.apiService
      .delete<void>(
        PRODUCT_ENDPOINTS.DELETE_ROOM_AVAILABILITY.replace('{id}', availabilityId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de habitación eliminada', { availabilityId })),
        catchError(this.handleError<void>('deleteRoomAvailability'))
      );
  }

  /**
   * Obtiene las disponibilidades de una habitación específica.
   * @param roomId ID de la habitación.
   * @returns Observable con un array de disponibilidades.
   */
  getRoomAvailabilities(roomId: number): Observable<ProductMetadataResponse[]> {
    return this.apiService
      .get<ProductMetadataResponse[]>(
        PRODUCT_ENDPOINTS.GET_ROOM_AVAILABILITIES.replace('{room_id}', roomId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) =>
          this.logger.debug('Disponibilidades de habitación obtenidas', {
            roomId,
            count: response.length,
          })
        ),
        catchError(this.handleError<ProductMetadataResponse[]>('getRoomAvailabilities'))
      );
  }

  /**
   * Obtiene las disponibilidades de todas las habitaciones de un alojamiento.
   * @param lodgmentId ID del alojamiento.
   * @returns Observable con un array de disponibilidades.
   */
  getLodgmentRoomsAvailabilities(lodgmentId: number): Observable<ProductMetadataResponse[]> {
    return this.apiService
      .get<ProductMetadataResponse[]>(
        PRODUCT_ENDPOINTS.GET_LODGMENT_ROOMS_AVAILABILITIES.replace('{lodgment_id}', lodgmentId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) =>
          this.logger.debug('Disponibilidades de habitaciones de alojamiento obtenidas', {
            lodgmentId,
            count: response.length,
          })
        ),
        catchError(this.handleError<ProductMetadataResponse[]>('getLodgmentRoomsAvailabilities'))
      );
  }

  /**
   * Obtiene una cotización para una habitación.
   * @param roomId ID de la habitación.
   * @param params Parámetros de consulta (fechas, huéspedes, etc.).
   * @returns Observable con la respuesta de la cotización.
   */
  getRoomQuote(roomId: number, params?: HttpParams): Observable<QuoteResponse> {
    return this.apiService
      .get<QuoteResponse>(
        PRODUCT_ENDPOINTS.GET_ROOM_QUOTE.replace('{room_id}', roomId.toString()),
        { params }
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Cotización de habitación obtenida', { roomId })),
        catchError(this.handleError<QuoteResponse>('getRoomQuote'))
      );
  }

  /**
   * Verifica la disponibilidad de un producto.
   * @param metadataId ID del producto.
   * @returns Observable con la respuesta de la verificación.
   */
  checkProductAvailability(metadataId: number): Observable<CheckResponse> {
    return this.apiService
      .get<CheckResponse>(
        PRODUCT_ENDPOINTS.CHECK_PRODUCT.replace('{metadata_id}', metadataId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de producto verificada', { metadataId })),
        catchError(this.handleError<CheckResponse>('checkProductAvailability'))
      );
  }

  /**
   * Verifica la disponibilidad de un transporte.
   * @param metadataId ID del producto.
   * @returns Observable con la respuesta de la verificación.
   */
  checkTransportAvailability(metadataId: number): Observable<CheckResponse> {
    return this.apiService
      .get<CheckResponse>(
        PRODUCT_ENDPOINTS.CHECK_TRANSPORT.replace('{metadata_id}', metadataId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de transporte verificada', { metadataId })),
        catchError(this.handleError<CheckResponse>('checkTransportAvailability'))
      );
  }

  /**
   * Verifica la disponibilidad de un vuelo.
   * @param metadataId ID del producto.
   * @returns Observable con la respuesta de la verificación.
   */
  checkFlightAvailability(metadataId: number): Observable<CheckResponse> {
    return this.apiService
      .get<CheckResponse>(
        PRODUCT_ENDPOINTS.CHECK_FLIGHT.replace('{metadata_id}', metadataId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de vuelo verificada', { metadataId })),
        catchError(this.handleError<CheckResponse>('checkFlightAvailability'))
      );
  }

  /**
   * Verifica la disponibilidad de una habitación.
   * @param roomId ID de la habitación.
   * @returns Observable con la respuesta de la verificación.
   */
  checkRoomAvailability(roomId: number): Observable<CheckResponse> {
    return this.apiService
      .get<CheckResponse>(
        PRODUCT_ENDPOINTS.CHECK_ROOM.replace('{room_id}', roomId.toString())
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap(() => this.logger.debug('Disponibilidad de habitación verificada', { roomId })),
        catchError(this.handleError<CheckResponse>('checkRoomAvailability'))
      );
  }

  /**
   * Realiza una búsqueda avanzada de productos.
   * @param params Parámetros de búsqueda.
   * @returns Observable con un array de productos.
   */
  searchProductsAdvanced(params: HttpParams): Observable<ProductMetadataResponse[]> {
    return this.apiService
      .get<ProductMetadataResponse[]>(PRODUCT_ENDPOINTS.SEARCH_ADVANCED, { params })
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) =>
          this.logger.debug('Búsqueda avanzada de productos realizada', { count: response.length })
        ),
        catchError(this.handleError<ProductMetadataResponse[]>('searchProductsAdvanced'))
      );
  }

  /**
   * Realiza una búsqueda rápida de productos.
   * @param params Parámetros de búsqueda.
   * @returns Observable con un array de productos.
   */
  searchProductsQuick(params: HttpParams): Observable<ProductMetadataResponse[]> {
    return this.apiService
      .get<ProductMetadataResponse[]>(PRODUCT_ENDPOINTS.SEARCH_QUICK, { params })
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) =>
          this.logger.debug('Búsqueda rápida de productos realizada', { count: response.length })
        ),
        catchError(this.handleError<ProductMetadataResponse[]>('searchProductsQuick'))
      );
  }

  /**
   * Obtiene estadísticas de filtros para productos.
   * @returns Observable con las estadísticas de filtros.
   */
  getFilterStats(): Observable<any> {
    return this.apiService.get<any>(PRODUCT_ENDPOINTS.STATS_FILTERS).pipe(
      timeout(this.apiTimeout),
      retry({ count: this.retryAttempts, delay: this.retryDelay }),
      tap(() => this.logger.debug('Estadísticas de filtros obtenidas')),
      catchError(this.handleError<any>('getFilterStats'))
    );
  }

  /**
   * Obtiene la lista de ubicaciones.
   * @returns Observable con un array de ubicaciones.
   */
  listLocations(): Observable<any[]> {
    return this.apiService.get<any[]>(PRODUCT_ENDPOINTS.LIST_LOCATIONS).pipe(
      timeout(this.apiTimeout),
      retry({ count: this.retryAttempts, delay: this.retryDelay }),
      tap((response) => this.logger.debug('Ubicaciones listadas', { count: response.length })),
      catchError(this.handleError<any[]>('listLocations'))
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