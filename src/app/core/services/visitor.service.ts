/**
 * Visitor Service
 * 
 * Service for managing visitors
 * Uses BaseCrudService and snake_case models to match backend
 */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  Visitor,
  VisitorCreate,
  VisitorUpdate,
  VisitorCheckIn,
  VisitorCheckOut,
  VisitorApproval,
  VisitorBlacklist,
  VisitorVisit,
  VisitorVisitCreate,
  VisitorInvitation,
  VisitorInvitationCreate,
  VisitorBadge,
  VisitorBadgeIssue,
  VisitorBadgeReturn,
  VisitorFilters,
  VisitorStatistics
} from '../models/visitor.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class VisitorService extends BaseCrudService<Visitor, VisitorCreate, VisitorUpdate> {
  protected baseEndpoint = '/visitors';

  constructor(
    protected override api: ApiService,
    private auth: AuthService
  ) {
    super(api);
  }

  /**
   * Get current company ID from auth
   */
  private getCompanyId(): string {
    const companyId = this.auth.currentUser()?.companyId || (this.auth.currentUser() as any)?.company_id;
    if (!companyId) {
      throw new Error('Company ID not found. User must be logged in.');
    }
    return typeof companyId === 'number' ? companyId.toString() : companyId;
  }

  /**
   * Get visitors with filters and pagination
   * Backend: GET /api/v1/visitors/company/{company_id}
   */
  getVisitors(filters?: VisitorFilters): Observable<PaginatedApiResponse<Visitor>> {
    try {
      const companyId = this.getCompanyId();
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
          } as PaginatedApiResponse<Visitor>;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get visitor by ID
   * Backend: GET /api/v1/visitors/company/{company_id}/{visitor_id}
   */
  getVisitorById(visitorId: string): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<Visitor>(`${this.baseEndpoint}/company/${companyId}/${visitorId}`, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Create new visitor
   * Backend: POST /api/v1/visitors/company/{company_id}
   */
  createVisitor(data: VisitorCreate): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<Visitor>(`${this.baseEndpoint}/company/${companyId}`, data, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update visitor
   * Backend: PUT /api/v1/visitors/company/{company_id}/{visitor_id}
   */
  updateVisitor(visitorId: string, data: VisitorUpdate): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.put<Visitor>(`${this.baseEndpoint}/company/${companyId}/${visitorId}`, data, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Delete visitor
   * Backend: DELETE /api/v1/visitors/company/{company_id}/{visitor_id}
   */
  deleteVisitor(visitorId: string): Observable<void> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.delete<void>(`${this.baseEndpoint}/company/${companyId}/${visitorId}`, undefined, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Check-in visitor
   * Backend: POST /api/v1/visitors/company/{company_id}/{visitor_id}/check-in
   */
  checkIn(visitorId: string, data: VisitorCheckIn): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<Visitor>(`${this.baseEndpoint}/company/${companyId}/${visitorId}/check-in`, data, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Check-out visitor
   * Backend: POST /api/v1/visitors/company/{company_id}/{visitor_id}/check-out
   */
  checkOut(visitorId: string, data: VisitorCheckOut): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<Visitor>(`${this.baseEndpoint}/company/${companyId}/${visitorId}/check-out`, data, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Approve visitor
   * Backend: POST /api/v1/visitors/{visitor_id}/approve
   */
  approve(visitorId: string, data: VisitorApproval): Observable<Visitor> {
    const options = { skipTransform: true };
    return this.api.post<Visitor>(`${this.baseEndpoint}/${visitorId}/approve`, data, undefined, options);
  }

  /**
   * Blacklist visitor
   * Backend: POST /api/v1/visitors/{visitor_id}/blacklist
   */
  blacklist(visitorId: string, data: VisitorBlacklist): Observable<Visitor> {
    const options = { skipTransform: true };
    return this.api.post<Visitor>(`${this.baseEndpoint}/${visitorId}/blacklist`, data, undefined, options);
  }

  /**
   * Get visitor statistics
   * Backend: GET /api/v1/visitors/company/{company_id}/statistics
   */
  getStatistics(filters?: VisitorFilters): Observable<VisitorStatistics> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<VisitorStatistics>(`${this.baseEndpoint}/company/${companyId}/statistics`, filters, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Visitor Visits ====================

  /**
   * Create visitor visit
   * Backend: POST /api/v1/visitor-visits/
   */
  createVisit(data: VisitorVisitCreate): Observable<VisitorVisit> {
    const options = { skipTransform: true };
    return this.api.post<VisitorVisit>('/visitor-visits', data, undefined, options);
  }

  /**
   * Get visitor visits
   * Backend: GET /api/v1/visitor-visits/
   */
  getVisits(filters?: VisitorFilters): Observable<PaginatedApiResponse<VisitorVisit>> {
    const options = { skipTransform: true };
    return this.api.get<PaginatedApiResponse<VisitorVisit>>('/visitor-visits', filters, options);
  }

  // ==================== Visitor Invitations ====================

  /**
   * Create visitor invitation
   * Backend: POST /api/v1/visitor-invitations/
   */
  createInvitation(data: VisitorInvitationCreate): Observable<VisitorInvitation> {
    const options = { skipTransform: true };
    return this.api.post<VisitorInvitation>('/visitor-invitations', data, undefined, options);
  }

  // ==================== Visitor Badges ====================

  /**
   * Issue visitor badge
   * Backend: POST /api/v1/visitor-badges/issue
   */
  issueBadge(data: VisitorBadgeIssue): Observable<VisitorBadge> {
    const options = { skipTransform: true };
    return this.api.post<VisitorBadge>('/visitor-badges/issue', data, undefined, options);
  }

  /**
   * Return visitor badge
   * Backend: POST /api/v1/visitor-badges/{badge_id}/return
   */
  returnBadge(badgeId: string, data: VisitorBadgeReturn): Observable<VisitorBadge> {
    const options = { skipTransform: true };
    return this.api.post<VisitorBadge>(`/visitor-badges/${badgeId}/return`, data, undefined, options);
  }

  // ==================== Export ====================

  /**
   * Export visitors data
   * Backend: GET /api/v1/visitors/company/{company_id}/export
   */
  exportVisitors(filters?: VisitorFilters): Observable<Blob> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true, responseType: 'blob' as const };
      return this.api.get<Blob>(`${this.baseEndpoint}/company/${companyId}/export`, filters, options);
    } catch (error) {
      return throwError(() => error);
    }
  }
}
