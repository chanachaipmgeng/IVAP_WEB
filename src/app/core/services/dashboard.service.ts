/**
 * Dashboard Service
 * 
 * Service for managing dashboard data and statistics
 * Matches backend dashboard routes
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UUID } from '../models/base.model';
import { EmployeeTimestamp } from '../models/timestamp.model';

/**
 * Dashboard Stats Response (from backend)
 */
export interface DashboardStatsResponse {
  summary: {
    check_ins_today: number;
  };
  chart_data: {
    check_ins_last_7_days: Array<{
      date: string;  // ISO date string
      count: number;
    }>;
  };
  recent_activity: Array<{
    employee_name: string;
    timestamp: string;  // ISO datetime string
    location_name?: string;
    timestamp_type: string;
  }>;
}

/**
 * Attendance Summary Response (from backend)
 */
export interface AttendanceSummaryResponse {
  totalEmployees: number;
  presentEmployees: number;
  absentEmployees: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private api: ApiService) {}

  /**
   * Get dashboard stats
   * Backend: GET /api/v1/dashboard/stats/{companyId}
   * @param companyId Company ID
   * @returns Observable containing dashboard stats
   */
  public getDashboardStats(companyId: UUID): Observable<DashboardStatsResponse> {
    return this.api.get<DashboardStatsResponse>(`/dashboard/stats/${companyId}`);
  }

  /**
   * Get attendance summary for a company
   * Backend: GET /api/v1/dashboard/company/{companyId}/attendance-summary
   * @param companyId Company ID
   * @returns Observable containing attendance summary
   */
  public getAttendanceSummary(companyId: UUID): Observable<AttendanceSummaryResponse> {
    return this.api.get<AttendanceSummaryResponse>(`/dashboard/company/${companyId}/attendance-summary`);
  }

  /**
   * Get attendance history for an employee
   * Backend: GET /api/v1/dashboard/employee/{employeeId}/attendance-history
   * @param employeeId Employee ID
   * @param startDate Start date for the history
   * @param endDate End date for the history
   * @returns Observable containing list of employee timestamps
   */
  public getAttendanceHistory(
    employeeId: UUID,
    startDate: Date | string,
    endDate: Date | string
  ): Observable<EmployeeTimestamp[]> {
    // Convert dates to ISO strings if needed
    const startDateStr = startDate instanceof Date ? startDate.toISOString() : startDate;
    const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;

    return this.api.get<any[]>(`/dashboard/employee/${employeeId}/attendance-history`, {
      start_date: startDateStr,
      end_date: endDateStr
    }).pipe(
      map(response => {
        // Transform backend response to EmployeeTimestamp array
        // Note: This assumes the response is already in the correct format
        // If transformation is needed, add it here
        return response.map((item: any) => item as EmployeeTimestamp);
      })
    );
  }
}
