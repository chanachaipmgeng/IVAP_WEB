/**
 * Visitor Extended Service
 * 
 * Service for visitor extended features:
 * - VisitorVisit management
 * - VisitorInvitation system
 * - VisitorBadge management
 * 
 * Uses snake_case to match backend API directly
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  VisitorVisit,
  VisitorVisitCreate,
  VisitorInvitation,
  VisitorInvitationCreate,
  VisitorInvitationVerify,
  VisitorBadge,
  VisitorBadgeIssue,
  VisitorBadgeReturn
} from '../models/visitor-extended.model';

@Injectable({
  providedIn: 'root'
})
export class VisitorExtendedService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  /**
   * Get company ID from current user
   */
  private getCompanyId(): string {
    const companyId = this.auth.currentUser()?.company_id || this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return String(companyId);
  }

  /**
   * Get options for API calls (skipTransform for snake_case)
   */
  private getOptions() {
    return { skipTransform: true };
  }

  // ==================== Visitor Visit Management ====================

  /**
   * Get all visits for a specific visitor
   * Backend: GET /api/v1/visitor-extended/visits/visitor/{visitor_id}?company_id={company_id}
   */
  getVisitorVisits(visitorId: string): Observable<VisitorVisit[]> {
    const companyId = this.getCompanyId();
    return this.api.get<VisitorVisit[]>(
      `/visitor-extended/visits/visitor/${visitorId}`,
      { company_id: companyId },
      this.getOptions()
    ).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data || response?.items || [];
      })
    );
  }

  /**
   * Create a new visitor visit record
   * Backend: POST /api/v1/visitor-extended/visits?company_id={company_id}
   */
  createVisitorVisit(visit: VisitorVisitCreate): Observable<VisitorVisit> {
    const companyId = this.getCompanyId();
    return this.api.post<VisitorVisit>(
      `/visitor-extended/visits`,
      visit,
      { company_id: companyId },
      this.getOptions()
    ).pipe(
      map((response: any) => response?.data || response)
    );
  }

  // ==================== Visitor Invitation Management ====================

  /**
   * Create a visitor invitation
   * Backend: POST /api/v1/visitor-extended/invitations?company_id={company_id}
   */
  createInvitation(invitation: VisitorInvitationCreate): Observable<VisitorInvitation> {
    const companyId = this.getCompanyId();
    return this.api.post<VisitorInvitation>(
      `/visitor-extended/invitations`,
      invitation,
      { company_id: companyId },
      this.getOptions()
    ).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Get invitations with optional status filter
   * Backend: GET /api/v1/visitor-extended/invitations?company_id={company_id}&status_filter={status}
   */
  getInvitations(statusFilter?: string): Observable<VisitorInvitation[]> {
    const companyId = this.getCompanyId();
    const params: any = { company_id: companyId };
    if (statusFilter) {
      params.status_filter = statusFilter;
    }
    return this.api.get<VisitorInvitation[]>(
      `/visitor-extended/invitations`,
      params,
      this.getOptions()
    ).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data || response?.items || [];
      })
    );
  }

  /**
   * Verify invitation code
   * Backend: POST /api/v1/visitor-extended/invitations/verify/{invitation_code}?company_id={company_id}
   */
  verifyInvitationCode(invitationCode: string): Observable<VisitorInvitation> {
    const companyId = this.getCompanyId();
    return this.api.post<VisitorInvitation>(
      `/visitor-extended/invitations/verify/${invitationCode}`,
      {},
      { company_id: companyId },
      this.getOptions()
    ).pipe(
      map((response: any) => response?.data || response)
    );
  }

  // ==================== Visitor Badge Management ====================

  /**
   * Issue a badge to a visitor
   * Backend: POST /api/v1/visitor-extended/badges/issue?company_id={company_id}
   */
  issueBadge(badge: VisitorBadgeIssue): Observable<VisitorBadge> {
    const companyId = this.getCompanyId();
    return this.api.post<VisitorBadge>(
      `/visitor-extended/badges/issue`,
      badge,
      { company_id: companyId },
      this.getOptions()
    ).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Return a badge
   * Backend: POST /api/v1/visitor-extended/badges/{badge_id}/return?company_id={company_id}
   */
  returnBadge(badgeId: string, returnData: VisitorBadgeReturn): Observable<VisitorBadge> {
    const companyId = this.getCompanyId();
    return this.api.post<VisitorBadge>(
      `/visitor-extended/badges/${badgeId}/return`,
      returnData,
      { company_id: companyId },
      this.getOptions()
    ).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Get badges with optional status filter
   * Backend: GET /api/v1/visitor-extended/badges?company_id={company_id}&status_filter={status}
   */
  getBadges(statusFilter?: string): Observable<VisitorBadge[]> {
    const companyId = this.getCompanyId();
    const params: any = { company_id: companyId };
    if (statusFilter) {
      params.status_filter = statusFilter;
    }
    return this.api.get<VisitorBadge[]>(
      `/visitor-extended/badges`,
      params,
      this.getOptions()
    ).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data || response?.items || [];
      })
    );
  }

  /**
   * Get active badges
   * Backend: GET /api/v1/visitor-extended/badges/active?company_id={company_id}
   */
  getActiveBadges(): Observable<VisitorBadge[]> {
    const companyId = this.getCompanyId();
    return this.api.get<VisitorBadge[]>(
      `/visitor-extended/badges/active`,
      { company_id: companyId },
      this.getOptions()
    ).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data || response?.items || [];
      })
    );
  }
}
