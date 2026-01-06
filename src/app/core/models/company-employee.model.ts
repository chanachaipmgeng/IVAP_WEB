/**
 * Company Employee Models
 * 
 * Uses snake_case to match backend CompanyEmployeeResponse schema (company_employee_schema.py)
 */

import { UUID } from './base.model';
import { Member } from './member.model';

/**
 * Member Input (for create/update)
 * Matches MemberInput schema from backend
 */
export interface MemberInput {
  member_id?: UUID;
  email: string;
  first_name?: string;
  last_name?: string;
  picture?: string;
}

/**
 * Position Response
 * Matches PositionResponse schema from backend
 */
export interface PositionResponse {
  position_id: UUID;
  th_name: string;
  eng_name: string;
}

/**
 * Department Response
 * Matches DepartmentResponse schema from backend
 */
export interface DepartmentResponse {
  department_id: UUID;
  th_name: string;
  eng_name: string;
}

/**
 * Position Input (for create/update)
 * Matches PositionInput schema from backend
 */
export interface PositionInput {
  position_id: UUID;
  th_name: string;
  eng_name: string;
}

/**
 * Department Input (for create/update)
 * Matches DepartmentInput schema from backend
 */
export interface DepartmentInput {
  department_id: UUID;
  th_name: string;
  eng_name: string;
}

/**
 * Company Employee Response
 * Matches CompanyEmployeeResponse schema from backend
 */
export interface CompanyEmployee {
  company_employee_id: UUID;
  company_id: UUID;
  member: Member;
  position?: PositionResponse;
  department?: DepartmentResponse;
  employee_id: string;
  salary: number;
  boss_id: string;
  company_role_type: string; // CompanyRoleType enum
  emp_type: string; // EmpType enum
  start_date: string;
}

/**
 * Company Employee Create Request
 * Matches CompanyEmployeePost schema from backend
 */
export interface CompanyEmployeeCreate {
  member: MemberInput;
  position?: PositionInput;
  department?: DepartmentInput;
  employee_id?: string;
  salary?: number;
  boss_id?: string;
  company_role_type: string; // CompanyRoleType enum
  emp_type: string; // EmpType enum
  start_date: string;
}

/**
 * Company Employee Update Request
 * Matches CompanyEmployeeUpdate schema from backend
 */
export interface CompanyEmployeeUpdate {
  member: MemberInput;
  position?: PositionInput;
  department?: DepartmentInput;
  employee_id?: string;
  salary?: number;
  boss_id?: string;
  company_employee_id: UUID;
  company_role_type: string; // CompanyRoleType enum
  emp_type: string; // EmpType enum
  start_date: string;
}

/**
 * Company Employee Filters
 */
export interface CompanyEmployeeFilters {
  search?: string;
  company_id?: UUID;
  department_id?: UUID;
  position_id?: UUID;
  company_role_type?: string;
  emp_type?: string;
  boss_id?: string;
}
