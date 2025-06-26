import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Claves estándar para guardar cosas en el storage.
 * No inventen nombres raros por su cuenta, usen estos.
 */
export enum StorageKeys {
  Token = 'access_token',
  RememberEmail = 'rememberEmail',
  Carrito = 'carrito',
  ViajeArmado = 'viajePersonalizado',
}

/**
 * Servicio para gestionar operaciones de almacenamiento local (localStorage o en memoria).
 * Compatible con SSR usando un fallback en memoria cuando localStorage no está disponible.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private memoryStorage: Map<string, string> = new Map(); // Fallback en memoria
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Verifica si localStorage está disponible.
   * @returns True si localStorage está definido y accesible.
   */
  private isLocalStorageAvailable(): boolean {
    if (!this.isBrowser) return false;
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Guarda un string con cualquier clave.
   * Ej: this.setItem('miDato', 'valor')
   */
  setItem(key: string, value: string): void {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(key, value);
      } else {
        this.memoryStorage.set(key, value);
      }
    } catch (error: any) {
      console.error(`Error al guardar en almacenamiento: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Recupera un string por su clave.
   * Ej: this.getItem('miDato')
   */
  getItem(key: string): string | null {
    try {
      if (this.isLocalStorageAvailable()) {
        return localStorage.getItem(key);
      }
      return this.memoryStorage.get(key) || null;
    } catch (error: any) {
      console.error(`Error al obtener del almacenamiento: ${error.message || 'Error desconocido'}`);
      return null;
    }
  }

  /**
   * Borra cualquier ítem por su clave.
   */
  removeItem(key: string): void {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(key);
      } else {
        this.memoryStorage.delete(key);
      }
    } catch (error: any) {
      console.error(`Error al eliminar del almacenamiento: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Guarda un objeto (JSON) convertido a string.
   * Ej: this.setObject('carrito', arrayDeProductos)
   */
  setObject<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(key, serializedValue);
      } else {
        this.memoryStorage.set(key, serializedValue);
      }
    } catch (error: any) {
      console.error(`Error al guardar objeto en almacenamiento: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Recupera un objeto parseado desde JSON.
   * Ej: const carrito = this.getObject<Carrito[]>('carrito')
   */
  getObject<T>(key: string): T | null {
    try {
      let serializedValue: string | null = null;
      if (this.isLocalStorageAvailable()) {
        serializedValue = localStorage.getItem(key);
      } else {
        serializedValue = this.memoryStorage.get(key) || null;
      }
      return serializedValue ? JSON.parse(serializedValue) : null;
    } catch (error: any) {
      console.error(`Error al obtener objeto del almacenamiento: ${error.message || 'Error desconocido'}`);
      return null;
    }
  }

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
    this.removeItem(StorageKeys.RememberEmail);
    this.removeItem(StorageKeys.Carrito);
    this.removeItem(StorageKeys.ViajeArmado);
  }
}