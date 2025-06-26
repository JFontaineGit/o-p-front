import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { LoggerService } from '../services/core/logger.service';
import { isDevMode } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';


export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  const checkAuth = (): Observable<boolean> => {
    return of(authService.isLoggedIn());
  };

  return checkAuth().pipe(
    map(isLoggedIn => {
      if (isLoggedIn) {
        if (isDevMode()) {
          logger.debug('authGuard: Usuario autenticado, acceso permitido');
        }
        return true;
      }

      if (isDevMode()) {
        logger.debug('authGuard: No autenticado, redirigiendo a /login');
      }
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    })
  );
};