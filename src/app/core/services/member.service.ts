/**
 * Member Service
 *
 * Service for managing members (user accounts)
 * Uses BaseCrudService and snake_case models to match backend
 * All endpoints match backend API: /api/v1/members
 */

import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import {
  Member,
  MemberCreate,
  MemberUpdate,
  MemberFilters,
  MemberStatistics,
  MemberSummary
} from '../models/member.model';
import { Company } from '../models/company.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class MemberService extends BaseCrudService<Member, MemberCreate, MemberUpdate> {
  protected baseEndpoint = '/members';

  // Internal state management
  private members = signal<Member[]>([]);
  private loading = signal(false);

  constructor(api: ApiService) {
    super(api);
  }

  // Getters for signals
  getMembersSignal = () => this.members.asReadonly();
  getLoadingSignal = () => this.loading.asReadonly();

  /**
   * Get all members
   * Backend: GET /api/v1/members/
   * Returns: List[MemberResponse] (not paginated)
   */
  getMembers(filters?: MemberFilters): Observable<Member[]> {
    this.loading.set(true);
    const options = { skipTransform: true };
    return this.api.get<Member[]>(this.baseEndpoint, filters, options).pipe(
      tap((response: any) => {
        // Backend returns List[MemberResponse] directly, not wrapped
        const members = Array.isArray(response) ? response : (response.data || response.items || []);
        this.members.set(members);
        this.loading.set(false);
      }),
      map((response: any) => {
        return Array.isArray(response) ? response : (response.data || response.items || []);
      })
    );
  }

  /**
   * Get members with pagination (if backend supports it)
   * Backend: GET /api/v1/members/ (with pagination params)
   */
  getMembersPaginated(filters?: MemberFilters): Observable<PaginatedApiResponse<Member>> {
    return this.getAll(filters);
  }

  /**
   * Get member by ID
   * Backend: GET /api/v1/members/{member_id}
   * Returns: MemberResponse
   */
  getMemberById(memberId: string): Observable<Member> {
    return this.getById(memberId);
  }

  /**
   * Get member's companies
   * Backend: GET /api/v1/members/{member_id}/companies
   * Returns: List[CompanyResponse]
   */
  getMemberCompanies(memberId: string): Observable<Company[]> {
    const options = { skipTransform: true };
    return this.api.get<Company[]>(`${this.baseEndpoint}/${memberId}/companies`, undefined, options).pipe(
      map((response: any) => {
        return Array.isArray(response) ? response : (response.data || response.items || []);
      })
    );
  }

  /**
   * Create new member
   * Backend: POST /api/v1/members/
   * Returns: MemberResponse
   */
  createMember(data: MemberCreate): Observable<Member> {
    return this.create(data).pipe(
      tap((member) => {
        // Update local state
        const current = this.members();
        this.members.set([...current, member]);
      })
    );
  }

  /**
   * Update member
   * Backend: PUT /api/v1/members/{member_id}
   * Returns: MemberResponse
   */
  updateMember(memberId: string, data: MemberUpdate): Observable<Member> {
    return this.update(memberId, data).pipe(
      tap((member) => {
        // Update local state
        const current = this.members();
        const index = current.findIndex(m => m.member_id === memberId);
        if (index >= 0) {
          current[index] = member;
          this.members.set([...current]);
        }
      })
    );
  }

  /**
   * Delete member
   * Backend: DELETE /api/v1/members/{member_id}
   * Returns: { message: string }
   */
  deleteMember(memberId: string): Observable<void> {
    return this.delete(memberId).pipe(
      tap(() => {
        // Update local state
        const current = this.members();
        this.members.set(current.filter(m => m.member_id !== memberId));
      })
    );
  }

  /**
   * Get member statistics
   * Backend: GET /api/v1/members/statistics (if exists)
   * Note: This endpoint may not exist in backend, calculate client-side if needed
   */
  getStatistics(filters?: MemberFilters): Observable<MemberStatistics> {
    const options = { skipTransform: true };
    return this.api.get<MemberStatistics>(`${this.baseEndpoint}/statistics`, filters, options).pipe(
      map((response: any) => {
        if (response.data) return response.data;
        return response;
      })
    );
  }

  /**
   * Calculate statistics from local data
   * Fallback if backend doesn't have statistics endpoint
   */
  calculateStatistics(): MemberStatistics {
    const members = this.members();
    const active = members.filter(m => m.is_active);
    const inactive = members.filter(m => !m.is_active);
    const verified = members.filter(m => m.is_verified);
    const unverified = members.filter(m => !m.is_verified);

    // Group by actor_type
    const byActorType: Record<string, number> = {};
    members.forEach(m => {
      const type = m.actor_type || 'unknown';
      byActorType[type] = (byActorType[type] || 0) + 1;
    });

    // Group by member_type
    const byMemberType: Record<string, number> = {};
    members.forEach(m => {
      if (m.member_type) {
        const type = m.member_type;
        byMemberType[type] = (byMemberType[type] || 0) + 1;
      }
    });

    return {
      total_members: members.length,
      active_members: active.length,
      inactive_members: inactive.length,
      verified_members: verified.length,
      unverified_members: unverified.length,
      members_by_actor_type: byActorType as any,
      members_by_member_type: byMemberType as any
    };
  }

  /**
   * Filter members locally
   */
  filterMembers(filters: MemberFilters): Member[] {
    let filtered = this.members();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(member =>
        (member.first_name?.toLowerCase().includes(search)) ||
        (member.last_name?.toLowerCase().includes(search)) ||
        (member.username?.toLowerCase().includes(search)) ||
        (member.email?.toLowerCase().includes(search))
      );
    }

    if (filters.actor_type) {
      filtered = filtered.filter(m => m.actor_type === filters.actor_type);
    }

    if (filters.member_type) {
      filtered = filtered.filter(m => m.member_type === filters.member_type);
    }

    if (filters.is_active !== undefined) {
      filtered = filtered.filter(m => m.is_active === filters.is_active);
    }

    if (filters.is_verified !== undefined) {
      filtered = filtered.filter(m => m.is_verified === filters.is_verified);
    }

    if (filters.status) {
      filtered = filtered.filter(m => m.status === filters.status);
    }

    return filtered;
  }

  /**
   * Get members as list (without pagination)
   */
  getMembersList(filters?: MemberFilters): Observable<Member[]> {
    return this.getMembers(filters);
  }

  /**
   * Load members (refresh from server)
   */
  loadMembers(filters?: MemberFilters): Observable<Member[]> {
    return this.getMembers(filters);
  }
}

