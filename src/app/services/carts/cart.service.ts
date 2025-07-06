import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap, timeout } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { StorageService } from '../core/storage.service';
import { CART_ENDPOINTS } from './cart-endpoints';
import { CartResponse, CartItemAdd, CartItemQtyPatch } from '../interfaces/cart.interfaces';
import { environment } from '../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

import { HttpHeaders } from '@angular/common/http';

// TODO: luego hacer refactor
//  esta echo para solucionar el problema por el momento pero no tiene ninguna practica

/**
 * Servicio para gestionar operaciones del carrito de compras.
 * Interactúa con la API a través de ApiService y maneja errores de forma centralizada.
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiTimeout = environment.apiTimeout;
  private readonly retryAttempts = environment.retryAttempts;
  private readonly retryDelay = environment.retryDelay;

  constructor(
    private apiService: ApiService,
    private logger: LoggerService,
    private storageService: StorageService
  ) {}

  /**
   * Obtiene el carrito actual.
   * @returns Observable con los datos del carrito.
   */
  getCart(): Observable<CartResponse> {
    return this.apiService.get<CartResponse>(CART_ENDPOINTS.GET).pipe(
      timeout(this.apiTimeout),
      retry({ count: this.retryAttempts, delay: this.retryDelay }),
      tap((response) => this.logger.debug('Carrito obtenido', { id: response.id, items_cnt: response.items_cnt })),
      catchError(this.handleError<CartResponse>('getCart'))
    );
  }

  /**
   * Agrega un ítem al carrito.
   * @param item Datos del ítem a agregar.
   * @returns Observable con la respuesta del carrito actualizado.
   */
  addCartItem(item: CartItemAdd): Observable<CartResponse> {
    const headers = new HttpHeaders({
      'Idempotency-Key': this.apiService.generateUUIDv4()
    })
    return this.apiService
      .post<CartResponse, CartItemAdd>(CART_ENDPOINTS.ADD_ITEM, item, { headers: headers })
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Ítem agregado al carrito', { cartId: response.id })),
        catchError(this.handleError<CartResponse>('addCartItem'))
      );
  }

  /**
   * Actualiza la cantidad de un ítem en el carrito.
   * @param itemId ID del ítem a actualizar.
   * @param patch Datos de la actualización (cantidad).
   * @returns Observable con la respuesta del carrito actualizado.
   */
  updateCartItemQty(itemId: number, patch: CartItemQtyPatch): Observable<CartResponse> {
    return this.apiService
      .patch<CartResponse, CartItemQtyPatch>(
        CART_ENDPOINTS.UPDATE_ITEM.replace('{item_id}', itemId.toString()),
        patch
      )
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Cantidad de ítem actualizada', { itemId, cartId: response.id })),
        catchError(this.handleError<CartResponse>('updateCartItemQty'))
      );
  }

  /**
   * Elimina un ítem del carrito.
   * @param itemId ID del ítem a eliminar.
   * @returns Observable con la respuesta del carrito actualizado.
   */
  deleteCartItem(itemId: number): Observable<CartResponse> {
    return this.apiService
      .delete<CartResponse>(CART_ENDPOINTS.DELETE_ITEM.replace('{item_id}', itemId.toString()))
      .pipe(
        timeout(this.apiTimeout),
        retry({ count: this.retryAttempts, delay: this.retryDelay }),
        tap((response) => this.logger.debug('Ítem eliminado del carrito', { itemId, cartId: response.id })),
        catchError(this.handleError<CartResponse>('deleteCartItem'))
      );
  }

  /**
   * Realiza el checkout del carrito.
   * @returns Observable con la respuesta del carrito procesado.
   */
  checkoutCart(): Observable<CartResponse> {
    return this.apiService.post<CartResponse>(CART_ENDPOINTS.CHECKOUT, {}).pipe(
      timeout(this.apiTimeout),
      retry({ count: this.retryAttempts, delay: this.retryDelay }),
      tap((response) => this.logger.debug('Checkout de carrito realizado', { cartId: response.id })),
      catchError(this.handleError<CartResponse>('checkoutCart'))
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