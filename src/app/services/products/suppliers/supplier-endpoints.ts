/**
 * Endpoints para las operaciones de proveedores en la API.
 */
export const SUPPLIER_ENDPOINTS = {
  CREATE: 'suppliers/',
  LIST: 'suppliers/',
  GET: 'suppliers/{id}/',
  UPDATE: 'suppliers/{id}/',
  DELETE: 'suppliers/{id}/',
  LIST_DELETED: 'suppliers/deleted/',
  RESTORE: 'suppliers/{id}/restore/',
} as const;