/**
 * Employee Models
 * Models สำหรับ Employee Service
 * ตรงกับ backend schema: employee_timestamp_schema.py, member_schema.py
 */

import { UUID } from './base.model';
import { Member } from './member.model';
import { CompanyEmployee } from './company-employee.model';

/**
 * Employee Hierarchy Model (for org chart)
 */
export interface EmployeeHierarchy {
  id: UUID;
  name: string;
  position: string;
  department: string;
  level: number;
  children: EmployeeHierarchy[];
  isExpanded: boolean;
}

// Re-export from employee-display.model for convenience
export type {
  EmployeeDisplay,
  EmployeeListItem,
  EmployeeDetail,
  EmployeeCreateForm,
  EmployeeUpdateForm,
  EmployeeFilters,
  EmployeeStatistics
} from './employee-display.model';

// Re-export from member.model
export type { Member } from './member.model';

// Re-export from company-employee.model
export type { CompanyEmployee } from './company-employee.model';

