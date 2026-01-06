/**
 * Department Models
 * 
 * Represents departments within a company
 * Matches backend Department model and schema
 */

import { UUID, BaseTimestamps } from './base.model';

/**
 * Department Interface
 * Represents a department in a company
 * Matches backend DepartmentResponse schema
 */
export interface Department {
  // Primary key
  id: UUID;  // department_id in backend
  
  // Department information
  thName: string;  // th_name in backend
  engName: string;  // eng_name in backend
  
  // Foreign key
  companyId: UUID;  // company_id in backend
  
  // Timestamps (optional - may not be in backend response)
  createdAt?: string;  // created_at from backend (ISO datetime string)
  updatedAt?: string;  // updated_at from backend (ISO datetime string)
}

/**
 * Department Create Request
 */
export interface DepartmentCreate {
  thName: string;
  engName: string;
  companyId: UUID;
}

/**
 * Department Update Request
 */
export interface DepartmentUpdate {
  thName?: string;
  engName?: string;
  companyId?: UUID;
}

/**
 * Department Response (from API)
 */
export interface DepartmentResponse extends Department {
  // All fields from Department interface
}

/**
 * Department Filters
 */
export interface DepartmentFilters {
  search?: string;
  companyId?: UUID;
}

/**
 * Department Statistics
 */
export interface DepartmentStatistics {
  totalDepartments: number;
  departmentsByCompany: Record<string, number>;
}
