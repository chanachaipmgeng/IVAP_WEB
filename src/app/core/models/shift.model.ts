/**
 * Shift Models
 * 
 * Uses snake_case to match backend ShiftResponse schema (shift.py)
 */

import { UUID, BaseTimestamps } from './base.model';

/**
 * Shift Interface
 * Matches ShiftResponse schema from backend
 */
export interface Shift extends BaseTimestamps {
  shift_id: UUID;
  company_id: UUID;
  shift_name: string;
  start_time: string; // Time format: "HH:MM:SS"
  end_time: string; // Time format: "HH:MM:SS"
}

/**
 * Shift Create Request
 * Matches ShiftCreate schema from backend
 */
export interface ShiftCreate {
  shift_name: string;
  start_time: string; // Time format: "HH:MM:SS"
  end_time: string; // Time format: "HH:MM:SS"
}

/**
 * Shift Update Request
 * Matches ShiftUpdate schema from backend
 */
export interface ShiftUpdate {
  shift_name?: string;
  start_time?: string;
  end_time?: string;
}

/**
 * Shift Response (from API)
 * Alias for Shift - matches backend response
 */
export interface ShiftResponse extends Shift {
  // All fields from Shift interface
}

/**
 * User Shift Assignment
 * Matches UserShiftAssign schema from backend
 */
export interface UserShiftAssign {
  company_employee_id: UUID;
  shift_id: UUID;
}

/**
 * User Shift Response
 * Matches UserShiftResponse schema from backend
 */
export interface UserShift {
  user_shift_id: UUID;
  company_employee_id: UUID;
  shift_id: UUID;
  created_at: string;
}

/**
 * User Shift Response (from API)
 * Alias for UserShift - matches backend response
 */
export interface UserShiftResponse extends UserShift {
  // All fields from UserShift interface
}

/**
 * Shift Filters
 */
export interface ShiftFilters {
  search?: string;
  company_id?: UUID;
  page?: number;
  size?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Shift Statistics
 */
export interface ShiftStatistics {
  total_shifts: number;
  shifts_by_company: Record<string, number>;
  employees_by_shift: Record<string, number>;
}
