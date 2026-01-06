/**
 * Notification Settings Component
 *
 * A component for managing notification settings including sound, vibration,
 * desktop notifications, position, theme, and duration preferences.
 *
 * @example
 * ```html
 * <app-notification-settings
 *   [customClass]="'my-settings'"
 *   [ariaLabel]="'Notification settings'">
 * </app-notification-settings>
 * ```
 */

import { Component, OnInit, signal, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../glass-card/glass-card.component';
import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { NotificationService, NotificationSettings } from '../../../core/services/notification.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, GlassButtonComponent],
  template: `
    <div class="notification-settings space-y-6" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || 'Notification settings'">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold text-white">Notification Settings</h3>
        <app-glass-button
          (clicked)="resetToDefaults()"
          variant="secondary"
          customClass="text-sm">
          <i class="fas fa-undo mr-1"></i>
          Reset to Defaults
        </app-glass-button>
      </div>

      <!-- General Settings -->
      <app-glass-card class="p-6">
        <h4 class="text-lg font-medium text-white mb-4">General Settings</h4>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Enable Sound</label>
              <p class="text-xs text-gray-400">Play sound when notifications arrive</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="settings().enableSound"
                (ngModelChange)="updateSettings()"
                class="sr-only peer">
              <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Enable Vibration</label>
              <p class="text-xs text-gray-400">Vibrate device when notifications arrive</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="settings().enableVibration"
                (ngModelChange)="updateSettings()"
                class="sr-only peer">
              <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Enable Desktop Notifications</label>
              <p class="text-xs text-gray-400">Show desktop notifications when tab is not active</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="settings().enableDesktop"
                (ngModelChange)="updateSettings()"
                class="sr-only peer">
              <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </app-glass-card>

      <!-- Display Settings -->
      <app-glass-card class="p-6">
        <h4 class="text-lg font-medium text-white mb-4">Display Settings</h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Position</label>
            <select
              [(ngModel)]="settings().position"
              (ngModelChange)="updateSettings()"
              class="glass-input w-full">
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-center">Top Center</option>
              <option value="bottom-center">Bottom Center</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Theme</label>
            <select
              [(ngModel)]="settings().theme"
              (ngModelChange)="updateSettings()"
              class="glass-input w-full">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select
              [(ngModel)]="settings().language"
              (ngModelChange)="updateSettings()"
              class="glass-input w-full">
              <option value="en">English</option>
              <option value="th">Thai</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
        </div>
      </app-glass-card>

      <!-- Behavior Settings -->
      <app-glass-card class="p-6">
        <h4 class="text-lg font-medium text-white mb-4">Behavior Settings</h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Maximum Notifications
              <span class="text-xs text-gray-400">({{ settings().maxNotifications }})</span>
            </label>
            <input
              type="range"
              [(ngModel)]="settings().maxNotifications"
              (ngModelChange)="updateSettings()"
              min="10"
              max="100"
              step="10"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider">
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>10</span>
              <span>100</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Default Duration
              <span class="text-xs text-gray-400">({{ settings().defaultDuration / 1000 }}s)</span>
            </label>
            <input
              type="range"
              [(ngModel)]="settings().defaultDuration"
              (ngModelChange)="updateSettings()"
              min="1000"
              max="10000"
              step="500"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider">
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>1s</span>
              <span>10s</span>
            </div>
          </div>
        </div>
      </app-glass-card>

      <!-- Test Notifications -->
      <app-glass-card class="p-6">
        <h4 class="text-lg font-medium text-white mb-4">Test Notifications</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <app-glass-button
            (clicked)="testNotification('success')"
            variant="primary"
            customClass="w-full">
            <i class="fas fa-check mr-1"></i>
            Success
          </app-glass-button>
          <app-glass-button
            (clicked)="testNotification('error')"
            variant="danger"
            customClass="w-full">
            <i class="fas fa-times mr-1"></i>
            Error
          </app-glass-button>
          <app-glass-button
            (clicked)="testNotification('warning')"
            variant="primary"
            customClass="w-full">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            Warning
          </app-glass-button>
          <app-glass-button
            (clicked)="testNotification('info')"
            variant="primary"
            customClass="w-full">
            <i class="fas fa-info mr-1"></i>
            Info
          </app-glass-button>
        </div>
      </app-glass-card>

      <!-- Advanced Settings -->
      <app-glass-card class="p-6">
        <h4 class="text-lg font-medium text-white mb-4">Advanced Settings</h4>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Auto-clear Old Notifications</label>
              <p class="text-xs text-gray-400">Automatically remove notifications older than 7 days</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="autoClearEnabled"
                (ngModelChange)="toggleAutoClear()"
                class="sr-only peer">
              <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-300">Group Similar Notifications</label>
              <p class="text-xs text-gray-400">Group notifications of the same type together</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="groupNotifications"
                (ngModelChange)="toggleGrouping()"
                class="sr-only peer">
              <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </app-glass-card>

      <!-- Save Button -->
      <div class="flex justify-end">
        <app-glass-button
          (clicked)="saveSettings()"
          variant="primary">
          <i class="fas fa-save mr-2"></i>
          Save Settings
        </app-glass-button>
      </div>
    </div>
  `,
  styles: [`
    .notification-settings {
      @apply max-w-4xl mx-auto;
    }

    .glass-input {
      background: rgba(26, 26, 46, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      color: #ffffff;
      transition: all 0.2s ease-in-out;
      padding: 0.75rem 1rem;

      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        outline: none;
      }

      &::placeholder {
        color: #9ca3af;
      }
    }

    .slider {
      background: linear-gradient(to right, #3b82f6 0%, #3b82f6 var(--value, 0%), #374151 var(--value, 0%), #374151 100%);

      &::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      &::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider-toggle {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #374151;
      transition: .4s;
      border-radius: 24px;
    }

    .slider-toggle:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider-toggle {
      background-color: #3b82f6;
    }

    input:checked + .slider-toggle:before {
      transform: translateX(20px);
    }
  `]
})
export class NotificationSettingsComponent extends BaseComponent implements OnInit {
  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  settings = signal<NotificationSettings>({
    enableSound: true,
    enableVibration: true,
    enableDesktop: true,
    maxNotifications: 50,
    defaultDuration: 5000,
    position: 'top-right',
    theme: 'auto',
    language: 'en'
  });

  autoClearEnabled = signal<boolean>(false);
  groupNotifications = signal<boolean>(false);

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
    this.loadSettings();
  }

  /**
   * Load settings from service
   */
  private loadSettings(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const settings = this.notificationService.settings();
      this.settings.set(settings);
    });
  }

  /**
   * Update settings
   */
  updateSettings(): void {
    this.notificationService.updateSettings(this.settings());
  }

  /**
   * Reset settings to defaults
   */
  resetToDefaults(): void {
    const defaultSettings: NotificationSettings = {
      enableSound: true,
      enableVibration: true,
      enableDesktop: true,
      maxNotifications: 50,
      defaultDuration: 5000,
      position: 'top-right',
      theme: 'auto',
      language: 'en'
    };

    this.settings.set(defaultSettings);
    this.notificationService.updateSettings(defaultSettings);
  }

  testNotification(type: 'success' | 'error' | 'warning' | 'info'): void {
    const messages = {
      success: 'This is a test success notification!',
      error: 'This is a test error notification!',
      warning: 'This is a test warning notification!',
      info: 'This is a test info notification!'
    };

    const titles = {
      success: 'Test Success',
      error: 'Test Error',
      warning: 'Test Warning',
      info: 'Test Info'
    };

    this.notificationService[type](messages[type], titles[type], {
      tags: ['test'],
      category: 'test'
    });
  }

  /**
   * Toggle auto clear
   */
  toggleAutoClear(): void {
    if (this.autoClearEnabled()) {
      // Enable auto-clear
      setInterval(() => {
        this.notificationService.clearOld(7);
      }, 24 * 60 * 60 * 1000); // Run daily
    }
  }

  toggleGrouping(): void {
    // This would be implemented in the notification service
    // Grouping toggled
  }

  /**
   * Save settings
   */
  saveSettings(): void {
    this.notificationService.updateSettings(this.settings());
    this.notificationService.success('Settings saved successfully!', 'Settings');
  }

  /**
   * Translate key
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}
