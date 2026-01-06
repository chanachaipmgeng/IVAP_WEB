import { TranslateService } from "@ngx-translate/core";
import { BaseTimestamps, UUID } from "./base.model";

/**
 * Company Location Model
 * ตรงกับ CompanyLocationResponse ใน backend (company_location_schema.py)
 */
export class CompanyLocationModel implements BaseTimestamps {
  // Primary identifiers - support both formats
  id: UUID;  // locationId from backend (UUID)
  locationId: string;  // locationId from backend (UUID) - alias for id
  companyId: string;  // companyId from backend (UUID, REQUIRED)
  
  // Location information (from CompanyLocationBase)
  locationName: string;  // locationName from backend (REQUIRED)
  latitude: number;  // latitude from backend (REQUIRED, float)
  longitude: number;  // longitude from backend (REQUIRED, float)
  radius: number;  // radius from backend (REQUIRED, float) - in meters/kilometers
  locationType: string;  // locationType from backend (LocationType enum, REQUIRED)
  startDate: string;  // startDate from backend (datetime, REQUIRED, ISO string)
  endDate: string;  // endDate from backend (datetime, REQUIRED, ISO string)
  
  // Timestamps (from CompanyLocationResponse)
  createdAt: string;  // createdAt from backend (ISO datetime string)
  updatedAt: string;  // updatedAt from backend (ISO datetime string, Optional in backend)
  
  // Frontend-only fields (not in backend schema, but useful for UI)
  address?: string;  // Derived or additional info
  isActive?: boolean;  // Derived from startDate/endDate (computed property)

  constructor(
    data?: Partial<CompanyLocationModel>,
    translateService?: TranslateService
  ) {
    this.id = data?.id || data?.locationId || '';
    this.locationId = data?.locationId || '';
    this.companyId = data?.companyId || '';
    this.locationName = data?.locationName || '';
    this.address = data?.address || '';
    this.latitude = data?.latitude || 0;
    this.longitude = data?.longitude || 0;
    this.radius = data?.radius || 0.1; // Default 100 meters
    this.locationType = data?.locationType || ''; // Initialize required field
    this.startDate = data?.startDate || ''; // Initialize required field
    this.endDate = data?.endDate || ''; // Initialize required field
    this.isActive = data?.isActive !== undefined ? data.isActive : true;
    this.createdAt = data?.createdAt || '';
    this.updatedAt = data?.updatedAt || '';
  }

  getLocation(): { lat: number; lng: number } {
    return {
      lat: this.latitude,
      lng: this.longitude
    };
  }

  getRadiusInMeters(): number {
    return this.radius * 1000; // Convert km to meters
  }

  getDisplayName(): string {
    return this.locationName || this.address || 'ไม่ระบุชื่อสถานที่';
  }

  isWithinRadius(userLat: number, userLng: number): boolean {
    const distance = this.calculateDistance(userLat, userLng);
    return distance <= this.radius;
  }

  private calculateDistance(lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - this.latitude);
    const dLng = this.toRad(lng2 - this.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}





