/**
 * Parking Management Models
 * 
 * Complete parking models matching backend structure
 * Includes ParkingSpace, Vehicle, ParkingEvent, Reservation
 */

import { UUID, BaseTimestamps } from './base.model';
import { PaginatedResponse } from './base.model';

// ==================== Enums ====================

export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'van' | 'bus' | 'other';
export type ParkingSpaceStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type ParkingEventType = 'entry' | 'exit' | 'violation' | 'reservation_checkin' | 'reservation_cancelled';
export type ReservationStatus = 'active' | 'completed' | 'cancelled' | 'expired';

// ==================== Parking Vehicle ====================

/**
 * Parking Vehicle Interface
 * ตรงกับ VehicleResponse ใน backend (parking_schema.py)
 */
export interface ParkingVehicle extends BaseTimestamps {
  vehicleId: UUID;  // vehicle_id from backend (UUID, REQUIRED)
  companyId: UUID;  // company_id from backend (UUID, REQUIRED)
  
  // Vehicle identification (from VehicleBase)
  plateNumber: string;  // plate_number from backend (REQUIRED, min_length=1, max_length=20)
  plateCountry?: string;  // plate_country from backend (optional, default="TH", max_length=10)
  plateProvince?: string;  // plate_province from backend (optional, max_length=20)
  
  // Vehicle details (from VehicleBase)
  vehicleType: VehicleType;  // vehicle_type from backend (VehicleType enum, REQUIRED)
  make?: string;  // make from backend (optional, max_length=50)
  model?: string;  // model from backend (optional, max_length=50)
  color?: string;  // color from backend (optional, max_length=30)
  year?: number;  // year from backend (optional, ge=1900, le=2100)
  
  // Owner information (from VehicleBase)
  ownerId?: UUID;  // owner_id from backend (optional, UUID)
  ownerName?: string;  // owner_name from backend (optional, max_length=100)
  ownerPhone?: string;  // owner_phone from backend (optional, max_length=20)
  ownerEmail?: string;  // owner_email from backend (optional, max_length=100)
  
  // Parking permissions (from VehicleBase)
  hasParkingPermission: boolean;  // has_parking_permission from backend (default=False)
  allowedZones?: string;  // allowed_zones from backend (optional, comma-separated)
  priorityLevel: number;  // priority_level from backend (default=1, ge=1, le=10)
  
  // Security (from VehicleBase)
  isBlacklisted: boolean;  // is_blacklisted from backend (default=False)
  blacklistReason?: string;  // blacklist_reason from backend (optional)
  
  // Current status (from VehicleResponse)
  lastSeen?: string;  // last_seen from backend (optional, datetime)
  currentSpaceId?: string;  // current_space_id from backend (optional, string)
}

export interface ParkingVehicleCreate {
  plateNumber: string;
  plateCountry?: string;
  plateProvince?: string;
  
  vehicleType: VehicleType;
  make?: string;
  model?: string;
  color?: string;
  year?: number;
  
  ownerId?: UUID;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  
  hasParkingPermission?: boolean;
  allowedZones?: string;
  priorityLevel?: number;
  
  isBlacklisted?: boolean;
  blacklistReason?: string;
}

export interface ParkingVehicleUpdate {
  plateNumber?: string;
  vehicleType?: VehicleType;
  make?: string;
  model?: string;
  color?: string;
  year?: number;
  
  ownerId?: UUID;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  
  hasParkingPermission?: boolean;
  allowedZones?: string;
  priorityLevel?: number;
  
  isBlacklisted?: boolean;
  blacklistReason?: string;
}

// ==================== Parking Space ====================

/**
 * Parking Space Interface
 * ตรงกับ ParkingSpaceResponse ใน backend (parking_schema.py)
 */
export interface ParkingSpace extends BaseTimestamps {
  spaceId: string;  // space_id from backend (string, REQUIRED)
  companyId: UUID;  // company_id from backend (UUID, REQUIRED)
  
  // Location (from ParkingSpaceBase)
  spaceNumber: string;  // space_number from backend (REQUIRED, min_length=1, max_length=20)
  zone?: string;  // zone from backend (optional, max_length=50)
  floor?: number;  // floor from backend (optional, int)
  row?: string;  // row from backend (optional, max_length=10)
  position?: string;  // position from backend (optional, max_length=10)
  
  // Dimensions (from ParkingSpaceBase)
  width?: number;  // width from backend (optional, float, ge=0, in meters)
  length?: number;  // length from backend (optional, float, ge=0, in meters)
  height?: number;  // height from backend (optional, float, ge=0, in meters)
  maxVehicleType?: VehicleType;  // max_vehicle_type from backend (optional, VehicleType enum)
  
  // Features (from ParkingSpaceBase)
  isHandicapAccessible: boolean;  // is_handicap_accessible from backend (default=False)
  isElectricVehicleReady: boolean;  // is_electric_vehicle_ready from backend (default=False)
  hourlyRate?: number;  // hourly_rate from backend (optional, float, ge=0)
  
  // Reservation (from ParkingSpaceBase)
  isReservable: boolean;  // is_reservable from backend (default=True)
  reservationDurationHours: number;  // reservation_duration_hours from backend (default=24, ge=1)
  
  // Current status (from ParkingSpaceResponse)
  status: ParkingSpaceStatus;  // status from backend (ParkingSpaceStatus enum, REQUIRED)
  currentVehiclePlate?: string;  // current_vehicle_plate from backend (optional)
  currentOccupantId?: UUID;  // current_occupant_id from backend (optional, UUID)
  occupiedSince?: string;  // occupied_since from backend (optional, datetime)
}

export interface ParkingSpaceCreate {
  spaceNumber: string;
  zone?: string;
  floor?: number;
  row?: string;
  position?: string;
  
  width?: number;
  length?: number;
  height?: number;
  maxVehicleType?: VehicleType;
  
  isHandicapAccessible?: boolean;
  isElectricVehicleReady?: boolean;
  hourlyRate?: number;
  
  isReservable?: boolean;
  reservationDurationHours?: number;
}

export interface ParkingSpaceUpdate {
  spaceNumber?: string;
  zone?: string;
  floor?: number;
  status?: ParkingSpaceStatus;
  
  isHandicapAccessible?: boolean;
  isElectricVehicleReady?: boolean;
  hourlyRate?: number;
  
  isReservable?: boolean;
  reservationDurationHours?: number;
}

// ==================== Parking Event ====================

/**
 * Parking Event Interface
 * ตรงกับ ParkingEventResponse ใน backend (parking_schema.py)
 */
export interface ParkingEvent extends BaseTimestamps {
  eventId: UUID;  // event_id from backend (UUID, REQUIRED)
  companyId: UUID;  // company_id from backend (UUID, REQUIRED)
  
  // Event details (from ParkingEventBase)
  eventType: ParkingEventType;  // event_type from backend (ParkingEventType enum, REQUIRED)
  spaceId?: string;  // space_id from backend (optional, string)
  vehicleId?: UUID;  // vehicle_id from backend (optional, UUID)
  plateNumber?: string;  // plate_number from backend (optional, max_length=20)
  plateConfidence?: number;  // plate_confidence from backend (optional, float, ge=0, le=1)
  
  // Timing (from ParkingEventResponse)
  entryTime?: string;  // entry_time from backend (optional, datetime)
  exitTime?: string;  // exit_time from backend (optional, datetime)
  durationMinutes?: number;  // duration_minutes from backend (optional, int)
  
  // Pricing (from ParkingEventResponse)
  hourlyRate?: number;  // hourly_rate from backend (optional, float)
  totalCost?: number;  // total_cost from backend (optional, float)
  paymentStatus?: string;  // payment_status from backend (optional, string)
  paymentMethod?: string;  // payment_method from backend (optional, string, max_length=20)
  
  // Reservation (from ParkingEventResponse)
  reservationId?: string;  // reservation_id from backend (optional, string)
  
  // Violation (from ParkingEventResponse)
  violationType?: string;  // violation_type from backend (optional, string)
  violationDescription?: string;  // violation_description from backend (optional, string)
  fineAmount?: number;  // fine_amount from backend (optional, float)
  
  // Images (from ParkingEventResponse)
  entryImagePath?: string;  // entry_image_path from backend (optional, string)
  exitImagePath?: string;  // exit_image_path from backend (optional, string)
  plateImagePath?: string;  // plate_image_path from backend (optional, string)
  
  // Metadata (from ParkingEventBase)
  notes?: string;  // notes from backend (optional, string)
  eventMetadata?: string;  // event_metadata from backend (optional, JSON string)
}

export interface VehicleEntryRequest {
  plateNumber: string;
  plateConfidence?: number;
  spaceId?: string;
  entryImage?: string;
  notes?: string;
}

export interface VehicleExitRequest {
  plateNumber: string;
  exitImage?: string;
  paymentMethod?: string;
  notes?: string;
}

// ==================== Parking Reservation ====================

/**
 * Parking Reservation Interface
 * ตรงกับ ParkingReservationResponse ใน backend (parking_schema.py)
 */
export interface ParkingReservation extends BaseTimestamps {
  reservationId: string;  // reservation_id from backend (string, REQUIRED)
  companyId: UUID;  // company_id from backend (UUID, REQUIRED)
  
  // Reservation details (from ParkingReservationBase)
  spaceId: string;  // space_id from backend (string, REQUIRED)
  vehicleId?: UUID;  // vehicle_id from backend (optional, UUID)
  plateNumber?: string;  // plate_number from backend (optional, max_length=20)
  
  // Reserver information (from ParkingReservationBase)
  reserverId?: UUID;  // reserver_id from backend (optional, UUID, member_id)
  reserverName: string;  // reserver_name from backend (REQUIRED, max_length=100)
  reserverPhone?: string;  // reserver_phone from backend (optional, max_length=20)
  reserverEmail?: string;  // reserver_email from backend (optional, max_length=100)
  
  // Schedule (from ParkingReservationBase)
  startTime: string;  // start_time from backend (datetime, REQUIRED)
  endTime: string;  // end_time from backend (datetime, REQUIRED)
  durationHours: number;  // duration_hours from backend (int, REQUIRED)
  
  // Recurring (from ParkingReservationBase)
  isRecurring: boolean;  // is_recurring from backend (default=False)
  recurringPattern?: string;  // recurring_pattern from backend (optional, max_length=50)
  
  // Current status (from ParkingReservationResponse)
  status: ReservationStatus;  // status from backend (string, REQUIRED, max_length=20)
  hourlyRate?: number;  // hourly_rate from backend (optional, float)
  totalCost?: number;  // total_cost from backend (optional, float)
  paymentStatus: string;  // payment_status from backend (string, REQUIRED)
  
  // Actual times (from ParkingReservationResponse)
  actualStartTime?: string;  // actual_start_time from backend (optional, datetime)
  actualEndTime?: string;  // actual_end_time from backend (optional, datetime)
  checkInTime?: string;  // check_in_time from backend (optional, datetime)
  checkOutTime?: string;  // check_out_time from backend (optional, datetime)
  
  // QR Code (from ParkingReservationResponse)
  qrCode?: string;  // qr_code from backend (optional, string)
  
  // Notes (from ParkingReservationBase)
  notes?: string;  // notes from backend (optional, string)
}

export interface ParkingReservationCreate {
  spaceId: string;
  vehicleId?: UUID;
  plateNumber?: string;
  
  reserverId?: UUID;
  reserverName: string;
  reserverPhone?: string;
  reserverEmail?: string;
  
  startTime: string;
  endTime: string;
  
  isRecurring?: boolean;
  recurringPattern?: string;
  
  notes?: string;
}

export interface ParkingReservationUpdate {
  startTime?: string;
  endTime?: string;
  status?: ReservationStatus;
  notes?: string;
}

// ==================== Parking Statistics ====================

/**
 * Parking Statistics Interface
 * ตรงกับ ParkingStatistics ใน backend (parking_schema.py)
 */
export interface ParkingStatistics {
  // Space statistics (from ParkingStatistics)
  totalSpaces: number;  // total_spaces from backend (int, REQUIRED)
  availableSpaces: number;  // available_spaces from backend (int, REQUIRED)
  occupiedSpaces: number;  // occupied_spaces from backend (int, REQUIRED)
  reservedSpaces: number;  // reserved_spaces from backend (int, REQUIRED)
  maintenanceSpaces: number;  // maintenance_spaces from backend (int, REQUIRED)
  
  // Vehicle statistics (from ParkingStatistics)
  totalVehicles: number;  // total_vehicles from backend (int, REQUIRED)
  currentlyParked: number;  // currently_parked from backend (int, REQUIRED)
  
  // Rates (from ParkingStatistics)
  occupancyRate: number;  // occupancy_rate from backend (float, REQUIRED, ge=0, le=100, percentage)
  
  // Daily statistics (from ParkingStatistics)
  todayEntries: number;  // today_entries from backend (int, REQUIRED)
  todayExits: number;  // today_exits from backend (int, REQUIRED)
  todayRevenue: number;  // today_revenue from backend (float, REQUIRED, ge=0)
  
  // Breakdowns (from ParkingStatistics)
  byVehicleType: Record<string, number>;  // by_vehicle_type from backend (Dict[str, int], default_factory=dict)
  byZone: Record<string, Record<string, number>>;  // by_zone from backend (Dict[str, Dict[str, int]], default_factory=dict)
  
  // Frontend-only fields (not in backend schema)
  utilizationRate?: number;  // Calculated field
  averageParkingDuration?: number;  // Calculated field
  peakHours?: string[];  // Calculated field
}

// ==================== Exports ====================

export type {
  ParkingVehicle as ParkingVehicleModel,
  ParkingSpace as ParkingSpaceModel,
  ParkingEvent as ParkingEventModel,
  ParkingReservation as ParkingReservationModel,
  ParkingStatistics as ParkingStatisticsModel
};

