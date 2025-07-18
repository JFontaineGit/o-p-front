/**
 * Endpoints para las operaciones del carrito en la API.
 */
export const CART_ENDPOINTS = {
  GET: 'store/cart/',
  ADD_ITEM: 'store/cart/items/',
  ADD_PACKAGE: '/store/cart/packages/',
  UPDATE_ITEM: 'store/cart/items/{item_id}/',
  DELETE_ITEM: 'store/cart/items/{item_id}/',
  CHECKOUT: 'store/cart/checkout/',
} as const;