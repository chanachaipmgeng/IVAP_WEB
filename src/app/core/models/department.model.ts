/**
 * Department Models
 * 
 * Uses snake_case to match backend DepartmentResponse schema (department_schema.py)
 */

import { UUID } from './base.model';

/**
 * Department Interface
 * Matches DepartmentResponse schema from backend
 */
export interface Department {
  department_id: UUID;
  th_name: string;
  eng_name: string;
  company_id: UUID;
}

/**
 * Department Create Request
 * Matches DepartmentCreate schema from backend
 */
export interface DepartmentCreate {
  th_name: string;
  eng_name: string;
  company_id: UUID;
}

/**
 * Department Update Request
 * Matches DepartmentUpdate schema from backend
 */
export interface DepartmentUpdate {
  th_name?: string;
  eng_name?: string;
  company_id?: UUID;
}

/**
 * Department Response (from API)
 * Alias for Department - matches backend response
 */
export interface DepartmentResponse extends Department {
  // All fields from Department interface
}

/**
 * Department Filters
 */
export interface DepartmentFilters {
  search?: string;
  company_id?: UUID;
  page?: number;
  size?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Department Statistics
 */
export interface DepartmentStatistics {
  total_departments: number;
  departments_by_company: Record<string, number>;
}
