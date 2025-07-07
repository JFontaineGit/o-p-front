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
  const injector = inject(Injector);
  const storageService = inject(StorageService);
  const logger = inject(LoggerService);
  const router = inject(Router);

  const isPublic = PUBLIC_ENDPOINTS.some(endpoint => req.url.includes(endpoint));

  const token = storageService.isRunningInBrowser() ? storageService.getToken() : null;

  logger.debug(`Interceptor ejecutado: URL=${req.url}, isPublic=${isPublic}, token=${token?.substring(0, 20)}...`);

  if (isPublic || !token) {
    logger.debug(`Pasando solicitud sin token: ${req.url}`);
    return next(req);
  }

  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': crypto.randomUUID()
    },
  });

  return next(clonedReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        logger.debug('Intento de refrescar token');

        const authService = injector.get(AuthService);

        return authService.refreshToken().pipe(
          switchMap((response: RefreshTokenResponse) => {
            logger.debug('Token refrescado:', response.data.access_token.substring(0, 20) + '...');
            storageService.setToken(response.data.access_token);
            if (response.data.refresh_token) {
              storageService.setRefreshToken(response.data.refresh_token);
            }

            const newClonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.data.access_token}`,
                'X-Retry-After-Refresh': 'true',
              },
            });

            return next(newClonedReq);
          }),
          catchError(refreshError => {
            logger.error('Error al refrescar el token', refreshError);
            authService.logout().subscribe({
              complete: () => {
                logger.debug('Sesión cerrada, redirigiendo a /login');
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
