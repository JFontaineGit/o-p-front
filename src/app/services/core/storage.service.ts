import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoggerService } from './logger.service';

/**
 * Claves estándar para guardar cosas en el storage.
 * No inventen nombres raros por su cuenta, usen estos.
 */
export enum StorageKeys {
  Token = 'access_token',
  RefreshToken = 'refresh_token',
  RememberEmail = 'rememberEmail',
  Carrito = 'carrito',
  ViajeArmado = 'viajePersonalizado',
}

/**
 * Servicio para gestionar operaciones de almacenamiento local (localStorage o en memoria).
 * Compatible con SSR usando un fallback en memoria cuando localStorage no está disponible.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private memoryStorage: Map<string, string> = new Map(); // Fallback en memoria
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly logger: LoggerService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Verifica si localStorage está disponible.
   * @returns True si localStorage está definido y accesible.
   */
  private isLocalStorageAvailable(): boolean {
    if (!this.isBrowser) {
      this.logger.debug('localStorage no disponible: ejecutando en servidor');
      return false;
    }
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (error: unknown) {
      this.logger.error('localStorage no accesible', error);
      return false;
    }
  }

  /**
   * Guarda un string con cualquier clave.
   * Ej: this.setItem('miDato', 'valor')
   * @param key - La clave del elemento.
   * @param value - El valor a almacenar.
   */
  setItem(key: string, value: string): void {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(key, value);
      } else {
        this.memoryStorage.set(key, value);
      }
      this.logger.debug(`Item ${key} guardado correctamente`);
    } catch (error: unknown) {
      this.logger.error(`Error al guardar ${key} en almacenamiento`, error);
    }
  }

  /**
   * Recupera un string por su clave.
   * Ej: this.getItem('miDato')
   * @param key - La clave del elemento.
   * @returns El valor del elemento o null si no existe.
   */
  getItem(key: string): string | null {
    try {
      if (this.isLocalStorageAvailable()) {
        const value = localStorage.getItem(key);
        if (value) {
          this.logger.debug(`Item ${key} recuperado correctamente`);
        } else {
          this.logger.debug(`No se encontró item para la clave ${key}`);
        }
        return value;
      }
      const value = this.memoryStorage.get(key) || null;
      if (value) {
        this.logger.debug(`Item ${key} recuperado de memoria`);
      } else {
        this.logger.debug(`No se encontró item en memoria para la clave ${key}`);
      }
      return value;
    } catch (error: unknown) {
      this.logger.error(`Error al obtener ${key} del almacenamiento`, error);
      return null;
    }
  }

  /**
   * Borra cualquier ítem por su clave.
   * @param key - La clave del elemento a eliminar.
   */
  removeItem(key: string): void {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(key);
      } else {
        this.memoryStorage.delete(key);
      }
      this.logger.debug(`Item ${key} eliminado correctamente`);
    } catch (error: unknown) {
      this.logger.error(`Error al eliminar ${key} del almacenamiento`, error);
    }
  }

  /**
   * Guarda un objeto (JSON) convertido a string.
   * Ej: this.setObject('carrito', arrayDeProductos)
   * @param key - La clave del elemento.
   * @param value - El objeto a almacenar.
   */
  setObject<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(key, serializedValue);
      } else {
        this.memoryStorage.set(key, serializedValue);
      }
      this.logger.debug(`Objeto ${key} guardado correctamente`);
    } catch (error: unknown) {
      this.logger.error(`Error al guardar objeto ${key} en almacenamiento`, error);
    }
  }

  /**
   * Recupera un objeto parseado desde JSON.
   * Ej: const carrito = this.getObject<Carrito[]>('carrito')
   * @param key - La clave del elemento.
   * @returns El objeto parseado o null si no existe.
   */
  getObject<T>(key: string): T | null {
    try {
      let serializedValue: string | null = null;
      if (this.isLocalStorageAvailable()) {
        serializedValue = localStorage.getItem(key);
      } else {
        serializedValue = this.memoryStorage.get(key) || null;
      }
      if (serializedValue) {
        this.logger.debug(`Objeto ${key} recuperado correctamente`);
        return JSON.parse(serializedValue) as T;
      }
      this.logger.debug(`No se encontró objeto para la clave ${key}`);
      return null;
    } catch (error: unknown) {
      this.logger.error(`Error al obtener objeto ${key} del almacenamiento`, error);
      return null;
    }
  }

  /**
   * Guarda el token de acceso cuando el usuario hace login.
   * @param token - El token de acceso.
   */
  setToken(token: string): void {
    this.setItem(StorageKeys.Token, token);
  }

  /**
   * Recupera el token de acceso guardado (si hay sesión).
   * @returns El token de acceso o null si no existe.
   */
  getToken(): string | null {
    return this.getItem(StorageKeys.Token);
  }

  /**
   * Borra el token de acceso del almacenamiento.
   */
  removeToken(): void {
    this.removeItem(StorageKeys.Token);
  }

  /**
   * Guarda el token de refresco cuando el usuario hace login.
   * @param refreshToken - El token de refresco.
   */
  setRefreshToken(refreshToken: string): void {
    this.setItem(StorageKeys.RefreshToken, refreshToken);
  }

  /**
   * Recupera el token de refresco guardado.
   * @returns El token de refresco o null si no existe.
   */
  getRefreshToken(): string | null {
    return this.getItem(StorageKeys.RefreshToken);
  }

  /**
   * Borra el token de refresco del almacenamiento.
   */
  removeRefreshToken(): void {
    this.removeItem(StorageKeys.RefreshToken);
  }

  /**
   * Trae el email si el usuario marcó "recordarme".
   * @returns El email almacenado o null si no existe.
   */
  getRememberEmail(): string | null {
    return this.getItem(StorageKeys.RememberEmail);
  }

  /**
   * Borra todo lo importante. Para limpiar sesión rápido.
   */
  clearStorage(): void {
    try {
      this.removeToken();
      this.removeRefreshToken();
      this.removeItem(StorageKeys.RememberEmail);
      this.removeItem(StorageKeys.Carrito);
      this.removeItem(StorageKeys.ViajeArmado);
      this.logger.debug('Almacenamiento limpiado correctamente');
    } catch (error: unknown) {
      this.logger.error('Error al limpiar almacenamiento', error);
    }
  }
}