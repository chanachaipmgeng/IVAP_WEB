/**
 * Notification Demo Component
 *
 * Demo component showcasing notification system with templates, custom configurations, and notification center.
 * Demonstrates various notification types, settings, and notification management.
 *
 * @example
 * ```html
 * <app-notification-demo></app-notification-demo>
 * ```
 */

import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { NotificationCenterComponent } from '../../../shared/components/notification-center/notification-center.component';
import { NotificationSettingsComponent } from '../../../shared/components/notification-settings/notification-settings.component';
import { NotificationService, NotificationConfig } from '../../../core/services/notification.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

/**
 * Notification template interface
 */
interface NotificationTemplate {
  name: string;
  description: string;
  config: NotificationConfig;
  category: string;
}

@Component({
  selector: 'app-notification-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    NotificationCenterComponent,
    NotificationSettingsComponent
  ],
  templateUrl: './notification-demo.component.html',
  styleUrl: './notification-demo.component.scss'
})
export class NotificationDemoComponent extends BaseComponent implements OnInit {
  // UI State
  activeTab = signal<'demo' | 'center' | 'settings'>('demo');
  selectedTemplate = signal<NotificationTemplate | null>(null);
  customConfig = signal<Partial<NotificationConfig>>({});

  // Notification Templates
  templates = signal<NotificationTemplate[]>([
    {
      name: 'Success Message',
      description: 'Operation completed successfully',
      category: 'system',
      config: {
        message: 'Your data has been saved successfully!',
        title: 'Success',
        type: 'success',
        icon: 'fas fa-check-circle',
        duration: 3000,
        priority: 'normal',
        tags: ['system', 'success']
      }
    },
    {
      name: 'Error Alert',
      description: 'Something went wrong',
      category: 'system',
      config: {
        message: 'Failed to save data. Please try again.',
        title: 'Error',
        type: 'error',
        icon: 'fas fa-exclamation-circle',
        duration: 0,
        priority: 'high',
        tags: ['system', 'error']
      }
    },
    {
      name: 'Warning Notice',
      description: 'Important information',
      category: 'system',
      config: {
        message: 'Your session will expire in 5 minutes.',
        title: 'Session Warning',
        type: 'warning',
        icon: 'fas fa-exclamation-triangle',
        duration: 5000,
        priority: 'normal',
        tags: ['system', 'warning']
      }
    },
    {
      name: 'Info Update',
      description: 'General information',
      category: 'system',
      config: {
        message: 'New features are available in the latest update.',
        title: 'Update Available',
        type: 'info',
        icon: 'fas fa-info-circle',
        duration: 4000,
        priority: 'low',
        tags: ['system', 'info']
      }
    },
    {
      name: 'Custom Action',
      description: 'Notification with action buttons',
      category: 'interactive',
      config: {
        message: 'You have a new message from John Doe.',
        title: 'New Message',
        type: 'custom',
        icon: 'fas fa-envelope',
        duration: 0,
        priority: 'normal',
        persistent: true,
        actions: [
          {
            label: 'Reply',
            action: () => this.replyToMessage(),
            style: 'primary',
            icon: 'fas fa-reply'
          },
          {
            label: 'Mark as Read',
            action: () => this.markAsRead(),
            style: 'secondary',
            icon: 'fas fa-check'
          }
        ],
        tags: ['message', 'interactive']
      }
    },
    {
      name: 'Progress Update',
      description: 'Long-running operation progress',
      category: 'progress',
      config: {
        message: 'Processing your request...',
        title: 'Processing',
        type: 'info',
        icon: 'fas fa-spinner fa-spin',
        duration: 0,
        priority: 'normal',
        persistent: true,
        tags: ['progress', 'system']
      }
    },
    {
      name: 'Security Alert',
      description: 'Security-related notification',
      category: 'security',
      config: {
        message: 'Unusual login activity detected from a new device.',
        title: 'Security Alert',
        type: 'error',
        icon: 'fas fa-shield-alt',
        duration: 0,
        priority: 'urgent',
        persistent: true,
        actions: [
          {
            label: 'View Details',
            action: () => this.viewSecurityDetails(),
            style: 'danger',
            icon: 'fas fa-eye'
          },
          {
            label: 'Secure Account',
            action: () => this.secureAccount(),
            style: 'primary',
            icon: 'fas fa-lock'
          }
        ],
        tags: ['security', 'urgent']
      }
    },
    {
      name: 'File Upload',
      description: 'File upload completion',
      category: 'file',
      config: {
        message: 'Your file "document.pdf" has been uploaded successfully.',
        title: 'Upload Complete',
        type: 'success',
        icon: 'fas fa-file-upload',
        duration: 4000,
        priority: 'normal',
        actions: [
          {
            label: 'View File',
            action: () => this.viewFile(),
            style: 'primary',
            icon: 'fas fa-eye'
          }
        ],
        tags: ['file', 'upload']
      }
    }
  ]);

  // Demo Data
  demoNotifications = signal<any[]>([]);
  notificationCount = signal<number>(0);
  unreadCount = signal<number>(0);

  // Custom Form
  customForm = signal({
    title: '',
    message: '',
    type: 'info' as NotificationConfig['type'],
    duration: 5000,
    priority: 'normal' as NotificationConfig['priority'],
    persistent: false,
    sound: true,
    vibration: true
  });

  constructor(
    private notificationService: NotificationService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadNotificationData();
    this.selectedTemplate.set(this.templates()[0]);
  }

  private loadNotificationData(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const count = this.notificationService.notificationCount();
      this.notificationCount.set(count);
    });

    effect(() => {
      const count = this.notificationService.unreadCount();
      this.unreadCount.set(count);
    });
  }

  selectTab(tab: string): void {
    if (tab === 'demo' || tab === 'center' || tab === 'settings') {
      this.activeTab.set(tab);
    }
  }

  selectTemplate(template: NotificationTemplate): void {
    this.selectedTemplate.set(template);
    this.customConfig.set({ ...template.config });
  }

  sendNotification(): void {
    const template = this.selectedTemplate();
    if (!template) return;

    const config = { ...template.config, ...this.customConfig() };
    this.notificationService.show(config);
  }

  sendCustomNotification(): void {
    const form = this.customForm();
    const config: NotificationConfig = {
      message: form.message,
      title: form.title,
      type: form.type,
      duration: form.persistent ? 0 : form.duration,
      priority: form.priority,
      persistent: form.persistent,
      sound: form.sound,
      vibration: form.vibration,
      tags: ['custom', 'demo']
    };

    this.notificationService.show(config);
  }

  sendBulkNotifications(): void {
    const templates = this.templates().slice(0, 5); // Send first 5 templates

    templates.forEach((template, index) => {
      setTimeout(() => {
        this.notificationService.show({
          ...template.config,
          message: `${template.config.message} (${index + 1})`
        });
      }, index * 1000); // Stagger by 1 second
    });
  }

  clearAllNotifications(): void {
    this.notificationService.dismissAll();
  }

  // Action handlers
  replyToMessage(): void {
    this.notificationService.info('Opening reply dialog...', 'Message');
  }

  markAsRead(): void {
    this.notificationService.success('Message marked as read', 'Message');
  }

  viewSecurityDetails(): void {
    this.notificationService.warning('Redirecting to security dashboard...', 'Security');
  }

  secureAccount(): void {
    this.notificationService.info('Initiating account security process...', 'Security');
  }

  viewFile(): void {
    this.notificationService.info('Opening file viewer...', 'File');
  }

  // Demo scenarios
  runDemoScenario(scenario: string): void {
    switch (scenario) {
      case 'login-flow':
        this.runLoginFlow();
        break;
      case 'file-upload':
        this.runFileUploadFlow();
        break;
      case 'error-handling':
        this.runErrorHandlingFlow();
        break;
      case 'progress-tracking':
        this.runProgressTrackingFlow();
        break;
      case 'security-alerts':
        this.runSecurityAlertsFlow();
        break;
    }
  }

  private runLoginFlow(): void {
    this.notificationService.info('Attempting to log in...', 'Authentication');

    setTimeout(() => {
      this.notificationService.success('Login successful! Welcome back.', 'Authentication');
    }, 2000);
  }

  private runFileUploadFlow(): void {
    this.notificationService.info('Starting file upload...', 'Upload');

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      this.notificationService.show({
        message: `Uploading file... ${progress}%`,
        title: 'File Upload',
        type: 'info',
        icon: 'fas fa-spinner fa-spin',
        duration: 0,
        persistent: true,
        tags: ['upload', 'progress']
      });

      if (progress >= 100) {
        clearInterval(interval);
        this.notificationService.success('File uploaded successfully!', 'Upload');
      }
    }, 1000);
  }

  private runErrorHandlingFlow(): void {
    this.notificationService.error('Connection failed. Retrying...', 'Network Error');

    setTimeout(() => {
      this.notificationService.warning('Still having issues. Switching to backup server...', 'Network');
    }, 3000);

    setTimeout(() => {
      this.notificationService.success('Connection restored!', 'Network');
    }, 6000);
  }

  private runProgressTrackingFlow(): void {
    const steps = [
      'Initializing process...',
      'Loading data...',
      'Processing information...',
      'Generating report...',
      'Finalizing...'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        this.notificationService.show({
          message: step,
          title: 'Progress Update',
          type: 'info',
          icon: 'fas fa-cog fa-spin',
          duration: 2000,
          tags: ['progress', 'system']
        });
      }, index * 2000);
    });
  }

  private runSecurityAlertsFlow(): void {
    this.notificationService.show({
      message: 'New login detected from unknown device',
      title: 'Security Alert',
      type: 'error',
      icon: 'fas fa-shield-alt',
      duration: 0,
      priority: 'urgent',
      persistent: true,
      actions: [
        {
          label: 'Secure Account',
          action: () => this.secureAccount(),
          style: 'danger',
          icon: 'fas fa-lock'
        }
      ],
      tags: ['security', 'urgent']
    });
  }

  // Utility methods
  getTemplatesByCategory(category: string): NotificationTemplate[] {
    return this.templates().filter(t => t.category === category);
  }

  getCategories(): string[] {
    return [...new Set(this.templates().map(t => t.category))];
  }

  getIconClass(type: string): string {
    const classMap = {
      success: 'icon-success',
      error: 'icon-error',
      warning: 'icon-warning',
      info: 'icon-info',
      custom: 'icon-custom'
    };
    return classMap[type as keyof typeof classMap] || 'icon-info';
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
