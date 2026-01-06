/**
 * Timestamp Demo Component
 *
 * Demo component showcasing timestamp component with various date/time formats and display modes.
 * Demonstrates relative time, absolute time, and timestamp formatting options.
 *
 * @example
 * ```html
 * <app-timestamp-demo></app-timestamp-demo>
 * ```
 */

import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimestampComponent } from '../../../shared/components/timestamp/timestamp.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { TimestampService, TimestampRecord, TimestampStats, LocationSettings } from '../../../core/services/timestamp.service';
import { LocationService, LocationData } from '../../../core/services/location.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-timestamp-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TimestampComponent,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './timestamp-demo.component.html',
  styleUrls: ['./timestamp-demo.component.scss']
})
export class TimestampDemoComponent extends BaseComponent implements OnInit {
  // Demo statistics
  stats: TimestampStats = {
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

  // Recent timestamps
  recentTimestamps: TimestampRecord[] = [];

  // Location data
  currentLocation: LocationData | null = null;
  availableLocations: LocationSettings[] = [];

  // Demo settings
  demoSettings = {
    showAdvancedFeatures: false,
    enableLocationTracking: true,
    enablePhotoCapture: true,
    autoSave: false,
    showWorkingHours: true
  };

  // UI state
  selectedTab: 'overview' | 'timestamps' | 'locations' | 'settings' = 'overview';
  selectedDateRange = 'today';
  customDateRange = {
    start: new Date(),
    end: new Date()
  };

  constructor(
    private timestampService: TimestampService,
    private locationService: LocationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToServices();
    this.loadDemoData();
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToServices(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const stats = this.timestampService.stats();
      this.stats = stats;
    });

    effect(() => {
      const timestamps = this.timestampService.timestamps();
      this.recentTimestamps = timestamps.slice(0, 10);
    });

    effect(() => {
      const location = this.locationService.location();
      this.currentLocation = location;
    });

    effect(() => {
      const locations = this.timestampService.locations();
      this.availableLocations = locations;
    });
  }

  /**
   * Load demo data
   */
  private loadDemoData(): void {
    // Load settings from localStorage
    this.loadDemoSettings();

    // Generate some sample data for demo
    this.generateSampleData();
  }

  /**
   * Generate sample data for demo
   */
  private generateSampleData(): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Sample timestamps
    const sampleTimestamps: Partial<TimestampRecord>[] = [
      {
        type: 'checkin',
        timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15),
        location: {
          latitude: 13.7563,
          longitude: 100.5018,
          address: 'สำนักงานใหญ่',
          accuracy: 5
        },
        status: 'approved'
      },
      {
        type: 'break_start',
        timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
        location: {
          latitude: 13.7563,
          longitude: 100.5018,
          address: 'สำนักงานใหญ่',
          accuracy: 5
        },
        status: 'approved'
      },
      {
        type: 'break_end',
        timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
        location: {
          latitude: 13.7563,
          longitude: 100.5018,
          address: 'สำนักงานใหญ่',
          accuracy: 5
        },
        status: 'approved'
      },
      {
        type: 'checkout',
        timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30),
        location: {
          latitude: 13.7563,
          longitude: 100.5018,
          address: 'สำนักงานใหญ่',
          accuracy: 5
        },
        status: 'approved'
      }
    ];

    // Add sample timestamps to service
    sampleTimestamps.forEach(timestamp => {
      // In a real app, this would be done through the service
      console.log('Sample timestamp:', timestamp);
    });
  }

  /**
   * Handle timestamp created event
   */
  onTimestampCreated(timestamp: TimestampRecord): void {
    console.log('Timestamp created:', timestamp);
    // In a real app, this would be handled by the service
  }

  /**
   * Handle location changed event
   */
  onLocationChanged(location: LocationData): void {
    console.log('Location changed:', location);
  }

  /**
   * Select tab
   */
  selectTab(tab: string): void {
    this.selectedTab = tab as 'overview' | 'timestamps' | 'locations' | 'settings';
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
   * Get timestamp status label
   */
  getTimestampStatusLabel(status: TimestampRecord['status']): string {
    const labels = {
      pending: 'รออนุมัติ',
      approved: 'อนุมัติแล้ว',
      rejected: 'ปฏิเสธ',
      auto_approved: 'อนุมัติอัตโนมัติ'
    };
    return labels[status] || status;
  }

  /**
   * Get timestamp status color
   */
  getTimestampStatusColor(status: TimestampRecord['status']): string {
    const colors = {
      pending: '#F59E0B',
      approved: '#10B981',
      rejected: '#EF4444',
      auto_approved: '#3B82F6'
    };
    return colors[status] || '#6B7280';
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleString('th-TH');
  }

  /**
   * Get timestamps by date range
   */
  getTimestampsByDateRange(): TimestampRecord[] {
    let startDate: Date;
    let endDate: Date;

    switch (this.selectedDateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
        break;
      case 'custom':
        startDate = this.customDateRange.start;
        endDate = this.customDateRange.end;
        break;
      default:
        startDate = new Date();
        endDate = new Date();
    }

    return this.timestampService.getTimestampsByDateRange(startDate, endDate);
  }

  /**
   * Export data
   */
  exportData(): void {
    const data = this.timestampService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timestamp-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import data
   */
  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.timestampService.importData(e.target?.result as string);
          alert('นำเข้าข้อมูลสำเร็จ');
        } catch (error) {
          alert('การนำเข้าข้อมูลล้มเหลว: ' + (error as Error).message);
        }
      };
      reader.readAsText(file);
    }
  }

  /**
   * Load demo settings from localStorage
   */
  private loadDemoSettings(): void {
    const saved = localStorage.getItem('timestamp-demo-settings');
    if (saved) {
      try {
        this.demoSettings = { ...this.demoSettings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load demo settings:', error);
      }
    }
  }

  /**
   * Save demo settings to localStorage
   */
  saveDemoSettings(): void {
    localStorage.setItem('timestamp-demo-settings', JSON.stringify(this.demoSettings));
  }

  /**
   * Toggle advanced features
   */
  toggleAdvancedFeatures(): void {
    this.demoSettings.showAdvancedFeatures = !this.demoSettings.showAdvancedFeatures;
    this.saveDemoSettings();
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
        return '#10B981';
      case 'outside':
        return '#EF4444';
      default:
        return '#6B7280';
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
   * Check if location is active
   */
  isLocationActive(location: LocationSettings): boolean {
    return location.isActive;
  }

  /**
   * Toggle location active status
   */
  toggleLocationActive(location: LocationSettings): void {
    this.timestampService.updateLocation(location.id, { isActive: !location.isActive });
  }

  /**
   * Delete location
   */
  deleteLocation(location: LocationSettings): void {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบสถานที่ "${location.name}"?`)) {
      this.timestampService.deleteLocation(location.id);
    }
  }

  /**
   * Get working hours for location
   */
  getWorkingHours(location: LocationSettings): string {
    return `${location.workingHours.start} - ${location.workingHours.end}`;
  }

  /**
   * Get working days for location
   */
  getWorkingDays(location: LocationSettings): string {
    const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    return location.workingHours.days.map(day => dayNames[day]).join(', ');
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
   * Add new location
   */
  addLocation(): void {
    // In a real app, this would open a modal or navigate to a form
    const newLocation: Omit<LocationSettings, 'id'> = {
      name: 'สถานที่ใหม่',
      address: 'กรุณาแก้ไขที่อยู่',
      coordinates: { latitude: 13.7563, longitude: 100.5018 },
      radius: 100,
      isActive: true,
      allowedTypes: ['checkin', 'checkout'],
      workingHours: {
        start: '08:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5]
      },
      timezone: 'Asia/Bangkok'
    };

    this.timestampService.addLocation(newLocation);
  }

  /**
   * Round number for display
   */
  roundNumber(value: number): number {
    return Math.round(value);
  }

  /**
   * Get location timestamp
   */
  getLocationTimestamp(): Date {
    return this.currentLocation ? new Date(this.currentLocation.timestamp) : new Date();
  }

  /**
   * Get tab icon with proper typing
   */
  getTabIcon(tab: string): string {
    const icons: { [key: string]: string } = {
      overview: 'fa-chart-pie',
      timestamps: 'fa-clock',
      locations: 'fa-map-marker-alt',
      settings: 'fa-cog'
    };
    return icons[tab] || 'fa-circle';
  }

  /**
   * Get tab label with proper typing
   */
  getTabLabel(tab: string): string {
    const labels: { [key: string]: string } = {
      overview: 'ภาพรวม',
      timestamps: 'บันทึกเวลา',
      locations: 'สถานที่',
      settings: 'การตั้งค่า'
    };
    return labels[tab] || tab;
  }
}
