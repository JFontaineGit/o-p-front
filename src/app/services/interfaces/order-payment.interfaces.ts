export interface OrderItemOut {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface OrderOut {
  id: number;
  total: number;
  state: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  items_count: number;
  items?: OrderItemOut[];
}

export interface OrderListOut {
  id: number;
  total: number;
  state: string;
  created_at: string;
  user_id: number;
}

export interface OrderCreateIn {
  cart_id: number;
}

export interface OrderCancelIn {
  reason?: string;
}

export interface PaymentMethodIn {
  payment_method: string;
}

export interface PaymentOut {
  sale_id: number;
  transaction_id: string;
  amount: number;
  payment_status: string;
  order_id: number;
  payment_method: string;
  created_at: string;
}

export interface PaymentStatusOut {
  order_id: number;
  payment_status: string;
  transaction_id?: string;
  amount?: number;
  payment_method?: string;
  message?: string;
}

export interface SaleOut {
  id: number;
  order_id: number;
  amount?: number;
  total: number;
  payment_status: string;
  sale_type: string;
  payment_type: string;
  transaction_number?: number;
  sale_date: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleSummaryOut {
  total_sales: number;
  total_amount: number;
  recent_sales_count: number;
  recent_sales_amount: number;
  average_amount: number;
}

export interface RefundIn {
  amount?: number;
}

export interface RefundOut {
  message: string;
  sale_id: number;
  refunded_amount: number;
  refund_id?: string;
}

export interface ErrorResponse {
  message: string;
  error_code?: string;
  details?: { [key: string]: any };
}

export interface StripeResponse {
  session_url: string;
}

export interface SuccessResponse {
  message: string;
  data?: { [key: string]: any };
}