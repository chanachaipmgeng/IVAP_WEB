import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { NativeBridgeService } from './native-bridge.service';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: { [key: string]: any };
  badge?: number;
  sound?: string;
  vibrate?: number[];
  priority?: 'high' | 'normal' | 'low';
  channelId?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  category?: string;
  imageUrl?: string;
  iconUrl?: string;
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  error?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  categories: {
    [category: string]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  priority: 'high' | 'normal' | 'low';
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'high' | 'normal' | 'low' | 'min';
  sound: boolean;
  vibration: boolean;
  lights: boolean;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {
  private notificationsMap: Map<string, PushNotification> = new Map();
  private settingsData: NotificationSettings = this.getDefaultSettings();
  private channels: Map<string, NotificationChannel> = new Map();
  private permissionData: NotificationPermission = {
    granted: false,
    denied: false,
    prompt: false
  };

  // ✅ Signals for reactive state
  private _notifications = signal<PushNotification[]>([]);
  private _settings = signal<NotificationSettings>(this.settingsData);
  private _permission = signal<NotificationPermission>(this.permissionData);
  private _unreadCount = signal<number>(0);

  // ✅ Readonly signals for public access
  public readonly notifications = this._notifications.asReadonly();
  public readonly settings = this._settings.asReadonly();
  public readonly permission = this._permission.asReadonly();
  public readonly unreadCount = this._unreadCount.asReadonly();

  // ✅ Computed signals for derived state
  public readonly notificationsCount = computed(() => this._notifications().length);
  public readonly readNotificationsCount = computed(() => this._notifications().filter(n => n.read).length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public notifications$ = new Observable<PushNotification[]>(observer => {
    observer.next(this._notifications());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public settings$ = new Observable<NotificationSettings>(observer => {
    observer.next(this._settings());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public permission$ = new Observable<NotificationPermission>(observer => {
    observer.next(this._permission());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public unreadCount$ = new Observable<number>(observer => {
    observer.next(this._unreadCount());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor(
    private nativeBridge: NativeBridgeService
  ) {
    this.initializeNotificationChannels();
    this.checkPermission();
  }

  /**
   * Initialize default notification channels
   */
  private initializeNotificationChannels(): void {
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'general',
        name: 'General Notifications',
        description: 'General app notifications',
        importance: 'normal',
        sound: true,
        vibration: true,
        lights: true,
        enabled: true
      },
      {
        id: 'attendance',
        name: 'Attendance Notifications',
        description: 'Time and attendance related notifications',
        importance: 'high',
        sound: true,
        vibration: true,
        lights: true,
        enabled: true
      },
      {
        id: 'security',
        name: 'Security Alerts',
        description: 'Security and safety alerts',
        importance: 'high',
        sound: true,
        vibration: true,
        lights: true,
        enabled: true
      },
      {
        id: 'approval',
        name: 'Approval Requests',
        description: 'Approval and workflow notifications',
        importance: 'normal',
        sound: true,
        vibration: false,
        lights: true,
        enabled: true
      },
      {
        id: 'system',
        name: 'System Notifications',
        description: 'System updates and maintenance',
        importance: 'low',
        sound: false,
        vibration: false,
        lights: false,
        enabled: true
      }
    ];

    defaultChannels.forEach(channel => {
      this.channels.set(channel.id, channel);
    });
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      sound: true,
      vibration: true,
      badge: true,
      categories: {
        general: true,
        attendance: true,
        security: true,
        approval: true,
        system: false
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        days: [0, 1, 2, 3, 4, 5, 6] // All days
      },
      priority: 'normal'
    };
  }

  /**
   * Check notification permission
   */
  private async checkPermission(): Promise<void> {
    try {
      if (this.nativeBridge.isNative()) {
        const granted = await this.nativeBridge.requestNotificationPermission();
        this.permissionData = {
          granted,
          denied: !granted,
          prompt: false
        };
      } else {
        // Web fallback
        if ('Notification' in window) {
          this.permissionData = {
            granted: Notification.permission === 'granted',
            denied: Notification.permission === 'denied',
            prompt: Notification.permission === 'default'
          };
        } else {
          this.permissionData = {
            granted: false,
            denied: true,
            prompt: false,
            error: 'Notifications not supported'
          };
        }
      }

      this._permission.set(this.permissionData);
    } catch (error) {
      this.permissionData = {
        granted: false,
        denied: true,
        prompt: false,
        error: (error as Error).message
      };
      this._permission.set(this.permissionData);
    }
  }

  /**
   * Request notification permission
   */
  public async requestPermission(): Promise<boolean> {
    try {
      if (this.nativeBridge.isNative()) {
        const granted = await this.nativeBridge.requestNotificationPermission();
        this.permissionData = {
          granted,
          denied: !granted,
          prompt: false
        };
      } else {
        // Web fallback
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          this.permissionData = {
            granted: permission === 'granted',
            denied: permission === 'denied',
            prompt: false
          };
        } else {
          throw new Error('Notifications not supported');
        }
      }

      this._permission.set(this.permissionData);
      return this.permissionData.granted;
    } catch (error) {
      this.permissionData = {
        granted: false,
        denied: true,
        prompt: false,
        error: (error as Error).message
      };
      this._permission.set(this.permissionData);
      return false;
    }
  }

  /**
   * Send push notification
   */
  public async sendNotification(notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      if (!this.permissionData.granted) {
        throw new Error('Notification permission not granted');
      }

      if (!this.settingsData.enabled) {
        throw new Error('Notifications are disabled');
      }

      // Check quiet hours
      if (this.isInQuietHours()) {
        // Notification suppressed due to quiet hours
        return '';
      }

      // Check category settings
      if (notification.category && !this.settingsData.categories[notification.category]) {
        // Notification suppressed for category
        return '';
      }

      const id = this.generateId();
      const fullNotification: PushNotification = {
        ...notification,
        id,
        timestamp: new Date(),
        read: false
      };

      // Store notification
      this.notificationsMap.set(id, fullNotification);
      this._notifications.set(Array.from(this.notificationsMap.values()));
      this.updateUnreadCount();

      // Send native notification
      if (this.nativeBridge.isNative()) {
        await this.nativeBridge.sendPushNotification({
          title: notification.title,
          body: notification.body,
          data: notification.data,
          badge: notification.badge,
          sound: notification.sound,
          vibrate: notification.vibrate,
          priority: notification.priority,
          channelId: notification.channelId
        });
      } else {
        // Web fallback
        await this.sendWebNotification(fullNotification);
      }

      return id;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send web notification
   */
  private async sendWebNotification(notification: PushNotification): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const webNotification = new Notification(notification.title, {
        body: notification.body,
        icon: notification.iconUrl || '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        data: notification.data,
        tag: notification.category,
        requireInteraction: notification.priority === 'high',
        silent: !this.settingsData.sound
      });

      // Handle click
      webNotification.onclick = () => {
        this.markAsRead(notification.id);
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
        webNotification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        webNotification.close();
      }, 5000);
    }
  }

  /**
   * Get all notifications
   */
  public getNotifications(): PushNotification[] {
    return Array.from(this.notificationsMap.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get unread notifications
   */
  public getUnreadNotifications(): PushNotification[] {
    return this.getNotifications().filter(notification => !notification.read);
  }

  /**
   * Mark notification as read
   */
  public markAsRead(id: string): void {
    const notification = this.notificationsMap.get(id);
    if (notification && !notification.read) {
      notification.read = true;
      this.notificationsMap.set(id, notification);
      this._notifications.set(Array.from(this.notificationsMap.values()));
      this.updateUnreadCount();
    }
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): void {
    this.notificationsMap.forEach(notification => {
      notification.read = true;
      this.notificationsMap.set(notification.id, notification);
    });
    this._notifications.set(Array.from(this.notificationsMap.values()));
    this.updateUnreadCount();
  }

  /**
   * Delete notification
   */
  public deleteNotification(id: string): void {
    this.notificationsMap.delete(id);
    this._notifications.set(Array.from(this.notificationsMap.values()));
    this.updateUnreadCount();
  }

  /**
   * Clear all notifications
   */
  public clearAllNotifications(): void {
    this.notificationsMap.clear();
    this._notifications.set([]);
    this.updateUnreadCount();
  }

  /**
   * Get notification by ID
   */
  public getNotification(id: string): PushNotification | undefined {
    return this.notificationsMap.get(id);
  }

  /**
   * Update notification settings
   */
  public updateSettings(settings: Partial<NotificationSettings>): void {
    this.settingsData = { ...this.settingsData, ...settings };
    this._settings.set(this.settingsData);
  }

  /**
   * Get current settings
   */
  public getSettings(): NotificationSettings {
    return { ...this.settingsData };
  }

  /**
   * Get notification channels
   */
  public getChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }

  /**
   * Update channel settings
   */
  public updateChannel(id: string, updates: Partial<NotificationChannel>): void {
    const channel = this.channels.get(id);
    if (channel) {
      const updatedChannel = { ...channel, ...updates };
      this.channels.set(id, updatedChannel);
    }
  }

  /**
   * Check if in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.settingsData.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format
    const currentDay = now.getDay();

    // Check if current day is in quiet hours days
    if (!this.settingsData.quietHours.days.includes(currentDay)) {
      return false;
    }

    const startTime = this.settingsData.quietHours.start;
    const endTime = this.settingsData.quietHours.end;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(): void {
    const unreadCount = this.getUnreadNotifications().length;
    this._unreadCount.set(unreadCount);
  }

  /**
   * Get unread count
   */
  public getUnreadCount(): number {
    return this._unreadCount();
  }

  /**
   * Check if notifications are enabled
   */
  public isEnabled(): boolean {
    return this.settingsData.enabled && this.permissionData.granted;
  }

  /**
   * Check if permission is granted
   */
  public hasPermission(): boolean {
    return this.permissionData.granted;
  }

  /**
   * Get permission status
   */
  public getPermission(): NotificationPermission {
    return { ...this.permissionData };
  }

  /**
   * Schedule notification
   */
  public async scheduleNotification(notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>, delay: number): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const id = await this.sendNotification(notification);
          resolve(id);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }

  /**
   * Cancel scheduled notification
   */
  public cancelScheduledNotification(id: string): void {
    // In a real implementation, this would cancel the scheduled notification
    // Scheduled notification cancelled
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Export notifications
   */
  public exportNotifications(): string {
    const data = {
      notifications: Array.from(this.notificationsMap.values()),
      settings: this.settingsData,
      channels: Array.from(this.channels.values()),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import notifications
   */
  public importNotifications(data: string): void {
    try {
      const imported = JSON.parse(data);

      if (imported.notifications) {
        imported.notifications.forEach((notif: any) => {
          notif.timestamp = new Date(notif.timestamp);
          this.notificationsMap.set(notif.id, notif);
        });
        this._notifications.set(Array.from(this.notificationsMap.values()));
        this.updateUnreadCount();
      }

      if (imported.settings) {
        this.settingsData = { ...this.settingsData, ...imported.settings };
        this._settings.set(this.settingsData);
      }

      if (imported.channels) {
        imported.channels.forEach((channel: any) => {
          this.channels.set(channel.id, channel);
        });
      }
    } catch (error) {
      console.error('Failed to import notifications:', error);
      throw error;
    }
  }
}

