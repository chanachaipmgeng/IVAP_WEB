/**
 * System Settings Component
 *
 * System configuration and settings management component for super admin.
 * Displays system information, settings, statistics, and system logs.
 *
 * @example
 * ```html
 * <app-system-settings></app-system-settings>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { SystemService } from '../../../core/services/system.service';
import { I18nService } from '../../../core/services/i18n.service';
import { SystemSetting, SystemInfo, SystemLog } from '../../../core/models/system.model';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassCardComponent,
    PageLayoutComponent,
    StatisticsGridComponent
  ],
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss']
})
export class SystemSettingsComponent extends BaseComponent implements OnInit {
  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: 'Refresh',
      variant: 'secondary',
      onClick: () => this.loadSettings()
    },
    {
      label: 'Save Settings',
      variant: 'primary',
      onClick: () => this.saveSettings()
    }
  ]);

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const info = this.getSystemInfo()();
    return [
      {
        icon: '📊',
        label: 'System Version',
        value: info.version,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '⏱️',
        label: 'Uptime',
        value: info.uptime,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '💾',
        label: 'Memory Usage',
        value: `${this.getMemoryUsagePercentage()}%`,
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
      }
    ];
  });

  constructor(
    public systemService: SystemService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadSettings();
    this.loadSystemInfo();
    this.loadSystemLogs();
  }

  // Getters from service
  getSettings = () => this.systemService.getSettings();
  getSystemInfo = () => this.systemService.getSystemInfo();
  getSystemLogs = () => this.systemService.getSystemLogs();
  getLoading = () => this.systemService.getLoading();

  // Load data methods
  loadSettings(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.systemService.loadSettings(),
      () => {
        // Data is automatically updated via service
      },
      (error) => {
        console.error('Error loading settings:', error);
      }
    );
  }

  loadSystemInfo(): void {
    this.subscribe(
      this.systemService.loadSystemInfo(),
      () => {
        // Data is automatically updated via service
      },
      (error) => {
        console.error('Error loading system info:', error);
      }
    );
  }

  loadSystemLogs(): void {
    this.subscribe(
      this.systemService.loadSystemLogs(),
      () => {
        // Data is automatically updated via service
      },
      (error) => {
        console.error('Error loading system logs:', error);
      }
    );
  }

  // Helper methods
  getSettingsByCategory(category: string): SystemSetting[] {
    return this.systemService.getSettingsByCategory(category);
  }

  getMemoryUsagePercentage(): number {
    const memoryUsage = this.getSystemInfo()().memoryUsage;
    const match = memoryUsage.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  getDiskUsagePercentage(): number {
    const diskUsage = this.getSystemInfo()().diskUsage;
    const match = diskUsage.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  getCpuUsagePercentage(): number {
    const cpuUsage = this.getSystemInfo()().cpuUsage;
    const match = cpuUsage.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  formatDateTime(timestamp: string): string {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Action methods
  saveSettings(): void {
    const updatedSettings = this.getSettings()().filter((setting: SystemSetting) => setting.isEditable);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.systemService.saveSettings(updatedSettings),
      () => {
        alert('Settings saved successfully!');
      },
      (error) => {
        console.error('Error saving settings:', error);
        alert('Error saving settings!');
      }
    );
  }

  clearCache(): void {
    if (!confirm('Clear system cache? This may temporarily slow down the system.')) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.systemService.clearCache(),
      () => {
        alert('Cache cleared successfully!');
      },
      (error) => {
        console.error('Error clearing cache:', error);
        alert('Error clearing cache!');
      }
    );
  }

  restartServices(): void {
    if (!confirm('Restart system services? This will cause temporary downtime.')) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.systemService.restartServices(),
      () => {
        alert('Services restart initiated!');
      },
      (error) => {
        console.error('Error restarting services:', error);
        alert('Error restarting services!');
      }
    );
  }

  enableMaintenanceMode(): void {
    if (!confirm('Enable maintenance mode? This will disable access for regular users.')) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.systemService.enableMaintenanceMode(),
      () => {
        alert('Maintenance mode enabled!');
      },
      (error) => {
        console.error('Error enabling maintenance mode:', error);
        alert('Error enabling maintenance mode!');
      }
    );
  }

  downloadLogs(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.systemService.downloadLogs(),
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'system-logs.txt';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error downloading logs:', error);
        alert('Error downloading logs!');
      }
    );
  }

  clearLogs(): void {
    if (!confirm('Clear all system logs? This action cannot be undone.')) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.systemService.clearLogs(),
      () => {
        this.loadSystemLogs();
        alert('Logs cleared successfully!');
      },
      (error) => {
        console.error('Error clearing logs:', error);
        alert('Error clearing logs!');
      }
    );
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
