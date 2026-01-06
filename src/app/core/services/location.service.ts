import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  isActive: boolean;
  type: 'workplace' | 'restricted' | 'custom';
  color: string;
  description?: string;
}

export interface LocationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  error?: string;
}

export interface LocationSettings {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  enableBackgroundTracking: boolean;
  trackingInterval: number; // in milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentLocation: LocationData | null = null;
  private watchId: number | null = null;
  private geofenceZonesMap: Map<string, GeofenceZone> = new Map();
  private isTracking = false;

  // ✅ Signals for reactive state
  private _location = signal<LocationData | null>(null);
  private _geofenceZones = signal<GeofenceZone[]>([]);
  private _permission = signal<LocationPermission>({
    granted: false,
    denied: false,
    prompt: false
  });

  // ✅ Readonly signals for public access
  public readonly location = this._location.asReadonly();
  public readonly geofenceZones = this._geofenceZones.asReadonly();
  public readonly permission = this._permission.asReadonly();

  // ✅ Computed signals for derived state
  public readonly hasLocation = computed(() => this._location() !== null);
  public readonly isInGeofence = computed(() => {
    const loc = this._location();
    if (!loc) return false;
    return this._geofenceZones().some(zone => {
      if (!zone.isActive) return false;
      const distance = this.calculateDistance(
        { latitude: loc.latitude, longitude: loc.longitude },
        zone.center
      );
      return distance <= zone.radius;
    });
  });
  public readonly activeGeofenceZonesCount = computed(() =>
    this._geofenceZones().filter(z => z.isActive).length
  );

  // ✅ Observable compatibility layer (for backward compatibility)
  public location$ = new Observable<LocationData | null>(observer => {
    observer.next(this._location());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public geofenceZones$ = new Observable<GeofenceZone[]>(observer => {
    observer.next(this._geofenceZones());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public permission$ = new Observable<LocationPermission>(observer => {
    observer.next(this._permission());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  // Default settings
  private settings: LocationSettings = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000,
    enableBackgroundTracking: false,
    trackingInterval: 5000
  };

  constructor() {
    this.initializeDefaultGeofences();
    this.checkLocationPermission();
  }

  /**
   * Initialize default geofence zones
   */
  private initializeDefaultGeofences(): void {
    const defaultZones: GeofenceZone[] = [
      {
        id: 'main-office',
        name: 'สำนักงานใหญ่',
        center: { latitude: 13.7563, longitude: 100.5018 },
        radius: 100,
        isActive: true,
        type: 'workplace',
        color: '#10B981',
        description: 'พื้นที่ทำงานหลัก'
      },
      {
        id: 'branch-office',
        name: 'สาขาเชียงใหม่',
        center: { latitude: 18.7883, longitude: 98.9853 },
        radius: 50,
        isActive: true,
        type: 'workplace',
        color: '#3B82F6',
        description: 'สาขาเชียงใหม่'
      },
      {
        id: 'restricted-area',
        name: 'พื้นที่จำกัด',
        center: { latitude: 13.7563, longitude: 100.5018 },
        radius: 20,
        isActive: true,
        type: 'restricted',
        color: '#EF4444',
        description: 'พื้นที่ห้ามเข้า'
      }
    ];

    defaultZones.forEach(zone => {
      this.geofenceZonesMap.set(zone.id, zone);
    });
    this._geofenceZones.set(Array.from(this.geofenceZonesMap.values()));
  }

  /**
   * Check location permission
   */
  private async checkLocationPermission(): Promise<void> {
    if (!navigator.geolocation) {
      this._permission.set({
        granted: false,
        denied: true,
        prompt: false,
        error: 'Geolocation is not supported by this browser'
      });
      return;
    }

    try {
      // Check if permission is already granted
      const permission = await (navigator.permissions as any)?.query({ name: 'geolocation' });

      if (permission) {
        this._permission.set({
          granted: permission.state === 'granted',
          denied: permission.state === 'denied',
          prompt: permission.state === 'prompt'
        });
      } else {
        // Fallback: try to get current position
        await this.getCurrentPosition();
      }
    } catch (error) {
      this._permission.set({
        granted: false,
        denied: true,
        prompt: false,
        error: 'Failed to check location permission'
      });
    }
  }

  /**
   * Request location permission
   */
  public async requestLocationPermission(): Promise<boolean> {
    try {
      const position = await this.getCurrentPosition();
      this._permission.set({
        granted: true,
        denied: false,
        prompt: false
      });
      return true;
    } catch (error) {
      this._permission.set({
        granted: false,
        denied: true,
        prompt: false,
        error: 'Location permission denied'
      });
      return false;
    }
  }

  /**
   * Get current position
   */
  public async getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp
          };

          this.currentLocation = locationData;
          this._location.set(locationData);
          resolve(locationData);
        },
        (error) => {
          reject(error);
        },
        this.settings
      );
    });
  }

  /**
   * Start location tracking
   */
  public startTracking(): void {
    if (this.isTracking) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp
        };

        this.currentLocation = locationData;
        this._location.set(locationData);
        this.checkGeofences(locationData);
      },
      (error) => {
        console.error('Location tracking error:', error);
        this.handleLocationError(error);
      },
      this.settings
    );

    this.isTracking = true;
  }

  /**
   * Stop location tracking
   */
  public stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  /**
   * Check geofences for current location
   */
  private checkGeofences(location: LocationData): void {
    this.geofenceZonesMap.forEach(zone => {
      if (!zone.isActive) return;

      const distance = this.calculateDistance(
        { latitude: location.latitude, longitude: location.longitude },
        zone.center
      );

      const isInside = distance <= zone.radius;
      // In a real app, you would emit events or call callbacks here
      // Location geofence check completed
    });
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
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
   * Handle location errors
   */
  private handleLocationError(error: GeolocationPositionError): void {
    let errorMessage = 'Unknown location error';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user';
        this._permission.set({
          granted: false,
          denied: true,
          prompt: false,
          error: errorMessage
        });
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }

    console.error('Location error:', errorMessage);
  }

  /**
   * Add geofence zone
   */
  public addGeofenceZone(zone: Omit<GeofenceZone, 'id'>): string {
    const id = this.generateId();
    const newZone: GeofenceZone = { ...zone, id };

    this.geofenceZonesMap.set(id, newZone);
    this._geofenceZones.set(Array.from(this.geofenceZonesMap.values()));

    return id;
  }

  /**
   * Update geofence zone
   */
  public updateGeofenceZone(id: string, updates: Partial<GeofenceZone>): void {
    const zone = this.geofenceZonesMap.get(id);
    if (zone) {
      const updatedZone = { ...zone, ...updates };
      this.geofenceZonesMap.set(id, updatedZone);
      this._geofenceZones.set(Array.from(this.geofenceZonesMap.values()));
    }
  }

  /**
   * Delete geofence zone
   */
  public deleteGeofenceZone(id: string): void {
    this.geofenceZonesMap.delete(id);
    this._geofenceZones.set(Array.from(this.geofenceZonesMap.values()));
  }

  /**
   * Get current location
   */
  public getCurrentLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Get geofence zones
   */
  public getGeofenceZones(): GeofenceZone[] {
    return Array.from(this.geofenceZonesMap.values());
  }

  /**
   * Check if location is within any geofence
   */
  public isWithinGeofence(location: { latitude: number; longitude: number }): GeofenceZone | null {
    for (const zone of this.geofenceZonesMap.values()) {
      if (!zone.isActive) continue;

      const distance = this.calculateDistance(location, zone.center);
      if (distance <= zone.radius) {
        return zone;
      }
    }
    return null;
  }

  /**
   * Get nearest geofence
   */
  public getNearestGeofence(location: { latitude: number; longitude: number }): { zone: GeofenceZone; distance: number } | null {
    let nearest: { zone: GeofenceZone; distance: number } | null = null;

    for (const zone of this.geofenceZonesMap.values()) {
      if (!zone.isActive) continue;

      const distance = this.calculateDistance(location, zone.center);
      if (!nearest || distance < nearest.distance) {
        nearest = { zone, distance };
      }
    }

    return nearest;
  }

  /**
   * Update location settings
   */
  public updateSettings(settings: Partial<LocationSettings>): void {
    this.settings = { ...this.settings, ...settings };

    // Restart tracking if currently tracking
    if (this.isTracking) {
      this.stopTracking();
      this.startTracking();
    }
  }

  /**
   * Get location settings
   */
  public getSettings(): LocationSettings {
    return { ...this.settings };
  }

  /**
   * Get location history (mock implementation)
   */
  public getLocationHistory(limit: number = 100): LocationData[] {
    // In a real app, this would fetch from a database
    // For now, return empty array
    return [];
  }

  /**
   * Clear location history
   */
  public clearLocationHistory(): void {
    // In a real app, this would clear the database
    // Location history cleared
  }

  /**
   * Export location data
   */
  public exportLocationData(): string {
    const data = {
      currentLocation: this.currentLocation,
      geofenceZones: Array.from(this.geofenceZonesMap.values()),
      settings: this.settings,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import location data
   */
  public importLocationData(data: string): void {
    try {
      const imported = JSON.parse(data);

      if (imported.geofenceZones) {
        this.geofenceZonesMap.clear();
        imported.geofenceZones.forEach((zone: GeofenceZone) => {
          this.geofenceZonesMap.set(zone.id, zone);
        });
        this._geofenceZones.set(Array.from(this.geofenceZonesMap.values()));
      }

      if (imported.settings) {
        this.settings = { ...this.settings, ...imported.settings };
      }
    } catch (error) {
      console.error('Failed to import location data:', error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'loc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get location permission status
   */
  public getPermissionStatus(): LocationPermission {
    return this._permission();
  }

  /**
   * Check if tracking is active
   */
  public isTrackingActive(): boolean {
    return this.isTracking;
  }
}
