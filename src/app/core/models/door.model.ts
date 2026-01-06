/**
 * Door Models
 * 
 * Represents doors and access control permissions
 * Matches backend Door model and schema
 */

import { UUID, BaseTimestamps } from './base.model';

/**
 * Door Interface
 * Represents a door in the access control system
 */
export interface Door extends BaseTimestamps {
  // Primary key
  id: UUID;  // door_id in backend
  
  // Door information
  door_name: string;  // door_name in backend (snake_case)
  location?: string;  // location in backend
  
  // Foreign key
  company_id: UUID;  // company_id in backend (snake_case)
}

/**
 * Door Create Request
 */
export interface DoorCreate {
  door_name: string;  // snake_case to match backend
  location?: string;
}

/**
 * Door Update Request
 */
export interface DoorUpdate {
  door_name?: string;  // snake_case to match backend
  location?: string;
}

/**
 * Door Response (from API)
 */
export interface DoorResponse extends Door {
  // All fields from Door interface
}

/**
 * Door Permission Interface
 * Represents permission for an employee to access a door
 */
export interface DoorPermission extends BaseTimestamps {
  // Primary key
  id: UUID;  // permission_id in backend
  
  // Foreign keys
  door_id: UUID;  // door_id in backend (snake_case)
  company_employee_id: UUID;  // company_employee_id in backend (snake_case)
}

/**
 * Door Permission Create Request
 */
export interface DoorPermissionCreate {
  door_id: UUID;  // snake_case to match backend
  company_employee_id: UUID;  // snake_case to match backend
}

/**
 * Door Permission Response (from API)
 */
export interface DoorPermissionResponse extends DoorPermission {
  // All fields from DoorPermission interface
}

/**
 * Door Filters
 */
export interface DoorFilters {
  search?: string;
  company_id?: UUID;  // snake_case to match backend
  location?: string;
}

/**
 * Door Statistics
 */
export interface DoorStatistics {
  total_doors: number;  // snake_case to match backend
  doors_by_company: Record<string, number>;  // snake_case to match backend
  permissions_by_door: Record<string, number>;  // snake_case to match backend
}
