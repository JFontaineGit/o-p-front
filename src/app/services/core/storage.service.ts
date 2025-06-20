import { Injectable } from '@angular/core';

/**
 * Claves estándar para guardar cosas en el storage.
 * No inventen nombres raros por su cuenta, usen estos.
 */
export enum StorageKeys {
  Token = 'refresh_token',
  RememberEmail = 'rememberEmail',
  Carrito = 'carrito',
  ViajeArmado = 'viajePersonalizado'
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Devuelve el token guardado (si es que hay sesión).
   */
  getToken(): string | null {
    return this.getItem(StorageKeys.Token);
  }

  /**
   * Guarda el token cuando el user hace login.
   */
  setToken(token: string): void {
    this.setItem(StorageKeys.Token, token);
  }

  /**
   * Borra el token del storage. Se usa al cerrar sesión.
   */
  removeToken(): void {
    this.removeItem(StorageKeys.Token);
  }

  /**
   * Trae el email si el user marcó "recordarme".
   */
  getRememberEmail(): string | null {
    return this.getItem(StorageKeys.RememberEmail);
  }

  /**
   * Borra todo lo importante. Para limpiar sesión rápido.
   */
  clearStorage(): void {
    this.removeToken();
  }

  /**
   * Guarda un string con cualquier clave.
   * Ej: this.setItem('miDato', 'valor')
   */
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  /**
   * Recupera un string por su clave.
   * Ej: this.getItem('miDato')
   */
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  /**
   * Borra cualquier ítem por su clave.
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Guarda un objeto (JSON) convertido a string.
   * Ej: this.setObject('carrito', arrayDeProductos)
   */
  setObject<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Recupera un objeto parseado desde JSON.
   * Ej: const carrito = this.getObject<Carrito[]>('carrito')
   */
  getObject<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}
