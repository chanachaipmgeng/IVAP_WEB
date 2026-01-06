/**
 * Visitor Service
 * 
 * Service for managing visitors
 * Uses BaseCrudService and snake_case models to match backend
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
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

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Get visitors with filters and pagination
   * Backend: GET /api/v1/visitors/
   */
  getVisitors(filters?: VisitorFilters): Observable<PaginatedApiResponse<Visitor>> {
    return this.getAll(filters);
  }

  /**
   * Get visitor by ID
   * Backend: GET /api/v1/visitors/{visitor_id}
   */
  getVisitorById(visitorId: string): Observable<Visitor> {
    return this.getById(visitorId);
  }

  /**
   * Create new visitor
   * Backend: POST /api/v1/visitors/
   */
  createVisitor(data: VisitorCreate): Observable<Visitor> {
    return this.create(data);
  }

  /**
   * Update visitor
   * Backend: PUT /api/v1/visitors/{visitor_id}
   */
  updateVisitor(visitorId: string, data: VisitorUpdate): Observable<Visitor> {
    return this.update(visitorId, data);
  }

  /**
   * Delete visitor
   * Backend: DELETE /api/v1/visitors/{visitor_id}
   */
  deleteVisitor(visitorId: string): Observable<void> {
    return this.delete(visitorId);
  }

  /**
   * Check-in visitor
   * Backend: POST /api/v1/visitors/{visitor_id}/check-in
   */
  checkIn(visitorId: string, data: VisitorCheckIn): Observable<Visitor> {
    const options = { skipTransform: true };
    return this.api.post<Visitor>(`${this.baseEndpoint}/${visitorId}/check-in`, data, undefined, options);
  }

  /**
   * Check-out visitor
   * Backend: POST /api/v1/visitors/{visitor_id}/check-out
   */
  checkOut(visitorId: string, data: VisitorCheckOut): Observable<Visitor> {
    const options = { skipTransform: true };
    return this.api.post<Visitor>(`${this.baseEndpoint}/${visitorId}/check-out`, data, undefined, options);
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
   * Backend: GET /api/v1/visitors/statistics
   */
  getStatistics(filters?: VisitorFilters): Observable<VisitorStatistics> {
    const options = { skipTransform: true };
    return this.api.get<VisitorStatistics>(`${this.baseEndpoint}/statistics`, filters, options);
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
}
