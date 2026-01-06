/**
 * Device Model
 *
 * Interfaces and types for device management
 * Matches backend device schemas
 */

/**
 * Device Type (from backend DeviceType enum)
 */
export type DeviceType = 'KIOSK' | 'DOOR' | 'ELEVATOR' | 'CCTV' | 'MOBILE';

/**
 * Device Status (from backend DeviceStatus enum)
 */
export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'DISABLED';

/**
 * Device Response (from backend DeviceResponse)
 * Uses snake_case to match backend (backend supports both via populate_by_name)
 */
export interface Device {
  device_id: string;  // UUID (alias: deviceId)
  company_id: string;  // UUID (alias: companyId)
  device_name: string;  // (alias: deviceName)
  device_type: DeviceType;  // (alias: deviceType)
  location?: string;
  status: DeviceStatus;
  api_key: string;  // (alias: apiKey)
  last_seen?: string;  // ISO datetime string (alias: lastSeen)
  created_at: string;  // ISO datetime string (alias: createdAt)
  updated_at?: string;  // ISO datetime string (alias: updatedAt)
}

/**
 * Device Create Request (from backend DeviceCreate)
 * Uses snake_case to match backend
 */
export interface DeviceCreate {
  device_name: string;
  device_type?: DeviceType;
  location?: string;
  status?: DeviceStatus;
}

/**
 * Device Update Request (from backend DeviceUpdate)
 * Uses snake_case to match backend
 */
export interface DeviceUpdate {
  device_name?: string;
  device_type?: DeviceType;
  location?: string;
  status?: DeviceStatus;
}

/**
 * Device API Key Response (from backend DeviceApiKeyResponse)
 * Uses snake_case to match backend
 */
export interface DeviceApiKeyResponse {
  api_key: string;  // (alias: apiKey)
}

/**
 * Device Filters for API queries
 */
export interface DeviceFilters {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
