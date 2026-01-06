import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { UUID, PaginatedResponse } from '../models/base.model';
import {
  Visitor,
  VisitorCreate,
  VisitorUpdate,
  VisitorCheckIn,
  VisitorCheckOut,
  VisitorApproval,
  VisitorBlacklist,
  VisitorVisit,
  VisitorInvitation,
  VisitorBadge,
  VisitorFilters,
  VisitorStats,
  VisitorSummary,
  getVisitorFullName,
  isVisitorOnPremises,
  needsApproval,
  getVisitDuration
} from '../models/visitor.model';
import { VisitorStatus } from '../models/enums.model';
import { API_ENDPOINTS } from '../utils/api-endpoints';
import { handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  /**
   * Get current company ID from auth
   */
  private getCompanyId(): UUID {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found. User must be logged in.');
    }
    // Convert to string if it's a number
    return typeof companyId === 'number' ? companyId.toString() : companyId;
  }

  // ==================== Visitor CRUD ====================

  /**
   * Get all visitors with filters and pagination
   */
  getVisitors(filters?: VisitorFilters): Observable<PaginatedApiResponse<Visitor>> {
    try {
      const companyId = this.getCompanyId();
      return this.api.get<any>(API_ENDPOINTS.VISITORS.LIST(companyId), filters).pipe(
        map(response => handlePaginatedResponse<Visitor>(response))
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get visitors as simple list
   */
  getVisitorsList(filters?: VisitorFilters): Observable<Visitor[]> {
    return this.getVisitors(filters).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get visitor by ID
   */
  getVisitorById(id: UUID): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      return this.api.get<Visitor>(API_ENDPOINTS.VISITORS.BY_ID(companyId, id));
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Create new visitor
   */
  createVisitor(visitorData: VisitorCreate): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      // Ensure companyId is set
      const data = { ...visitorData, companyId };
      return this.api.post<Visitor>(API_ENDPOINTS.VISITORS.CREATE(companyId), data);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update existing visitor
   */
  updateVisitor(id: UUID, updates: VisitorUpdate): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      return this.api.put<Visitor>(API_ENDPOINTS.VISITORS.UPDATE(companyId, id), updates);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Delete visitor
   */
  deleteVisitor(id: UUID): Observable<void> {
    try {
      const companyId = this.getCompanyId();
      return this.api.delete<void>(API_ENDPOINTS.VISITORS.DELETE(companyId, id));
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Check-in/out Operations ====================

  /**
   * Check in visitor
   */
  checkInVisitor(id: UUID, checkInData: VisitorCheckIn): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      return this.api.post<Visitor>(API_ENDPOINTS.VISITORS.CHECK_IN(companyId, id), checkInData);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Check out visitor
   */
  checkOutVisitor(id: UUID, checkOutData: VisitorCheckOut): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      return this.api.post<Visitor>(API_ENDPOINTS.VISITORS.CHECK_OUT(companyId, id), checkOutData);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Approval & Security ====================

  /**
   * Approve or reject visitor
   */
  approveVisitor(id: UUID, approval: VisitorApproval): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      return this.api.post<Visitor>(API_ENDPOINTS.VISITORS.APPROVE(companyId, id), approval);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Add visitor to blacklist
   */
  blacklistVisitor(id: UUID, blacklist: VisitorBlacklist): Observable<Visitor> {
    try {
      const companyId = this.getCompanyId();
      return this.api.post<Visitor>(API_ENDPOINTS.VISITORS.BLACKLIST(companyId, id), blacklist);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Remove visitor from blacklist
   */
  unblacklistVisitor(id: UUID): Observable<Visitor> {
    return this.blacklistVisitor(id, { blacklisted: false });
  }

  // ==================== Visitor Visits ====================

  /**
   * Get all visits for a visitor
   */
  getVisitorVisits(visitorId: UUID): Observable<VisitorVisit[]> {
    try {
      return this.api.get<VisitorVisit[]>(API_ENDPOINTS.VISITORS.VISITS(visitorId));
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Create new visit for visitor
   */
  createVisitorVisit(visitorId: UUID, visitData: Partial<VisitorVisit>): Observable<VisitorVisit> {
    try {
      return this.api.post<VisitorVisit>(API_ENDPOINTS.VISITORS.VISITS(visitorId), visitData);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Visitor Invitations ====================

  /**
   * Create visitor invitation
   */
  createInvitation(invitationData: Partial<VisitorInvitation>): Observable<VisitorInvitation> {
    try {
      return this.api.post<VisitorInvitation>(API_ENDPOINTS.VISITORS.INVITATIONS, invitationData);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get all invitations
   */
  getInvitations(filters?: any): Observable<VisitorInvitation[]> {
    try {
      return this.api.get<VisitorInvitation[]>(API_ENDPOINTS.VISITORS.INVITATIONS, filters);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Send invitation via email
   */
  sendInvitation(invitationId: UUID): Observable<any> {
    try {
      return this.api.post<any>(API_ENDPOINTS.VISITORS.INVITATION_SEND(invitationId), {});
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Visitor Badges ====================

  /**
   * Issue badge to visitor
   */
  issueBadge(visitorId: UUID, badgeData: Partial<VisitorBadge>): Observable<VisitorBadge> {
    try {
      return this.api.post<VisitorBadge>(API_ENDPOINTS.VISITORS.BADGES, badgeData);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Return badge from visitor
   */
  returnBadge(badgeId: UUID, returnNotes?: string): Observable<VisitorBadge> {
    try {
      return this.api.post<VisitorBadge>(API_ENDPOINTS.VISITORS.BADGE_RETURN(badgeId), { 
        returnNotes 
      });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get all badges
   */
  getBadges(filters?: any): Observable<VisitorBadge[]> {
    try {
      return this.api.get<VisitorBadge[]>(API_ENDPOINTS.VISITORS.BADGES, filters);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Statistics & Reports ====================

  /**
   * Get visitor statistics
   */
  getVisitorStats(filters?: any): Observable<VisitorStats> {
    try {
      const companyId = this.getCompanyId();
      return this.api.get<VisitorStats>(API_ENDPOINTS.VISITORS.STATS(companyId), filters);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get visitor summary list
   */
  getVisitorSummaries(filters?: VisitorFilters): Observable<VisitorSummary[]> {
    return this.getVisitors(filters).pipe(
      map(response => (response.data || []).map(v => ({
        id: v.id,
        fullName: getVisitorFullName(v),
        email: v.email,
        phone: v.phone,
        companyName: v.companyName,
        visitorType: v.visitorType,
        visitPurpose: v.visitPurpose,
        status: v.status,
        appointmentDate: v.appointmentDate,
        checkInTime: v.checkInTime
      })))
    );
  }

  // ==================== Filter Helpers ====================

  /**
   * Get visitors by status
   */
  getVisitorsByStatus(status: VisitorStatus): Observable<Visitor[]> {
    return this.getVisitorsList({ status });
  }

  /**
   * Get pending visitors (need approval)
   */
  getPendingVisitors(): Observable<Visitor[]> {
    return this.getVisitorsByStatus(VisitorStatus.PENDING);
  }

  /**
   * Get approved visitors
   */
  getApprovedVisitors(): Observable<Visitor[]> {
    return this.getVisitorsByStatus(VisitorStatus.APPROVED);
  }

  /**
   * Get checked-in visitors (currently on premises)
   */
  getCheckedInVisitors(): Observable<Visitor[]> {
    return this.getVisitorsByStatus(VisitorStatus.CHECKED_IN);
  }

  /**
   * Get blacklisted visitors
   */
  getBlacklistedVisitors(): Observable<Visitor[]> {
    return this.getVisitorsList({ isBlacklisted: true });
  }

  /**
   * Search visitors
   */
  searchVisitors(query: string): Observable<Visitor[]> {
    return this.getVisitorsList({ search: query });
  }

  // ==================== Helper Methods ====================

  /**
   * Check if visitor is on premises
   */
  isOnPremises(visitor: Visitor): boolean {
    return isVisitorOnPremises(visitor);
  }

  /**
   * Check if visitor needs approval
   */
  needsApproval(visitor: Visitor): boolean {
    return needsApproval(visitor);
  }

  /**
   * Get visit duration
   */
  getVisitDuration(visitor: Visitor): number | null {
    return getVisitDuration(visitor);
  }

  /**
   * Get visitor full name
   */
  getFullName(visitor: Visitor): string {
    return getVisitorFullName(visitor);
  }

  // ==================== Export ====================

  /**
   * Export visitors data
   */
  exportVisitors(format: 'csv' | 'json' | 'excel' = 'csv', filters?: VisitorFilters): Observable<Blob> {
    try {
      const companyId = this.getCompanyId();
      return this.api.get<Blob>(API_ENDPOINTS.VISITORS.EXPORT(companyId), filters, { responseType: 'blob' });
    } catch (error) {
      return throwError(() => error);
    }
  }
}
