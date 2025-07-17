import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
//import { OrderPaymentService } from '../../services/orders/order.service';
import { LoggerService } from '../../services/core/logger.service';

@Component({
  selector: 'app-checkout-success',
  template: `
    <div class="checkout-success">
      <h2>¡Pago exitoso!</h2>
      <p>Tu pago ha sido procesado correctamente. Gracias por tu compra.</p>
    </div>
  `,
  styles: [
    `
      .checkout-success {
        text-align: center;
        padding: 2rem;
      }
    `,
  ],
})
export class CheckoutSuccess implements OnInit {
  #route = inject(ActivatedRoute);
  //#orderPaymentService = inject(OrderPaymentService);
  #logger = inject(LoggerService);

  ngOnInit(): void {
    const query = this.#route.snapshot.queryParams;
    const sessionId = query['session_id'];
    const orderId = query['order_id']; // Mantener como string, sin conversión
    const paymentMethod = query['payment_method'];

    if (!sessionId || !orderId || !paymentMethod) {
      this.#logger.error('Faltan parámetros en checkout/success');
      return;
    }

    /*this.#orderPaymentService
      *.paySuccess(sessionId, orderId, paymentMethod)
      *.subscribe({
       * next: (res) => this.#logger.info('Pago confirmado', res),
        *error: (err) => this.#logger.error('Error al confirmar pago', err),
      *});
    */
  }
}
