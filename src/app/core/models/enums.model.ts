/**
 * System-wide Enums
 *
 * All enums used across the application
 * Must match backend enums exactly
 */

// ==================== User & Member ====================

/**
 * Actor Type Enum
 * Represents the type of actor/user in the system
 */
export enum ActorType {
  MEMBER = 'member',           // Regular member/employee
  GUEST = 'guest',             // Guest user
  ADMIN_SYSTEM = 'admin_system', // System administrator
  PUBLIC = 'public'            // Public user
}

/**
 * Member Type Enum
 * Sub-type for MEMBER actors
 */
export enum MemberType {
  ADMIN = 'admin',             // Company admin
  EMPLOYEE = 'employee'        // Regular employee
}

/**
 * Status Type Enum
 * General status for entities
 */
export enum StatusType {
  ENABLE = 'enable',
  DISABLE = 'disable'
}

// ==================== Employee & Company ====================

/**
 * Employment Type Enum
 * Must match backend EmpType enum
 */
export enum EmpType {
  PERMONTH = 'PERMONTH',       // Monthly paid employee
  PERDAY = 'PERDAY',           // Daily paid employee
  FULL_TIME = 'FULL_TIME',    // Full-time employee
  PART_TIME = 'PART_TIME'     // Part-time employee
}

/**
 * Company Role Type Enum
 * Must match backend CompanyRoleType enum
 */
export enum CompanyRoleType {
  EMPLOYEE = 'EMPLOYEE',       // Regular employee
  ADMIN_COMPANY = 'ADMIN_COMPANY', // Company admin
  // Aliases for backward compatibility
  EMP = 'EMPLOYEE',
  ADMIN = 'ADMIN_COMPANY'
}

/**
 * Access Level Enum
 */
export enum AccessLevel {
  STANDARD = 'standard',       // Standard access
  ELEVATED = 'elevated',       // Elevated access
  ADMIN = 'admin'              // Admin access
}

// ==================== Visitor Management ====================

/**
 * Visitor Type Enum
 */
export enum VisitorType {
  GUEST = 'guest',             // General guest
  VENDOR = 'vendor',           // Vendor/supplier
  CONTRACTOR = 'contractor',   // Contractor
  INTERVIEW = 'interview',     // Interview candidate
  DELIVERY = 'delivery'        // Delivery person
}

/**
 * Visitor Status Enum
 */
export enum VisitorStatus {
  PENDING = 'pending',         // Waiting for approval
  APPROVED = 'approved',       // Approved but not checked in
  CHECKED_IN = 'checked_in',   // Currently on premises
  CHECKED_OUT = 'checked_out', // Completed visit
  CANCELLED = 'cancelled',     // Visit cancelled
  EXPIRED = 'expired'          // Visit expired
}

/**
 * Visit Purpose Enum
 */
export enum VisitPurpose {
  MEETING = 'meeting',         // Business meeting
  INTERVIEW = 'interview',     // Job interview
  DELIVERY = 'delivery',       // Delivery
  MAINTENANCE = 'maintenance', // Maintenance work
  EVENT = 'event',             // Special event
  OTHER = 'other'              // Other purpose
}

// ==================== Guest Management ====================

/**
 * Guest Status Enum
 */
export enum GuestStatus {
  PENDING = 'pending',         // Not checked in
  CHECKED_IN = 'checked_in',   // Currently on premises
  CHECKED_OUT = 'checked_out', // Completed visit
  EXPIRED = 'expired',         // Visit expired
  CANCELLED = 'cancelled'      // Cancelled
}

// ==================== Leave Management ====================

/**
 * Leave Type Enum
 */
export enum LeaveType {
  SICK = 'sick',               // Sick leave
  ANNUAL = 'annual',           // Annual leave
  PERSONAL = 'personal',       // Personal leave
  MATERNITY = 'maternity',     // Maternity leave
  PATERNITY = 'paternity',     // Paternity leave
  UNPAID = 'unpaid',           // Unpaid leave
  OTHER = 'other'              // Other type
}

/**
 * Leave Status Enum
 */
export enum LeaveStatus {
  PENDING = 'pending',         // Awaiting approval
  APPROVED = 'approved',       // Approved
  REJECTED = 'rejected',       // Rejected
  CANCELLED = 'cancelled'      // Cancelled
}

// ==================== Verification ====================

/**
 * Verification Method Enum
 */
export enum VerificationMethod {
  FACE_RECOGNITION = 'face_recognition', // Face recognition
  QR_CODE = 'qr_code',                   // QR code scan
  RFID_CARD = 'rfid_card',               // RFID card
  PIN_CODE = 'pin_code',                 // PIN code
  FINGERPRINT = 'fingerprint',           // Fingerprint
  PASSWORD = 'password',                 // Password
  MOBILE_APP = 'mobile_app'              // Mobile app
}

/**
 * Verification Session Status Enum
 */
export enum VerificationSessionStatus {
  PENDING = 'pending',         // Not started
  IN_PROGRESS = 'in_progress', // In progress
  COMPLETED = 'completed',     // Successfully completed
  FAILED = 'failed',           // Failed
  EXPIRED = 'expired'          // Session expired
}

/**
 * Verification Type Enum
 */
export enum VerificationType {
  CHECK_IN = 'check_in',       // Check-in verification
  CHECK_OUT = 'check_out',     // Check-out verification
  DOOR_ACCESS = 'door_access', // Door access
  EVENT_ENTRY = 'event_entry'  // Event entry
}

// ==================== Parking ====================

/**
 * Parking Space Type Enum
 */
export enum ParkingSpaceType {
  STANDARD = 'standard',       // Standard parking
  HANDICAP = 'handicap',       // Handicap parking
  EV_CHARGING = 'ev_charging', // EV charging spot
  MOTORCYCLE = 'motorcycle',   // Motorcycle parking
  VISITOR = 'visitor'          // Visitor parking
}

/**
 * Parking Space Status Enum
 */
export enum ParkingSpaceStatus {
  AVAILABLE = 'available',     // Available
  OCCUPIED = 'occupied',       // Currently occupied
  RESERVED = 'reserved',       // Reserved
  MAINTENANCE = 'maintenance'  // Under maintenance
}

/**
 * Parking Reservation Status Enum
 */
export enum ParkingReservationStatus {
  PENDING = 'pending',         // Pending confirmation
  CONFIRMED = 'confirmed',     // Confirmed
  CANCELLED = 'cancelled',     // Cancelled
  COMPLETED = 'completed'      // Completed
}

// ==================== Vehicle ====================

/**
 * Vehicle Owner Type Enum
 */
export enum VehicleOwnerType {
  EMPLOYEE = 'employee',       // Employee vehicle
  VISITOR = 'visitor',         // Visitor vehicle
  GUEST = 'guest'              // Guest vehicle
}

/**
 * Vehicle Status Enum
 */
export enum VehicleStatus {
  PARKED = 'parked',           // Currently parked
  LEFT = 'left',               // Left the premises
  RESERVED = 'reserved'        // Reserved
}

// ==================== Event ====================

/**
 * Event Type Enum
 */
export enum EventType {
  CONFERENCE = 'conference',   // Conference
  MEETING = 'meeting',         // Meeting
  TRAINING = 'training',       // Training session
  WORKSHOP = 'workshop',       // Workshop
  SEMINAR = 'seminar',         // Seminar
  SOCIAL = 'social',           // Social event
  OTHER = 'other'              // Other
}

/**
 * Event Attendee Status Enum
 */
export enum EventAttendeeStatus {
  REGISTERED = 'registered',   // Registered
  CONFIRMED = 'confirmed',     // Confirmed
  CHECKED_IN = 'checked_in',   // Checked in
  CANCELLED = 'cancelled'      // Cancelled
}

// ==================== Timestamp ====================

/**
 * Timestamp Type Enum
 */
export enum TimestampType {
  CHECK_IN = 'check_in',       // Check in
  CHECK_OUT = 'check_out',     // Check out
  BREAK_START = 'break_start', // Break start
  BREAK_END = 'break_end'      // Break end
}

/**
 * Attendance Status Enum
 */
export enum AttendanceStatus {
  PRESENT = 'present',         // Present
  ABSENT = 'absent',           // Absent
  LATE = 'late',               // Late
  EARLY_LEAVE = 'early_leave', // Left early
  ON_LEAVE = 'on_leave'        // On leave
}

// ==================== Notification ====================

/**
 * Notification Type Enum
 */
export enum NotificationType {
  INFO = 'info',               // Information
  WARNING = 'warning',         // Warning
  ERROR = 'error',             // Error
  SUCCESS = 'success',         // Success
  ALERT = 'alert'              // Alert
}

/**
 * Notification Priority Enum
 */
export enum NotificationPriority {
  LOW = 'low',                 // Low priority
  MEDIUM = 'medium',           // Medium priority
  HIGH = 'high',               // High priority
  URGENT = 'urgent'            // Urgent
}

// ==================== Device ====================

/**
 * Device Type Enum
 */
export enum DeviceType {
  CAMERA = 'camera',           // Camera
  KIOSK = 'kiosk',             // Kiosk
  DOOR = 'door',               // Door controller
  MOBILE = 'mobile'            // Mobile device
}

/**
 * Device Status Enum
 */
export enum DeviceStatus {
  ONLINE = 'online',           // Online
  OFFLINE = 'offline',         // Offline
  MAINTENANCE = 'maintenance', // Under maintenance
  ERROR = 'error'              // Error state
}

// ==================== Company ====================

/**
 * Public Type Enum (Company visibility)
 */
export enum PublicType {
  PUBLIC = 'public',           // Public company
  PRIVATE = 'private'          // Private company
}

// ==================== Helper Functions ====================

/**
 * Get display name for enum value
 */
export function getEnumDisplayName(enumType: any, value: string): string {
  // Convert enum value to display name (e.g., 'check_in' -> 'Check In')
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get all enum values as array
 */
export function getEnumValues(enumType: any): string[] {
  return Object.values(enumType);
}

/**
 * Check if value is valid enum value
 */
export function isValidEnumValue(enumType: any, value: string): boolean {
  return Object.values(enumType).includes(value);
}

