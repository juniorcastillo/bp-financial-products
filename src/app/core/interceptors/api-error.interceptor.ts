import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const notificationService = inject(NotificationService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        notificationService.error(
          'Ocurrió un error inesperado. Intenta nuevamente.',
        );

        return throwError(() => error);
      }

      const message = getSafeErrorMessage(error);

      if (message) {
        notificationService.error(message);
      }

      return throwError(() => error);
    }),
  );
};

function getSafeErrorMessage(error: HttpErrorResponse): string | null {
  if (error.status === 0) {
    return 'No fue posible conectar con el servidor. Verifica tu conexión e intenta nuevamente.';
  }

  if (error.status === 401) {
    return 'Tu sesión no es válida o ha expirado.';
  }

  if (error.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (error.status >= 500) {
    return 'El servidor presentó un inconveniente. Intenta nuevamente más tarde.';
  }

  /*
   * Los errores 400 y 404 no se muestran globalmente porque pueden ser
   * errores esperados de validación, edición o eliminación y cada pantalla
   * ya los presenta de manera contextual.
   */
  return null;
}