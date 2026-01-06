/**
 * Report Models
 * 
 * Models for report generation and export
 * Matches backend reports_schema.py
 */

import { UUID } from './base.model';

/**
 * Attendance Report Row
 */
export interface AttendanceReportRow {
  date: string;  // ISO date string
  employeeName: string;
  checkInTime?: string;  // ISO datetime string
  checkOutTime?: string;  // ISO datetime string
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
}

/**
 * Attendance Report
 */
export interface AttendanceReport {
  startDate: string;  // ISO date string
  endDate: string;  // ISO date string
  generatedAt: string;  // ISO datetime string
  data: AttendanceReportRow[];
}

/**
 * Attendance Report Filters
 */
export interface AttendanceReportFilters {
  startDate: string;  // ISO date string
  endDate: string;  // ISO date string
  employeeIds?: UUID[];
  departmentIds?: UUID[];
}

/**
 * Export Format
 */
export type ExportFormat = 'excel' | 'csv';

/**
 * Report Export Options
 */
export interface ReportExportOptions {
  format: ExportFormat;
  startDate?: string;
  endDate?: string;
  employeeIds?: UUID[];
  departmentIds?: UUID[];
}
