export const ORDER_PAYMENT_ENDPOINTS = {
  PAY_SUCCESS: '/pay/success',
  PAY_CANCEL: '/pay/cancel',
  PAY_ORDER: (orderId: number) => `/orders/${orderId}/pay`,
  CANCEL_ORDER: (orderId: number) => `/orders/${orderId}/cancel`,
  LIST_ORDERS: '/orders/',
  GET_PAYMENT_STATUS: (orderId: number) => `/orders/${orderId}/payment-status`,
  REFUND_ORDER: (orderId: number) => `/orders/${orderId}/refund`,
  GET_ORDER_SALE: (orderId: number) => `/orders/${orderId}/sales`,
  GET_SALES_SUMMARY: '/sales/summary',
};