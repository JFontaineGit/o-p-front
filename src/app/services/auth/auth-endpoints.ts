export const AUTH_ENDPOINTS = {
  REGISTER: '/users/register',
  LOGIN: '/users/login',
  REFRESH: '/users/refresh',
  LIST_USERS: '/users/',
  GET_USER: (id: number) => `/users/${id}`,
  UPDATE_USER: (id: number) => `/users/${id}`,
  DELETE_USER: (id: number) => `/users/${id}`,
};