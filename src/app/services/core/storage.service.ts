import { Injectable, Inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoggerService } from './logger.service';

export enum StorageKeys {
  Token = 'access_token',
  RefreshToken = 'refresh_token',
  RememberEmail = 'rememberEmail',
  Carrito = 'carrito',
  ViajeArmado = 'viajePersonalizado',
}

const TOKEN_STATE_KEY = makeStateKey<string>('access_token');

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private memoryStorage: Map<string, string> = new Map();
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly logger: LoggerService,
    private readonly transferState: TransferState
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.logger.debug(`StorageService inicializado, isBrowser=${this.isBrowser}`);
  }

  public isRunningInBrowser(): boolean {
    return this.isBrowser;
  }

  private isLocalStorageAvailable(): boolean {
    if (!this.isBrowser) {
      this.logger.debug('localStorage no disponible: ejecutando en servidor');
      return false;
    }
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const testKey = '__test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        this.logger.debug('localStorage disponible en el navegador');
        return true;
      }
      this.logger.debug('localStorage no definido en el navegador');
      return false;
    } catch (error: unknown) {
      this.logger.error('localStorage no accesible', error);
      return false;
    }
  }

  setItem(key: string, value: string): void {
    try {
      const trimmedValue = value.trim();
      if (this.isLocalStorageAvailable()) {
        window.localStorage.setItem(key, trimmedValue);
        this.logger.debug(`Item ${key} guardado en localStorage: ${trimmedValue.substring(0, 20)}...`);
      } else {
        this.memoryStorage.set(key, trimmedValue);
        this.logger.debug(`Item ${key} guardado en memoria: ${trimmedValue.substring(0, 20)}...`);
      }
    } catch (error: unknown) {
      this.logger.error(`Error al guardar ${key} en almacenamiento`, error);
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.isLocalStorageAvailable()) {
        const value = window.localStorage.getItem(key);
        if (value) {
          this.logger.debug(`Item ${key} recuperado de localStorage: ${value.substring(0, 20)}...`);
          return value;
        }
        this.logger.debug(`No se encontró item en localStorage para la clave ${key}`);
        return null;
      }
      const value = this.memoryStorage.get(key) || null;
      if (value) {
        this.logger.debug(`Item ${key} recuperado de memoria: ${value.substring(0, 20)}...`);
      } else {
        this.logger.debug(`No se encontró item en memoria para la clave ${key}`);
      }
      return value;
    } catch (error: unknown) {
      this.logger.error(`Error al obtener ${key} del almacenamiento`, error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      if (this.isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
        this.logger.debug(`Item ${key} eliminado de localStorage`);
      } else {
        this.memoryStorage.delete(key);
        this.logger.debug(`Item ${key} eliminado de memoria`);
      }
    } catch (error: unknown) {
      this.logger.error(`Error al eliminar ${key} del almacenamiento`, error);
    }
  }

  setObject<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      this.setItem(key, serializedValue);
    } catch (error: unknown) {
      this.logger.error(`Error al guardar objeto ${key} en almacenamiento`, error);
    }
  }

  getObject<T>(key: string): T | null {
    try {
      const serializedValue = this.getItem(key);
      if (serializedValue) {
        return JSON.parse(serializedValue) as T;
      }
      return null;
    } catch (error: unknown) {
      this.logger.error(`Error al obtener objeto ${key} del almacenamiento`, error);
      return null;
    }
  }

  setToken(token: string): void {
    const trimmed = token.trim();
    this.memoryStorage.set(StorageKeys.Token, trimmed);

    if (this.isLocalStorageAvailable()) {
      window.localStorage.setItem(StorageKeys.Token, trimmed);
      this.logger.debug(`Token guardado en localStorage y memoria: ${trimmed.substring(0, 20)}...`);
    } else {
      this.logger.debug(`Token guardado en memoria: ${trimmed.substring(0, 20)}...`);
    }

    if (!this.isBrowser) {
      this.transferState.set(TOKEN_STATE_KEY, trimmed);
      this.logger.debug('Token guardado en TransferState para hidratar en navegador');
    }
  }

  getToken(): string | null {
    const cached = this.memoryStorage.get(StorageKeys.Token);
    if (cached) {
      this.logger.debug(`Token recuperado de memoria: ${cached.substring(0, 20)}...`);
      return cached;
    }

    if (this.isBrowser && this.transferState.hasKey(TOKEN_STATE_KEY)) {
      const transferred = this.transferState.get(TOKEN_STATE_KEY, null);
      if (transferred) {
        this.logger.debug(`Token recuperado de TransferState: ${transferred.substring(0, 20)}...`);
        this.memoryStorage.set(StorageKeys.Token, transferred);
        this.transferState.remove(TOKEN_STATE_KEY);
        return transferred;
      }
    }

    if (this.isLocalStorageAvailable()) {
      const token = window.localStorage.getItem(StorageKeys.Token);
      if (token) {
        this.logger.debug(`Token recuperado de localStorage: ${token.substring(0, 20)}...`);
        this.memoryStorage.set(StorageKeys.Token, token);
        return token;
      }
    }

    this.logger.debug(`No se encontró token en ningún medio`);
    return null;
  }

  removeToken(): void {
    this.removeItem(StorageKeys.Token);
  }

  setRefreshToken(refreshToken: string): void {
    this.setItem(StorageKeys.RefreshToken, refreshToken);
  }

  getRefreshToken(): string | null {
    return this.getItem(StorageKeys.RefreshToken);
  }

  removeRefreshToken(): void {
    this.removeItem(StorageKeys.RefreshToken);
  }

  getRememberEmail(): string | null {
    return this.getItem(StorageKeys.RememberEmail);
  }

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
