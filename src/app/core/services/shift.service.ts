/**
 * Shift Service
 * 
 * Service for managing work shifts and shift assignments
 * Matches backend shift routes
 */

import { Injectable, signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { handleApiResponse, PaginatedApiResponse } from '../utils/response-handler';
import {
  Shift,
  ShiftCreate,
  ShiftUpdate,
  ShiftResponse,
  UserShift,
  UserShiftAssign,
  UserShiftResponse,
  ShiftFilters,
  ShiftStatistics
} from '../models/shift.model';

@Injectable({
  providedIn: 'root'
})
export class ShiftService extends BaseCrudService<Shift, ShiftCreate, ShiftUpdate> {
  protected baseEndpoint = '/shifts';
  private auth = inject(AuthService);

  // Signal-based state management
  private shifts = signal<Shift[]>([]);
  private loading = signal(false);

  constructor(protected override api: ApiService) {
    super(api);
  }

  // Getters
  getShifts = () => this.shifts.asReadonly();
  getLoading = () => this.loading.asReadonly();

  /**
   * Get company ID from current user
   */
  private getCompanyId(): string {
    const user = this.auth.getCurrentUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }
    const companyId = user.companyId || (user as any).company_id;
    if (!companyId) {
      throw new Error('User is not associated with a company');
    }
    return companyId.toString();
  }

  /**
   * Load all shifts for current company
   */
  loadShifts(): Observable<Shift[]> {
    this.loading.set(true);
    try {
      const companyId = this.getCompanyId();
      return this.getByCompanyId(companyId).pipe(
        tap((shifts) => {
          this.shifts.set(shifts);
          this.loading.set(false);
        }),
        catchError((error) => {
          console.error('Error loading shifts:', error);
          this.shifts.set([]);
          this.loading.set(false);
          throw error;
        })
      );
    } catch (error) {
      this.loading.set(false);
      throw error;
    }
  }

  /**
   * Get all shifts for a company
   * Backend: GET /api/v1/shifts/company/{company_id}/shifts
   */
  getByCompanyId(companyId: string): Observable<Shift[]> {
    return this.api.get<Shift[]>(`/shifts/company/${companyId}/shifts`).pipe(
      map(response => {
        // Handle both array and paginated response
        if (Array.isArray(response)) {
          return response;
        }
        return (response as any).data || [];
      })
    );
  }

  /**
   * Get shift by ID (company-scoped)
   * Backend: GET /api/v1/shifts/company/{company_id}/shifts/{shift_id}
   */
  getByIdWithCompany(companyId: string, shiftId: string): Observable<Shift> {
    return this.api.get<any>(`/shifts/company/${companyId}/shifts/${shiftId}`).pipe(
      map(response => handleApiResponse<Shift>(response))
    );
  }

  /**
   * Create new shift (company-scoped)
   * Backend: POST /api/v1/shifts/company/{company_id}/shifts
   */
  createWithCompany(companyId: string, data: ShiftCreate): Observable<Shift> {
    return this.api.post<any>(`/shifts/company/${companyId}/shifts`, data).pipe(
      map(response => handleApiResponse<Shift>(response)),
      tap((shift) => {
        // Update local state
        this.shifts.update(shifts => [...shifts, shift]);
      })
    );
  }

  /**
   * Create shift for current company
   */
  createShift(data: Partial<ShiftCreate>): Observable<Shift> {
    const companyId = this.getCompanyId();
    const shiftData: ShiftCreate = {
      shiftName: data.shiftName || '',
      startTime: data.startTime || '',
      endTime: data.endTime || ''
    };
    return this.createWithCompany(companyId, shiftData);
  }

  /**
   * Update existing shift (company-scoped)
   * Backend: PUT /api/v1/shifts/company/{company_id}/shifts/{shift_id}
   */
  updateWithCompany(companyId: string, shiftId: string, data: ShiftUpdate): Observable<Shift> {
    return this.api.put<any>(`/shifts/company/${companyId}/shifts/${shiftId}`, data).pipe(
      map(response => handleApiResponse<Shift>(response)),
      tap((shift) => {
        // Update local state
        this.shifts.update(shifts => shifts.map(s => s.id === shift.id ? shift : s));
      })
    );
  }

  /**
   * Update shift for current company
   */
  updateShift(shiftId: string, data: Partial<ShiftUpdate>): Observable<Shift> {
    const companyId = this.getCompanyId();
    return this.updateWithCompany(companyId, shiftId, data);
  }

  /**
   * Delete shift (company-scoped)
   * Backend: DELETE /api/v1/shifts/company/{company_id}/shifts/{shift_id}
   */
  deleteWithCompany(companyId: string, shiftId: string): Observable<void> {
    return this.api.delete<void>(`/shifts/company/${companyId}/shifts/${shiftId}`).pipe(
      tap(() => {
        // Update local state
        this.shifts.update(shifts => shifts.filter(s => s.id !== shiftId));
      })
    );
  }

  /**
   * Delete shift for current company
   */
  deleteShift(shiftId: string): Observable<void> {
    const companyId = this.getCompanyId();
    return this.deleteWithCompany(companyId, shiftId);
  }

  /**
   * Get shift by ID for current company
   */
  getShiftById(shiftId: string): Observable<Shift> {
    const companyId = this.getCompanyId();
    return this.getByIdWithCompany(companyId, shiftId);
  }

  /**
   * Assign shift to employee
   * Backend: POST /api/v1/shifts/company/{company_id}/shifts/user-shifts
   */
  assignShift(companyId: string, data: UserShiftAssign): Observable<UserShift> {
    return this.api.post<any>(`/shifts/company/${companyId}/shifts/user-shifts`, data).pipe(
      map(response => handleApiResponse<UserShift>(response))
    );
  }

  /**
   * Assign shift to employee for current company
   */
  assignShiftToEmployee(data: UserShiftAssign): Observable<UserShift> {
    const companyId = this.getCompanyId();
    return this.assignShift(companyId, data);
  }

  /**
   * Get shift assignments
   * Backend: GET /api/v1/shifts/company/{company_id}/shifts/user-shifts
   */
  getShiftAssignments(companyId: string, filters?: { companyEmployeeId?: string; shiftId?: string }): Observable<UserShift[]> {
    return this.api.get<any>(`/shifts/company/${companyId}/shifts/user-shifts`, filters).pipe(
      map(response => {
        // Handle both array and paginated response
        if (Array.isArray(response)) {
          return response;
        }
        return (response as any).data || [];
      })
    );
  }

  /**
   * Unassign shift from employee
   */
  unassignShift(assignmentId: string): Observable<void> {
    return this.api.delete<void>(`${this.baseEndpoint}/user-shifts/${assignmentId}`);
  }

  /**
   * Get shift statistics
   */
  getStatistics(companyId?: string): Observable<ShiftStatistics> {
    const params = companyId ? { companyId } : {};
    return this.api.get<ShiftStatistics>(`${this.baseEndpoint}/statistics`, params).pipe(
      map(response => handleApiResponse<ShiftStatistics>(response))
    );
  }
}
