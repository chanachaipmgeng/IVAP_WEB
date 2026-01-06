/**
 * Models Index
 * 
 * This file re-exports all models from their respective files.
 * Legacy interfaces (Employee, Department, Position, Device, Door, Event, Shift, CompanyLocation, Role)
 * have been removed as they were redundant with snake_case models in separate files.
 * 
 * Use models from their respective files:
 * - Employee → Use CompanyEmployee from './company-employee.model'
 * - Department → Use Department from './department.model' (snake_case)
 * - Position → Use Position from './position.model' (snake_case)
 * - Device → Use Device from './device.model' (snake_case)
 * - Door → Use Door from './door.model' (snake_case)
 * - Event → Use Event from './event.model' (snake_case)
 * - Shift → Use Shift from './shift.model' (snake_case)
 * - CompanyLocation → Use CompanyLocation from './company-location.model' (snake_case)
 * - Role → Use Role from './rbac.model'
 */

// Company Models - Export from company.model.ts to avoid duplication
export type {
  Company,
  CompanyCreate,
  CompanyUpdate,
  CompanySettings,
  CompanyFilters,
  CompanyStatistics
} from './company.model';

// Role & Permission Models - Export from rbac.model.ts (explicit to avoid conflict with user.model.ts)
export type {
  Role,
  Permission,
  UserRole,
  RolePermission,
  RBACFilters,
  RBACStatistics,
  RoleForm,
  PermissionForm,
  UserRoleForm,
  PermissionCategory
} from './rbac.model';
// Note: Role interface in user.model.ts is different from rbac.model.ts
// This export uses Role from rbac.model.ts (the correct one for RBAC operations)
// If you need Role from user.model.ts, import it directly from './user.model'

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

// Department Models - Explicit export to avoid conflicts with company-employee.model
export type {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
  DepartmentFilters,
  DepartmentStatistics
} from './department.model';
// Note: DepartmentResponse is also exported from company-employee.model.ts with different structure
// Use DepartmentResponse from company-employee.model.ts for CompanyEmployee context

// Position Models - Explicit export to avoid conflicts with company-employee.model
export type {
  Position,
  PositionCreate,
  PositionUpdate,
  PositionFilters,
  PositionStatistics
} from './position.model';
// Note: PositionResponse is also exported from company-employee.model.ts with different structure
// Use PositionResponse from company-employee.model.ts for CompanyEmployee context

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

// Company Location Models (re-export from company-location.model.ts)
export * from './company-location.model';

// Member Models (re-export from member.model.ts)
export * from './member.model';

// Company Employee Models (re-export from company-employee.model.ts)
export * from './company-employee.model';

// Employee Display Models (re-export from employee-display.model.ts)
export * from './employee-display.model';

// Employee Models (re-export from employee.model.ts - contains EmployeeHierarchy only)
export * from './employee.model';

// User Models (re-export from user.model.ts - frontend-specific interface)
export type {
  User,
  UserFilters,
  UserStatistics
} from './user.model';
// Note: Role interface in user.model.ts is different from rbac.model.ts
// Use Role from './rbac.model' for RBAC operations
// Use Role from './user.model' only if needed for backward compatibility

