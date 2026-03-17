
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Global Authentication Interceptor.
 * Automatically attaches the JWT Bearer token to outgoing HTTP requests 
 * if the user is authenticated and running in a browser environment.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Check if the code is executing in the browser to access localStorage
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('auth_token');

    if (token) {
      // Clone the request and inject the Authorization header with the Bearer token
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next(authReq);
    }
  }
  // If no token exists or not in a browser, proceed with the original request
  return next(req);
};