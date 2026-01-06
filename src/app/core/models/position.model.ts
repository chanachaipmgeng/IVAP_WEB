/**
 * Position Models
 * 
 * Represents positions/job titles within a company
 * Matches backend Position model and schema
 */

import { UUID, BaseTimestamps } from './base.model';

/**
 * Position Interface
 * Represents a job position in a company
 * Matches backend PositionResponse schema
 */
export interface Position {
  // Primary key
  id: UUID;  // position_id in backend
  
  // Position information
  thName: string;  // th_name in backend
  engName: string;  // eng_name in backend
  
  // Foreign key
  companyId: UUID;  // company_id in backend
  
  // Timestamps (optional - may not be in backend response)
  createdAt?: string;  // created_at from backend (ISO datetime string)
  updatedAt?: string;  // updated_at from backend (ISO datetime string)
}

/**
 * Position Create Request
 */
export interface PositionCreate {
  thName: string;
  engName: string;
  companyId: UUID;
}

/**
 * Position Update Request
 */
export interface PositionUpdate {
  thName?: string;
  engName?: string;
  companyId?: UUID;
}

/**
 * Position Response (from API)
 */
export interface PositionResponse extends Position {
  // All fields from Position interface
}

/**
 * Position Filters
 */
export interface PositionFilters {
  search?: string;
  companyId?: UUID;
}

/**
 * Position Statistics
 */
export interface PositionStatistics {
  totalPositions: number;
  positionsByCompany: Record<string, number>;
}
