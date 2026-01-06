/**
 * Employee Display Models
 *
 * DTO (Data Transfer Object) for displaying employee information
 * Uses snake_case to match backend schemas
 * Combines CompanyEmployee + Member + related entity data
 */

import { UUID } from './base.model';
import { CompanyEmployee } from './company-employee.model';
import { Member } from './member.model';

/**
 * Employee Display Interface
 * Complete employee information for display purposes
 * Based on CompanyEmployeeResponse from backend with flattened structure
 */
export interface EmployeeDisplay {
  // From CompanyEmployee
  company_employee_id: UUID;
  company_id: UUID;
  employee_id: string;
  salary: number;
  boss_id: string;
  company_role_type: string; // CompanyRoleType enum
  emp_type: string; // EmpType enum
  start_date: string;

  // From Member (nested in CompanyEmployee)
  member_id: UUID;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  picture?: string;
  actor_type: string;
  member_type?: string;
  roles: string[];
  permissions: string[];

  // From Position (nested in CompanyEmployee)
  position_id?: UUID;
  position_th_name?: string;
  position_eng_name?: string;

  // From Department (nested in CompanyEmployee)
  department_id?: UUID;
  department_th_name?: string;
  department_eng_name?: string;

  // Computed/Display fields
  full_name: string;
  display_name: string;
  department_name?: string; // alias for department_th_name or department_eng_name
  position_name?: string; // alias for position_th_name or position_eng_name
  company_name?: string;
  boss_name?: string;

  // Status (derived, not from backend)
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';

  // Timestamps from member
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

/**
 * Employee List Item
 * Lightweight version for lists and tables
 */
export interface EmployeeListItem {
  company_employee_id: UUID;
  member_id: UUID;
  employee_id?: string;
  full_name: string;
  email: string;
  phone_number?: string;
  picture?: string;
  department_name?: string;
  position_name?: string;
  company_role_type: string;
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
  start_date: string;
}

/**
 * Employee Detail
 * Extended information for detail views
 */
export interface EmployeeDetail extends EmployeeDisplay {
  // Additional detail fields can be added here
  subordinates?: EmployeeListItem[];
}

/**
 * Employee Create Form Data
 * Used for creating new employee (Member + CompanyEmployee)
 * Maps to CompanyEmployeeCreate
 */
export interface EmployeeCreateForm {
  // Member data (via MemberInput)
  email: string;
  first_name?: string;
  last_name?: string;
  picture?: string;

  // CompanyEmployee data
  position_id?: UUID;
  department_id?: UUID;
  employee_id?: string;
  emp_type: string; // EmpType enum
  company_role_type: string; // CompanyRoleType enum
  salary?: number;
  boss_id?: string;
  start_date: string;
}

/**
 * Employee Update Form Data
 * Maps to CompanyEmployeeUpdate
 */
export interface EmployeeUpdateForm {
  // Member updates (via MemberInput)
  email?: string;
  first_name?: string;
  last_name?: string;
  picture?: string;

  // CompanyEmployee updates
  company_employee_id: UUID; // Required for update
  position_id?: UUID;
  department_id?: UUID;
  employee_id?: string;
  emp_type?: string;
  company_role_type?: string;
  salary?: number;
  boss_id?: string;
  start_date: string; // Required in backend
}

/**
 * Employee Filters for search/filter
 */
export interface EmployeeFilters {
  search?: string;
  company_id?: UUID;
  department_id?: UUID;
  position_id?: UUID;
  emp_type?: string;
  company_role_type?: string;
  boss_id?: string;
  // Pagination parameters
  page?: number;
  size?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Employee Statistics Dashboard
 */
export interface EmployeeStatistics {
  // Counts
  total_employees: number;
  active_employees: number;
  inactive_employees: number;

  // Distributions
  employees_by_department: Record<string, number>;
  employees_by_position: Record<string, number>;
  employees_by_emp_type: Record<string, number>;
  employees_by_role: Record<string, number>;

  // Metrics
  average_tenure?: number; // in months
  average_salary?: number;
}

// ==================== Helper Functions ====================

/**
 * Convert CompanyEmployee (from backend) to EmployeeDisplay
 * Backend returns CompanyEmployeeResponse which has nested member, position, department
 */
export function companyEmployeeToDisplay(companyEmployee: CompanyEmployee, options?: {
  company_name?: string;
  boss_name?: string;
}): EmployeeDisplay {
  const member = companyEmployee.member;
  const position = companyEmployee.position;
  const department = companyEmployee.department;

  const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();

  // Extract position/department names
  const positionName = position ? (position.th_name || position.eng_name) : undefined;
  const departmentName = department ? (department.th_name || department.eng_name) : undefined;

  return {
    // CompanyEmployee fields
    company_employee_id: companyEmployee.company_employee_id,
    company_id: companyEmployee.company_id,
    employee_id: companyEmployee.employee_id,
    salary: companyEmployee.salary,
    boss_id: companyEmployee.boss_id,
    company_role_type: companyEmployee.company_role_type,
    emp_type: companyEmployee.emp_type,
    start_date: companyEmployee.start_date,

    // Member fields (flattened)
    member_id: member.member_id,
    username: member.username || '',
    email: member.email || '',
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    phone_number: member.phone_number,
    picture: member.picture,
    actor_type: member.actor_type,
    member_type: member.member_type,
    roles: member.roles || [],
    permissions: member.permissions || [],

    // Position fields (flattened)
    position_id: position?.position_id,
    position_th_name: position?.th_name,
    position_eng_name: position?.eng_name,

    // Department fields (flattened)
    department_id: department?.department_id,
    department_th_name: department?.th_name,
    department_eng_name: department?.eng_name,

    // Computed
    full_name: fullName,
    display_name: fullName || member.username || member.email || '',
    department_name: departmentName,
    position_name: positionName,
    company_name: options?.company_name,
    boss_name: options?.boss_name,

    // Timestamps
    created_at: member.created_at,
    updated_at: member.updated_at,
    last_login_at: member.last_login_at,
  };
}

/**
 * Convert EmployeeDisplay to EmployeeListItem
 */
export function toEmployeeListItem(employee: EmployeeDisplay): EmployeeListItem {
  return {
    company_employee_id: employee.company_employee_id,
    member_id: employee.member_id,
    employee_id: employee.employee_id,
    full_name: employee.full_name,
    email: employee.email,
    phone_number: employee.phone_number,
    picture: employee.picture,
    department_name: employee.department_name,
    position_name: employee.position_name,
    company_role_type: employee.company_role_type,
    status: employee.status,
    start_date: employee.start_date,
  };
}

/**
 * Check if employee has permission
 */
export function hasEmployeePermission(employee: EmployeeDisplay, permission: string): boolean {
  return employee.permissions?.includes(permission) || false;
}

/**
 * Check if employee has role
 */
export function hasEmployeeRole(employee: EmployeeDisplay, role: string): boolean {
  return employee.roles?.includes(role) || false;
}

/**
 * Check if employee is admin
 */
export function isEmployeeAdmin(employee: EmployeeDisplay): boolean {
  return employee.company_role_type === 'ADMIN' || employee.company_role_type === 'admin';
}

/**
 * Get employee tenure in months
 */
export function getEmployeeTenure(employee: EmployeeDisplay): number {
  if (!employee.start_date) return 0;
  const startDate = new Date(employee.start_date);
  const endDate = new Date();
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                 (endDate.getMonth() - startDate.getMonth());
  return Math.max(0, months);
}

/**
 * Check if employee is still employed
 * Note: Backend doesn't have isActive/leftAt fields, so we assume active if exists
 */
export function isCurrentlyEmployed(employee: EmployeeDisplay): boolean {
  // If status is explicitly set to terminated, return false
  if (employee.status === 'terminated') return false;
  // Otherwise assume active if employee exists
  return true;
}
