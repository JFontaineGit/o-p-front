import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderPaymentService } from '../../services/orders/order.service';
import { LoggerService } from '../../services/core/logger.service';

@Component({
  selector: 'app-checkout-cancel',
  template: `
    <div class="checkout-cancel">
      <h2>Pago cancelado</h2>
      <p>El proceso de pago fue cancelado. Puedes intentarlo nuevamente.</p>
    </div>
  `,
  styles: [
    `
      .checkout-cancel {
        text-align: center;
        padding: 2rem;
      }
    `,
  ],
})
export class CheckoutCancel implements OnInit {
  #route = inject(ActivatedRoute);
  #orderPaymentService = inject(OrderPaymentService);
  #logger = inject(LoggerService);

  ngOnInit(): void {
    const query = this.#route.snapshot.queryParams;
    const sessionId = query['session_id'];
    const orderId = query['order_id']; // Mantener como string, sin conversión

    if (!sessionId || !orderId) {
      this.#logger.error('Faltan parámetros en checkout/cancel');
      return;
    }

    this.#orderPaymentService.payCancel(sessionId, orderId).subscribe({
      next: (res) => this.#logger.info('Pago cancelado', res),
      error: (err) => this.#logger.error('Error al cancelar pago', err),
    });
  }
}
