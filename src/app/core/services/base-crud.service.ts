/**
 * Base CRUD Service
 * 
 * Provides common CRUD operations for services
 * Uses snake_case to match backend schemas directly
 * Extend this class to create type-safe service implementations
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { handleApiResponse, handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';

/**
 * Base CRUD Service
 * 
 * @template T - The entity type (should use snake_case fields)
 * @template TCreate - The create DTO type (defaults to Partial<T>)
 * @template TUpdate - The update DTO type (defaults to Partial<T>)
 */
@Injectable({
  providedIn: 'root'
})
export abstract class BaseCrudService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  /**
   * Base endpoint path (e.g., '/companies', '/visitors')
   * Must be implemented by child classes
   */
  protected abstract baseEndpoint: string;
  
  /**
   * Whether to skip field name transformation (use snake_case directly)
   * Default: true (use snake_case to match backend)
   */
  protected useSnakeCase: boolean = true;
  
  constructor(protected api: ApiService) {}
  
  /**
   * Get all entities with pagination
   * Backend returns: PaginatedResponse<T> with items, total, page, size, total_pages, has_next, has_prev
   */
  getAll(filters?: any): Observable<PaginatedApiResponse<T>> {
    const options = this.useSnakeCase ? { skipTransform: true } : undefined;
    return this.api.get<any>(this.baseEndpoint, filters, options).pipe(
      map(response => {
        // Handle backend PaginatedResponse structure
        if (response.items && Array.isArray(response.items)) {
          return {
            total: response.total || 0,
            data: response.items,
            page: response.page || 1,
            size: response.size || response.items.length
          } as PaginatedApiResponse<T>;
        }
        // Fallback to standard handler
        return handlePaginatedResponse<T>(response);
      })
    );
  }
  
  /**
   * Get entity by ID
   * Backend returns: StandardResponse<T> or T directly
   */
  getById(id: string): Observable<T> {
    const options = this.useSnakeCase ? { skipTransform: true } : undefined;
    return this.api.get<any>(`${this.baseEndpoint}/${id}`, undefined, options).pipe(
      map(response => {
        // Handle StandardResponse structure
        if (response.data !== undefined) {
          return response.data as T;
        }
        // If response is already the data itself
        return response as T;
      })
    );
  }
  
  /**
   * Create new entity
   * Backend expects: TCreate (snake_case)
   * Backend returns: StandardResponse<T> or T directly
   */
  create(data: TCreate): Observable<T> {
    const options = this.useSnakeCase ? { skipTransform: true } : undefined;
    return this.api.post<any>(this.baseEndpoint, data, undefined, options).pipe(
      map(response => {
        // Handle StandardResponse structure
        if (response.data !== undefined) {
          return response.data as T;
        }
        // If response is already the data itself
        return response as T;
      })
    );
  }
  
  /**
   * Update existing entity
   * Backend expects: TUpdate (snake_case)
   * Backend returns: StandardResponse<T> or T directly
   */
  update(id: string, data: TUpdate): Observable<T> {
    const options = this.useSnakeCase ? { skipTransform: true } : undefined;
    return this.api.put<any>(`${this.baseEndpoint}/${id}`, data, undefined, options).pipe(
      map(response => {
        // Handle StandardResponse structure
        if (response.data !== undefined) {
          return response.data as T;
        }
        // If response is already the data itself
        return response as T;
      })
    );
  }
  
  /**
   * Partial update (PATCH)
   * Backend expects: Partial<TUpdate> (snake_case)
   * Backend returns: StandardResponse<T> or T directly
   */
  patch(id: string, data: Partial<TUpdate>): Observable<T> {
    const options = this.useSnakeCase ? { skipTransform: true } : undefined;
    return this.api.patch<any>(`${this.baseEndpoint}/${id}`, data, undefined, options).pipe(
      map(response => {
        // Handle StandardResponse structure
        if (response.data !== undefined) {
          return response.data as T;
        }
        // If response is already the data itself
        return response as T;
      })
    );
  }
  
  /**
   * Delete entity
   * Backend returns: StandardResponse<void> or void
   */
  delete(id: string): Observable<void> {
    const options = this.useSnakeCase ? { skipTransform: true } : undefined;
    return this.api.delete<void>(`${this.baseEndpoint}/${id}`, undefined, undefined, options).pipe(
      map(() => undefined)
    );
  }
  
  /**
   * Get all entities as a simple list (without pagination)
   */
  getAllList(filters?: any): Observable<T[]> {
    return this.getAll(filters).pipe(
      map(response => response.data || response.items || [])
    );
  }
  
  /**
   * Count entities
   * Backend endpoint: GET /{baseEndpoint}/count
   */
  count(filters?: any): Observable<number> {
    const options = this.useSnakeCase ? { skipTransform: true } : undefined;
    return this.api.get<{ count: number }>(`${this.baseEndpoint}/count`, filters, options).pipe(
      map(response => {
        if (typeof response === 'number') {
          return response;
        }
        if (response.count !== undefined) {
          return response.count;
        }
        if (response.data !== undefined && typeof response.data === 'number') {
          return response.data;
        }
        return 0;
      })
    );
  }
  
  /**
   * Check if entity exists
   * Backend endpoint: GET /{baseEndpoint}/{id}/exists
   */
  exists(id: string): Observable<boolean> {
    const options = this.useSnakeCase ? { skipTransform: true } : undefined;
    return this.api.get<{ exists: boolean }>(`${this.baseEndpoint}/${id}/exists`, undefined, options).pipe(
      map(response => {
        if (typeof response === 'boolean') {
          return response;
        }
        if (response.exists !== undefined) {
          return response.exists;
        }
        if (response.data !== undefined && typeof response.data === 'boolean') {
          return response.data;
        }
        return false;
      })
    );
  }
}
