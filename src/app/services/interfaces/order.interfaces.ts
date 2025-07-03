/**
 * Interfaz para la respuesta del pago de una orden.
 */
export interface PayOrderResponse {
  sale_id: number;
  order_state: string;
}