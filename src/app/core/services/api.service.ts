import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { toSnakeCase } from '../utils/field-transformer';
import { extractErrorMessage } from '../utils/response-handler';

/**
 * API Response interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * HTTP request parameters type
 * Accepts any object that can be converted to query parameters
 * Using a flexible type to accommodate various parameter types
 */
export type HttpRequestParams = unknown;

/**
 * HTTP request body type
 * Accepts any serializable data structure
 * Using a flexible type to accommodate various form types without requiring index signatures
 * This type is intentionally broad to accept any object structure
 */
export type HttpRequestBody = unknown;

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
  skipTransform?: boolean; // Skip field name transformation (use snake_case directly)
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const token = localStorage.getItem('access_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  public get<T = unknown>(
    endpoint: string,
    params?: HttpRequestParams,
    options?: HttpRequestOptions
  ): Observable<T> {
    let httpParams = new HttpParams();

    // Transform params to snake_case before sending (unless skipTransform is true)
    const shouldTransform = !options?.skipTransform && options?.responseType !== 'blob' && options?.responseType !== 'text';
    const transformedParams = params && shouldTransform
      ? toSnakeCase(params as Record<string, unknown>)
      : params;

    if (transformedParams && typeof transformedParams === 'object' && !Array.isArray(transformedParams)) {
      Object.keys(transformedParams).forEach(key => {
        const value = (transformedParams as { [key: string]: unknown })[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    const httpOptions: any = {
      headers: this.getHeaders(),
      params: httpParams,
      observe: 'body' as const
    };

    if (options?.responseType) {
      httpOptions.responseType = options.responseType;
    }

    // Return response as-is (no camelCase conversion)
    return this.http.get<unknown>(`${this.baseUrl}${endpoint}`, httpOptions).pipe(
      map(response => response as T),
      catchError(this.handleError)
    );
  }

  public post<T = unknown>(
    endpoint: string,
    data: HttpRequestBody,
    params?: HttpRequestParams,
    options?: HttpRequestOptions
  ): Observable<T> {
    const shouldTransform = !options?.skipTransform && options?.responseType !== 'blob' && options?.responseType !== 'text';

    // Transform data to snake_case before sending unless explicitly skipped
    const transformedData = data && shouldTransform && !(data instanceof FormData)
      ? toSnakeCase(data as Record<string, unknown>)
      : data;

    let httpParams = new HttpParams();
    const transformedParams = params && shouldTransform ? toSnakeCase(params as Record<string, unknown>) : params;

    if (transformedParams && typeof transformedParams === 'object' && !Array.isArray(transformedParams)) {
      Object.keys(transformedParams).forEach(key => {
        const value = (transformedParams as { [key: string]: unknown })[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    const httpOptions: any = {
      headers: this.getHeaders(),
      observe: 'body' as const
    };
    if (httpParams.keys().length > 0) {
      httpOptions.params = httpParams;
    }
    if (options?.responseType) {
      httpOptions.responseType = options.responseType;
    }

    return this.http.post<unknown>(`${this.baseUrl}${endpoint}`, transformedData, httpOptions).pipe(
      map(response => response as T),
      catchError(this.handleError)
    );
  }

  public put<T = unknown>(
    endpoint: string,
    data: HttpRequestBody,
    params?: HttpRequestParams,
    options?: HttpRequestOptions
  ): Observable<T> {
    const shouldTransform = !options?.skipTransform;

    // Transform data to snake_case before sending
    const transformedData = data instanceof FormData
      ? data
      : (data && typeof data === 'object' && !Array.isArray(data) && shouldTransform)
        ? toSnakeCase(data as Record<string, unknown>)
        : data;

    let httpParams = new HttpParams();
    const transformedParams = params && shouldTransform ? toSnakeCase(params as Record<string, unknown>) : params;

    if (transformedParams && typeof transformedParams === 'object' && !Array.isArray(transformedParams)) {
      Object.keys(transformedParams).forEach(key => {
        const value = (transformedParams as { [key: string]: unknown })[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    const httpOptions: {
      headers: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
    } = {
      headers: this.getHeaders()
    };
    if (httpParams.keys().length > 0) {
      httpOptions.params = httpParams;
    }

    return this.http.put<unknown>(`${this.baseUrl}${endpoint}`, transformedData, httpOptions).pipe(
      map(response => response as T),
      catchError(this.handleError)
    );
  }

  public patch<T = unknown>(
    endpoint: string,
    data: HttpRequestBody,
    params?: HttpRequestParams,
    options?: HttpRequestOptions
  ): Observable<T> {
    const shouldTransform = !options?.skipTransform;

    // Transform data to snake_case before sending
    const transformedData = data instanceof FormData
      ? data
      : (data && typeof data === 'object' && !Array.isArray(data) && shouldTransform)
        ? toSnakeCase(data as Record<string, unknown>)
        : data;

    let httpParams = new HttpParams();
    const transformedParams = params && shouldTransform ? toSnakeCase(params as Record<string, unknown>) : params;

    if (transformedParams && typeof transformedParams === 'object' && !Array.isArray(transformedParams)) {
      Object.keys(transformedParams).forEach(key => {
        const value = (transformedParams as { [key: string]: unknown })[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    const httpOptions: {
      headers: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
    } = {
      headers: this.getHeaders()
    };
    if (httpParams.keys().length > 0) {
      httpOptions.params = httpParams;
    }

    return this.http.patch<unknown>(`${this.baseUrl}${endpoint}`, transformedData, httpOptions).pipe(
      map(response => response as T),
      catchError(this.handleError)
    );
  }

  public delete<T = unknown>(
    endpoint: string,
    params?: HttpRequestParams,
    body?: HttpRequestBody,
    options?: HttpRequestOptions
  ): Observable<T> {
    const shouldTransform = !options?.skipTransform;

    let httpParams = new HttpParams();
    const transformedParams = params && shouldTransform ? toSnakeCase(params as Record<string, unknown>) : params;

    if (transformedParams && typeof transformedParams === 'object' && !Array.isArray(transformedParams)) {
      Object.keys(transformedParams).forEach(key => {
        const value = (transformedParams as { [key: string]: unknown })[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    const httpOptions: {
      headers: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      body?: unknown;
    } = {
      headers: this.getHeaders()
    };
    if (httpParams.keys().length > 0) {
      httpOptions.params = httpParams;
    }
    if (body !== undefined) {
      // Transform body to snake_case if it's not FormData
      // For arrays (like permissionIds), send as-is
      httpOptions.body = body instanceof FormData
        ? body
        : Array.isArray(body)
          ? body
          : (body && typeof body === 'object' && shouldTransform)
            ? toSnakeCase(body as Record<string, unknown>)
            : body;
    }

    return this.http.delete<unknown>(`${this.baseUrl}${endpoint}`, httpOptions).pipe(
      map(response => {
        // DELETE might return void or a response
        if (!response) {
          return undefined as T;
        }
        return response as T;
      }),
      catchError(this.handleError)
    );
  }

  public upload<T = unknown>(
    endpoint: string,
    file: File,
    additionalData?: HttpRequestBody
  ): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      // Transform additional data to snake_case
      const transformedData = toSnakeCase(additionalData as Record<string, unknown>);
      Object.keys(transformedData).forEach(key => {
        const value = transformedData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
    }

    // Don't set Content-Type for FormData, browser will set it with boundary
    let headers = new HttpHeaders();
    const token = localStorage.getItem('access_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<unknown>(`${this.baseUrl}${endpoint}`, formData, {
      headers: headers
    }).pipe(
      map(response => {
        // Assuming we want to stop forcing camelCase on uploads to respect backend DTOs more strictly
        return response as T;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Upload multiple files
   * For endpoints that accept List[UploadFile]
   */
  public uploadMultiple<T = unknown>(
    endpoint: string,
    files: File[],
    additionalData?: HttpRequestBody
  ): Observable<T> {
    const formData = new FormData();

    // Append all files - backend expects 'files' parameter for List[UploadFile]
    files.forEach((file) => {
      formData.append('files', file);
    });

    if (additionalData) {
      // Transform additional data to snake_case
      const transformedData = toSnakeCase(additionalData as Record<string, unknown>);
      Object.keys(transformedData).forEach(key => {
        const value = transformedData[key];
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
    }

    // Don't set Content-Type for FormData, browser will set it with boundary
    let headers = new HttpHeaders();
    const token = localStorage.getItem('access_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<unknown>(`${this.baseUrl}${endpoint}`, formData, {
      headers: headers
    }).pipe(
      map(response => response as T), // Return response as-is without camelCase conversion
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    console.error('API Error:', error);
    // Preserve the full error object so validation_errors can be accessed
    // HttpErrorResponse structure: { error: { success: false, error: {...}, validation_errors: [...] } }
    return throwError(() => error);
  }
}
