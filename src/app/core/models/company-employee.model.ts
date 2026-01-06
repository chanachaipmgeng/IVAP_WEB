/**
 * Company Employee Models
 * 
 * Represents the association between a Member and a Company
 * Matches backend CompanyEmployee model
 */

import { UUID, BaseTimestamps } from './base.model';
import { EmpType, CompanyRoleType, AccessLevel } from './enums.model';

/**
 * Company Employee Interface
 * Represents a member's employment relationship with a company
 * ตรงกับ CompanyEmployeeResponse ใน backend
 */
export interface CompanyEmployee extends BaseTimestamps {
  // Primary key
  id: UUID;  // company_employee_id in backend
  
  // Foreign keys
  memberId: UUID;  // member_id in backend
  companyId: UUID;  // company_id in backend
  positionId?: UUID;  // position_id in backend
  departmentId?: UUID;  // department_id in backend
  
  // Employment identification
  employeeId: string;  // employee_id in backend (REQUIRED in backend)
  
  // Employment details (from backend)
  empType: EmpType;  // emp_type in backend
  companyRoleType: CompanyRoleType;  // company_role_type in backend
  salary: number;  // salary in backend (REQUIRED in backend)
  bossId: string;  // boss_id in backend (REQUIRED in backend)
  startDate: string;  // start_date in backend (REQUIRED in backend)
  
  // Nested objects from backend response
  member?: {
    memberId: UUID;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  };
  position?: {
    positionId: UUID;
    thName: string;
    engName: string;
  };
  department?: {
    departmentId: UUID;
    thName: string;
    engName: string;
  };
  
  // Frontend-only fields (not in backend schema)
  isPrimary?: boolean;   // Is this the primary company for this member
  isActive?: boolean;    // Derived from status or other fields
  accessLevel?: AccessLevel;  // Derived from companyRoleType
  joinedAt?: string;     // Same as startDate
  leftAt?: string;       // Not in backend schema
}

/**
 * Company Employee Create Request
 */
export interface CompanyEmployeeCreate {
  memberId: UUID;
  companyId: UUID;
  positionId?: UUID;
  departmentId?: UUID;
  employeeId?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  accessLevel?: AccessLevel;
  startDate?: string;
  empType?: EmpType;
  companyRoleType?: CompanyRoleType;
  salary?: number;
  bossId?: string;
}

/**
 * Company Employee Update Request
 */
export interface CompanyEmployeeUpdate {
  positionId?: UUID;
  departmentId?: UUID;
  employeeId?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  accessLevel?: AccessLevel;
  leftAt?: string;
  empType?: EmpType;
  companyRoleType?: CompanyRoleType;
  salary?: number;
  bossId?: string;
}

/**
 * Company Employee Response (from API)
 */
export interface CompanyEmployeeResponse extends CompanyEmployee {
  // All fields from CompanyEmployee interface
}

/**
 * Company Employee Filters
 */
export interface CompanyEmployeeFilters {
  search?: string;
  companyId?: UUID;
  departmentId?: UUID;
  positionId?: UUID;
  isActive?: boolean;
  isPrimary?: boolean;
  empType?: EmpType;
  companyRoleType?: CompanyRoleType;
  accessLevel?: AccessLevel;
}

/**
 * Company Employee Statistics
 */
export interface CompanyEmployeeStatistics {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  employeesByEmpType: Record<EmpType, number>;
  employeesByCompanyRole: Record<CompanyRoleType, number>;
  employeesByDepartment: Record<string, number>;
  employeesByPosition: Record<string, number>;
}

/**
 * Company Employee Summary (lightweight)
 */
export interface CompanyEmployeeSummary {
  id: UUID;
  memberId: UUID;
  companyId: UUID;
  employeeId?: string;
  isActive: boolean;
  isPrimary: boolean;
  companyRoleType: CompanyRoleType;
}

