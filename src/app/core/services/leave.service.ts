/**
 * Leave Service
 * 
 * Service for managing leave requests
 * Uses BaseCrudService and snake_case models to match backend
 * All endpoints match backend API: /api/v1/leaves
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import {
  Leave,
  LeaveCreate,
  LeaveUpdate,
  LeaveApproval,
  LeaveRejection,
  LeaveBalance,
  LeaveBalanceResponse,
  LeaveStatistics,
  LeaveFilters
} from '../models/leave.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class LeaveService extends BaseCrudService<Leave, LeaveCreate, LeaveUpdate> {
  protected baseEndpoint = '/leaves';

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Get leave requests with pagination
   * Backend: GET /api/v1/leaves/leave-requests
   */
  getLeaveRequests(filters?: LeaveFilters): Observable<PaginatedApiResponse<Leave>> {
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/leave-requests`, filters, options).pipe(
      map((response: any) => {
        const items = response.items || response.data || [];
        return {
          total: response.total || items.length,
          data: items,
          items: items,
          page: response.page || 1,
          size: response.size || response.page_size || items.length
        } as PaginatedApiResponse<Leave>;
      })
    );
  }

  /**
   * Get leave request by ID
   * Backend: GET /api/v1/leaves/leave-requests/{leave_request_id}
   */
  getLeaveRequestById(leaveRequestId: string): Observable<Leave> {
    const options = { skipTransform: true };
    return this.api.get<Leave>(`${this.baseEndpoint}/leave-requests/${leaveRequestId}`, undefined, options);
  }

  /**
   * Create leave request
   * Backend: POST /api/v1/leaves/leave-requests
   */
  createLeaveRequest(data: LeaveCreate): Observable<Leave> {
    const options = { skipTransform: true };
    return this.api.post<Leave>(`${this.baseEndpoint}/leave-requests`, data, undefined, options);
  }

  /**
   * Update leave request
   * Backend: PUT /api/v1/leaves/leave-requests/{leave_request_id}
   */
  updateLeaveRequest(leaveRequestId: string, data: LeaveUpdate): Observable<Leave> {
    const options = { skipTransform: true };
    return this.api.put<Leave>(`${this.baseEndpoint}/leave-requests/${leaveRequestId}`, data, undefined, options);
  }

  /**
   * Delete leave request
   * Backend: DELETE /api/v1/leaves/leave-requests/{leave_request_id}
   */
  deleteLeaveRequest(leaveRequestId: string): Observable<void> {
    const options = { skipTransform: true };
    return this.api.delete<void>(`${this.baseEndpoint}/leave-requests/${leaveRequestId}`, undefined, undefined, options);
  }

  /**
   * Approve leave request
   * Backend: PUT /api/v1/leaves/leave-requests/{leave_request_id}/approve
   */
  approveLeaveRequest(leaveRequestId: string, data: LeaveApproval): Observable<Leave> {
    const options = { skipTransform: true };
    return this.api.put<Leave>(`${this.baseEndpoint}/leave-requests/${leaveRequestId}/approve`, data, undefined, options);
  }

  /**
   * Reject leave request
   * Backend: PUT /api/v1/leaves/leave-requests/{leave_request_id}/reject
   */
  rejectLeaveRequest(leaveRequestId: string, data: LeaveRejection): Observable<Leave> {
    const options = { skipTransform: true };
    return this.api.put<Leave>(`${this.baseEndpoint}/leave-requests/${leaveRequestId}/reject`, data, undefined, options);
  }

  /**
   * Get leave balance for employee
   * Backend: GET /api/v1/leaves/employees/{employee_id}/leave-balance
   */
  getLeaveBalance(employeeId: string): Observable<LeaveBalanceResponse> {
    const options = { skipTransform: true };
    return this.api.get<LeaveBalanceResponse>(`${this.baseEndpoint}/employees/${employeeId}/leave-balance`, undefined, options);
  }

  /**
   * Get leave statistics
   * Backend: GET /api/v1/leaves/companies/{company_id}/leave-statistics
   */
  getLeaveStatistics(companyId: string, year?: number): Observable<LeaveStatistics> {
    const options = { skipTransform: true };
    const params = year ? { year } : {};
    return this.api.get<LeaveStatistics>(`${this.baseEndpoint}/companies/${companyId}/leave-statistics`, params, options);
  }
}
