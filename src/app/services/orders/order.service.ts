import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../core/api.service';
import { LoggerService } from '../core/logger.service';
import { ORDER_PAYMENT_ENDPOINTS } from './order-payment-endpoints';
import {
  OrderListOut,
  OrderCancelIn,
  PaymentMethodIn,
  PaymentOut,
  PaymentStatusOut,
  SaleOut,
  SaleSummaryOut,
  RefundIn,
  RefundOut,
  ErrorResponse,
  StripeResponse,
  SuccessResponse,
} from '../interfaces/order-payment.interfaces';
import { HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrderPaymentService {
  constructor(
    private apiService: ApiService,
    private logger: LoggerService
  ) {}

  paySuccess(sessionId: string, orderId: number, paymentMethod: string): Observable<PaymentOut> {
    const params = new HttpParams()
      .set('session_id', sessionId)
      .set('order_id', orderId.toString())
      .set('payment_method', paymentMethod);
    return this.apiService.get<PaymentOut>(ORDER_PAYMENT_ENDPOINTS.PAY_SUCCESS, { params }).pipe(
      catchError(this.handleError<PaymentOut>('paySuccess'))
    );
  }

  payCancel(sessionId: string, orderId: number): Observable<SuccessResponse> {
    const params = new HttpParams()
      .set('session_id', sessionId)
      .set('order_id', orderId.toString());
    return this.apiService.get<SuccessResponse>(ORDER_PAYMENT_ENDPOINTS.PAY_CANCEL, { params }).pipe(
      catchError(this.handleError<SuccessResponse>('payCancel'))
    );
  }

  payOrder(orderId: number, paymentMethod: PaymentMethodIn, idempotencyKey: string): Observable<StripeResponse> {
    const headers = new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
    return this.apiService.post<StripeResponse, PaymentMethodIn>(
      ORDER_PAYMENT_ENDPOINTS.PAY_ORDER(orderId),
      paymentMethod,
      { headers }
    ).pipe(
      catchError(this.handleError<StripeResponse>('payOrder'))
    );
  }

  cancelOrder(orderId: number, cancelData?: OrderCancelIn): Observable<SuccessResponse> {
    return this.apiService.post<SuccessResponse, OrderCancelIn>(
      ORDER_PAYMENT_ENDPOINTS.CANCEL_ORDER(orderId),
      cancelData || {}
    ).pipe(
      catchError(this.handleError<SuccessResponse>('cancelOrder'))
    );
  }

  listOrders(filters?: { state?: string; start_date?: string; end_date?: string; limit?: number }): Observable<OrderListOut[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.state) params = params.set('state', filters.state);
      if (filters.start_date) params = params.set('start_date', filters.start_date);
      if (filters.end_date) params = params.set('end_date', filters.end_date);
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }
    return this.apiService.get<OrderListOut[]>(ORDER_PAYMENT_ENDPOINTS.LIST_ORDERS, { params }).pipe(
      catchError(this.handleError<OrderListOut[]>('listOrders'))
    );
  }

  getPaymentStatus(orderId: number): Observable<PaymentStatusOut> {
    return this.apiService.get<PaymentStatusOut>(ORDER_PAYMENT_ENDPOINTS.GET_PAYMENT_STATUS(orderId)).pipe(
      catchError(this.handleError<PaymentStatusOut>('getPaymentStatus'))
    );
  }

  refundOrder(orderId: number, refundData: RefundIn): Observable<RefundOut> {
    return this.apiService.post<RefundOut, RefundIn>(
      ORDER_PAYMENT_ENDPOINTS.REFUND_ORDER(orderId),
      refundData
    ).pipe(
      catchError(this.handleError<RefundOut>('refundOrder'))
    );
  }

  getOrderSale(orderId: number): Observable<SaleOut> {
    return this.apiService.get<SaleOut>(ORDER_PAYMENT_ENDPOINTS.GET_ORDER_SALE(orderId)).pipe(
      catchError(this.handleError<SaleOut>('getOrderSale'))
    );
  }

  getSalesSummary(): Observable<SaleSummaryOut> {
    return this.apiService.get<SaleSummaryOut>(ORDER_PAYMENT_ENDPOINTS.GET_SALES_SUMMARY).pipe(
      catchError(this.handleError<SaleSummaryOut>('getSalesSummary'))
    );
  }

  private handleError<T>(operation: string): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {
      this.logger.error(`${operation} falló`, error);
      return throwError(() => new Error(`Error en ${operation}: ${error.message || 'Error desconocido'}`));
    };
  }
}