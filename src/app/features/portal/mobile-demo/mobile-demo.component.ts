/**
 * Mobile Demo Component
 *
 * Demo component showcasing mobile features including camera, push notifications, and offline support.
 * Demonstrates native bridge capabilities, device info, and mobile-specific functionality.
 *
 * @example
 * ```html
 * <app-mobile-demo></app-mobile-demo>
 * ```
 */

import { Component, OnInit, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { MobileCameraComponent } from '../../../shared/components/mobile-camera/mobile-camera.component';
import { NativeBridgeService, NativeCapabilities, DeviceInfo } from '../../../core/services/native-bridge.service';
import { MobileCameraService, PhotoResult } from '../../../core/services/mobile-camera.service';
import { PushNotificationsService, PushNotification, NotificationSettings } from '../../../core/services/push-notifications.service';
import { OfflineSupportService, OfflineData, SyncStatus } from '../../../core/services/offline-support.service';
import { BaseComponent } from '../../../core/base/base.component';

import { ImageOptimizationDirective } from '../../../shared/directives/image-optimization.directive';

@Component({
  selector: 'app-mobile-demo',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    MobileCameraComponent,
    ImageOptimizationDirective
  ],
  templateUrl: './mobile-demo.component.html',
  styleUrls: ['./mobile-demo.component.scss']
})
export class MobileDemoComponent extends BaseComponent implements OnInit {
  // Data
  capabilities: NativeCapabilities | null = null;
  deviceInfo: DeviceInfo | null = null;
  notifications: PushNotification[] = [];
  offlineData: OfflineData[] = [];
  syncStatus: SyncStatus = {
    isOnline: false,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    failedItems: 0,
    totalItems: 0,
    syncProgress: 0
  };

  // UI State
  selectedTab: 'overview' | 'camera' | 'notifications' | 'offline' | 'settings' = 'overview';
  showCamera = false;
  lastPhoto: PhotoResult | null = null;
  notificationSettings: NotificationSettings;
  offlineSettings: any;

  // Demo data
  demoNotifications: PushNotification[] = [];
  demoOfflineData: OfflineData[] = [];

  constructor(
    private nativeBridge: NativeBridgeService,
    private mobileCamera: MobileCameraService,
    private pushNotifications: PushNotificationsService,
    private offlineSupport: OfflineSupportService
  ) {
    super();
    this.notificationSettings = this.pushNotifications.getSettings();
    this.offlineSettings = this.offlineSupport.getSettings();
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
      const capabilities = this.nativeBridge.capabilities();
      this.capabilities = capabilities;
    });

    effect(() => {
      const deviceInfo = this.nativeBridge.deviceInfo();
      this.deviceInfo = deviceInfo;
    });

    // ✅ Using signals (no subscription needed)
    effect(() => {
      const notifications = this.pushNotifications.notifications();
      this.notifications = notifications;
    });

    // ✅ Using signals (no subscription needed)
    effect(() => {
      const offlineData = this.offlineSupport.offlineData();
      this.offlineData = offlineData;
    });

    effect(() => {
      const syncStatus = this.offlineSupport.syncStatus();
      this.syncStatus = syncStatus;
    });
  }

  /**
   * Load demo data
   */
  private loadDemoData(): void {
    // Generate demo notifications
    this.demoNotifications = [
      {
        id: 'demo_1',
        title: 'Welcome to Mobile Demo',
        body: 'This is a demo push notification',
        timestamp: new Date(),
        read: false,
        category: 'general'
      },
      {
        id: 'demo_2',
        title: 'Camera Ready',
        body: 'Mobile camera is now available',
        timestamp: new Date(Date.now() - 300000),
        read: true,
        category: 'system'
      }
    ];

    // Generate demo offline data
    this.demoOfflineData = [
      {
        id: 'offline_1',
        type: 'timestamp',
        data: { action: 'checkin', location: 'Office' },
        timestamp: new Date(),
        synced: false,
        retryCount: 0,
        maxRetries: 3,
        priority: 'high'
      },
      {
        id: 'offline_2',
        type: 'photo',
        data: { filename: 'photo_001.jpg', size: 1024000 },
        timestamp: new Date(Date.now() - 600000),
        synced: true,
        retryCount: 0,
        maxRetries: 3,
        priority: 'normal'
      }
    ];
  }

  /**
   * Select tab
   */
  selectTab(tab: string): void {
    this.selectedTab = tab as 'overview' | 'camera' | 'notifications' | 'offline' | 'settings';
  }

  /**
   * Toggle camera
   */
  toggleCamera(): void {
    this.showCamera = !this.showCamera;
  }

  /**
   * Handle photo captured
   */
  onPhotoCaptured(photo: PhotoResult): void {
    this.lastPhoto = photo;
    this.showCamera = false;

    // Store offline data
    this.offlineSupport.storeOfflineData('photo', {
      dataUrl: photo.dataUrl,
      width: photo.width,
      height: photo.height,
      size: photo.size,
      timestamp: photo.timestamp,
      location: photo.location
    }, 'high');
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<void> {
    try {
      await this.pushNotifications.sendNotification({
        title: 'Test Notification',
        body: 'This is a test notification from the mobile demo',
        category: 'general',
        priority: 'normal'
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<void> {
    try {
      await this.pushNotifications.requestPermission();
    } catch (error) {
      console.error('Failed to request permission:', error);
    }
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(id: string): void {
    this.pushNotifications.markAsRead(id);
  }

  /**
   * Delete notification
   */
  deleteNotification(id: string): void {
    this.pushNotifications.deleteNotification(id);
  }

  /**
   * Sync offline data
   */
  async syncOfflineData(): Promise<void> {
    try {
      await this.offlineSupport.forceSync();
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  /**
   * Store test offline data
   */
  async storeTestOfflineData(): Promise<void> {
    try {
      await this.offlineSupport.storeOfflineData('test', {
        message: 'This is test offline data',
        timestamp: new Date(),
        random: Math.random()
      }, 'normal');
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }

  /**
   * Delete offline data
   */
  deleteOfflineData(id: string): void {
    this.offlineSupport.deleteOfflineData(id);
  }

  /**
   * Update notification settings
   */
  updateNotificationSettings(): void {
    this.pushNotifications.updateSettings(this.notificationSettings);
  }

  /**
   * Update offline settings
   */
  updateOfflineSettings(): void {
    this.offlineSupport.updateSettings(this.offlineSettings);
  }

  /**
   * Get capability status
   */
  getCapabilityStatus(capability: string): string {
    if (!this.capabilities) return 'Unknown';
    return this.capabilities[capability as keyof NativeCapabilities] ? 'Available' : 'Not Available';
  }

  /**
   * Get capability color
   */
  getCapabilityColor(capability: string): string {
    if (!this.capabilities) return '#6B7280';
    return this.capabilities[capability as keyof NativeCapabilities] ? '#10B981' : '#EF4444';
  }

  /**
   * Get capability icon
   */
  getCapabilityIcon(capability: string): string {
    if (!this.capabilities) return 'fas fa-question-circle';
    return this.capabilities[capability as keyof NativeCapabilities] ? 'fas fa-check-circle' : 'fas fa-times-circle';
  }

  /**
   * Get capability name
   */
  getCapabilityName(capability: string): string {
    return capability.replace('has', '').replace(/([A-Z])/g, ' $1').trim();
  }

  /**
   * Handle camera ready
   */
  onCameraReady(ready: boolean): void {
    console.log('Camera ready:', ready);
  }

  /**
   * Handle camera error
   */
  onCameraError(error: string): void {
    console.error('Camera error:', error);
  }

  /**
   * Get tab icon
   */
  getTabIcon(tab: string): string {
    const icons: { [key: string]: string } = {
      overview: 'fa-mobile-alt',
      camera: 'fa-camera',
      notifications: 'fa-bell',
      offline: 'fa-cloud-download-alt',
      settings: 'fa-cog'
    };
    return icons[tab] || 'fa-circle';
  }

  /**
   * Get tab label
   */
  getTabLabel(tab: string): string {
    const labels: { [key: string]: string } = {
      overview: 'ภาพรวม',
      camera: 'กล้อง',
      notifications: 'การแจ้งเตือน',
      offline: 'ออฟไลน์',
      settings: 'การตั้งค่า'
    };
    return labels[tab] || tab;
  }

  /**
   * Format date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('th-TH');
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get sync status color
   */
  getSyncStatusColor(): string {
    if (this.syncStatus.isSyncing) return '#3B82F6';
    if (this.syncStatus.failedItems > 0) return '#EF4444';
    if (this.syncStatus.pendingItems > 0) return '#F59E0B';
    return '#10B981';
  }

  /**
   * Get sync status text
   */
  getSyncStatusText(): string {
    if (this.syncStatus.isSyncing) return 'กำลังซิงค์...';
    if (this.syncStatus.failedItems > 0) return 'ซิงค์ล้มเหลว';
    if (this.syncStatus.pendingItems > 0) return 'รอซิงค์';
    return 'ซิงค์เสร็จสิ้น';
  }

  /**
   * Check if native app
   */
  isNative(): boolean {
    return this.nativeBridge.isNative();
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return this.syncStatus.isOnline;
  }

  /**
   * Get device name
   */
  getDeviceName(): string {
    if (this.deviceInfo) {
      return `${this.deviceInfo.manufacturer} ${this.deviceInfo.model}`;
    }
    return 'Web Browser';
  }

  /**
   * Get platform name
   */
  getPlatformName(): string {
    if (this.deviceInfo) {
      return this.deviceInfo.platform.charAt(0).toUpperCase() + this.deviceInfo.platform.slice(1);
    }
    return 'Web';
  }

  /**
   * Vibrate device
   */
  async vibrateDevice(): Promise<void> {
    try {
      await this.nativeBridge.vibrate(200);
    } catch (error) {
      console.error('Failed to vibrate:', error);
    }
  }

  /**
   * Open native settings
   */
  async openNativeSettings(): Promise<void> {
    try {
      await this.nativeBridge.openSettings();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  }
}
