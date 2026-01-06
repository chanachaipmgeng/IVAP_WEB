/**
 * Report Service
 * 
 * Service for generating and exporting reports
 * Matches backend reports routes at /api/v1/reports
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { handleApiResponse } from '../utils/response-handler';
import {
  AttendanceReport,
  AttendanceReportFilters,
  ExportFormat,
  ReportExportOptions
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseEndpoint = '/reports';

  constructor(private api: ApiService) {}

  /**
   * Get attendance report
   * Backend: GET /api/v1/reports/attendance
   */
  getAttendanceReport(filters: AttendanceReportFilters): Observable<AttendanceReport> {
    const params: any = {
      startDate: filters.startDate,
      endDate: filters.endDate
    };
    
    if (filters.employeeIds && filters.employeeIds.length > 0) {
      params.employeeIds = filters.employeeIds;
    }
    
    if (filters.departmentIds && filters.departmentIds.length > 0) {
      params.departmentIds = filters.departmentIds;
    }

    return this.api.get<any>(`${this.baseEndpoint}/attendance`, params).pipe(
      map(response => handleApiResponse<AttendanceReport>(response))
    );
  }

  /**
   * Export attendance report
   * Backend: POST /api/v1/reports/export-attendance
   */
  exportAttendanceReport(filters: AttendanceReportFilters, format: ExportFormat = 'excel'): Observable<Blob> {
    const params: any = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      format: format
    };
    
    if (filters.employeeIds && filters.employeeIds.length > 0) {
      params.employeeIds = filters.employeeIds;
    }
    
    if (filters.departmentIds && filters.departmentIds.length > 0) {
      params.departmentIds = filters.departmentIds;
    }

    return this.api.post<Blob>(
      `${this.baseEndpoint}/export-attendance`,
      {},
      params,
      { responseType: 'blob' }
    );
  }

  /**
   * Export employees report
   * Backend: POST /api/v1/reports/export-employees
   */
  exportEmployeesReport(format: ExportFormat = 'excel'): Observable<Blob> {
    return this.api.post<Blob>(
      `${this.baseEndpoint}/export-employees`,
      {},
      { format },
      { responseType: 'blob' }
    );
  }
}
