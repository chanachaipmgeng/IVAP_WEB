import { Injectable, ComponentRef, ViewContainerRef, TemplateRef, Type, signal, computed } from '@angular/core';
import { ToastrService, ToastrConfig, IndividualConfig } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import {
  NotificationConfig,
  NotificationAction,
  NotificationHistory,
  NotificationSettings,
  EmailNotificationRequest,
  SMSNotificationRequest,
  LineNotificationRequest,
  WebhookNotificationRequest,
  BulkNotificationRequest,
  NotificationResponse,
  NotificationListItem
} from '../models/notification.model';

// Re-export for backward compatibility
export type {
  NotificationConfig,
  NotificationAction,
  NotificationHistory,
  NotificationSettings,
  EmailNotificationRequest,
  SMSNotificationRequest,
  LineNotificationRequest,
  WebhookNotificationRequest,
  BulkNotificationRequest,
  NotificationResponse,
  NotificationListItem
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // ✅ Signals for reactive state
  private _notifications = signal<NotificationHistory[]>([]);
  private _settings = signal<NotificationSettings>({
    enableSound: true,
    enableVibration: true,
    enableDesktop: true,
    maxNotifications: 50,
    defaultDuration: 5000,
    position: 'top-right',
    theme: 'auto',
    language: 'en'
  });

  // ✅ Readonly signals for public access
  public readonly notifications = this._notifications.asReadonly();
  public readonly settings = this._settings.asReadonly();

  // ✅ Computed signals for derived state
  public readonly notificationCount = computed(() => this._notifications().length);
  public readonly unreadCount = computed(() => this._notifications().filter(n => !n.read && !n.dismissed).length);

  constructor(private toastr: ToastrService) {
    this.loadSettings();
    this.checkNotificationPermission();
  }

  // Basic notification methods
  success(message: string, title?: string, config?: Partial<NotificationConfig>): string {
    return this.show({
      message,
      title: title || 'Success',
      type: 'success',
      icon: 'fas fa-check-circle',
      ...config
    });
  }

  error(message: string, title?: string, config?: Partial<NotificationConfig>): string {
    return this.show({
      message,
      title: title || 'Error',
      type: 'error',
      icon: 'fas fa-exclamation-circle',
      duration: 0, // Error notifications don't auto-close
      ...config
    });
  }

  warning(message: string, title?: string, config?: Partial<NotificationConfig>): string {
    return this.show({
      message,
      title: title || 'Warning',
      type: 'warning',
      icon: 'fas fa-exclamation-triangle',
      ...config
    });
  }

  info(message: string, title?: string, config?: Partial<NotificationConfig>): string {
    return this.show({
      message,
      title: title || 'Information',
      type: 'info',
      icon: 'fas fa-info-circle',
      ...config
    });
  }

  // Advanced notification methods
  show(config: NotificationConfig): string {
    const id = config.id || this.generateId();
    const fullConfig = { ...this.getDefaultConfig(), ...config };

    // Add to history
    const history: NotificationHistory = {
      id,
      config: fullConfig,
      timestamp: new Date(),
      read: false,
      dismissed: false
    };

    this.addToHistory(history);

    // Show toast notification
    this.showToast(fullConfig);

    // Play sound if enabled
    if (fullConfig.sound && this._settings().enableSound) {
      this.playSound(fullConfig.type);
    }

    // Vibrate if enabled
    if (fullConfig.vibration && this._settings().enableVibration) {
      this.vibrate(fullConfig.priority || 'normal');
    }

    // Desktop notification if enabled
    if (this._settings().enableDesktop && document.hidden) {
      this.showDesktopNotification(fullConfig);
    }

    return id;
  }

  // Custom notification with actions
  custom(config: NotificationConfig): string {
    return this.show({
      ...config,
      type: 'custom',
      persistent: true,
      autoClose: false
    });
  }

  // Progress notification
  progress(message: string, progress: number, title?: string): string {
    const id = this.generateId();
    const config: NotificationConfig = {
      id,
      message: `${message} (${progress}%)`,
      title: title || 'Progress',
      type: 'info',
      icon: 'fas fa-spinner fa-spin',
      duration: 0,
      persistent: true,
      autoClose: false
    };

    this.show(config);
    return id;
  }

  // Update progress notification
  updateProgress(id: string, progress: number, message?: string): void {
    this._notifications.update(notifications => {
      const history = notifications.find(n => n.id === id);
      if (history) {
        history.config.message = message ? `${message} (${progress}%)` : `${history.config.message.split(' (')[0]} (${progress}%)`;
      }
      return [...notifications];
    });
  }

  // Dismiss notification
  dismiss(id: string): void {
    this._notifications.update(notifications => {
      const history = notifications.find(n => n.id === id);
      if (history) {
        history.dismissed = true;
      }
      return [...notifications];
    });
    this.toastr.clear();
  }

  // Dismiss all notifications
  dismissAll(): void {
    this._notifications.update(notifications => {
      notifications.forEach(notification => {
        notification.dismissed = true;
      });
      return [...notifications];
    });
    this.toastr.clear();
  }

  // Mark as read
  markAsRead(id: string): void {
    this._notifications.update(notifications => {
      const history = notifications.find(n => n.id === id);
      if (history) {
        history.read = true;
      }
      return [...notifications];
    });
  }

  // Mark all as read
  markAllAsRead(): void {
    this._notifications.update(notifications => {
      notifications.forEach(notification => {
        notification.read = true;
      });
      return [...notifications];
    });
  }

  // Get notifications (for backward compatibility)
  getNotifications(): Observable<NotificationHistory[]> {
    // Return observable that emits current value and updates
    return new Observable(observer => {
      // Emit current value
      observer.next(this._notifications());
      // Subscribe to signal changes (using effect would be better but Observable needed for compatibility)
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  // Get unread notifications
  getUnreadNotifications(): NotificationHistory[] {
    return this._notifications().filter(n => !n.read && !n.dismissed);
  }

  // Get notification count (use computed signal instead)
  getNotificationCount(): number {
    return this.notificationCount();
  }

  // Get unread count (use computed signal instead)
  getUnreadCount(): number {
    return this.unreadCount();
  }

  // Get settings (use signal instead)
  getSettings(): NotificationSettings {
    return this._settings();
  }

  // Update settings
  updateSettings(settings: Partial<NotificationSettings>): void {
    this._settings.update(current => ({ ...current, ...settings }));
    this.saveSettings();
  }

  // Clear old notifications
  clearOld(olderThanDays: number = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    this._notifications.update(notifications =>
      notifications.filter(n => n.timestamp > cutoffDate)
    );
  }

  // Search notifications
  search(query: string, category?: string): NotificationHistory[] {
    let results = this._notifications();

    if (query) {
      const lowercaseQuery = query.toLowerCase();
      results = results.filter(n =>
        n.config.message.toLowerCase().includes(lowercaseQuery) ||
        n.config.title?.toLowerCase().includes(lowercaseQuery) ||
        n.config.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }

    if (category) {
      results = results.filter(n => n.config.category === category);
    }

    return results;
  }

  // Get notifications by type
  getByType(type: NotificationConfig['type']): NotificationHistory[] {
    return this._notifications().filter(n => n.config.type === type);
  }

  // Get notifications by priority
  getByPriority(priority: NotificationConfig['priority']): NotificationHistory[] {
    return this._notifications().filter(n => n.config.priority === priority);
  }

  // Export notifications
  exportNotifications(): string {
    const data = this._notifications().map(n => ({
      id: n.id,
      title: n.config.title,
      message: n.config.message,
      type: n.config.type,
      timestamp: n.timestamp.toISOString(),
      read: n.read,
      dismissed: n.dismissed
    }));

    return JSON.stringify(data, null, 2);
  }

  // Import notifications
  importNotifications(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      const imported: NotificationHistory[] = data.map((item: any) => ({
        id: item.id || this.generateId(),
        config: {
          message: item.message,
          title: item.title,
          type: item.type || 'info',
          ...item.config
        },
        timestamp: new Date(item.timestamp),
        read: item.read || false,
      dismissed: item.dismissed || false
    }));

    this._notifications.update(current => [...current, ...imported]);
    } catch (error) {
      this.error('Failed to import notifications', 'Import Error');
    }
  }

  // Private methods
  private showToast(config: NotificationConfig): void {
    const currentSettings = this._settings();
    const toastConfig: any = {
      timeOut: config.autoClose !== false ? (config.duration || currentSettings.defaultDuration) : 0,
      closeButton: config.showCloseButton !== false,
      progressBar: config.showProgressBar !== false,
      positionClass: this.getPositionClass(config.position || currentSettings.position),
      enableHtml: config.enableHtml || false,
      disableTimeOut: config.persistent || config.autoClose === false,
      tapToDismiss: config.clickToClose !== false
    };

    switch (config.type) {
      case 'success':
        this.toastr.success(config.message, config.title, toastConfig);
        break;
      case 'error':
        this.toastr.error(config.message, config.title, toastConfig);
        break;
      case 'warning':
        this.toastr.warning(config.message, config.title, toastConfig);
        break;
      case 'info':
        this.toastr.info(config.message, config.title, toastConfig);
        break;
      case 'custom':
        this.toastr.show(config.message, config.title, toastConfig);
        break;
    }
  }

  private addToHistory(history: NotificationHistory): void {
    this._notifications.update(current => {
      const maxNotifications = this._settings().maxNotifications;
      return [history, ...current].slice(0, maxNotifications);
    });
  }

  private getDefaultConfig(): NotificationConfig {
    const currentSettings = this._settings();
    return {
      message: '',
      type: 'info',
      duration: currentSettings.defaultDuration,
      position: currentSettings.position,
      showCloseButton: true,
      showProgressBar: true,
      pauseOnHover: true,
      clickToClose: true,
      enableHtml: false,
      priority: 'normal',
      sound: true,
      vibration: true,
      persistent: false,
      autoClose: true
    };
  }

  private getPositionClass(position: NotificationConfig['position']): string {
    const positionMap = {
      'top-right': 'toast-top-right',
      'top-left': 'toast-top-left',
      'bottom-right': 'toast-bottom-right',
      'bottom-left': 'toast-bottom-left',
      'top-center': 'toast-top-center',
      'bottom-center': 'toast-bottom-center'
    };
    return positionMap[position || 'top-right'];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private playSound(type: NotificationConfig['type']): void {
    const audio = new Audio();
    const soundMap = {
      success: 'assets/sounds/success.mp3',
      error: 'assets/sounds/error.mp3',
      warning: 'assets/sounds/warning.mp3',
      info: 'assets/sounds/info.mp3',
      custom: 'assets/sounds/notification.mp3'
    };

    audio.src = soundMap[type || 'info'];
    audio.play().catch(() => {
      // Fallback to system sound
      // Notification sound played
    });
  }

  private vibrate(priority: NotificationConfig['priority']): void {
    if ('vibrate' in navigator) {
      const patternMap = {
        low: [100],
        normal: [200],
        high: [300, 100, 300],
        urgent: [500, 200, 500, 200, 500]
      };
      navigator.vibrate(patternMap[priority || 'normal']);
    }
  }

  private showDesktopNotification(config: NotificationConfig): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(config.title || 'Notification', {
        body: config.message,
        icon: config.icon || '/assets/icons/notification.png',
        tag: config.id,
        requireInteraction: config.persistent || false
      });
    }
  }

  private async checkNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this._settings.update(current => ({ ...current, ...settings }));
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    }
  }

  private saveSettings(): void {
    localStorage.setItem('notification-settings', JSON.stringify(this._settings()));
  }
}
