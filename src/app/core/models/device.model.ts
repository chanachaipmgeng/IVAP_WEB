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
 */
export interface Device {
  deviceId: string;  // UUID
  companyId: string;  // UUID
  deviceName: string;
  deviceType: DeviceType;
  location?: string;
  status: DeviceStatus;
  apiKey: string;
  lastSeen?: string;  // ISO datetime string
  createdAt: string;  // ISO datetime string
  updatedAt?: string;  // ISO datetime string
}

/**
 * Device Create Request (from backend DeviceCreate)
 */
export interface DeviceCreate {
  deviceName: string;
  deviceType?: DeviceType;
  location?: string;
  status?: DeviceStatus;
}

/**
 * Device Update Request (from backend DeviceUpdate)
 */
export interface DeviceUpdate {
  deviceName?: string;
  deviceType?: DeviceType;
  location?: string;
  status?: DeviceStatus;
}

/**
 * Device API Key Response (from backend DeviceApiKeyResponse)
 */
export interface DeviceApiKeyResponse {
  apiKey: string;
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
