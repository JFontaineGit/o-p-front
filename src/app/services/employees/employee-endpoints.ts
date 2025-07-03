/**
 * Constantes centralizadas para los endpoints de la API relacionados con empleados.
 */
export const EMPLOYEE_ENDPOINTS = {
  BASE: '/employees',
  GET_ALL: '/',
  GET_ONE: (id: number) => `/${id}/see`,
  GET_AUDITS: (id: number, limit?: number) => `/${id}/audits${limit ? `?limit=${limit}` : ''}`,
  CREATE: '/create',
  UPDATE: (id: number) => `/update/${id}`,
  DELETE: (id: number) => `/delete/${id}`,
} as const;