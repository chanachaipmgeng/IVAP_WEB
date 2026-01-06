/**
 * Employee Display Models
 * 
 * DTO (Data Transfer Object) for displaying employee information
 * Combines Member + CompanyEmployee + related entity data
 */

import { UUID } from './base.model';
import { CompanyEmployee } from './company-employee.model';
import { Member } from './member.model';
import { ActorType, MemberType, EmpType, CompanyRoleType, AccessLevel } from './enums.model';

/**
 * Employee Display Interface
 * Complete employee information for display purposes
 * Includes CompanyEmployee fields + Member fields + related entities
 */
export interface EmployeeDisplay extends Omit<CompanyEmployee, 'position' | 'department'> {
  // Member fields
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  picture?: string;
  actorType: ActorType;
  memberType?: MemberType;
  roles: string[];
  permissions: string[];
  
  // Related entity names
  departmentName?: string;
  positionName?: string;
  companyName?: string;
  bossName?: string;
  
  // Aliases for backward compatibility
  department?: string;  // alias for departmentName
  position?: string;    // alias for positionName (overrides CompanyEmployee.position which is an object)
  status?: 'active' | 'inactive' | 'on_leave' | 'terminated'; // derived from isActive and leftAt
  avatar?: string;      // alias for picture
  
  // Additional info (optional, might not be loaded in all contexts)
  workInfo?: EmployeeWorkInfo;
  
  // Computed fields
  fullName: string;
  displayName: string;
  
  // Timestamps from member
  memberCreatedAt?: string;
  memberUpdatedAt?: string;
  lastLoginAt?: string;
}

/**
 * Employee List Item
 * Lightweight version for lists and tables
 */
export interface EmployeeListItem {
  id: UUID;
  memberId: UUID;
  employeeId?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  picture?: string;
  departmentName?: string;
  positionName?: string;
  companyRoleType: CompanyRoleType;
  isActive: boolean;
  joinedAt: string;
}

/**
 * Employee Detail
 * Extended information for detail views
 */
export interface EmployeeDetail extends EmployeeDisplay {
  // Additional detail fields
  personalInfo?: EmployeePersonalInfo;
  workInfo?: EmployeeWorkInfo;
  performanceInfo?: EmployeePerformanceInfo;
  subordinates?: EmployeeListItem[];
}

/**
 * Employee Personal Information
 */
export interface EmployeePersonalInfo {
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  idCardNumber?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    address?: string;
  };
}

/**
 * Employee Work Information
 */
export interface EmployeeWorkInfo {
  workLocation?: string;
  workSchedule?: string;
  workType?: 'full_time' | 'part_time' | 'contract' | 'intern';
  probationEndDate?: string;
  contractEndDate?: string;
  benefits?: string[];
  skills?: string[];
  certifications?: string[];
}

/**
 * Employee Performance Information
 */
export interface EmployeePerformanceInfo {
  lastReviewDate?: string;
  nextReviewDate?: string;
  performanceRating?: number;
  goalsAchieved?: number;
  totalGoals?: number;
  attendanceRate?: number;
  punctualityRate?: number;
}

/**
 * Employee Create Form Data
 * Used for creating new employee (Member + CompanyEmployee)
 */
export interface EmployeeCreateForm {
  // Member data
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  actorType: ActorType;
  memberType: MemberType;
  
  // CompanyEmployee data
  companyId: UUID;
  departmentId?: UUID;
  positionId?: UUID;
  employeeId?: string;
  empType: EmpType;
  companyRoleType: CompanyRoleType;
  accessLevel: AccessLevel;
  salary?: number;
  startDate: string;
  bossId?: string;
  
  // Additional data
  personalInfo?: Partial<EmployeePersonalInfo>;
  workInfo?: Partial<EmployeeWorkInfo>;
}

/**
 * Employee Update Form Data
 */
export interface EmployeeUpdateForm {
  // Member updates
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  picture?: string;
  
  // CompanyEmployee updates
  departmentId?: UUID;
  positionId?: UUID;
  employeeId?: string;
  empType?: EmpType;
  companyRoleType?: CompanyRoleType;
  accessLevel?: AccessLevel;
  salary?: number;
  bossId?: string;
  isActive?: boolean;
  leftAt?: string;
  
  // Additional updates
  personalInfo?: Partial<EmployeePersonalInfo>;
  workInfo?: Partial<EmployeeWorkInfo>;
}

/**
 * Employee Filters for search/filter
 */
export interface EmployeeFilters {
  search?: string;
  companyId?: UUID;
  departmentId?: UUID;
  positionId?: UUID;
  isActive?: boolean;
  empType?: EmpType;
  companyRoleType?: CompanyRoleType;
  accessLevel?: AccessLevel;
  joinedFrom?: string;
  joinedTo?: string;
}

/**
 * Employee Statistics Dashboard
 */
export interface EmployeeStatistics {
  // Counts
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  terminatedEmployees: number;
  onLeaveEmployees: number;
  newHiresThisMonth: number;
  newHiresThisYear: number;
  leftThisMonth: number;
  leftThisYear: number;
  
  // Distributions
  employeesByDepartment: Record<string, number>;
  employeesByPosition: Record<string, number>;
  employeesByEmpType: Record<EmpType, number>;
  employeesByRole: Record<CompanyRoleType, number>;
  
  // Aliases for backward compatibility
  departmentDistribution?: Record<string, number>;  // alias for employeesByDepartment
  positionDistribution?: Record<string, number>;    // alias for employeesByPosition
  
  // Metrics
  averageTenure: number; // in months
  averageSalary?: number;
  turnoverRate?: number; // percentage
}

// ==================== Helper Functions ====================

/**
 * Convert Member + CompanyEmployee to EmployeeDisplay
 */
export function createEmployeeDisplay(
  member: Member,
  companyEmployee: CompanyEmployee,
  options?: {
    departmentName?: string;
    positionName?: string;
    companyName?: string;
    bossName?: string;
  }
): EmployeeDisplay {
  const fullName = `${member.firstName} ${member.lastName}`.trim();
  
  // Determine status based on isActive and leftAt
  let status: 'active' | 'inactive' | 'on_leave' | 'terminated' = 'inactive';
  if (companyEmployee.leftAt) {
    status = 'terminated';
  } else if (companyEmployee.isActive) {
    status = 'active';
  }
  
  return {
    ...companyEmployee,
    // Member fields
    username: member.username,
    email: member.email,
    firstName: member.firstName,
    lastName: member.lastName,
    phoneNumber: member.phoneNumber,
    picture: member.picture,
    actorType: member.actorType,
    memberType: member.memberType,
    roles: member.roles,
    permissions: member.permissions,
    
    // Related entities
    departmentName: options?.departmentName,
    positionName: options?.positionName,
    companyName: options?.companyName,
    bossName: options?.bossName,
    
    // Aliases for backward compatibility
    department: options?.departmentName,
    position: options?.positionName,
    status,
    avatar: member.picture,
    
    // Computed
    fullName,
    displayName: fullName || member.username,
    
    // Timestamps
    memberCreatedAt: member.createdAt,
    memberUpdatedAt: member.updatedAt,
    lastLoginAt: member.lastLoginAt,
  };
}

/**
 * Convert EmployeeDisplay to EmployeeListItem
 */
export function toEmployeeListItem(employee: EmployeeDisplay): EmployeeListItem {
  return {
    id: employee.id,
    memberId: employee.memberId,
    employeeId: employee.employeeId,
    fullName: employee.fullName,
    email: employee.email,
    phoneNumber: employee.phoneNumber,
    picture: employee.picture,
    departmentName: employee.departmentName,
    positionName: employee.positionName,
    companyRoleType: employee.companyRoleType,
    isActive: employee.isActive ?? true,
    joinedAt: employee.joinedAt || employee.startDate || '',
  };
}

/**
 * Check if employee has permission
 */
export function hasEmployeePermission(employee: EmployeeDisplay, permission: string): boolean {
  return employee.permissions.includes(permission);
}

/**
 * Check if employee has role
 */
export function hasEmployeeRole(employee: EmployeeDisplay, role: string): boolean {
  return employee.roles.includes(role);
}

/**
 * Check if employee is admin
 */
export function isEmployeeAdmin(employee: EmployeeDisplay): boolean {
  return employee.companyRoleType === CompanyRoleType.ADMIN || 
         employee.accessLevel === AccessLevel.ADMIN;
}

/**
 * Get employee tenure in months
 */
export function getEmployeeTenure(employee: EmployeeDisplay): number {
  const startDateStr = employee.joinedAt || employee.startDate || '';
  if (!startDateStr) return 0;
  const startDate = new Date(startDateStr);
  const endDate = employee.leftAt ? new Date(employee.leftAt) : new Date();
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                 (endDate.getMonth() - startDate.getMonth());
  return Math.max(0, months);
}

/**
 * Check if employee is still employed
 */
export function isCurrentlyEmployed(employee: EmployeeDisplay): boolean {
  return (employee.isActive ?? true) && !employee.leftAt;
}

