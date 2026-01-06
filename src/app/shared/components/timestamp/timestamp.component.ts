/**
 * Timestamp Component
 *
 * A component for recording timestamps (check-in/check-out) with face recognition,
 * location tracking, photo capture, and notes. Supports both camera and manual modes.
 *
 * @example
 * ```html
 * <app-timestamp
 *   [mode]="'camera'"
 *   [showPhoto]="true"
 *   [showLocation]="true"
 *   [showNotes]="true"
 *   [autoSave]="false"
 *   [customClass]="'my-timestamp'"
 *   [ariaLabel]="'Timestamp recorder'"
 *   (timestampCreated)="onTimestampCreated($event)"
 *   (locationChanged)="onLocationChanged($event)">
 * </app-timestamp>
 * ```
 */

import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimestampService, TimestampRecord, LocationSettings } from '../../../core/services/timestamp.service';
import { LocationService, LocationData } from '../../../core/services/location.service';
import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { GlassCardComponent } from '../glass-card/glass-card.component';
import { GlassInputComponent } from '../glass-input/glass-input.component';
import { FaceRecognitionComponent } from '../face-recognition/face-recognition.component';
import { BaseComponent } from '../../../core/base/base.component';

import { ImageOptimizationDirective } from '../../directives/image-optimization.directive';

@Component({
  selector: 'app-timestamp',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    GlassButtonComponent,
    GlassCardComponent,
    GlassInputComponent,
    FaceRecognitionComponent,
    ImageOptimizationDirective
  ],
  templateUrl: './timestamp.component.html',
  styleUrls: ['./timestamp.component.scss']
})
export class TimestampComponent extends BaseComponent implements OnInit {
  /**
   * Face recognition component reference
   */
  @ViewChild(FaceRecognitionComponent) faceComponent!: FaceRecognitionComponent;

  /**
   * Canvas element reference
   */
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  /**
   * File input element reference
   */
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  /**
   * Timestamp mode
   */
  @Input() mode: 'camera' | 'manual' = 'camera';

  /**
   * Show photo capture
   */
  @Input() showPhoto: boolean = true;

  /**
   * Show location selector
   */
  @Input() showLocation: boolean = true;

  /**
   * Show notes field
   */
  @Input() showNotes: boolean = true;

  /**
   * Auto save timestamps
   */
  @Input() autoSave: boolean = false;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Timestamp created event
   */
  @Output() timestampCreated = new EventEmitter<TimestampRecord>();

  /**
   * Location changed event
   */
  @Output() locationChanged = new EventEmitter<LocationData>();

  // Component state
  isInitialized = false;
  isStreaming = false;
  isCapturing = false;
  currentLocation: LocationData | null = null;
  availableLocations: LocationSettings[] = [];
  selectedLocation: LocationSettings | null = null;

  // UI state
  selectedFile: File | null = null;
  previewImage: string | null = null;
  notes = '';
  timestampType: TimestampRecord['type'] = 'checkin';
  showLocationSelector = false;
  showPhotoCapture = false;

  // Statistics
  todayStats = {
    checkins: 0,
    checkouts: 0,
    totalHours: 0,
    isCheckedIn: false
  };

  constructor(
    private timestampService: TimestampService,
    private locationService: LocationService
  ) {
    super();
  }

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.initializeServices();
    this.subscribeToServices();
    this.loadTodayStats();
  }

  /**
   * Initialize services
   */
  private async initializeServices(): Promise<void> {
    try {
      // Request location permission
      const hasPermission = await this.locationService.requestLocationPermission();
      if (hasPermission) {
        this.currentLocation = this.locationService.getCurrentLocation();
        this.locationService.startTracking();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToServices(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const location = this.locationService.location();
      this.currentLocation = location;
      this.locationChanged.emit(location || undefined);
      this.updateSelectedLocation();
    });

    // ✅ Using signals (no subscription needed)
    effect(() => {
      const locations = this.timestampService.locations();
      this.availableLocations = locations;
      this.updateSelectedLocation();
    });
  }

  /**
   * Update selected location based on current position
   */
  private updateSelectedLocation(): void {
    if (!this.currentLocation) return;

    const nearestZone = this.locationService.getNearestGeofence({
      latitude: this.currentLocation.latitude,
      longitude: this.currentLocation.longitude
    });

    if (nearestZone) {
      this.selectedLocation = this.availableLocations.find(loc => loc.id === nearestZone.zone.id) || null;
    }
  }

  /**
   * Load today's statistics
   */
  private loadTodayStats(): void {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayTimestamps = this.timestampService.getTimestampsByDateRange(startOfDay, endOfDay);

    this.todayStats.checkins = todayTimestamps.filter(t => t.type === 'checkin').length;
    this.todayStats.checkouts = todayTimestamps.filter(t => t.type === 'checkout').length;
    this.todayStats.isCheckedIn = this.todayStats.checkins > this.todayStats.checkouts;

    // Calculate total hours (simplified)
    const checkinTimes = todayTimestamps.filter(t => t.type === 'checkin').map(t => t.timestamp);
    const checkoutTimes = todayTimestamps.filter(t => t.type === 'checkout').map(t => t.timestamp);

    if (checkinTimes.length > 0 && checkoutTimes.length > 0) {
      const totalMs = checkoutTimes[checkoutTimes.length - 1].getTime() - checkinTimes[0].getTime();
      this.todayStats.totalHours = Math.round(totalMs / (1000 * 60 * 60) * 10) / 10;
    }
  }

  /**
   * Start camera stream (proxied to child component)
   */
  async startCamera(): Promise<void> {
    if (this.faceComponent) {
      await this.faceComponent.startCamera();
      this.isStreaming = true;
    }
  }

  /**
   * Stop camera stream (proxied to child component)
   */
  stopCamera(): void {
    if (this.faceComponent) {
      this.faceComponent.stopCamera();
      this.isStreaming = false;
    }
  }

  /**
   * Capture photo from camera
   */
  capturePhoto(): void {
    if (!this.faceComponent || !this.faceComponent.videoElement) return;

    try {
      this.isCapturing = true;
      const video = this.faceComponent.videoElement.nativeElement;

      // Use existing canvas or create temp one
      let canvas = this.canvasElement?.nativeElement;
      if (!canvas) {
        canvas = document.createElement('canvas');
      }

      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      this.previewImage = canvas.toDataURL('image/jpeg', 0.8);
      this.showPhotoCapture = true;

      // Stop camera after capture
      this.stopCamera();

    } catch (error) {
      console.error('Failed to capture photo:', error);
    } finally {
      this.isCapturing = false;
    }
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target?.result as string;
        this.showPhotoCapture = true;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  /**
   * Create timestamp record
   */
  async createTimestamp(): Promise<void> {
    if (!this.selectedLocation) {
      alert('กรุณาเลือกสถานที่');
      return;
    }

    try {
      // Use createTimestampRecord for client-side timestamp creation
      const timestamp = await this.timestampService.createTimestampRecord(
        this.timestampType,
        this.selectedLocation.id,
        this.previewImage || undefined,
        this.notes || undefined
      );

      this.timestampCreated.emit(timestamp);
      this.resetForm();
      this.loadTodayStats();

      alert(`บันทึก ${this.getTimestampTypeLabel(this.timestampType)} สำเร็จ`);
    } catch (error) {
      console.error('Failed to create timestamp:', error);
      alert('การบันทึกล้มเหลว: ' + (error as Error).message);
    }
  }

  /**
   * Reset form
   */
  private resetForm(): void {
    this.notes = '';
    this.previewImage = null;
    this.selectedFile = null;
    this.showPhotoCapture = false;
    this.showLocationSelector = false;
    // Camera is already stopped after capture, but ensure state is reset
    this.isStreaming = false;
  }

  /**
   * Get timestamp type label
   */
  getTimestampTypeLabel(type: TimestampRecord['type']): string {
    const labels = {
      checkin: 'เข้างาน',
      checkout: 'ออกงาน',
      break_start: 'เริ่มพัก',
      break_end: 'สิ้นสุดพัก',
      overtime_start: 'เริ่มล่วงเวลา',
      overtime_end: 'สิ้นสุดล่วงเวลา'
    };
    return labels[type] || type;
  }

  /**
   * Get available timestamp types based on current status
   */
  getAvailableTimestampTypes(): TimestampRecord['type'][] {
    if (this.todayStats.isCheckedIn) {
      return ['checkout', 'break_start', 'overtime_start'];
    } else {
      return ['checkin'];
    }
  }

  /**
   * Toggle location selector
   */
  toggleLocationSelector(): void {
    this.showLocationSelector = !this.showLocationSelector;
  }

  /**
   * Select location
   */
  selectLocation(location: LocationSettings): void {
    this.selectedLocation = location;
    this.showLocationSelector = false;
  }

  /**
   * Get location distance
   */
  getLocationDistance(location: LocationSettings): number {
    if (!this.currentLocation) return 0;

    const distance = this.locationService['calculateDistance'](
      { latitude: this.currentLocation.latitude, longitude: this.currentLocation.longitude },
      location.coordinates
    );

    return Math.round(distance);
  }

  /**
   * Format distance for display
   */
  formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${distance}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }

  /**
   * Get location status
   */
  getLocationStatus(location: LocationSettings): 'inside' | 'outside' | 'unknown' {
    if (!this.currentLocation) return 'unknown';

    const distance = this.getLocationDistance(location);
    return distance <= location.radius ? 'inside' : 'outside';
  }

  /**
   * Get location status color
   */
  getLocationStatusColor(status: 'inside' | 'outside' | 'unknown'): string {
    switch (status) {
      case 'inside':
        return 'var(--color-success-500, #10B981)';
      case 'outside':
        return 'var(--color-error-500, #EF4444)';
      default:
        return 'var(--color-gray-500, #6B7280)';
    }
  }

  /**
   * Get location status icon
   */
  getLocationStatusIcon(status: 'inside' | 'outside' | 'unknown'): string {
    switch (status) {
      case 'inside':
        return 'fas fa-check-circle';
      case 'outside':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  /**
   * Toggle photo capture
   */
  togglePhotoCapture(): void {
    this.showPhotoCapture = !this.showPhotoCapture;

    // Auto start camera if showing capture and camera mode
    if (this.showPhotoCapture && this.mode === 'camera' && !this.previewImage) {
      // Need to wait for view to init
      setTimeout(() => this.startCamera(), 100);
    } else if (!this.showPhotoCapture) {
      this.stopCamera();
    }
  }

  /**
   * Remove photo
   */
  removePhoto(): void {
    this.previewImage = null;
    this.selectedFile = null;
    // Don't close capture view, just let user retake
    if (this.mode === 'camera') {
      this.startCamera();
    }
  }

  /**
   * Get current time
   */
  /**
   * Get current time formatted string
   */
  getCurrentTime(): string {
    return new Date().toLocaleTimeString('th-TH');
  }

  /**
   * Get current date
   */
  /**
   * Get current date formatted string
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  /**
   * Check if location is available for timestamp type
   */
  isLocationAvailableForType(location: LocationSettings, type: TimestampRecord['type']): boolean {
    return location.allowedTypes.includes(type);
  }

  /**
   * Get working hours for location
   */
  getWorkingHours(location: LocationSettings): string {
    return `${location.workingHours.start} - ${location.workingHours.end}`;
  }

  /**
   * Check if current time is within working hours
   */
  isWithinWorkingHours(location: LocationSettings): boolean {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    const dayOfWeek = now.getDay();

    return location.workingHours.days.includes(dayOfWeek) &&
           timeString >= location.workingHours.start &&
           timeString <= location.workingHours.end;
  }

  /**
   * Get timestamp type icon
   */
  getTimestampTypeIcon(type: TimestampRecord['type']): string {
    const icons = {
      checkin: 'fa-sign-in-alt',
      checkout: 'fa-sign-out-alt',
      break_start: 'fa-coffee',
      break_end: 'fa-play',
      overtime_start: 'fa-clock',
      overtime_end: 'fa-stop'
    };
    return icons[type] || 'fa-clock';
  }

  /**
   * Round number for display
   */
  roundNumber(value: number): number {
    return Math.round(value);
  }
}
