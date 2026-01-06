/**
 * Timestamp Models
 * Models สำหรับ Timestamp Service
 * ตรงกับ backend schema: employee_timestamp_schema.py
 */

/**
 * Timestamp Type (from backend TimestampType enum)
 * Backend: CHECK_IN = 1, CHECK_OUT = 2, WARNING = 0, DISAPPROVE = 3
 * Frontend uses string values for API compatibility
 */
export type TimestampType = 'CHECK_IN' | 'CHECK_OUT' | 'WARNING' | 'DISAPPROVE' | 
  // Legacy/alternative values for backward compatibility
  'checkin' | 'checkout' | 'break_start' | 'break_end' | 'overtime_start' | 'overtime_end';

/**
 * Timestamp Status (from backend TimestampStatus enum)
 * Backend: PENDING = "pending", APPROVED = "approved", REJECTED = "rejected", AUTO_APPROVED = "auto_approved"
 */
export type TimestampStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

/**
 * Timestamp Record Model
 */
export interface TimestampRecord {
  id: string;
  userId: string;
  userName: string;
  type: TimestampType;
  timestamp: Date | string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracy?: number;
  };
  photo?: {
    data: string; // base64
    timestamp: Date | string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
  };
  status: TimestampStatus;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Backend Employee Timestamp Model (from API)
 * ตรงกับ EmployeeTimestampResponse ใน backend
 */
export interface EmployeeTimestamp {
  timestampId: string;  // timestampId from backend
  companyEmployeeId: string;  // company_employeeId from backend
  companyId: string;  // companyId from backend
  timestampType: TimestampType;  // timestampType from backend
  timestamp: Date | string;  // timestamp from backend (actual timestamp)
  locationName?: string;  // locationName from backend
  latitude?: number;  // latitude from backend
  longitude?: number;  // longitude from backend
  photoTimestamp?: string;  // photoTimestamp from backend
  status?: TimestampStatus;  // status from backend (PENDING, APPROVED, REJECTED)
  approvedBy?: string;  // approvedBy from backend (UUID)
  approvedAt?: Date | string;  // approvedAt from backend
  rejectionReason?: string;  // rejectionReason from backend
  createdAt?: Date | string;  // createdAt from backend
  updatedAt?: Date | string;  // updatedAt from backend
  // Nested employee object from backend
  employee?: {
    member: {
      memberId: string;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
    position?: {
      positionId: string;
      thName: string;
      engName: string;
    };
    department?: {
      departmentId: string;
      thName: string;
      engName: string;
    };
    companyEmployeeId: string;
    employeeId: string;
    bossId: string;
  };
}

/**
 * Employee Timestamp Create Request
 */
export interface EmployeeTimestampCreate {
  companyEmployeeId: string;
  timestampType: TimestampType;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  photoTimestamp?: string;
}

/**
 * Employee Timestamp Update Request
 */
export interface EmployeeTimestampUpdate {
  timestampType?: TimestampType;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  photoTimestamp?: string;
  status?: TimestampStatus;
}

/**
 * Location Settings Model
 */
export interface LocationSettings {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  isActive: boolean;
  allowedTypes: TimestampType[];
  workingHours: {
    start: string; // HH:mm format
    end: string; // HH:mm format
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  timezone: string;
}

/**
 * Geofence Event Model
 */
export interface GeofenceEvent {
  id: string;
  userId: string;
  locationId: string;
  eventType: 'enter' | 'exit';
  timestamp: Date | string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  accuracy: number;
}

/**
 * Timestamp Stats Model
 */
export interface TimestampStats {
  totalRecords: number;
  todayRecords: number;
  thisWeekRecords: number;
  thisMonthRecords: number;
  pendingApprovals: number;
  averageCheckinTime: string;
  averageCheckoutTime: string;
  lateCheckins: number;
  earlyCheckouts: number;
}

