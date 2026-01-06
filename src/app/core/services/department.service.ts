/**
 * Department Service
 * 
 * Service for managing departments
 * Matches backend department routes
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { handleApiResponse, handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';
import {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
  DepartmentResponse,
  DepartmentFilters,
  DepartmentStatistics
} from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService extends BaseCrudService<Department, DepartmentCreate, DepartmentUpdate> {
  protected baseEndpoint = '/departments';

  constructor(protected override api: ApiService) {
    super(api);
  }

  /**
   * Get all departments with pagination
   */
  override getAll(filters?: DepartmentFilters): Observable<PaginatedApiResponse<Department>> {
    return this.api.get<any>(this.baseEndpoint, filters).pipe(
      map(response => handlePaginatedResponse<Department>(response))
    );
  }

  /**
   * Get department by ID
   */
  override getById(id: string): Observable<Department> {
    return this.api.get<any>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => handleApiResponse<Department>(response))
    );
  }

  /**
   * Get departments by company ID
   */
  getByCompanyId(companyId: string, filters?: DepartmentFilters): Observable<PaginatedApiResponse<Department>> {
    return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}`, filters).pipe(
      map(response => handlePaginatedResponse<Department>(response))
    );
  }

  /**
   * Create new department
   */
  override create(data: DepartmentCreate): Observable<Department> {
    return this.api.post<any>(this.baseEndpoint, data).pipe(
      map(response => handleApiResponse<Department>(response))
    );
  }

  /**
   * Update existing department
   */
  override update(id: string, data: DepartmentUpdate): Observable<Department> {
    return this.api.put<any>(`${this.baseEndpoint}/${id}`, data).pipe(
      map(response => handleApiResponse<Department>(response))
    );
  }

  /**
   * Delete department
   */
  override delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Get department statistics
   * Note: Backend endpoint may not exist - consider removing or implementing backend endpoint
   */
  getStatistics(companyId?: string): Observable<DepartmentStatistics> {
    // TODO: Check if backend has /departments/statistics endpoint
    // If not, remove this function or implement client-side calculation
    const params = companyId ? { companyId } : {};
    return this.api.get<DepartmentStatistics>(`${this.baseEndpoint}/statistics`, params).pipe(
      map(response => handleApiResponse<DepartmentStatistics>(response))
    );
  }
}
