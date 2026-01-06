import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UUID, PaginatedResponse } from '../models/base.model';
import { EmployeeTimestamp, EmployeeTimestampCreate, EmployeeTimestampUpdate } from '../models/timestamp.model';

export interface TimestampRecord {
  id: string;
  userId: string;
  userName: string;
  type: 'checkin' | 'checkout' | 'break_start' | 'break_end' | 'overtime_start' | 'overtime_end';
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    accuracy?: number;
  };
  photo?: {
    data: string; // base64
    timestamp: Date;
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
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  allowedTypes: TimestampRecord['type'][];
  workingHours: {
    start: string; // HH:mm format
    end: string; // HH:mm format
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  timezone: string;
}

export interface GeofenceEvent {
  id: string;
  userId: string;
  locationId: string;
  eventType: 'enter' | 'exit';
  timestamp: Date;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  accuracy: number;
}

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

/**
 * Timestamp Filters for API queries
 */
export interface TimestampFilters {
  search?: string;
  company_employee_id?: UUID;
  start_date?: string;  // ISO datetime string
  end_date?: string;  // ISO datetime string
  timestamp_type?: string;  // CHECK_IN, CHECK_OUT, etc.
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimestampService {
  // Client-side storage (for backward compatibility)
  private timestampsMap: Map<string, TimestampRecord> = new Map();
  private locationsMap: Map<string, LocationSettings> = new Map();
  private geofenceEventsMap: Map<string, GeofenceEvent> = new Map();

  // ✅ Signals for reactive state
  private _timestamps = signal<TimestampRecord[]>([]);
  private _locations = signal<LocationSettings[]>([]);
  private _geofenceEvents = signal<GeofenceEvent[]>([]);
  private _stats = signal<TimestampStats>(this.getInitialStats());

  // ✅ Readonly signals for public access
  public readonly timestamps = this._timestamps.asReadonly();
  public readonly locations = this._locations.asReadonly();
  public readonly geofenceEvents = this._geofenceEvents.asReadonly();
  public readonly stats = this._stats.asReadonly();

  // ✅ Computed signals for derived state
  public readonly timestampsCount = computed(() => this._timestamps().length);
  public readonly todayTimestampsCount = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this._timestamps().filter(t => new Date(t.timestamp) >= today).length;
  });
  public readonly pendingApprovalsCount = computed(() =>
    this._timestamps().filter(t => t.status === 'pending').length
  );
  public readonly locationsCount = computed(() => this._locations().length);
  public readonly activeLocationsCount = computed(() =>
    this._locations().filter(l => l.isActive).length
  );
  public readonly geofenceEventsCount = computed(() => this._geofenceEvents().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public timestamps$ = new Observable<TimestampRecord[]>(observer => {
    observer.next(this._timestamps());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public locations$ = new Observable<LocationSettings[]>(observer => {
    observer.next(this._locations());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public geofenceEvents$ = new Observable<GeofenceEvent[]>(observer => {
    observer.next(this._geofenceEvents());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public stats$ = new Observable<TimestampStats>(observer => {
    observer.next(this._stats());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  // Location tracking
  private watchId: number | null = null;
  private currentLocation: GeolocationPosition | null = null;
  private locationUpdateInterval: any = null;

  constructor(private api?: ApiService) {
    this.initializeDefaultLocations();
    this.startLocationTracking();
    this.loadStoredData();
  }

  // ==================== Backend API Functions ====================

  /**
   * Get timestamps with pagination
   * Backend: GET /api/v1/timestamps/company/{company_id}
   */
  public getTimestamps(companyId: UUID, filters?: TimestampFilters): Observable<PaginatedResponse<EmployeeTimestamp>> {
    if (!this.api) {
      throw new Error('ApiService is not available');
    }
    return this.api.get<any>(`/timestamps/company/${companyId}`, filters).pipe(
      map(response => ({
        ...response,
        data: response.data?.map((item: any) => this.transformBackendToEmployeeTimestamp(item)) || []
      }))
    );
  }

  /**
   * Get timestamp by ID
   * Backend: GET /api/v1/timestamps/company/{company_id}/{timestamp_id}
   */
  public getTimestampById(companyId: UUID, timestampId: UUID): Observable<EmployeeTimestamp> {
    if (!this.api) {
      throw new Error('ApiService is not available');
    }
    return this.api.get<any>(`/timestamps/company/${companyId}/${timestampId}`).pipe(
      map(response => this.transformBackendToEmployeeTimestamp(response))
    );
  }

  /**
   * Create timestamp
   * Backend: POST /api/v1/timestamps/company/{company_id}
   */
  public createTimestamp(companyId: UUID, data: EmployeeTimestampCreate): Observable<EmployeeTimestamp> {
    if (!this.api) {
      throw new Error('ApiService is not available');
    }
    // Transform frontend format to backend format
    const backendData = this.transformCreateToBackend(data);
    return this.api.post<any>(`/timestamps/company/${companyId}`, backendData).pipe(
      map(response => this.transformBackendToEmployeeTimestamp(response))
    );
  }

  /**
   * Update timestamp
   * Backend: PUT /api/v1/timestamps/company/{company_id}/{timestamp_id}
   */
  public updateTimestamp(companyId: UUID, timestampId: UUID, data: EmployeeTimestampUpdate): Observable<EmployeeTimestamp> {
    if (!this.api) {
      throw new Error('ApiService is not available');
    }
    // Transform frontend format to backend format
    const backendData = this.transformUpdateToBackend(data);
    return this.api.put<any>(`/timestamps/company/${companyId}/${timestampId}`, backendData).pipe(
      map(response => this.transformBackendToEmployeeTimestamp(response))
    );
  }

  /**
   * Delete timestamp
   * Backend: DELETE /api/v1/timestamps/company/{company_id}/{timestamp_id}
   */
  public deleteTimestamp(companyId: UUID, timestampId: UUID): Observable<void> {
    if (!this.api) {
      throw new Error('ApiService is not available');
    }
    return this.api.delete<void>(`/timestamps/company/${companyId}/${timestampId}`);
  }

  /**
   * Approve timestamp
   * Backend: POST /api/v1/timestamps/company/{company_id}/{timestamp_id}/approve
   */
  public approveTimestamp(companyId: UUID, timestampId: UUID): Observable<EmployeeTimestamp> {
    if (!this.api) {
      throw new Error('ApiService is not available');
    }
    return this.api.post<any>(`/timestamps/company/${companyId}/${timestampId}/approve`, {}).pipe(
      map(response => this.transformBackendToEmployeeTimestamp(response))
    );
  }

  /**
   * Reject timestamp
   * Backend: POST /api/v1/timestamps/company/{company_id}/{timestamp_id}/reject
   */
  public rejectTimestamp(companyId: UUID, timestampId: UUID, reason: string): Observable<EmployeeTimestamp> {
    if (!this.api) {
      throw new Error('ApiService is not available');
    }
    return this.api.post<any>(`/timestamps/company/${companyId}/${timestampId}/reject`, {
      status: 'rejected',
      rejection_reason: reason
    }).pipe(
      map(response => this.transformBackendToEmployeeTimestamp(response))
    );
  }

  /**
   * Bulk approve timestamps
   * Backend: POST /api/v1/timestamps/company/{company_id}/bulk-approve
   */
  public bulkApproveTimestamps(companyId: UUID, timestampIds: UUID[]): Observable<EmployeeTimestamp[]> {
    if (!this.api) {
      throw new Error('ApiService is not available');
    }
    return this.api.post<any[]>(`/timestamps/company/${companyId}/bulk-approve`, timestampIds).pipe(
      map(response => response.map(item => this.transformBackendToEmployeeTimestamp(item)))
    );
  }

  /**
   * Export timestamps
   * Backend: GET /api/v1/timestamps/company/{company_id}/export
   */
  public exportTimestamps(companyId: UUID, filters?: TimestampFilters): Observable<Blob> {
    if (!this.api) {
      throw new Error('ApiService is not available');
    }
    return this.api.get<Blob>(`/timestamps/company/${companyId}/export`, filters);
  }

  /**
   * Transform EmployeeTimestampCreate to backend format
   */
  private transformCreateToBackend(data: EmployeeTimestampCreate): any {
    // Map frontend timestampType to backend format
    const backendTimestampType = this.mapTimestampTypeToBackend(data.timestampType);

    return {
      company_employeeId: data.companyEmployeeId,
      timestampType: backendTimestampType,
      locationName: data.locationName,
      latitude: data.latitude,
      longitude: data.longitude,
      photoTimestamp: data.photoTimestamp
    };
  }

  /**
   * Map frontend TimestampType to backend format
   */
  private mapTimestampTypeToBackend(type: string): string {
    const typeMap: Record<string, string> = {
      'checkin': 'CHECK_IN',
      'checkout': 'CHECK_OUT',
      'break_start': 'WARNING',
      'break_end': 'WARNING',
      'overtime_start': 'WARNING',
      'overtime_end': 'WARNING'
    };
    return typeMap[type] || type.toUpperCase();
  }

  /**
   * Map backend TimestampType to frontend format
   */
  private mapBackendToTimestampType(type: string): EmployeeTimestamp['timestampType'] {
    // Backend uses: CHECK_IN, CHECK_OUT, WARNING, DISAPPROVE
    // Map to TimestampType union type
    const validTypes: EmployeeTimestamp['timestampType'][] = ['CHECK_IN', 'CHECK_OUT', 'WARNING', 'DISAPPROVE'];
    if (validTypes.includes(type as EmployeeTimestamp['timestampType'])) {
      return type as EmployeeTimestamp['timestampType'];
    }
    // Default to CHECK_IN if unknown
    return 'CHECK_IN';
  }

  /**
   * Transform EmployeeTimestampUpdate to backend format
   */
  private transformUpdateToBackend(data: EmployeeTimestampUpdate): any {
    // Map frontend timestampType to backend format if provided
    const backendTimestampType = data.timestampType
      ? this.mapTimestampTypeToBackend(data.timestampType)
      : undefined;

    return {
      timestampType: backendTimestampType,
      latitude: data.latitude,
      longitude: data.longitude,
      locationName: data.locationName,
      photoTimestamp: data.photoTimestamp
    };
  }

  /**
   * Transform backend response to EmployeeTimestamp
   */
  private transformBackendToEmployeeTimestamp(backend: any): EmployeeTimestamp {
    return {
      timestampId: backend.timestampId || backend.timestamp_id || '',
      companyEmployeeId: backend.company_employeeId || backend.companyEmployeeId || '',
      companyId: backend.companyId || backend.company_id || '',
      timestampType: this.mapBackendToTimestampType(backend.timestampType || backend.timestamp_type || 'CHECK_IN'),
      timestamp: backend.timestamp || new Date().toISOString(),
      locationName: backend.locationName || backend.location_name,
      latitude: backend.latitude,
      longitude: backend.longitude,
      photoTimestamp: backend.photoTimestamp || backend.photo_timestamp,
      status: backend.status || 'pending',
      approvedBy: backend.approvedBy || backend.approved_by,
      approvedAt: backend.approvedAt || backend.approved_at,
      rejectionReason: backend.rejectionReason || backend.rejection_reason,
      createdAt: backend.createdAt || backend.created_at || new Date().toISOString(),
      updatedAt: backend.updatedAt || backend.updated_at,
      employee: backend.employee ? {
        member: backend.employee.member || {},
        position: backend.employee.position,
        department: backend.employee.department,
        companyEmployeeId: backend.employee.company_employeeId || backend.employee.companyEmployeeId || '',
        employeeId: backend.employee.employeeId || backend.employee.employee_id || '',
        bossId: backend.employee.bossId || backend.employee.boss_id || ''
      } : undefined
    };
  }

  /**
   * Initialize default locations
   */
  private initializeDefaultLocations(): void {
    const defaultLocations: LocationSettings[] = [
      {
        id: 'main-office',
        name: 'สำนักงานใหญ่',
        address: '123 ถนนสุขุมวิท กรุงเทพมหานคร 10110',
        coordinates: { latitude: 13.7563, longitude: 100.5018 },
        radius: 100,
        isActive: true,
        allowedTypes: ['checkin', 'checkout', 'break_start', 'break_end'],
        workingHours: {
          start: '08:00',
          end: '17:00',
          days: [1, 2, 3, 4, 5] // Monday to Friday
        },
        timezone: 'Asia/Bangkok'
      },
      {
        id: 'branch-office',
        name: 'สาขาเชียงใหม่',
        address: '456 ถนนนิมมานเหมินท์ เชียงใหม่ 50200',
        coordinates: { latitude: 18.7883, longitude: 98.9853 },
        radius: 50,
        isActive: true,
        allowedTypes: ['checkin', 'checkout'],
        workingHours: {
          start: '08:30',
          end: '17:30',
          days: [1, 2, 3, 4, 5]
        },
        timezone: 'Asia/Bangkok'
      }
    ];

    defaultLocations.forEach(location => {
      this.locationsMap.set(location.id, location);
    });
    this._locations.set(Array.from(this.locationsMap.values()));
  }

  /**
   * Start location tracking
   */
  private startLocationTracking(): void {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentLocation = position;
          this.checkGeofences(position);
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    }
  }

  /**
   * Stop location tracking
   */
  public stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  /**
   * Check geofences for current location
   */
  private checkGeofences(position: GeolocationPosition): void {
    const currentCoords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    this.locationsMap.forEach((location, locationId) => {
      if (!location.isActive) return;

      const distance = this.calculateDistance(
        currentCoords,
        location.coordinates
      );

      const isInside = distance <= location.radius;
      const lastEvent = this.getLastGeofenceEvent(locationId, position.timestamp);

      if (isInside && (!lastEvent || lastEvent.eventType === 'exit')) {
        this.recordGeofenceEvent(locationId, 'enter', currentCoords, position.coords.accuracy);
      } else if (!isInside && lastEvent && lastEvent.eventType === 'enter') {
        this.recordGeofenceEvent(locationId, 'exit', currentCoords, position.coords.accuracy);
      }
    });
  }

  /**
   * Record geofence event
   */
  private recordGeofenceEvent(
    locationId: string,
    eventType: 'enter' | 'exit',
    coordinates: { latitude: number; longitude: number },
    accuracy: number
  ): void {
    const event: GeofenceEvent = {
      id: this.generateId(),
      userId: 'current-user', // In real app, get from auth service
      locationId,
      eventType,
      timestamp: new Date(),
      coordinates,
      accuracy
    };

    this.geofenceEventsMap.set(event.id, event);
    this._geofenceEvents.set(Array.from(this.geofenceEventsMap.values()));
  }

  /**
   * Get last geofence event for location
   */
  private getLastGeofenceEvent(locationId: string, beforeTimestamp: number): GeofenceEvent | null {
    const events = Array.from(this.geofenceEventsMap.values())
      .filter((event: GeofenceEvent) => event.locationId === locationId && event.timestamp.getTime() < beforeTimestamp)
      .sort((a: GeofenceEvent, b: GeofenceEvent) => b.timestamp.getTime() - a.timestamp.getTime());

    return events.length > 0 ? events[0] : null;
  }

  /**
   * Calculate distance between two coordinates
   */
  private calculateDistance(
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.latitude * Math.PI / 180;
    const φ2 = coord2.latitude * Math.PI / 180;
    const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Create timestamp record (client-side only)
   * Note: This is different from createTimestamp() which calls the backend API
   */
  public async createTimestampRecord(
    type: TimestampRecord['type'],
    locationId?: string,
    photo?: string,
    notes?: string
  ): Promise<TimestampRecord> {
    const currentLocation = await this.getCurrentLocation();
    const location = locationId ? this.locationsMap.get(locationId) : this.findNearestLocation(currentLocation);

    if (!location) {
      throw new Error('No valid location found');
    }

    // Check if location allows this type of timestamp
    if (!location.allowedTypes.includes(type)) {
      throw new Error(`Location does not allow ${type} timestamps`);
    }

    // Check working hours
    if (!this.isWithinWorkingHours(location, new Date())) {
      throw new Error('Outside working hours');
    }

    const timestamp: TimestampRecord = {
      id: this.generateId(),
      userId: 'current-user', // In real app, get from auth service
      userName: 'Current User', // In real app, get from user service
      type,
      timestamp: new Date(),
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: location.address,
        accuracy: currentLocation.accuracy
      },
      photo: photo ? {
        data: photo,
        timestamp: new Date(),
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }
      } : undefined,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      },
      status: 'pending',
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.timestampsMap.set(timestamp.id, timestamp);
    this._timestamps.set(Array.from(this.timestampsMap.values()));
    this.updateStats();

    return timestamp;
  }

  /**
   * Get current location
   */
  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (this.currentLocation) {
        resolve({
          latitude: this.currentLocation.coords.latitude,
          longitude: this.currentLocation.coords.longitude,
          accuracy: this.currentLocation.coords.accuracy
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }

  /**
   * Find nearest location
   */
  private findNearestLocation(currentLocation: { latitude: number; longitude: number }): LocationSettings | null {
    let nearestLocation: LocationSettings | null = null;
    let minDistance = Infinity;

    this.locationsMap.forEach(location => {
      if (!location.isActive) return;

      const distance = this.calculateDistance(currentLocation, location.coordinates);
      if (distance < minDistance && distance <= location.radius) {
        minDistance = distance;
        nearestLocation = location;
      }
    });

    return nearestLocation;
  }

  /**
   * Check if timestamp is within working hours
   */
  private isWithinWorkingHours(location: LocationSettings, timestamp: Date): boolean {
    const now = new Date(timestamp);
    const dayOfWeek = now.getDay();
    const timeString = now.toTimeString().slice(0, 5); // HH:mm format

    return location.workingHours.days.includes(dayOfWeek) &&
           timeString >= location.workingHours.start &&
           timeString <= location.workingHours.end;
  }

  /**
   * Update timestamp status
   */
  public updateTimestampStatus(id: string, status: TimestampRecord['status'], notes?: string): void {
    const timestamp = this.timestampsMap.get(id);
    if (timestamp) {
      timestamp.status = status;
      timestamp.notes = notes || timestamp.notes;
      timestamp.updatedAt = new Date();

      this.timestampsMap.set(id, timestamp);
      this._timestamps.set(Array.from(this.timestampsMap.values()));
      this.updateStats();
    }
  }

  /**
   * Get timestamps by date range
   */
  public getTimestampsByDateRange(startDate: Date, endDate: Date): TimestampRecord[] {
    return Array.from(this.timestampsMap.values())
      .filter(timestamp =>
        timestamp.timestamp >= startDate && timestamp.timestamp <= endDate
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get timestamps by user
   */
  public getTimestampsByUser(userId: string): TimestampRecord[] {
    return Array.from(this.timestampsMap.values())
      .filter(timestamp => timestamp.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get pending timestamps
   */
  public getPendingTimestamps(): TimestampRecord[] {
    return Array.from(this.timestampsMap.values())
      .filter(timestamp => timestamp.status === 'pending')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Add location
   */
  public addLocation(location: Omit<LocationSettings, 'id'>): string {
    const id = this.generateId();
    const newLocation: LocationSettings = { ...location, id };

    this.locationsMap.set(id, newLocation);
    this._locations.set(Array.from(this.locationsMap.values()));

    return id;
  }

  /**
   * Update location
   */
  public updateLocation(id: string, updates: Partial<LocationSettings>): void {
    const location = this.locationsMap.get(id);
    if (location) {
      const updatedLocation = { ...location, ...updates };
      this.locationsMap.set(id, updatedLocation);
      this._locations.set(Array.from(this.locationsMap.values()));
    }
  }

  /**
   * Delete location
   */
  public deleteLocation(id: string): void {
    this.locationsMap.delete(id);
    this._locations.set(Array.from(this.locationsMap.values()));
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const stats = this.calculateStats();
    this._stats.set(stats);
  }

  /**
   * Calculate statistics
   */
  private calculateStats(): TimestampStats {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const allTimestamps = Array.from(this.timestampsMap.values());
    const todayTimestamps = allTimestamps.filter(t => t.timestamp >= today);
    const weekTimestamps = allTimestamps.filter(t => t.timestamp >= weekStart);
    const monthTimestamps = allTimestamps.filter(t => t.timestamp >= monthStart);

    const checkins = allTimestamps.filter(t => t.type === 'checkin');
    const checkouts = allTimestamps.filter(t => t.type === 'checkout');

    return {
      totalRecords: allTimestamps.length,
      todayRecords: todayTimestamps.length,
      thisWeekRecords: weekTimestamps.length,
      thisMonthRecords: monthTimestamps.length,
      pendingApprovals: allTimestamps.filter(t => t.status === 'pending').length,
      averageCheckinTime: this.calculateAverageTime(checkins),
      averageCheckoutTime: this.calculateAverageTime(checkouts),
      lateCheckins: this.countLateCheckins(checkins),
      earlyCheckouts: this.countEarlyCheckouts(checkouts)
    };
  }

  /**
   * Calculate average time for timestamps
   */
  private calculateAverageTime(timestamps: TimestampRecord[]): string {
    if (timestamps.length === 0) return '--:--';

    const totalMinutes = timestamps.reduce((sum, t) => {
      const time = new Date(t.timestamp);
      return sum + time.getHours() * 60 + time.getMinutes();
    }, 0);

    const averageMinutes = Math.round(totalMinutes / timestamps.length);
    const hours = Math.floor(averageMinutes / 60);
    const minutes = averageMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Count late check-ins
   */
  private countLateCheckins(checkins: TimestampRecord[]): number {
    const lateThreshold = 8 * 60; // 8:00 AM in minutes
    return checkins.filter(t => {
      const time = new Date(t.timestamp);
      const minutes = time.getHours() * 60 + time.getMinutes();
      return minutes > lateThreshold;
    }).length;
  }

  /**
   * Count early check-outs
   */
  private countEarlyCheckouts(checkouts: TimestampRecord[]): number {
    const earlyThreshold = 17 * 60; // 5:00 PM in minutes
    return checkouts.filter(t => {
      const time = new Date(t.timestamp);
      const minutes = time.getHours() * 60 + time.getMinutes();
      return minutes < earlyThreshold;
    }).length;
  }

  /**
   * Get initial stats
   */
  private getInitialStats(): TimestampStats {
    return {
      totalRecords: 0,
      todayRecords: 0,
      thisWeekRecords: 0,
      thisMonthRecords: 0,
      pendingApprovals: 0,
      averageCheckinTime: '--:--',
      averageCheckoutTime: '--:--',
      lateCheckins: 0,
      earlyCheckouts: 0
    };
  }

  /**
   * Load stored data from localStorage
   */
  private loadStoredData(): void {
    try {
      const storedTimestamps = localStorage.getItem('timestamp-records');
      if (storedTimestamps) {
        const timestamps = JSON.parse(storedTimestamps);
        timestamps.forEach((t: any) => {
          t.timestamp = new Date(t.timestamp);
          t.createdAt = new Date(t.createdAt);
          t.updatedAt = new Date(t.updatedAt);
          if (t.photo) {
            t.photo.timestamp = new Date(t.photo.timestamp);
          }
          this.timestampsMap.set(t.id, t);
        });
        this._timestamps.set(Array.from(this.timestampsMap.values()));
      }

      const storedLocations = localStorage.getItem('timestamp-locations');
      if (storedLocations) {
        const locations = JSON.parse(storedLocations);
        locations.forEach((l: any) => {
          this.locationsMap.set(l.id, l);
        });
        this._locations.set(Array.from(this.locationsMap.values()));
      }
    } catch (error) {
      console.error('Failed to load stored data:', error);
    }
  }

  /**
   * Save data to localStorage
   */
  public saveData(): void {
    try {
      localStorage.setItem('timestamp-records', JSON.stringify(Array.from(this.timestampsMap.values())));
      localStorage.setItem('timestamp-locations', JSON.stringify(Array.from(this.locationsMap.values())));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  /**
   * Export data
   */
  public exportData(): string {
    const data = {
      timestamps: Array.from(this.timestampsMap.values()),
      locations: Array.from(this.locationsMap.values()),
      geofenceEvents: Array.from(this.geofenceEventsMap.values()),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data
   */
  public importData(data: string): void {
    try {
      const imported = JSON.parse(data);

      if (imported.timestamps) {
        imported.timestamps.forEach((t: any) => {
          t.timestamp = new Date(t.timestamp);
          t.createdAt = new Date(t.createdAt);
          t.updatedAt = new Date(t.updatedAt);
          if (t.photo) {
            t.photo.timestamp = new Date(t.photo.timestamp);
          }
          this.timestampsMap.set(t.id, t);
        });
        this._timestamps.set(Array.from(this.timestampsMap.values()));
      }

      if (imported.locations) {
        imported.locations.forEach((l: any) => {
          this.locationsMap.set(l.id, l);
        });
        this._locations.set(Array.from(this.locationsMap.values()));
      }

      this.updateStats();
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'ts_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

