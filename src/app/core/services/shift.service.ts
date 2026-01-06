/**
 * Shift Service
 *
 * Service for managing work shifts and shift assignments
 * Uses BaseCrudService and snake_case models to match backend
 * All endpoints match backend API: /api/v1/shifts
 */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  Shift,
  ShiftCreate,
  ShiftUpdate,
  UserShift,
  UserShiftAssign,
  ShiftFilters
} from '../models/shift.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class ShiftService extends BaseCrudService<Shift, ShiftCreate, ShiftUpdate> {
  protected baseEndpoint = '/shifts';

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
   * Get shifts by company ID
   * Backend: GET /api/v1/shifts/company/{company_id}/shifts
   */
  getByCompanyId(companyId: string, filters?: ShiftFilters): Observable<Shift[]> {
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}/shifts`, filters, options).pipe(
      map((response: any) => {
        const items = response.items || response.data || [];
        return Array.isArray(items) ? items : [];
      })
    );
  }

  /**
   * Get all shifts for current company
   */
  getAllShifts(filters?: ShiftFilters): Observable<Shift[]> {
    try {
      const companyId = this.getCompanyId();
      return this.getByCompanyId(companyId, filters);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get shift by ID
   * Backend: GET /api/v1/shifts/company/{company_id}/shifts/{shift_id}
   */
  getShiftById(shiftId: string): Observable<Shift> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<Shift>(`${this.baseEndpoint}/company/${companyId}/shifts/${shiftId}`, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Create shift
   * Backend: POST /api/v1/shifts/company/{company_id}/shifts
   */
  createShift(data: ShiftCreate): Observable<Shift> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<Shift>(`${this.baseEndpoint}/company/${companyId}/shifts`, data, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update shift
   * Backend: PUT /api/v1/shifts/company/{company_id}/shifts/{shift_id}
   */
  updateShift(shiftId: string, data: ShiftUpdate): Observable<Shift> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.put<Shift>(`${this.baseEndpoint}/company/${companyId}/shifts/${shiftId}`, data, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Delete shift
   * Backend: DELETE /api/v1/shifts/company/{company_id}/shifts/{shift_id}
   */
  deleteShift(shiftId: string): Observable<void> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.delete<void>(`${this.baseEndpoint}/company/${companyId}/shifts/${shiftId}`, undefined, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Assign shift to employee
   * Backend: POST /api/v1/shifts/company/{company_id}/shifts/user-shifts
   */
  assignShift(data: UserShiftAssign): Observable<UserShift> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<UserShift>(`${this.baseEndpoint}/company/${companyId}/shifts/user-shifts`, data, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get employee shifts
   * Note: Backend doesn't have this endpoint - consider removing or implementing client-side filtering
   */
  getEmployeeShifts(companyEmployeeId: string): Observable<UserShift[]> {
    // This endpoint doesn't exist in backend
    // Return empty array or implement client-side filtering
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }

  /**
   * Remove shift assignment
   * Note: Backend doesn't have this endpoint - consider removing or implementing differently
   */
  removeShiftAssignment(userShiftId: string): Observable<void> {
    // This endpoint doesn't exist in backend
    // Consider implementing by updating the shift assignment or removing it differently
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }
}
