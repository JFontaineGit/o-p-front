import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { REQUEST } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomCookieService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(REQUEST) private request?: any
  ) {}

  get(key: string): string | null {
    if (isPlatformServer(this.platformId) && this.request) {
      const cookies = this.request.headers.get('cookie');
      if (cookies) {
        const cookieArray = cookies.split(';');
        for (let cookie of cookieArray) {
          const [name, value] = cookie.trim().split('=');
          if (name === key) {
            return value;
          }
        }
      }
      return null;
    } else {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === key) {
          return value;
        }
      }
      return null;
    }
  }

  set(key: string, value: string, options?: any): void {
    if (isPlatformServer(this.platformId)) {
      console.warn('No se pueden establecer cookies directamente en el servidor.');
    } else {
      let cookieString = `${key}=${value}`;
      if (options) {
        if (options.expires) {
          const date = new Date(options.expires);
          cookieString += `; expires=${date.toUTCString()}`;
        }
        if (options.path) {
          cookieString += `; path=${options.path}`;
        }
      }
      document.cookie = cookieString;
    }
  }

  delete(key: string, path?: string): void {
    if (isPlatformServer(this.platformId)) {
      console.warn('No se pueden eliminar cookies directamente en el servidor.');
    } else {
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path || '/'}`;
    }
  }
}