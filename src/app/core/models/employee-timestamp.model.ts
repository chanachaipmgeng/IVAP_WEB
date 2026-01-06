/**
 * Employee Timestamp Models
 * 
 * Uses snake_case to match backend EmployeeTimestampResponse schema (employee_timestamp_schema.py)
 */

import { UUID, BaseTimestamps } from './base.model';
import { PositionResponse, DepartmentResponse } from './company-employee.model';

/**
 * Timestamp Type Enum
 */
export type TimestampType = 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';

/**
 * Timestamp Status Enum
 */
export type TimestampStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED';

/**
 * Member Response (simplified for timestamp)
 */
export interface MemberResponse {
  member_id: UUID;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Employee Model (for timestamp response)
 * Matches EmployeeModel schema from backend
 */
export interface EmployeeModel {
  member: MemberResponse;
  position?: PositionResponse;
  department?: DepartmentResponse;
  company_employee_id: UUID;
  employee_id: string;
  boss_id: string;
}

/**
 * Employee Timestamp Response
 * Matches EmployeeTimestampResponse schema from backend
 */
export interface EmployeeTimestamp extends BaseTimestamps {
  timestamp_id: UUID;
  company_id: UUID;
  company_employee_id: UUID;
  employee: EmployeeModel;
  timestamp: string; // datetime
  timestamp_type: TimestampType;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  photo_timestamp?: string;
  status: TimestampStatus;
  approved_by?: UUID;
  approved_at?: string; // datetime
  rejection_reason?: string;
}

/**
 * Employee Timestamp Create Request
 * Matches EmployeeTimestampCreate schema from backend
 */
export interface EmployeeTimestampCreate {
  company_employee_id: UUID;
  timestamp_type: TimestampType;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  photo_timestamp?: string;
}

/**
 * Employee Timestamp Update Request
 * Matches EmployeeTimestampUpdate schema from backend
 */
export interface EmployeeTimestampUpdate {
  timestamp_type?: TimestampType;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  photo_timestamp?: string;
}

/**
 * Employee Timestamp Status Update Request
 * Matches EmployeeTimestampStatusUpdate schema from backend
 */
export interface EmployeeTimestampStatusUpdate {
  status: TimestampStatus;
  rejection_reason?: string;
}

/**
 * Employee Timestamp Filters
 */
export interface EmployeeTimestampFilters {
  company_id?: UUID;
  company_employee_id?: UUID;
  timestamp_type?: TimestampType;
  status?: TimestampStatus;
  date_from?: string;
  date_to?: string;
  approved_by?: UUID;
}

