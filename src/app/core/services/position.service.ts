/**
 * Position Service
 * 
 * Service for managing positions/job titles
 * Matches backend position routes
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { handleApiResponse, handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';
import {
  Position,
  PositionCreate,
  PositionUpdate,
  PositionResponse,
  PositionFilters,
  PositionStatistics
} from '../models/position.model';

@Injectable({
  providedIn: 'root'
})
export class PositionService extends BaseCrudService<Position, PositionCreate, PositionUpdate> {
  protected baseEndpoint = '/positions';

  constructor(protected override api: ApiService) {
    super(api);
  }

  /**
   * Get all positions with pagination
   */
  override getAll(filters?: PositionFilters): Observable<PaginatedApiResponse<Position>> {
    return this.api.get<any>(this.baseEndpoint, filters).pipe(
      map(response => handlePaginatedResponse<Position>(response))
    );
  }

  /**
   * Get position by ID
   */
  override getById(id: string): Observable<Position> {
    return this.api.get<any>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => handleApiResponse<Position>(response))
    );
  }

  /**
   * Get positions by company ID
   */
  getByCompanyId(companyId: string, filters?: PositionFilters): Observable<PaginatedApiResponse<Position>> {
    return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}`, filters).pipe(
      map(response => handlePaginatedResponse<Position>(response))
    );
  }

  /**
   * Create new position
   */
  override create(data: PositionCreate): Observable<Position> {
    return this.api.post<any>(this.baseEndpoint, data).pipe(
      map(response => handleApiResponse<Position>(response))
    );
  }

  /**
   * Update existing position
   */
  override update(id: string, data: PositionUpdate): Observable<Position> {
    return this.api.put<any>(`${this.baseEndpoint}/${id}`, data).pipe(
      map(response => handleApiResponse<Position>(response))
    );
  }

  /**
   * Delete position
   */
  override delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Get position statistics
   * Note: Backend endpoint may not exist - consider removing or implementing backend endpoint
   */
  getStatistics(companyId?: string): Observable<PositionStatistics> {
    // TODO: Check if backend has /positions/statistics endpoint
    // If not, remove this function or implement client-side calculation
    const params = companyId ? { companyId } : {};
    return this.api.get<PositionStatistics>(`${this.baseEndpoint}/statistics`, params).pipe(
      map(response => handleApiResponse<PositionStatistics>(response))
    );
  }
}
