/**
 * Position Service
 * 
 * Service for managing positions/job titles
 * Uses BaseCrudService and snake_case models to match backend
 * All endpoints match backend API: /api/v1/positions
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import {
  Position,
  PositionCreate,
  PositionUpdate,
  PositionFilters
} from '../models/position.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class PositionService extends BaseCrudService<Position, PositionCreate, PositionUpdate> {
  protected baseEndpoint = '/positions';

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Get positions by company ID
   * Backend: GET /api/v1/positions/company/{company_id}
   */
  getByCompanyId(companyId: string, filters?: PositionFilters): Observable<PaginatedApiResponse<Position>> {
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
        } as PaginatedApiResponse<Position>;
      })
    );
  }

  /**
   * Get position statistics
   * Note: Backend endpoint may not exist - consider removing or implementing backend endpoint
   */
  getStatistics(companyId?: string): Observable<any> {
    const params = companyId ? { company_id: companyId } : {};
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/statistics`, params, options);
  }
}
