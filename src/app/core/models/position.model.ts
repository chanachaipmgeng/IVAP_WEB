/**
 * Position Models
 * 
 * Uses snake_case to match backend PositionResponse schema (position_schema.py)
 */

import { UUID } from './base.model';

/**
 * Position Interface
 * Matches PositionResponse schema from backend
 */
export interface Position {
  position_id: UUID;
  th_name: string;
  eng_name: string;
  company_id: UUID;
}

/**
 * Position Create Request
 * Matches PositionCreate schema from backend
 */
export interface PositionCreate {
  th_name: string;
  eng_name: string;
  company_id: UUID;
}

/**
 * Position Update Request
 * Matches PositionUpdate schema from backend
 */
export interface PositionUpdate {
  th_name?: string;
  eng_name?: string;
  company_id?: UUID;
}

/**
 * Position Response (from API)
 * Alias for Position - matches backend response
 */
export interface PositionResponse extends Position {
  // All fields from Position interface
}

/**
 * Position Filters
 */
export interface PositionFilters {
  search?: string;
  company_id?: UUID;
  page?: number;
  size?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Position Statistics
 */
export interface PositionStatistics {
  total_positions: number;
  positions_by_company: Record<string, number>;
}
