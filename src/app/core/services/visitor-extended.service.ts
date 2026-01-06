/**
 * Visitor Extended Service
 * 
 * Service for visitor extended features:
 * - VisitorVisit management
 * - VisitorInvitation system
 * - VisitorBadge management
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  
  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  // ==================== Visitor Visit Management ====================

  getVisitorVisits(visitorId: string): Observable<VisitorVisit[]> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<VisitorVisit[]>(
      `/visitor-extended/visits/visitor/${visitorId}`,
      { company_id: companyId }
    );
  }

  createVisitorVisit(visit: VisitorVisitCreate): Observable<VisitorVisit> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<VisitorVisit>(
      `/visitor-extended/visits`,
      visit,
      { company_id: companyId }
    );
  }

  // ==================== Visitor Invitation Management ====================

  createInvitation(invitation: VisitorInvitationCreate): Observable<VisitorInvitation> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<VisitorInvitation>(
      `/visitor-extended/invitations`,
      invitation,
      { company_id: companyId }
    );
  }

  getInvitations(statusFilter?: string): Observable<VisitorInvitation[]> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    const params: any = { company_id: companyId };
    if (statusFilter) {
      params['status_filter'] = statusFilter;
    }
    return this.api.get<VisitorInvitation[]>(
      `/visitor-extended/invitations`,
      params
    );
  }

  verifyInvitationCode(invitationCode: string): Observable<VisitorInvitation> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<VisitorInvitation>(
      `/visitor-extended/invitations/verify/${invitationCode}`,
      {},
      { company_id: companyId }
    );
  }

  // ==================== Visitor Badge Management ====================

  issueBadge(badge: VisitorBadgeIssue): Observable<VisitorBadge> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<VisitorBadge>(
      `/visitor-extended/badges/issue`,
      badge,
      { company_id: companyId }
    );
  }

  returnBadge(badgeId: string, returnData: VisitorBadgeReturn): Observable<VisitorBadge> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.post<VisitorBadge>(
      `/visitor-extended/badges/${badgeId}/return`,
      returnData,
      { company_id: companyId }
    );
  }

  getBadges(statusFilter?: string): Observable<VisitorBadge[]> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    const params: any = { company_id: companyId };
    if (statusFilter) {
      params['status_filter'] = statusFilter;
    }
    return this.api.get<VisitorBadge[]>(
      `/visitor-extended/badges`,
      params
    );
  }

  getActiveBadges(): Observable<VisitorBadge[]> {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return this.api.get<VisitorBadge[]>(
      `/visitor-extended/badges/active`,
      { company_id: companyId }
    );
  }
}

