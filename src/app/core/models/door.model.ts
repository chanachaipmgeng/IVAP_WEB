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
  doorName: string;  // door_name in backend
  location?: string;  // location in backend
  
  // Foreign key
  companyId: UUID;  // company_id in backend
}

/**
 * Door Create Request
 */
export interface DoorCreate {
  doorName: string;
  location?: string;
}

/**
 * Door Update Request
 */
export interface DoorUpdate {
  doorName?: string;
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
  doorId: UUID;  // door_id in backend
  companyEmployeeId: UUID;  // company_employee_id in backend
}

/**
 * Door Permission Create Request
 */
export interface DoorPermissionCreate {
  doorId: UUID;
  companyEmployeeId: UUID;
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
  companyId?: UUID;
  location?: string;
}

/**
 * Door Statistics
 */
export interface DoorStatistics {
  totalDoors: number;
  doorsByCompany: Record<string, number>;
  permissionsByDoor: Record<string, number>;
}
