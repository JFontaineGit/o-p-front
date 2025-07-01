export const USER_ENDPOINTS = {
  LIST_USERS: '/users/',
  GET_USER: (id: number) => `/users/${id}`,
  UPDATE_USER: (id: number) => `/users/${id}`,
  DELETE_USER: (id: number) => `/users/${id}`,
  GET_ME: '/users/me'
}