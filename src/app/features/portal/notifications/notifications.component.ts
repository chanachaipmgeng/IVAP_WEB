/**
 * Notifications Component
 *
 * Component for managing portal notifications.
 * Supports notification creation, viewing, marking as read, and notification management.
 *
 * @example
 * ```html
 * <app-notifications></app-notifications>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { RichTextComponent } from '../../../shared/components/rich-text/rich-text.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Notification, PortalForm } from '../../../core/models/portal.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassCardComponent,
    GlassButtonComponent,
    RichTextComponent,
    ModalComponent,
    PageLayoutComponent
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  showCreateModal = signal(false);
  creating = signal(false);

  // Local state for notifications
  private notificationsList = signal<Notification[]>([]);
  private loadingState = signal(false);
  
  // Getters
  getNotifications = () => this.notificationsList.asReadonly();
  getLoading = () => this.loadingState.asReadonly();

  // Computed signals
  notifications = computed(() => this.getNotifications()());

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '✓ Mark All as Read',
      variant: 'secondary',
      onClick: () => this.markAllAsRead()
    },
    {
      label: '➕ Create Notification',
      variant: 'primary',
      onClick: () => this.openCreateModal()
    }
  ]);

  newNotification: PortalForm = {
    name: '',
    email: '',
    phone: '',
    department: '',
    status: 'active'
  };

  constructor(
    private api: ApiService,
    private notificationService: NotificationService,
    private auth: AuthService,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loadingState.set(true);
    // Note: NotificationService is for client-side toast notifications
    // For backend notifications, we may need to use a different endpoint
    // For now, using a mock/placeholder - should be replaced with actual backend endpoint
    this.api.get<Notification[]>('/notifications').subscribe({
      next: (response: any) => {
        this.notificationsList.set(response.data || response || []);
        this.loadingState.set(false);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.notificationsList.set([]);
        this.loadingState.set(false);
      }
    });
  }

  markAsRead(notification: Notification): void {
    this.api.put<Notification>(`/notifications/${notification.id}/read`, {}).subscribe({
      next: () => {
        // Update local state
        this.notificationsList.update(notifications =>
          notifications.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      },
      error: (error: any) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    this.api.put<void>('/notifications/read-all', {}).subscribe({
      next: () => {
        // Update local state
        this.notificationsList.update(notifications =>
          notifications.map(n => ({ ...n, read: true }))
        );
      },
      error: (error: any) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    };
    return icons[type] || 'ℹ️';
  }

  getColor(type: string): string {
    const colors: Record<string, string> = {
      'info': 'border-blue-500',
      'success': 'border-green-500',
      'warning': 'border-yellow-500',
      'error': 'border-red-500'
    };
    return colors[type] || 'border-gray-500';
  }

  formatTimestamp(timestamp: string): string {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openCreateModal(): void {
    this.newNotification = {
      name: '',
      email: '',
      phone: '',
      department: '',
      status: 'active'
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createNotification(): void {
    this.creating.set(true);

    // Note: This seems to be creating a notification, not an event
    // If this should create an event, use eventService.create() instead
    // For now, using API directly - should be reviewed
    this.api.post<Notification>('/notifications', {
      title: this.newNotification.name || '',
      message: this.newNotification.email || '',
      type: 'info'
    }).subscribe({
      next: () => {
        this.creating.set(false);
        this.closeCreateModal();
        this.loadNotifications();
      },
      error: (error: any) => {
        console.error('Error creating notification:', error);
        this.creating.set(false);
      }
    });
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}

