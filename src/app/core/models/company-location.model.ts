/**
 * Company Location Models
 * 
 * Uses snake_case to match backend CompanyLocationResponse schema (company_location_schema.py)
 */

import { UUID, BaseTimestamps } from './base.model';

/**
 * Location Type Enum
 * Matches LocationType enum from backend
 */
export enum LocationType {
  OFFICE = 'OFFICE',
  WAREHOUSE = 'WAREHOUSE',
  FACTORY = 'FACTORY',
  BRANCH = 'BRANCH',
  REMOTE = 'REMOTE',
  OTHER = 'OTHER'
}

/**
 * Company Location Interface
 * Matches CompanyLocationResponse schema from backend
 */
export interface CompanyLocation extends BaseTimestamps {
  location_id: UUID;
  company_id: UUID;
  latitude: number;
  longitude: number;
  radius: number;
  location_name: string;
  start_date: string; // datetime ISO string
  end_date: string; // datetime ISO string
  location_type: LocationType | string;
}

/**
 * Company Location Create Request
 * Matches CompanyLocationCreate schema from backend
 */
export interface CompanyLocationCreate {
  latitude: number;
  longitude: number;
  radius: number;
  location_name: string;
  start_date: string; // datetime ISO string
  end_date: string; // datetime ISO string
  location_type: LocationType | string;
}

/**
 * Company Location Update Request
 * Matches CompanyLocationUpdate schema from backend
 */
export interface CompanyLocationUpdate {
  latitude?: number;
  longitude?: number;
  radius?: number;
  location_name?: string;
  start_date?: string; // datetime ISO string
  end_date?: string; // datetime ISO string
  location_type?: LocationType | string;
}

/**
 * Company Location Response (from API)
 * Alias for CompanyLocation - matches backend response
 */
export interface CompanyLocationResponse extends CompanyLocation {
  // All fields from CompanyLocation interface
}

/**
 * Company Location Filters
 */
export interface CompanyLocationFilters {
  search?: string;
  company_id?: UUID;
  location_type?: LocationType | string;
  page?: number;
  size?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
