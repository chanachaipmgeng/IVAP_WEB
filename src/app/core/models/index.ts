// Employee Models
export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId?: number;
  positionId?: number;
  companyId: number;
  isActive: boolean;
  faceImages?: string[];
}

// Department Models
export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  companyId: number;
}

// Position Models
export interface Position {
  id: number;
  name: string;
  code: string;
  description?: string;
  companyId: number;
}

// Device Models
export interface Device {
  id: number;
  name: string;
  deviceCode: string;
  deviceType: 'camera' | 'kiosk' | 'door';
  location?: string;
  isActive: boolean;
  companyId: number;
}

// Door Models
export interface Door {
  id: number;
  name: string;
  doorCode: string;
  location?: string;
  deviceId?: number;
  companyId: number;
}

export interface DoorPermission {
  doorId: number;
  employeeIds: number[];
}

// Event Models
export interface Event {
  id: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  publicUrl?: string;
  companyId: number;
  isActive: boolean;
}

export interface EventAttendee {
  id: number;
  eventId: number;
  name: string;
  email?: string;
  phone?: string;
  checkedIn: boolean;
  checkInTime?: string;
  faceImage?: string;
}

// Shift Models
export interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  companyId: number;
}

// Location Models
export interface CompanyLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  companyId: number;
}

// Company Models - Export from company.model.ts to avoid duplication
export type {
  Company,
  CompanyForm,
  CompanySettings,
  CompanyFilters,
  CompanyStatistics
} from './company.model';

// Role & Permission Models
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  companyId?: number;
}

// Report Models
export interface AttendanceReport {
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  status: 'present' | 'absent' | 'late' | 'early';
}

// Dashboard Models
export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  totalEvents: number;
  activeEvents: number;
  totalDevices: number;
  activeDevices: number;
}

// Visitor Models
export * from './visitor.model';

// Guest Models
export * from './guest.model';

// Vehicle Models
export * from './vehicle.model';

// Parking Models - Re-export with conflicts resolution
export type { ParkingVehicle, ParkingVehicleCreate, ParkingVehicleUpdate } from './parking.model';
export type { ParkingSpace, ParkingSpaceCreate, ParkingSpaceUpdate } from './parking.model';
export type { ParkingEvent, VehicleEntryRequest, VehicleExitRequest } from './parking.model';
export type { ParkingReservation, ParkingReservationCreate, ParkingReservationUpdate } from './parking.model';
export type { ParkingStatistics } from './parking.model';
// Only export parking-specific VehicleType, not the duplicate from vehicle
export type { ParkingSpaceStatus, ParkingEventType, ReservationStatus } from './parking.model';

// Visitor Extended Models - Re-export with conflicts resolution
export type { VisitorVisit as VisitorVisitExtended, VisitorVisitCreate } from './visitor-extended.model';
export type { VisitorInvitation as VisitorInvitationExtended, VisitorInvitationCreate, VisitorInvitationVerify } from './visitor-extended.model';
export type { VisitorBadge as VisitorBadgeExtended, VisitorBadgeIssue, VisitorBadgeReturn } from './visitor-extended.model';

// Department Models
export * from './department.model';

// Position Models
export * from './position.model';

// Shift Models
export * from './shift.model';

// Door Models
export * from './door.model';

// Event Models
export * from './event.model';

// Notification Models
export * from './notification.model';

// Performance Models
export * from './performance.model';

// Module Subscription Models
export * from './module-subscription.model';

// Timestamp Models
export * from './timestamp.model';

// Monitoring Models - Export with explicit names to avoid conflicts
export type {
  SystemMetrics,
  DeviceStatus,
  SecurityAlert,
  ActivityLog,
  BackendPerformanceMetrics as MonitoringPerformanceMetrics
} from './monitoring.model';
export type {
  DeviceStatusType,
  SecurityAlertType,
  SecurityAlertSeverity
} from './monitoring.model';

// Export Models
export * from './export.model';

// Safety Models
export * from './safety.model';

// Hardware Monitoring Models - Export with explicit names to avoid conflicts
export type {
  HardwareMetrics,
  MonitoringConfig,
  DeviceHealth,
  DevicesOverview
} from './hardware-monitoring.model';
export type {
  HardwareDeviceStatus,
  ProcessStatus,
  AlertType,
  HealthGrade
} from './hardware-monitoring.model';

// Template Management Models
export * from './template-management.model';

// Face Recognition Models
// export * from './face.model'; // File not found - commented out

// Admin System Models (re-export from system.model.ts)
export type {
  SystemStats,
  DeviceStats,
  ChartData,
  Activity,
  SystemHealth,
  PerformanceMetrics
} from './system.model';

// Device Models (re-export from device.model.ts)
export * from './device.model';

