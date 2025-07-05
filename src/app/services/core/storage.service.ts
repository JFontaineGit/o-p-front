import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CustomCookieService } from './custom-cookie.service';
import { LoggerService } from './logger.service';
import { environment } from '../../environments/environment';

export enum StorageKeys {
  Token = 'access_token',
  RefreshToken = 'refresh_token',
  RememberEmail = 'rememberEmail',
  Carrito = 'carrito',
  ViajeArmado = 'viajePersonalizado',
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly logger: LoggerService,
    private readonly cookieService: CustomCookieService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.logger.debug(
      `StorageService inicializado, isBrowser=${this.isBrowser}`
    );
  }

  public isRunningInBrowser(): boolean {
    return this.isBrowser;
  }

  setItem(key: string, value: string): void {
    if (!this.isBrowser) {
      this.logger.debug(`No se puede establecer ${key} en el servidor`);
      return; // No intenta establecer cookies en el servidor
    }
    try {
      const trimmedValue = value.trim();
      const options = {
        path: '/',
        sameSite: 'Lax',
        secure: environment.production,
      };
      this.cookieService.set(key, trimmedValue, options);
      this.logger.debug(
        `Item ${key} guardado en cookie: ${trimmedValue.substring(0, 20)}...`
      );
    } catch (error: unknown) {
      this.logger.error(`Error al guardar ${key} en cookie`, error);
    }
  }

  getItem(key: string): string | null {
    if (!this.isBrowser) {
      this.logger.debug(
        `No se puede obtener ${key} en el servidor, devolviendo null`
      );
      return null; // Evita intentar acceder a cookies en el servidor
    }
    try {
      const value = this.cookieService.get(key);
      if (value) {
        this.logger.debug(
          `Item ${key} recuperado de cookie: ${value.substring(0, 20)}...`
        );
        return value;
      }
      this.logger.debug(`No se encontró item en cookie para la clave ${key}`);
      return null;
    } catch (error: unknown) {
      this.logger.error(`Error al obtener ${key} de cookie`, error);
      return null;
    }
  }

  removeItem(key: string): void {
    if (!this.isBrowser) {
      this.logger.debug(`No se puede eliminar ${key} en el servidor`);
      return; // No intenta eliminar cookies en el servidor
    }
    try {
      this.cookieService.delete(key, '/');
      this.logger.debug(`Item ${key} eliminado de cookie`);
    } catch (error: unknown) {
      this.logger.error(`Error al eliminar ${key} de cookie`, error);
    }
  }

  setObject<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      this.setItem(key, serializedValue);
    } catch (error: unknown) {
      this.logger.error(`Error al guardar objeto ${key} en cookie`, error);
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
      this.logger.error(`Error al obtener objeto ${key} de cookie`, error);
      return null;
    }
  }

  setToken(token: string): void {
    try {
      const trimmed = token.trim();
      const options = {
        path: '/',
        sameSite: 'Lax',
        secure: environment.production,
      };
      this.cookieService.set(StorageKeys.Token, trimmed, options);
      this.logger.debug(
        `Token guardado en cookie: ${trimmed.substring(0, 20)}...`
      );
    } catch (error: unknown) {
      this.logger.error('Error al guardar token en cookie', error);
    }
  }

  getToken(): string | null {
    return this.getItem(StorageKeys.Token);
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
      this.logger.debug('Cookies limpiadas correctamente');
    } catch (error: unknown) {
      this.logger.error('Error al limpiar cookies', error);
    }
  }
}
