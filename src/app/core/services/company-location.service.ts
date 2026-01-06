/**
 * Company Location Service
 * 
 * Service for managing company locations
 * Uses BaseCrudService and snake_case models to match backend
 * All endpoints match backend API: /api/v1/company-locations
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import {
  CompanyLocation,
  CompanyLocationCreate,
  CompanyLocationUpdate,
  CompanyLocationFilters
} from '../models/company-location.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class CompanyLocationService extends BaseCrudService<CompanyLocation, CompanyLocationCreate, CompanyLocationUpdate> {
  protected baseEndpoint = '/company-locations';

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Get locations by company ID
   * Backend: GET /api/v1/company-locations/company/{company_id}
   */
  getByCompanyId(companyId: string, filters?: CompanyLocationFilters): Observable<PaginatedApiResponse<CompanyLocation>> {
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}`, filters, options).pipe(
      map((response: any) => {
        const items = response.items || response.data || [];
        return {
          total: response.total || items.length,
          data: items,
          items: items,
          page: response.page || 1,
          size: response.size || response.page_size || items.length
        } as PaginatedApiResponse<CompanyLocation>;
      })
    );
  }

  /**
   * Get location by ID
   * Backend: GET /api/v1/company-locations/company/{company_id}/{location_id}
   */
  getLocationById(companyId: string, locationId: string): Observable<CompanyLocation> {
    const options = { skipTransform: true };
    return this.api.get<CompanyLocation>(`${this.baseEndpoint}/company/${companyId}/${locationId}`, undefined, options);
  }

  /**
   * Create location for company
   * Backend: POST /api/v1/company-locations/company/{company_id}
   */
  createLocation(companyId: string, data: CompanyLocationCreate): Observable<CompanyLocation> {
    const options = { skipTransform: true };
    return this.api.post<CompanyLocation>(`${this.baseEndpoint}/company/${companyId}`, data, undefined, options);
  }

  /**
   * Update location
   * Backend: PUT /api/v1/company-locations/company/{company_id}/{location_id}
   */
  updateLocation(companyId: string, locationId: string, data: CompanyLocationUpdate): Observable<CompanyLocation> {
    const options = { skipTransform: true };
    return this.api.put<CompanyLocation>(`${this.baseEndpoint}/company/${companyId}/${locationId}`, data, undefined, options);
  }

  /**
   * Delete location
   * Backend: DELETE /api/v1/company-locations/company/{company_id}/{location_id}
   */
  deleteLocation(companyId: string, locationId: string): Observable<void> {
    const options = { skipTransform: true };
    return this.api.delete<void>(`${this.baseEndpoint}/company/${companyId}/${locationId}`, undefined, undefined, options);
  }
}
