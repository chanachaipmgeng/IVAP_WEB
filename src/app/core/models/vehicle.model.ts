export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'van' | 'bus';
export type OwnerType = 'employee' | 'visitor' | 'guest';
export type VehicleStatus = 'parked' | 'left' | 'reserved';

/**
 * Vehicle Interface
 * ตรงกับ VehicleResponse ใน backend (vehicle_schema.py)
 */
export interface Vehicle {
  id: string;  // id from backend (UUID)
  companyId: string;  // company_id from backend (REQUIRED)
  
  // Vehicle identification (from VehicleBase)
  plateNumber: string;  // plate_number from backend (REQUIRED)
  brand: string;  // brand from backend (REQUIRED)
  model: string;  // model from backend (REQUIRED)
  color: string;  // color from backend (REQUIRED)
  vehicleType: VehicleType;  // vehicle_type from backend (REQUIRED)
  ownerType: OwnerType;  // owner_type from backend (REQUIRED)
  ownerName: string;  // owner_name from backend (REQUIRED)
  ownerId?: string;  // owner_id from backend (optional, UUID)
  notes?: string;  // notes from backend (optional)
  
  // Parking information (from VehicleResponse)
  parkingSpotId?: string;  // parking_spot_id from backend (optional, UUID)
  parkingSpotNumber?: string;  // parking_spot_number from backend (optional)
  status: VehicleStatus;  // status from backend (REQUIRED: 'parked', 'left', 'reserved')
  checkInTime?: string;  // check_in_time from backend (optional, datetime)
  checkOutTime?: string;  // check_out_time from backend (optional, datetime)
  
  // Timestamps
  createdAt: string;  // created_at from backend
  updatedAt: string;  // updated_at from backend
}

export interface VehicleCreate {
  plateNumber: string;
  brand: string;
  model: string;
  color: string;
  vehicleType: VehicleType;
  ownerType: OwnerType;
  ownerName: string;
  ownerId?: string;
  notes?: string;
}

export interface VehicleUpdate {
  plateNumber?: string;
  brand?: string;
  model?: string;
  color?: string;
  vehicleType?: VehicleType;
  ownerType?: OwnerType;
  ownerName?: string;
  ownerId?: string;
  notes?: string;
}

export interface VehicleCheckIn {
  checkInTime?: string;
  location?: string;
  notes?: string;
}

export interface VehicleCheckOut {
  checkOutTime?: string;
  notes?: string;
}

export interface ParkingSpot {
  id: string;
  spotNumber: string;
  location: string;
  isCovered: boolean;
  isReserved: boolean;
  isOccupied: boolean;
  occupiedByVehicleId?: string;
  occupiedByPlateNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParkingSpotCreate {
  spotNumber: string;
  location: string;
  isCovered?: boolean;
  isReserved?: boolean;
  notes?: string;
}

export interface ParkingSpotAssignment {
  spotId: string;
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
