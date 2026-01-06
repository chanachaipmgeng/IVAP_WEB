import { HttpInterceptorFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, tap, filter } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Get token from localStorage
  const token = localStorage.getItem('access_token');
  let sessionId = localStorage.getItem('session_id');
  
  // Create session_id if not exists
  if (!sessionId) {
    sessionId = `session_${Date.now()}`;
    localStorage.setItem('session_id', sessionId);
  }
  
  const csrfToken = localStorage.getItem('csrf_token');

  // Clone the request and add headers
  let authReq = req;
  const headers: { [key: string]: string } = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Always send X-Session-ID for GET requests (to receive CSRF token)
  // and for state-changing methods (to validate CSRF token)
  if (req.method === 'GET' || ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    headers['X-Session-ID'] = sessionId;
    
    // Add CSRF token for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
        // CSRF token sent with request
      } else {
        // Log warning if CSRF token is missing for state-changing methods
        console.warn('CSRF token missing for', req.method, req.url, '- Current localStorage:', {
          session_id: sessionId,
          csrf_token: csrfToken
        });
      }
    }
  }

  if (Object.keys(headers).length > 0) {
    authReq = req.clone({
      setHeaders: headers
    });
  }

  return next(authReq).pipe(
    tap((event: HttpEvent<any>) => {
      // Extract CSRF token from response headers if present
      if (event instanceof HttpResponse) {
        const csrfTokenFromResponse = event.headers.get('X-CSRF-Token');
        if (csrfTokenFromResponse) {
          // CSRF token received from server
          localStorage.setItem('csrf_token', csrfTokenFromResponse);
        }
      }
    }),
    catchError((error) => {
      if (error.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        localStorage.removeItem('csrf_token');
        localStorage.removeItem('session_id');
        router.navigate(['/portal/login']);
      }

      return throwError(() => error);
    })
  );
};

