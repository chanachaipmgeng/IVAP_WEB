/**
 * Shift Service
 *
 * Service for managing work shifts and shift assignments
 * Uses BaseCrudService and snake_case models to match backend
 * All endpoints match backend API: /api/v1/shifts
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
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

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Get shifts by company ID
   * Backend: GET /api/v1/shifts/company/{company_id}
   */
  getByCompanyId(companyId: string, filters?: ShiftFilters): Observable<PaginatedApiResponse<Shift>> {
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
        } as PaginatedApiResponse<Shift>;
      })
    );
  }

  /**
   * Assign shift to employee
   * Backend: POST /api/v1/shifts/assign
   */
  assignShift(data: UserShiftAssign): Observable<UserShift> {
    const options = { skipTransform: true };
    return this.api.post<UserShift>(`${this.baseEndpoint}/assign`, data, undefined, options);
  }

  /**
   * Get employee shifts
   * Backend: GET /api/v1/shifts/employee/{company_employee_id}
   */
  getEmployeeShifts(companyEmployeeId: string): Observable<UserShift[]> {
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/employee/${companyEmployeeId}`, undefined, options).pipe(
      map((response: any) => {
        const items = response.items || response.data || [];
        return Array.isArray(items) ? items : [];
      })
    );
  }

  /**
   * Remove shift assignment
   * Backend: DELETE /api/v1/shifts/assign/{user_shift_id}
   */
  removeShiftAssignment(userShiftId: string): Observable<void> {
    const options = { skipTransform: true };
    return this.api.delete<void>(`${this.baseEndpoint}/assign/${userShiftId}`, undefined, undefined, options);
  }
}
