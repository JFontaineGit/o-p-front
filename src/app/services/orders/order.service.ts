import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap, timeout } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { StorageService } from '../core/storage.service';
import { ORDER_ENDPOINTS } from './order-endpoints';
import { PayOrderResponse } from '../interfaces/order.interfaces';
import { environment } from '../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Servicio para gestionar operaciones relacionadas con órdenes.
 * Interactúa con la API a través de ApiService y maneja errores de forma centralizada.
 */
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiTimeout = environment.apiTimeout;
  private readonly retryAttempts = environment.retryAttempts;
  private readonly retryDelay = environment.retryDelay;

  constructor(
    private apiService: ApiService,
    private logger: LoggerService,
    private storageService: StorageService
  ) {}

  /**
   * Procesa el pago de una orden.
   * @param orderId ID de la orden a pagar.
   * @returns Observable con la respuesta del pago (sale_id y order_state).
   */
  payOrder(orderId: number): Observable<PayOrderResponse> {
    return this.apiService
      .patch<PayOrderResponse>(
        ORDER_ENDPOINTS.PAY_ORDER.replace('{order_id}', orderId.toString()),
        {}
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Orden pagada', { orderId, saleId: response.sale_id })),
        catchError(this.handleError<PayOrderResponse>('payOrder'))
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