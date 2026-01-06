/**
 * Company Service
 * 
 * Service for managing companies
 * Uses BaseCrudService and snake_case models to match backend
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import {
  Company,
  CompanyCreate,
  CompanyUpdate,
  CompanySettings,
  CompanySettingsUpdate,
  CompanyStatistics,
  CompanyFilters
} from '../models/company.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class CompanyService extends BaseCrudService<Company, CompanyCreate, CompanyUpdate> {
  protected baseEndpoint = '/companies';

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Get companies with filters and pagination
   * Backend: GET /api/v1/companies/
   */
  getCompanies(filters?: CompanyFilters): Observable<PaginatedApiResponse<Company>> {
    return this.getAll(filters);
  }

  /**
   * Get company by ID
   * Backend: GET /api/v1/companies/{company_id}
   */
  getCompanyById(companyId: string): Observable<Company> {
    return this.getById(companyId);
  }

  /**
   * Create new company
   * Backend: POST /api/v1/companies/
   */
  createCompany(data: CompanyCreate): Observable<Company> {
    return this.create(data);
  }

  /**
   * Update company
   * Backend: PUT /api/v1/companies/{company_id}
   */
  updateCompany(companyId: string, data: CompanyUpdate): Observable<Company> {
    return this.update(companyId, data);
  }

  /**
   * Delete company
   * Backend: DELETE /api/v1/companies/{company_id}
   */
  deleteCompany(companyId: string): Observable<void> {
    return this.delete(companyId);
  }

  /**
   * Get company settings
   * Backend: GET /api/v1/companies/{company_id}/settings
   */
  getSettings(companyId: string): Observable<CompanySettings> {
    const options = { skipTransform: true };
    return this.api.get<CompanySettings>(`${this.baseEndpoint}/${companyId}/settings`, undefined, options);
  }

  /**
   * Update company settings
   * Backend: PUT /api/v1/companies/{company_id}/settings
   */
  updateSettings(companyId: string, data: CompanySettingsUpdate): Observable<CompanySettings> {
    const options = { skipTransform: true };
    return this.api.put<CompanySettings>(`${this.baseEndpoint}/${companyId}/settings`, data, undefined, options);
  }

  /**
   * Get company statistics
   * Backend: GET /api/v1/companies/stats
   */
  getStatistics(): Observable<CompanyStatistics> {
    const options = { skipTransform: true };
    return this.api.get<CompanyStatistics>(`${this.baseEndpoint}/stats`, undefined, options);
  }

  /**
   * Export companies data
   * Backend: GET /api/v1/companies/export
   */
  exportCompanies(filters?: CompanyFilters): Observable<Blob> {
    const options = { skipTransform: true, responseType: 'blob' as const };
    return this.api.get<Blob>(`${this.baseEndpoint}/export`, filters, options);
  }

  /**
   * Activate company
   * Backend: POST /api/v1/companies/{company_id}/activate
   */
  activateCompany(companyId: string): Observable<any> {
    const options = { skipTransform: true };
    return this.api.post<any>(`${this.baseEndpoint}/${companyId}/activate`, {}, undefined, options);
  }

  /**
   * Deactivate company
   * Backend: POST /api/v1/companies/{company_id}/deactivate
   */
  deactivateCompany(companyId: string): Observable<any> {
    const options = { skipTransform: true };
    return this.api.post<any>(`${this.baseEndpoint}/${companyId}/deactivate`, {}, undefined, options);
  }

  /**
   * Suspend company
   * Backend: POST /api/v1/companies/{company_id}/suspend
   */
  suspendCompany(companyId: string, reason: string): Observable<any> {
    const options = { skipTransform: true };
    return this.api.post<any>(`${this.baseEndpoint}/${companyId}/suspend`, { reason }, undefined, options);
  }
}
