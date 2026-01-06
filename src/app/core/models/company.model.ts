/**
 * Company Models
 * 
 * Uses snake_case to match backend CompanyResponse schema (company_schema.py)
 */

import { UUID, BaseTimestamps } from './base.model';

/**
 * Company Interface
 * Matches CompanyResponse schema from backend
 */
export interface Company extends BaseTimestamps {
  company_id: UUID;
  company_name: string;
  company_code: string;
  company_info: string;
  address: string;
  latitude: number;
  longitude: number;
  picture?: string;
  status: 'PUBLIC' | 'PENDING' | number; // PublicType enum
  owner_name: string;
  contact: string;
}

/**
 * Company Create Request
 * Matches CompanyBase schema from backend
 */
export interface CompanyCreate {
  company_name: string;
  company_code: string;
  company_info: string;
  address: string;
  latitude: number;
  longitude: number;
  picture?: string;
  status: 'PUBLIC' | 'PENDING' | number;
  owner_name: string;
  contact: string;
}

/**
 * Company Update Request
 * Matches CompanyUpdate schema from backend
 */
export interface CompanyUpdate {
  company_name?: string;
  company_code?: string;
  company_info?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  picture?: string;
  status?: 'PUBLIC' | 'PENDING' | number;
  owner_name?: string;
  contact?: string;
}

/**
 * Company Settings
 * Matches CompanySettingsResponse schema from backend
 */
export interface CompanySettings {
  company_id: UUID;
  max_users: number;
  max_devices: number;
  max_storage_gb: number;
  subscription_type: string;
  features: string[];
  additional_settings: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Company Settings Update
 * Matches CompanySettingsUpdate schema from backend
 */
export interface CompanySettingsUpdate {
  max_users?: number;
  max_devices?: number;
  max_storage_gb?: number;
  subscription_type?: string;
  features?: string[];
  additional_settings?: Record<string, any>;
}

/**
 * Company Statistics
 * Matches CompanyStatistics schema from backend
 */
export interface CompanyStatistics {
  total_companies: number;
  public_companies: number;
  pending_companies: number;
  suspended_companies: number;
}

/**
 * Company Filters
 */
export interface CompanyFilters {
  search?: string;
  status?: 'PUBLIC' | 'PENDING' | number;
  owner_name?: string;
}
