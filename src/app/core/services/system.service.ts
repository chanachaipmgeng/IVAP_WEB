import { Injectable, signal } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { SystemSetting, SystemInfo, SystemLog, SystemAction, SystemStats, DeviceStats, ChartData, Activity } from '../models/system.model';
import { handleApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private settings = signal<SystemSetting[]>([]);
  private systemInfo = signal<SystemInfo>({
    version: '1.0.0',
    uptime: '0 days, 0 hours',
    memoryUsage: '0%',
    diskUsage: '0%',
    cpuUsage: '0%',
    databaseStatus: 'Connected',
    lastBackup: 'Never'
  });
  private systemLogs = signal<SystemLog[]>([]);
  private loading = signal(false);

  constructor(private api: ApiService) {}

  // Getters
  getSettings = () => this.settings.asReadonly();
  getSystemInfo = () => this.systemInfo.asReadonly();
  getSystemLogs = () => this.systemLogs.asReadonly();
  getLoading = () => this.loading.asReadonly();

  // Load data
  loadSettings(): Observable<SystemSetting[]> {
    this.loading.set(true);
    return this.api.get<SystemSetting[]>('/admin/settings').pipe(
      tap((response: any) => {
        this.settings.set(response.data || response || []);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading settings:', error);
        this.settings.set([]);
        this.loading.set(false);
        throw error;
      })
    );
  }

  loadSystemInfo(): Observable<SystemInfo> {
    // Use existing endpoints: /admin/system-health and /admin/performance-metrics
    return forkJoin({
      health: this.api.get<any>('/admin/system-health'),
      metrics: this.api.get<any>('/admin/performance-metrics')
    }).pipe(
      map(({ health, metrics }) => {
        // Combine health and metrics into SystemInfo format
        const info: SystemInfo = {
          version: '1.0.0', // TODO: Get from actual system
          uptime: this.formatUptime(health.timestamp),
          memoryUsage: metrics.memoryUsage || '0%',
          diskUsage: metrics.diskUsage || '0%',
          cpuUsage: metrics.cpuUsage || '0%',
          databaseStatus: health.database === 'healthy' ? 'Connected' : 'Disconnected',
          lastBackup: 'Never' // TODO: Get from actual backup service
        };
        this.systemInfo.set(info);
        return info;
      }),
      catchError((error) => {
        console.error('Error loading system info:', error);
        // Fallback to default info
        return of(this.systemInfo());
      })
    );
  }

  private formatUptime(timestamp: string): string {
    if (!timestamp) return '0 days, 0 hours';
    // Calculate uptime from timestamp (simplified)
    const now = new Date();
    const start = new Date(timestamp);
    const diffMs = now.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days} days, ${hours} hours`;
  }

  loadSystemLogs(): Observable<SystemLog[]> {
    return this.api.get<SystemLog[]>('/admin/system/logs').pipe(
      tap((response: any) => {
        this.systemLogs.set(response.data || response || []);
      }),
      catchError((error) => {
        console.error('Error loading system logs:', error);
        this.systemLogs.set([]);
        throw error;
      })
    );
  }

  // Settings operations
  saveSettings(settings: SystemSetting[]): Observable<void> {
    return this.api.put<void>('/admin/settings', { settings });
  }

  // System actions
  clearCache(): Observable<void> {
    return this.api.post<void>('/admin/system/clear-cache', {});
  }

  restartServices(): Observable<void> {
    return this.api.post<void>('/admin/system/restart', {});
  }

  enableMaintenanceMode(): Observable<void> {
    return this.api.post<void>('/admin/system/maintenance', {});
  }

  /**
   * Rebuild face recognition index
   * Backend: POST /api/v1/system/rebuild-index
   * @returns Observable containing the rebuild response
   */
  rebuildFaceIndex(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/system/rebuild-index', {});
  }

  // Log operations
  clearLogs(): Observable<void> {
    return this.api.delete<void>('/admin/system/logs').pipe(
      tap(() => {
        this.loadSystemLogs().subscribe();
      })
    );
  }

  downloadLogs(): Observable<Blob> {
    return this.api.get<Blob>('/admin/system/logs/download', { responseType: 'blob' });
  }

  // Helper methods
  getSettingsByCategory(category: string): SystemSetting[] {
    return this.settings().filter(setting => setting.category === category);
  }

  getLogLevelClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      case 'debug':
        return 'text-gray-400';
      default:
        return 'text-white';
    }
  }

  // ==================== Admin System Statistics ====================

  /**
   * Get system-wide statistics
   * Backend: GET /api/v1/admin/system-stats
   */
  getSystemStats(): Observable<SystemStats> {
    return this.api.get<any>('/admin/system-stats').pipe(
      map(response => handleApiResponse<SystemStats>(response))
    );
  }

  /**
   * Get device statistics
   * Backend: GET /api/v1/admin/device-stats
   */
  getDeviceStats(): Observable<DeviceStats> {
    return this.api.get<any>('/admin/device-stats').pipe(
      map(response => handleApiResponse<DeviceStats>(response))
    );
  }

  /**
   * Get user registrations chart data
   * Backend: GET /api/v1/admin/charts/user-registrations
   */
  getUserRegistrationsChart(): Observable<ChartData> {
    return this.api.get<any>('/admin/charts/user-registrations').pipe(
      map(response => handleApiResponse<ChartData>(response))
    );
  }

  /**
   * Get user distribution chart data
   * Backend: GET /api/v1/admin/charts/user-distribution
   */
  getUserDistributionChart(): Observable<ChartData> {
    return this.api.get<any>('/admin/charts/user-distribution').pipe(
      map(response => handleApiResponse<ChartData>(response))
    );
  }

  /**
   * Get recent system activities
   * Backend: GET /api/v1/admin/activities
   */
  getRecentActivities(): Observable<Activity[]> {
    return this.api.get<any>('/admin/activities').pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.data || response.items || [];
      })
    );
  }
}
