/**
 * Shift Models
 * 
 * Represents work shifts within a company
 * Matches backend Shift model and schema
 */

import { UUID, BaseTimestamps } from './base.model';

/**
 * Shift Interface
 * Represents a work shift
 */
export interface Shift extends BaseTimestamps {
  // Primary key
  id: UUID;  // shift_id in backend
  
  // Shift information
  shiftName: string;  // shift_name in backend
  startTime: string;  // start_time in backend (Time format)
  endTime: string;  // end_time in backend (Time format)
  
  // Foreign key
  companyId: UUID;  // company_id in backend
}

/**
 * Shift Create Request
 */
export interface ShiftCreate {
  shiftName: string;
  startTime: string;  // Time format: "HH:MM:SS"
  endTime: string;  // Time format: "HH:MM:SS"
}

/**
 * Shift Update Request
 */
export interface ShiftUpdate {
  shiftName?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Shift Response (from API)
 */
export interface ShiftResponse extends Shift {
  // All fields from Shift interface
}

/**
 * User Shift Assignment
 * Represents the assignment of a shift to an employee
 */
export interface UserShift {
  id: UUID;  // user_shift_id in backend
  companyEmployeeId: UUID;  // company_employee_id in backend
  shiftId: UUID;  // shift_id in backend
  createdAt: string;
}

/**
 * User Shift Assign Request
 */
export interface UserShiftAssign {
  companyEmployeeId: UUID;
  shiftId: UUID;
}

/**
 * User Shift Response (from API)
 */
export interface UserShiftResponse extends UserShift {
  // All fields from UserShift interface
}

/**
 * Shift Filters
 */
export interface ShiftFilters {
  search?: string;
  companyId?: UUID;
}

/**
 * Shift Statistics
 */
export interface ShiftStatistics {
  totalShifts: number;
  shiftsByCompany: Record<string, number>;
  employeesByShift: Record<string, number>;
}
