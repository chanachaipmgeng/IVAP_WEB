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
 * Matches VehicleResponse schema from backend (parking_schema.py)
 * Uses snake_case to match backend
 */
export interface ParkingVehicle extends BaseTimestamps {
  vehicle_id: UUID;  // vehicle_id from backend (UUID, REQUIRED)
  company_id: UUID;  // company_id from backend (UUID, REQUIRED)

  // Vehicle identification (from VehicleBase)
  plate_number: string;  // plate_number from backend (REQUIRED, min_length=1, max_length=20)
  plate_country?: string;  // plate_country from backend (optional, default="TH", max_length=10)
  plate_province?: string;  // plate_province from backend (optional, max_length=20)

  // Vehicle details (from VehicleBase)
  vehicle_type: VehicleType;  // vehicle_type from backend (VehicleType enum, REQUIRED)
  make?: string;  // make from backend (optional, max_length=50)
  model?: string;  // model from backend (optional, max_length=50)
  color?: string;  // color from backend (optional, max_length=30)
  year?: number;  // year from backend (optional, ge=1900, le=2100)

  // Owner information (from VehicleBase)
  owner_id?: UUID;  // owner_id from backend (optional, UUID)
  owner_name?: string;  // owner_name from backend (optional, max_length=100)
  owner_phone?: string;  // owner_phone from backend (optional, max_length=20)
  owner_email?: string;  // owner_email from backend (optional, max_length=100)

  // Parking permissions (from VehicleBase)
  has_parking_permission: boolean;  // has_parking_permission from backend (default=False)
  allowed_zones?: string;  // allowed_zones from backend (optional, comma-separated)
  priority_level: number;  // priority_level from backend (default=1, ge=1, le=10)

  // Security (from VehicleBase)
  is_blacklisted: boolean;  // is_blacklisted from backend (default=False)
  blacklist_reason?: string;  // blacklist_reason from backend (optional)

  // Current status (from VehicleResponse)
  last_seen?: string;  // last_seen from backend (optional, datetime)
  current_space_id?: string;  // current_space_id from backend (optional, string)
}

/**
 * Parking Vehicle Create Request
 * Matches VehicleCreate schema from backend
 */
export interface ParkingVehicleCreate {
  plate_number: string;
  plate_country?: string;
  plate_province?: string;

  vehicle_type: VehicleType;
  make?: string;
  model?: string;
  color?: string;
  year?: number;

  owner_id?: UUID;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;

  has_parking_permission?: boolean;
  allowed_zones?: string;
  priority_level?: number;

  is_blacklisted?: boolean;
  blacklist_reason?: string;
}

/**
 * Parking Vehicle Update Request
 * Matches VehicleUpdate schema from backend
 */
export interface ParkingVehicleUpdate {
  plate_number?: string;
  vehicle_type?: VehicleType;
  make?: string;
  model?: string;
  color?: string;
  year?: number;

  owner_id?: UUID;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;

  has_parking_permission?: boolean;
  allowed_zones?: string;
  priority_level?: number;

  is_blacklisted?: boolean;
  blacklist_reason?: string;
}

// ==================== Parking Space ====================

/**
 * Parking Space Interface
 * Matches ParkingSpaceResponse schema from backend (parking_schema.py)
 * Uses snake_case to match backend
 */
export interface ParkingSpace extends BaseTimestamps {
  space_id: string;  // space_id from backend (string, REQUIRED)
  company_id: UUID;  // company_id from backend (UUID, REQUIRED)

  // Location (from ParkingSpaceBase)
  space_number: string;  // space_number from backend (REQUIRED, min_length=1, max_length=20)
  zone?: string;  // zone from backend (optional, max_length=50)
  floor?: number;  // floor from backend (optional, int)
  row?: string;  // row from backend (optional, max_length=10)
  position?: string;  // position from backend (optional, max_length=10)

  // Dimensions (from ParkingSpaceBase)
  width?: number;  // width from backend (optional, float, ge=0, in meters)
  length?: number;  // length from backend (optional, float, ge=0, in meters)
  height?: number;  // height from backend (optional, float, ge=0, in meters)
  max_vehicle_type?: VehicleType;  // max_vehicle_type from backend (optional, VehicleType enum)

  // Features (from ParkingSpaceBase)
  is_handicap_accessible: boolean;  // is_handicap_accessible from backend (default=False)
  is_electric_vehicle_ready: boolean;  // is_electric_vehicle_ready from backend (default=False)
  hourly_rate?: number;  // hourly_rate from backend (optional, float, ge=0)

  // Reservation (from ParkingSpaceBase)
  is_reservable: boolean;  // is_reservable from backend (default=True)
  reservation_duration_hours: number;  // reservation_duration_hours from backend (default=24, ge=1)

  // Current status (from ParkingSpaceResponse)
  status: ParkingSpaceStatus;  // status from backend (ParkingSpaceStatus enum, REQUIRED)
  current_vehicle_plate?: string;  // current_vehicle_plate from backend (optional)
  current_occupant_id?: UUID;  // current_occupant_id from backend (optional, UUID)
  occupied_since?: string;  // occupied_since from backend (optional, datetime)
}

/**
 * Parking Space Create Request
 * Matches ParkingSpaceCreate schema from backend
 */
export interface ParkingSpaceCreate {
  space_number: string;
  zone?: string;
  floor?: number;
  row?: string;
  position?: string;

  width?: number;
  length?: number;
  height?: number;
  max_vehicle_type?: VehicleType;

  is_handicap_accessible?: boolean;
  is_electric_vehicle_ready?: boolean;
  hourly_rate?: number;

  is_reservable?: boolean;
  reservation_duration_hours?: number;
}

/**
 * Parking Space Update Request
 * Matches ParkingSpaceUpdate schema from backend
 */
export interface ParkingSpaceUpdate {
  space_number?: string;
  zone?: string;
  floor?: number;
  status?: ParkingSpaceStatus;

  is_handicap_accessible?: boolean;
  is_electric_vehicle_ready?: boolean;
  hourly_rate?: number;

  is_reservable?: boolean;
  reservation_duration_hours?: number;
}

// ==================== Parking Event ====================

/**
 * Parking Event Interface
 * Matches ParkingEventResponse schema from backend (parking_schema.py)
 * Uses snake_case to match backend
 */
export interface ParkingEvent extends BaseTimestamps {
  event_id: UUID;  // event_id from backend (UUID, REQUIRED)
  company_id: UUID;  // company_id from backend (UUID, REQUIRED)

  // Event details (from ParkingEventBase)
  event_type: ParkingEventType;  // event_type from backend (ParkingEventType enum, REQUIRED)
  space_id?: string;  // space_id from backend (optional, string)
  vehicle_id?: UUID;  // vehicle_id from backend (optional, UUID)
  plate_number?: string;  // plate_number from backend (optional, max_length=20)
  plate_confidence?: number;  // plate_confidence from backend (optional, float, ge=0, le=1)

  // Timing (from ParkingEventResponse)
  entry_time?: string;  // entry_time from backend (optional, datetime)
  exit_time?: string;  // exit_time from backend (optional, datetime)
  duration_minutes?: number;  // duration_minutes from backend (optional, int)

  // Pricing (from ParkingEventResponse)
  hourly_rate?: number;  // hourly_rate from backend (optional, float)
  total_cost?: number;  // total_cost from backend (optional, float)
  payment_status?: string;  // payment_status from backend (optional, string)
  payment_method?: string;  // payment_method from backend (optional, string, max_length=20)

  // Reservation (from ParkingEventResponse)
  reservation_id?: string;  // reservation_id from backend (optional, string)

  // Violation (from ParkingEventResponse)
  violation_type?: string;  // violation_type from backend (optional, string)
  violation_description?: string;  // violation_description from backend (optional, string)
  fine_amount?: number;  // fine_amount from backend (optional, float)

  // Images (from ParkingEventResponse)
  entry_image_path?: string;  // entry_image_path from backend (optional, string)
  exit_image_path?: string;  // exit_image_path from backend (optional, string)
  plate_image_path?: string;  // plate_image_path from backend (optional, string)

  // Metadata (from ParkingEventBase)
  notes?: string;  // notes from backend (optional, string)
  event_metadata?: string;  // event_metadata from backend (optional, JSON string)
}

/**
 * Vehicle Entry Request
 * Matches VehicleEntryRequest schema from backend
 */
export interface VehicleEntryRequest {
  plate_number: string;
  plate_confidence?: number;
  space_id?: string;
  entry_image?: string;
  notes?: string;
}

/**
 * Vehicle Exit Request
 * Matches VehicleExitRequest schema from backend
 */
export interface VehicleExitRequest {
  plate_number: string;
  exit_image?: string;
  payment_method?: string;
  notes?: string;
}

// ==================== Parking Reservation ====================

/**
 * Parking Reservation Interface
 * Matches ParkingReservationResponse schema from backend (parking_schema.py)
 * Uses snake_case to match backend
 */
export interface ParkingReservation extends BaseTimestamps {
  reservation_id: string;  // reservation_id from backend (string, REQUIRED)
  company_id: UUID;  // company_id from backend (UUID, REQUIRED)

  // Reservation details (from ParkingReservationBase)
  space_id: string;  // space_id from backend (string, REQUIRED)
  vehicle_id?: UUID;  // vehicle_id from backend (optional, UUID)
  plate_number?: string;  // plate_number from backend (optional, max_length=20)

  // Reserver information (from ParkingReservationBase)
  reserver_id?: UUID;  // reserver_id from backend (optional, UUID, member_id)
  reserver_name: string;  // reserver_name from backend (REQUIRED, max_length=100)
  reserver_phone?: string;  // reserver_phone from backend (optional, max_length=20)
  reserver_email?: string;  // reserver_email from backend (optional, max_length=100)

  // Schedule (from ParkingReservationBase)
  start_time: string;  // start_time from backend (datetime, REQUIRED)
  end_time: string;  // end_time from backend (datetime, REQUIRED)
  duration_hours: number;  // duration_hours from backend (int, REQUIRED)

  // Recurring (from ParkingReservationBase)
  is_recurring: boolean;  // is_recurring from backend (default=False)
  recurring_pattern?: string;  // recurring_pattern from backend (optional, max_length=50)

  // Current status (from ParkingReservationResponse)
  status: ReservationStatus;  // status from backend (string, REQUIRED, max_length=20)
  hourly_rate?: number;  // hourly_rate from backend (optional, float)
  total_cost?: number;  // total_cost from backend (optional, float)
  payment_status: string;  // payment_status from backend (string, REQUIRED)

  // Actual times (from ParkingReservationResponse)
  actual_start_time?: string;  // actual_start_time from backend (optional, datetime)
  actual_end_time?: string;  // actual_end_time from backend (optional, datetime)
  check_in_time?: string;  // check_in_time from backend (optional, datetime)
  check_out_time?: string;  // check_out_time from backend (optional, datetime)

  // QR Code (from ParkingReservationResponse)
  qr_code?: string;  // qr_code from backend (optional, string)

  // Notes (from ParkingReservationBase)
  notes?: string;  // notes from backend (optional, string)
}

/**
 * Parking Reservation Create Request
 * Matches ParkingReservationCreate schema from backend
 */
export interface ParkingReservationCreate {
  space_id: string;
  vehicle_id?: UUID;
  plate_number?: string;

  reserver_id?: UUID;
  reserver_name: string;
  reserver_phone?: string;
  reserver_email?: string;

  start_time: string;
  end_time: string;

  is_recurring?: boolean;
  recurring_pattern?: string;

  notes?: string;
}

/**
 * Parking Reservation Update Request
 * Matches ParkingReservationUpdate schema from backend
 */
export interface ParkingReservationUpdate {
  start_time?: string;
  end_time?: string;
  status?: ReservationStatus;
  notes?: string;
}

// ==================== Parking Statistics ====================

/**
 * Parking Statistics Interface
 * Matches ParkingStatistics schema from backend (parking_schema.py)
 * Uses snake_case to match backend
 */
export interface ParkingStatistics {
  // Space statistics (from ParkingStatistics)
  total_spaces: number;  // total_spaces from backend (int, REQUIRED)
  available_spaces: number;  // available_spaces from backend (int, REQUIRED)
  occupied_spaces: number;  // occupied_spaces from backend (int, REQUIRED)
  reserved_spaces: number;  // reserved_spaces from backend (int, REQUIRED)
  maintenance_spaces: number;  // maintenance_spaces from backend (int, REQUIRED)

  // Vehicle statistics (from ParkingStatistics)
  total_vehicles: number;  // total_vehicles from backend (int, REQUIRED)
  currently_parked: number;  // currently_parked from backend (int, REQUIRED)

  // Rates (from ParkingStatistics)
  occupancy_rate: number;  // occupancy_rate from backend (float, REQUIRED, ge=0, le=100, percentage)

  // Daily statistics (from ParkingStatistics)
  today_entries: number;  // today_entries from backend (int, REQUIRED)
  today_exits: number;  // today_exits from backend (int, REQUIRED)
  today_revenue: number;  // today_revenue from backend (float, REQUIRED, ge=0)

  // Breakdowns (from ParkingStatistics)
  by_vehicle_type: Record<string, number>;  // by_vehicle_type from backend (Dict[str, int], default_factory=dict)
  by_zone: Record<string, Record<string, number>>;  // by_zone from backend (Dict[str, Dict[str, int]], default_factory=dict)

  // Frontend-only fields (not in backend schema)
  utilization_rate?: number;  // Calculated field
  average_parking_duration?: number;  // Calculated field
  peak_hours?: string[];  // Calculated field
}

// ==================== Exports ====================

export type {
  ParkingVehicle as ParkingVehicleModel,
  ParkingSpace as ParkingSpaceModel,
  ParkingEvent as ParkingEventModel,
  ParkingReservation as ParkingReservationModel,
  ParkingStatistics as ParkingStatisticsModel
};

