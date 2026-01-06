import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Leave,
  LeaveBalance,
  CreateLeaveDto,
  UpdateLeaveDto,
  LeaveFilters
} from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private api = inject(ApiService);

  /**
   * Get all leaves with optional filters
   * Returns Leave[] with guaranteed id and days properties
   * Backend: GET /api/v1/leaves/leave-requests
   */
  getLeaves(filters?: LeaveFilters): Observable<Leave[]> {
    return this.api.get<any>('/leaves/leave-requests', filters).pipe(
      map((response: any) => {
        // Handle paginated response
        let leaves: any[] = [];
        if (response.data && Array.isArray(response.data)) {
          leaves = response.data;
        } else if (Array.isArray(response)) {
          leaves = response;
        }
        
        // Map backend response to frontend model with aliases
        // Backend returns snake_case, we need to ensure id and days are always present
        return leaves.map((leave: any) => {
          // Get leave_request_id from various possible field names
          const leaveRequestId = leave.leaveRequestId || leave.leave_request_id || leave.id || '';
          // Get days_requested from various possible field names
          const daysRequested = leave.daysRequested ?? leave.days_requested ?? leave.days ?? 0;
          
          return {
            ...leave,
            // Ensure required fields are always present
            leaveRequestId: leaveRequestId,
            id: leaveRequestId,  // REQUIRED alias
            daysRequested: daysRequested,
            days: daysRequested  // REQUIRED alias
          };
        });
      })
    );
  }

  /**
   * Get leave by ID
   * Backend: GET /api/v1/leaves/leave-requests/{leave_request_id}
   */
  getLeaveById(id: string): Observable<Leave> {
    return this.api.get<Leave>(`/leaves/leave-requests/${id}`).pipe(
      map((response: any) => {
        const leave = response.data || response;
        const leaveRequestId = leave.leaveRequestId || leave.leave_request_id || leave.id || id;
        const daysRequested = leave.daysRequested ?? leave.days_requested ?? leave.days ?? 0;
        
        return {
          ...leave,
          leaveRequestId: leaveRequestId,
          id: leaveRequestId,  // REQUIRED alias
          daysRequested: daysRequested,
          days: daysRequested  // REQUIRED alias
        };
      })
    );
  }

  /**
   * Create a new leave request
   * Backend: POST /api/v1/leaves/leave-requests
   */
  createLeave(data: CreateLeaveDto): Observable<Leave> {
    return this.api.post<Leave>('/leaves/leave-requests', data).pipe(
      map((response: any) => {
        const leave = response.data || response;
        const leaveRequestId = leave.leaveRequestId || leave.leave_request_id || leave.id || '';
        const daysRequested = leave.daysRequested ?? leave.days_requested ?? leave.days ?? 0;
        
        return {
          ...leave,
          leaveRequestId: leaveRequestId,
          id: leaveRequestId,  // REQUIRED alias
          daysRequested: daysRequested,
          days: daysRequested  // REQUIRED alias
        };
      })
    );
  }

  /**
   * Update an existing leave request
   * Backend: PUT /api/v1/leaves/leave-requests/{leave_request_id}
   */
  updateLeave(id: string, data: UpdateLeaveDto): Observable<Leave> {
    return this.api.put<Leave>(`/leaves/leave-requests/${id}`, data).pipe(
      map((response: any) => {
        const leave = response.data || response;
        const leaveRequestId = leave.leaveRequestId || leave.leave_request_id || leave.id || id;
        const daysRequested = leave.daysRequested ?? leave.days_requested ?? leave.days ?? 0;
        
        return {
          ...leave,
          leaveRequestId: leaveRequestId,
          id: leaveRequestId,  // REQUIRED alias
          daysRequested: daysRequested,
          days: daysRequested  // REQUIRED alias
        };
      })
    );
  }

  /**
   * Delete a leave request
   * Backend: DELETE /api/v1/leaves/leave-requests/{leave_request_id}
   */
  deleteLeave(id: string, employeeId: string): Observable<void> {
    return this.api.delete<void>(`/leaves/leave-requests/${id}`, { employee_id: employeeId });
  }

  /**
   * Approve a leave request
   * Backend: PUT /api/v1/leaves/leave-requests/{leave_request_id}/approve
   */
  approveLeave(id: string, approvalData?: any): Observable<Leave> {
    return this.api.put<Leave>(`/leaves/leave-requests/${id}/approve`, approvalData || {}).pipe(
      map((response: any) => {
        const leave = response.data || response;
        const leaveRequestId = leave.leaveRequestId || leave.leave_request_id || leave.id || id;
        const daysRequested = leave.daysRequested ?? leave.days_requested ?? leave.days ?? 0;
        
        return {
          ...leave,
          leaveRequestId: leaveRequestId,
          id: leaveRequestId,  // REQUIRED alias
          daysRequested: daysRequested,
          days: daysRequested  // REQUIRED alias
        };
      })
    );
  }

  /**
   * Reject a leave request
   * Backend: PUT /api/v1/leaves/leave-requests/{leave_request_id}/reject
   */
  rejectLeave(id: string, reason: string): Observable<Leave> {
    return this.api.put<Leave>(`/leaves/leave-requests/${id}/reject`, { reason }).pipe(
      map((response: any) => {
        const leave = response.data || response;
        const leaveRequestId = leave.leaveRequestId || leave.leave_request_id || leave.id || id;
        const daysRequested = leave.daysRequested ?? leave.days_requested ?? leave.days ?? 0;
        
        return {
          ...leave,
          leaveRequestId: leaveRequestId,
          id: leaveRequestId,  // REQUIRED alias
          daysRequested: daysRequested,
          days: daysRequested  // REQUIRED alias
        };
      })
    );
  }

  /**
   * Get leave balance for an employee
   * Backend: GET /api/v1/leaves/employees/{employee_id}/leave-balance
   */
  getLeaveBalance(employeeId: string): Observable<LeaveBalance[]> {
    return this.api.get<any>(`/leaves/employees/${employeeId}/leave-balance`).pipe(
      map((response: any) => {
        const balance = response.data || response;
        // Convert to array format if needed
        if (balance && !Array.isArray(balance)) {
          return [balance];
        }
        return balance || [];
      })
    );
  }

  /**
   * Get leave statistics
   * Backend: GET /api/v1/leaves/companies/{company_id}/leave-statistics
   */
  getLeaveStatistics(companyId: string, year?: number): Observable<any> {
    const params = year ? { year: year.toString() } : undefined;
    return this.api.get<any>(`/leaves/companies/${companyId}/leave-statistics`, params);
  }

  /**
   * Calculate number of days between two dates
   */
  calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  /**
   * Check if user can approve leave
   */
  canApproveLeave(leave: Leave, currentUserId: string): boolean {
    return leave.status === 'pending' && leave.employeeId !== currentUserId;
  }

  /**
   * Check if user can edit leave
   */
  canEditLeave(leave: Leave, currentUserId: string): boolean {
    return leave.status === 'pending' && leave.employeeId === currentUserId;
  }

  /**
   * Check if user can cancel leave
   */
  canCancelLeave(leave: Leave, currentUserId: string): boolean {
    return (leave.status === 'pending' || leave.status === 'approved') &&
           leave.employeeId === currentUserId;
  }
}

