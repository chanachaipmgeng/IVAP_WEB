export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'van' | 'bus';
export type OwnerType = 'employee' | 'visitor' | 'guest';
export type VehicleStatus = 'parked' | 'left' | 'reserved';

/**
 * Vehicle Interface
 * Matches VehicleResponse schema from backend (vehicle_schema.py)
 * Uses snake_case to match backend
 */
export interface Vehicle {
  id: string;  // id from backend (UUID)
  company_id: string;  // company_id from backend (REQUIRED)
  
  // Vehicle identification (from VehicleBase)
  plate_number: string;  // plate_number from backend (REQUIRED)
  brand: string;  // brand from backend (REQUIRED)
  model: string;  // model from backend (REQUIRED)
  color: string;  // color from backend (REQUIRED)
  vehicle_type: VehicleType;  // vehicle_type from backend (REQUIRED)
  owner_type: OwnerType;  // owner_type from backend (REQUIRED)
  owner_name: string;  // owner_name from backend (REQUIRED)
  owner_id?: string;  // owner_id from backend (optional, UUID)
  notes?: string;  // notes from backend (optional)
  
  // Parking information (from VehicleResponse)
  parking_spot_id?: string;  // parking_spot_id from backend (optional, UUID)
  parking_spot_number?: string;  // parking_spot_number from backend (optional)
  status: VehicleStatus;  // status from backend (REQUIRED: 'parked', 'left', 'reserved')
  check_in_time?: string;  // check_in_time from backend (optional, datetime)
  check_out_time?: string;  // check_out_time from backend (optional, datetime)
  
  // Timestamps
  created_at: string;  // created_at from backend
  updated_at: string;  // updated_at from backend
}

/**
 * Vehicle Create Request
 * Matches VehicleCreate schema from backend
 */
export interface VehicleCreate {
  plate_number: string;
  brand: string;
  model: string;
  color: string;
  vehicle_type: VehicleType;
  owner_type: OwnerType;
  owner_name: string;
  owner_id?: string;
  notes?: string;
}

/**
 * Vehicle Update Request
 * Matches VehicleUpdate schema from backend
 */
export interface VehicleUpdate {
  plate_number?: string;
  brand?: string;
  model?: string;
  color?: string;
  vehicle_type?: VehicleType;
  owner_type?: OwnerType;
  owner_name?: string;
  owner_id?: string;
  notes?: string;
}

/**
 * Vehicle Check-in Request
 * Matches VehicleCheckIn schema from backend
 */
export interface VehicleCheckIn {
  check_in_time?: string;
  location?: string;
  notes?: string;
}

/**
 * Vehicle Check-out Request
 * Matches VehicleCheckOut schema from backend
 */
export interface VehicleCheckOut {
  check_out_time?: string;
  notes?: string;
}

/**
 * Parking Spot Interface
 * Matches ParkingSpotResponse schema from backend
 */
export interface ParkingSpot {
  id: string;
  company_id: string;
  spot_number: string;
  location: string;
  is_covered: boolean;
  is_reserved: boolean;
  is_occupied: boolean;
  occupied_by_vehicle_id?: string;
  occupied_by_plate_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Parking Spot Create Request
 * Matches ParkingSpotCreate schema from backend
 */
export interface ParkingSpotCreate {
  spot_number: string;
  location: string;
  is_covered?: boolean;
  is_reserved?: boolean;
  notes?: string;
}

/**
 * Parking Spot Assignment
 * Matches ParkingSpotAssignment schema from backend
 */
export interface ParkingSpotAssignment {
  spot_id: string;
}

export interface VehicleStats {
  totalVehicles: number;
  parkedVehicles: number;
  leftVehicles: number;
  reservedVehicles: number;
  totalParkingSpots: number;
  occupiedSpots: number;
  availableSpots: number;
}
