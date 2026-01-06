/**
 * Base CRUD Service
 * 
 * Provides common CRUD operations for services
 * Extend this class to create type-safe service implementations
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { handleApiResponse, handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';
import { API_ENDPOINTS } from '../utils/api-endpoints';

/**
 * Base CRUD Service
 * 
 * @template T - The entity type
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
  
  constructor(protected api: ApiService) {}
  
  /**
   * Get all entities with pagination
   */
  getAll(filters?: any): Observable<PaginatedApiResponse<T>> {
    return this.api.get<any>(this.baseEndpoint, filters).pipe(
      map(response => handlePaginatedResponse<T>(response))
    );
  }
  
  /**
   * Get entity by ID
   */
  getById(id: string): Observable<T> {
    return this.api.get<any>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => handleApiResponse<T>(response))
    );
  }
  
  /**
   * Create new entity
   */
  create(data: TCreate): Observable<T> {
    return this.api.post<any>(this.baseEndpoint, data).pipe(
      map(response => handleApiResponse<T>(response))
    );
  }
  
  /**
   * Update existing entity
   */
  update(id: string, data: TUpdate): Observable<T> {
    return this.api.put<any>(`${this.baseEndpoint}/${id}`, data).pipe(
      map(response => handleApiResponse<T>(response))
    );
  }
  
  /**
   * Delete entity
   */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.baseEndpoint}/${id}`);
  }
  
  /**
   * Get all entities as a simple list (without pagination)
   */
  getAllList(filters?: any): Observable<T[]> {
    return this.getAll(filters).pipe(
      map(response => response.data || [])
    );
  }
}
