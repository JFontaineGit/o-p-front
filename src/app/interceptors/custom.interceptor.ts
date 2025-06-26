import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { LoggerService } from '../services/core/logger.service';
import { StorageService } from '../services/core/storage.service';
import { RefreshTokenResponse } from '../services/interfaces/auth.interfaces';
import { AUTH_ENDPOINTS } from '../services/auth/auth-endpoints';

const PUBLIC_ENDPOINTS = [
  AUTH_ENDPOINTS.REGISTER, 
  AUTH_ENDPOINTS.LOGIN,   
  AUTH_ENDPOINTS.REFRESH, 
];

export const customInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const storageService = inject(StorageService);
  const logger = inject(LoggerService);
  const router = inject(Router);
  const injector = inject(Injector);
  const isPublic = PUBLIC_ENDPOINTS.some(endpoint => req.url.includes(endpoint));
  const token = storageService.getToken();

  if (isPublic || !token) {
    return next(req);
  }

  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(clonedReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((response: RefreshTokenResponse) => {
            storageService.setToken(response.access_token);
            const newClonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.access_token}`,
              },
            });
            return next(newClonedReq);
          }),
          catchError(refreshError => {
            logger.error('Error al refrescar el token', refreshError);
            authService.logout().subscribe({
              complete: () => {
                router.navigate(['/login'], { queryParams: { returnUrl: req.url } });
              },
            });
            return throwError(() => new Error('Sesión expirada, por favor iniciá sesión nuevamente.'));
          })
        );
      }
      logger.error(`Error en la petición ${req.url}`, error);
      return throwError(() => error);
    })
  );
};