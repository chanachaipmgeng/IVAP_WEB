/**
 * Notification Center Component
 *
 * A notification center component for displaying and managing notifications.
 * Supports filtering, searching, marking as read, and dismissing notifications.
 *
 * @example
 * ```html
 * <app-notification-center
 *   [customClass]="'my-notifications'"
 *   [ariaLabel]="'Notifications'">
 * </app-notification-center>
 * ```
 */

import { Component, OnInit, signal, computed, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { NotificationService, NotificationHistory, NotificationConfig, NotificationSettings } from '../../../core/services/notification.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent],
  template: `
    <div class="notification-center" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || 'Notification center'">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-white">
          Notifications
          <span *ngIf="unreadCount() > 0" class="ml-2 px-2 py-1 bg-error-500 text-white text-sm rounded-full">
            {{ unreadCount() }}
          </span>
        </h3>
        <div class="flex space-x-2">
          <app-glass-button
            (clicked)="markAllAsRead()"
            variant="secondary"
            customClass="text-sm"
            [disabled]="unreadCount() === 0">
            <i class="fas fa-check-double mr-1"></i>
            Mark All Read
          </app-glass-button>
          <app-glass-button
            (clicked)="dismissAll()"
            variant="secondary"
            customClass="text-sm">
            <i class="fas fa-trash mr-1"></i>
            Clear All
          </app-glass-button>
        </div>
      </div>

      <!-- Filter and Search -->
      <div class="mb-4 space-y-3">
        <div class="flex space-x-2">
          <select
            [(ngModel)]="selectedFilter"
            (ngModelChange)="applyFilters()"
            class="glass-input flex-1">
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
            <option value="custom">Custom</option>
          </select>
          <select
            [(ngModel)]="selectedPriority"
            (ngModelChange)="applyFilters()"
            class="glass-input flex-1">
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
            placeholder="Search notifications..."
            class="glass-input w-full pl-10">
          <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list max-h-96 overflow-y-auto">
        <div *ngIf="filteredNotifications().length === 0" class="text-center py-8 text-gray-400">
          <i class="fas fa-bell-slash text-4xl mb-2"></i>
          <p>No notifications found</p>
        </div>

        <div *ngFor="let notification of filteredNotifications()"
             class="notification-item mb-3 p-4 rounded-lg border transition-all"
             [class]="getNotificationClass(notification)">
          <div class="flex items-start space-x-3">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <i [class]="getNotificationIcon(notification)"
                 [class]="getNotificationIconClass(notification)"></i>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-white mb-1">
                    {{ notification.config.title }}
                    <span *ngIf="!notification.read" class="ml-2 w-2 h-2 bg-primary-500 rounded-full inline-block"></span>
                  </h4>
                  <p class="text-sm text-gray-300 mb-2" [innerHTML]="notification.config.message"></p>

                  <!-- Tags -->
                  <div *ngIf="notification.config.tags && notification.config.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
                    <span *ngFor="let tag of notification.config.tags"
                          class="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                      {{ tag }}
                    </span>
                  </div>

                  <!-- Actions -->
                  <div *ngIf="notification.config.actions && notification.config.actions.length > 0" class="flex space-x-2">
                    <button
                      *ngFor="let action of notification.config.actions"
                      (click)="executeAction(action)"
                      [class]="'px-3 py-1 text-xs rounded transition-colors ' + getActionClass(action.style)"
                    >
                      <i *ngIf="action.icon" [class]="action.icon + ' mr-1'"></i>
                      {{ action.label }}
                    </button>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-400">
                    {{ formatTime(notification.timestamp) }}
                  </span>
                  <div class="flex space-x-1">
                    <button
                      *ngIf="!notification.read"
                      (click)="markAsRead(notification.id)"
                      class="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Mark as read">
                      <i class="fas fa-check"></i>
                    </button>
                    <button
                      (click)="dismiss(notification.id)"
                      class="p-1 text-gray-400 hover:text-error-400 transition-colors"
                      title="Dismiss">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-gray-700">
        <div class="flex items-center justify-between text-sm text-gray-400">
          <span>Showing {{ filteredNotifications().length }} of {{ totalNotifications() }} notifications</span>
          <div class="flex space-x-2">
            <button (click)="exportNotifications()" class="hover:text-white transition-colors">
              <i class="fas fa-download mr-1"></i> Export
            </button>
            <button (click)="clearOld()" class="hover:text-white transition-colors">
              <i class="fas fa-trash-alt mr-1"></i> Clear Old
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-center {
      @apply w-full max-w-2xl mx-auto;
    }

    .glass-input {
      background: rgba(26, 26, 46, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      color: #ffffff;
      transition: var(--transition-fast); /* 150ms */
      padding: calc(var(--spacing-sm) + var(--spacing-xs)) var(--spacing-md); /* 12px 16px */

      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        outline: none;
      }

      &::placeholder {
        color: var(--color-gray-400, #9ca3af);
      }
    }

    .notifications-list {
      scrollbar-width: thin;
      scrollbar-color: rgba(59, 130, 246, 0.5) rgba(26, 26, 46, 0.5); /* Using primary-500 */

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(26, 26, 46, 0.5);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.5);
        border-radius: 3px;

        &:hover {
          background: rgba(59, 130, 246, 0.7); /* Using primary-500 */
        }
      }
    }

    .notification-item {
      background: rgba(26, 26, 46, 0.8);
      border: 1px solid rgba(59, 130, 246, 0.1);
      transition: all 0.2s ease-in-out;

      &:hover {
        background: rgba(26, 26, 46, 0.9);
        border-color: rgba(59, 130, 246, 0.3); /* Using primary-500 */
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      &.unread {
        border-left: 4px solid var(--color-primary-500, #3b82f6);
        background: rgba(59, 130, 246, 0.05); /* Using primary-500 */
      }

      &.success {
        border-left: 4px solid #10b981;
      }

      &.error {
        border-left: 4px solid var(--color-error-500, #ef4444);
      }

      &.warning {
        border-left: 4px solid #f59e0b;
      }

      &.info {
        border-left: 4px solid var(--color-primary-500, #3b82f6);
      }

      &.custom {
        border-left: 4px solid #8b5cf6;
      }
    }

    .action-button {
      @apply px-3 py-1 text-xs rounded transition-colors;

      &.primary {
        @apply bg-blue-600 text-white hover:bg-blue-700;
      }

      &.secondary {
        @apply bg-gray-600 text-white hover:bg-gray-700;
      }

      &.success {
        @apply bg-green-600 text-white hover:bg-green-700;
      }

      &.danger {
        @apply bg-red-600 text-white hover:bg-red-700;
      }

      &.warning {
        @apply bg-yellow-600 text-white hover:bg-yellow-700;
      }

      &.info {
        @apply bg-blue-600 text-white hover:bg-blue-700;
      }
    }
  `]
})
export class NotificationCenterComponent extends BaseComponent implements OnInit {
  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Notifications data
   */
  notifications = signal<NotificationHistory[]>([]);

  /**
   * Filtered notifications
   */
  filteredNotifications = signal<NotificationHistory[]>([]);

  /**
   * Total notifications count
   */
  totalNotifications = signal<number>(0);

  /**
   * Unread notifications count
   */
  unreadCount = signal<number>(0);

  /**
   * Selected filter
   */
  selectedFilter = signal<string>('all');

  /**
   * Selected priority
   */
  selectedPriority = signal<string>('all');

  /**
   * Search query
   */
  searchQuery = signal<string>('');

  /**
   * Notification settings
   */
  settings = signal<NotificationSettings | null>(null);

  /**
   * Constructor
   */
  constructor(
    private notificationService: NotificationService,
    private i18n: I18nService
  ) {
    super();
  }

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.loadNotifications();
    this.loadSettings();
  }

  /**
   * Load notifications
   */
  private loadNotifications(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const notifications = this.notificationService.notifications();
      this.notifications.set(notifications);
      this.totalNotifications.set(notifications.length);
      this.applyFilters();
    });

    effect(() => {
      const count = this.notificationService.unreadCount();
      this.unreadCount.set(count);
    });
  }

  /**
   * Load settings
   */
  private loadSettings(): void {
    effect(() => {
      const settings = this.notificationService.settings();
      this.settings.set(settings);
    });
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    let filtered = [...this.notifications()];

    // Filter by type
    if (this.selectedFilter() !== 'all') {
      if (this.selectedFilter() === 'unread') {
        filtered = filtered.filter(n => !n.read && !n.dismissed);
      } else {
        filtered = filtered.filter(n => n.config.type === this.selectedFilter());
      }
    }

    // Filter by priority
    if (this.selectedPriority() !== 'all') {
      filtered = filtered.filter(n => n.config.priority === this.selectedPriority());
    }

    // Search
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(n =>
        n.config.message.toLowerCase().includes(query) ||
        n.config.title?.toLowerCase().includes(query) ||
        n.config.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    this.filteredNotifications.set(filtered);
  }

  /**
   * Get notification CSS classes
   */
  getNotificationClass(notification: NotificationHistory): string {
    const classes = ['notification-item'];

    if (!notification.read) {
      classes.push('unread');
    }

    classes.push(notification.config.type);

    return classes.join(' ');
  }

  /**
   * Get notification icon
   */
  getNotificationIcon(notification: NotificationHistory): string {
    return notification.config.icon || this.getDefaultIcon(notification.config.type);
  }

  /**
   * Get notification icon classes
   */
  getNotificationIconClass(notification: NotificationHistory): string {
    const baseClass = 'text-lg';
    const typeClass = this.getIconClass(notification.config.type);
    return `${baseClass} ${typeClass}`;
  }

  /**
   * Get default icon for notification type
   */
  private getDefaultIcon(type: string): string {
    const iconMap = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
      custom: 'fas fa-bell'
    };
    return iconMap[type as keyof typeof iconMap] || 'fas fa-bell';
  }

  /**
   * Get icon class for notification type
   */
  private getIconClass(type: string): string {
    const classMap = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
      custom: 'text-purple-400'
    };
    return classMap[type as keyof typeof classMap] || 'text-gray-400';
  }

  /**
   * Get action button class
   */
  getActionClass(style?: string): string {
    const classMap = {
      primary: 'action-button primary',
      secondary: 'action-button secondary',
      success: 'action-button success',
      danger: 'action-button danger',
      warning: 'action-button warning',
      info: 'action-button info'
    };
    return classMap[style as keyof typeof classMap] || 'action-button secondary';
  }

  /**
   * Format timestamp to relative time
   */
  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return timestamp.toLocaleDateString();
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  /**
   * Dismiss notification
   */
  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notificationService.dismissAll();
  }

  /**
   * Execute notification action
   */
  executeAction(action: any): void {
    const actionFn = action['action'];
    if (actionFn && typeof actionFn === 'function') {
      (actionFn as () => void)();
    }
  }

  /**
   * Export notifications
   */
  exportNotifications(): void {
    const data = this.notificationService.exportNotifications();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Clear old notifications
   */
  clearOld(): void {
    this.notificationService.clearOld(7);
  }

  /**
   * TrackBy function for notifications
   */
  trackByNotificationId(index: number, notification: NotificationHistory): string {
    return notification.id;
  }

  /**
   * TrackBy function for tags
   */
  trackByTag(index: number, tag: string): string {
    return tag;
  }

  /**
   * Translate key
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}
