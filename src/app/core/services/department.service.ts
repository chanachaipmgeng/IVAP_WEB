/**
 * Department Service
 * 
 * Service for managing departments
 * Uses BaseCrudService and snake_case models to match backend
 * All endpoints match backend API: /api/v1/departments
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
  DepartmentFilters
} from '../models/department.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService extends BaseCrudService<Department, DepartmentCreate, DepartmentUpdate> {
  protected baseEndpoint = '/departments';

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Get departments by company ID
   * Backend: GET /api/v1/departments/company/{company_id}
   */
  getByCompanyId(companyId: string, filters?: DepartmentFilters): Observable<PaginatedApiResponse<Department>> {
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}`, filters, options).pipe(
      map((response: any) => {
        // Backend returns PaginatedResponse with items array
        const items = response.items || response.data || [];
        return {
          total: response.total || items.length,
          data: items,
          items: items,
          page: response.page || 1,
          size: response.size || response.page_size || items.length
        } as PaginatedApiResponse<Department>;
      })
    );
  }

  /**
   * Get department statistics
   * Note: Backend endpoint may not exist - consider removing or implementing backend endpoint
   */
  getStatistics(companyId?: string): Observable<any> {
    const params = companyId ? { company_id: companyId } : {};
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/statistics`, params, options);
  }
}
