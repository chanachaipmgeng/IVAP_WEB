import { Injectable, OnDestroy, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval, timer, Subject, of } from 'rxjs';
import { map, takeUntil, catchError, retry, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  HardwareMetrics,
  MonitoringConfig,
  DeviceHealth,
  DevicesOverview
} from '../models/hardware-monitoring.model';

// Re-export for backward compatibility
export type { HardwareMetrics, MonitoringConfig, DeviceHealth, DevicesOverview };

// Additional interfaces specific to this service (not in models)
export interface MonitoringDashboard {
  deviceId: string;
  name: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  lastUpdate: Date;
  metrics: HardwareMetrics;
  trends: {
    cpu: Array<{ timestamp: Date; value: number }>;
    memory: Array<{ timestamp: Date; value: number }>;
    disk: Array<{ timestamp: Date; value: number }>;
    temperature: Array<{ timestamp: Date; value: number }>;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date | string;
    resolved: boolean;
  }>;
  performance: {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
  };
}

export interface MonitoringAlert {
  id: string;
  deviceId: string;
  type: 'threshold_exceeded' | 'device_offline' | 'performance_degradation' | 'hardware_failure' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class RealTimeHardwareMonitoringService implements OnDestroy {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/hardware`;

  private destroy$ = new Subject<void>();

  // ✅ Signals for reactive state
  private _monitoringConfigs = signal<MonitoringConfig[]>([]);
  private _hardwareMetrics = signal<Map<string, HardwareMetrics>>(new Map());
  private _monitoringDashboards = signal<Map<string, MonitoringDashboard>>(new Map());
  private _alerts = signal<MonitoringAlert[]>([]);
  private _isMonitoring = signal<boolean>(false);
  private _monitoringDevices = signal<Set<string>>(new Set());

  // ✅ Readonly signals for public access
  public readonly monitoringConfigs = this._monitoringConfigs.asReadonly();
  public readonly hardwareMetrics = this._hardwareMetrics.asReadonly();
  public readonly monitoringDashboards = this._monitoringDashboards.asReadonly();
  public readonly alerts = this._alerts.asReadonly();
  public readonly isMonitoring = this._isMonitoring.asReadonly();
  public readonly monitoringDevices = this._monitoringDevices.asReadonly();

  // ✅ Computed signals for derived state
  public readonly monitoringConfigsCount = computed(() => this._monitoringConfigs().length);
  public readonly activeMonitoringConfigsCount = computed(() => this._monitoringConfigs().filter(c => c.enabled).length);
  public readonly hardwareMetricsCount = computed(() => this._hardwareMetrics().size);
  public readonly monitoringDashboardsCount = computed(() => this._monitoringDashboards().size);
  public readonly alertsCount = computed(() => this._alerts().length);
  public readonly unacknowledgedAlertsCount = computed(() => this._alerts().filter(a => !a.acknowledged).length);
  public readonly unresolvedAlertsCount = computed(() => this._alerts().filter(a => !a.resolved).length);
  public readonly monitoringDevicesCount = computed(() => this._monitoringDevices().size);

  // ✅ Observable compatibility layer (for backward compatibility)
  public monitoringConfigs$ = new Observable<MonitoringConfig[]>(observer => {
    observer.next(this._monitoringConfigs());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public hardwareMetrics$ = new Observable<Map<string, HardwareMetrics>>(observer => {
    observer.next(this._hardwareMetrics());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public monitoringDashboards$ = new Observable<MonitoringDashboard[]>(observer => {
    observer.next(Array.from(this._monitoringDashboards().values()));
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public alerts$ = new Observable<MonitoringAlert[]>(observer => {
    observer.next(this._alerts());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public isMonitoring$ = new Observable<boolean>(observer => {
    observer.next(this._isMonitoring());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeMonitoring();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeMonitoring(): void {
    // Initialize with default monitoring configurations
    const defaultConfigs: MonitoringConfig[] = [
      {
        deviceId: 'dev-001',
        enabled: true,
        interval: 30,
        metrics: {
          cpu: true,
          memory: true,
          disk: true,
          network: true,
          power: true,
          temperature: true,
          uptime: true,
          processes: true
        },
        thresholds: {
          cpu: { warning: 70, critical: 90 },
          memory: { warning: 80, critical: 95 },
          disk: { warning: 85, critical: 95 },
          temperature: { warning: 60, critical: 80 },
          power: { warning: 80, critical: 95 }
        },
        alerts: {
          enabled: true,
          email: true,
          sms: false,
          push: true,
          webhook: false
        }
      }
    ];

    this._monitoringConfigs.set(defaultConfigs);
  }

  // Monitoring Configuration
  getMonitoringConfigs(): Observable<MonitoringConfig[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._monitoringConfigs());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getMonitoringConfig(deviceId: string): Observable<MonitoringConfig | undefined> {
    return new Observable(observer => {
      observer.next(this._monitoringConfigs().find(config => config.deviceId === deviceId));
      observer.complete();
    });
  }

  updateMonitoringConfig(deviceId: string, config: Partial<MonitoringConfig>): Observable<boolean> {
    this._monitoringConfigs.update(configs => {
      const index = configs.findIndex(c => c.deviceId === deviceId);

      if (index !== -1) {
        configs[index] = { ...configs[index], ...config };
        return [...configs];
      } else {
        const newConfig: MonitoringConfig = {
          deviceId,
          enabled: true,
          interval: 30,
          metrics: {
            cpu: true,
            memory: true,
            disk: true,
            network: true,
            power: true,
            temperature: true,
            uptime: true,
            processes: true
          },
          thresholds: {
            cpu: { warning: 70, critical: 90 },
            memory: { warning: 80, critical: 95 },
            disk: { warning: 85, critical: 95 },
            temperature: { warning: 60, critical: 80 },
            power: { warning: 80, critical: 95 }
          },
          alerts: {
            enabled: true,
            email: true,
            sms: false,
            push: true,
            webhook: false
          },
          ...config
        };
        return [...configs, newConfig];
      }
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Start/Stop Monitoring
  startMonitoring(deviceId: string): Observable<boolean> {
    const config = this._monitoringConfigs().find(c => c.deviceId === deviceId);
    if (!config || !config.enabled) {
      return new Observable(observer => {
        observer.error(new Error('Monitoring not configured or disabled'));
        observer.complete();
      });
    }

    const monitoringDevices = this._monitoringDevices();
    if (monitoringDevices.has(deviceId)) {
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }

    const newMonitoringDevices = new Set(monitoringDevices);
    newMonitoringDevices.add(deviceId);
    this._monitoringDevices.set(newMonitoringDevices);

    // Start monitoring interval
    interval(config.interval * 1000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.collectMetrics(deviceId)),
      catchError(error => {
        console.error(`Error monitoring device ${deviceId}:`, error);
        return [];
      })
    ).subscribe(metrics => {
      if (metrics) {
        this.updateMetrics(deviceId, metrics);
        this.updateDashboard(deviceId, metrics);
        this.checkThresholds(deviceId, metrics);
      }
    });

    this._isMonitoring.set(true);

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  stopMonitoring(deviceId: string): Observable<boolean> {
    this._monitoringDevices.update(devices => {
      const newDevices = new Set(devices);
      newDevices.delete(deviceId);
      if (newDevices.size === 0) {
        this._isMonitoring.set(false);
      }
      return newDevices;
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  isDeviceMonitoring(deviceId: string): Observable<boolean> {
    return new Observable(observer => {
      observer.next(this._monitoringDevices().has(deviceId));
      observer.complete();
    });
  }

  getMonitoringStatus(): Observable<boolean> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._isMonitoring());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  /**
   * Get device metrics from API
   */
  getDeviceMetrics(deviceId: string, companyId: string): Observable<HardwareMetrics> {
    const params = new HttpParams().set('company_id', companyId);

    return this.http.get<any>(`${this.apiUrl}/devices/${deviceId}/metrics`, { params }).pipe(
      map((response) => {
        const metrics: HardwareMetrics = {
          deviceId: response.deviceId,
          timestamp: new Date(),
          cpu: response.metrics.cpu,
          memory: {
            ...response.metrics.memory,
            free: response.metrics.memory.total - response.metrics.memory.used,
            usage: response.metrics.memory.usage
          },
          disk: {
            ...response.metrics.disk,
            free: response.metrics.disk.total - response.metrics.disk.used
          },
          network: response.metrics.network,
          power: response.metrics.power,
          temperature: response.metrics.temperature,
          uptime: {
            ...response.metrics.uptime,
            lastReboot: new Date(response.metrics.uptime.lastReboot)
          },
          processes: response.metrics.processes || [],
          alerts: response.metrics.alerts || []
        };
        this.updateMetrics(deviceId, metrics);
        return metrics;
      }),
      catchError((error) => {
        console.error('Error getting device metrics:', error);
        return this.collectMetrics(deviceId).pipe(
          map(metrics => metrics || {
            deviceId,
            timestamp: new Date(),
            cpu: { usage: 0, temperature: 0, cores: 0, loadAverage: [] },
            memory: { total: 0, used: 0, free: 0, usage: 0, swap: { total: 0, used: 0, free: 0 } },
            disk: { total: 0, used: 0, free: 0, usage: 0, readSpeed: 0, writeSpeed: 0, iops: 0 },
            network: { interfaces: [], totalBytesIn: 0, totalBytesOut: 0, bandwidth: 0, latency: 0 },
            power: { consumption: 0, voltage: 0, current: 0, efficiency: 0 },
            temperature: { ambient: 0, cpu: 0, storage: 0, max: 0, min: 0 },
            uptime: { current: 0, lastReboot: new Date(), totalUptime: 0, availability: 0 },
            processes: [],
            alerts: []
          })
        );
      })
    );
  }

  /**
   * Get device health from API
   */
  getDeviceHealth(deviceId: string, companyId: string): Observable<{ deviceId: string; status: string; health: { score: number; grade: string; status: string } }> {
    const params = new HttpParams().set('company_id', companyId);

    return this.http.get<any>(`${this.apiUrl}/devices/${deviceId}/health`, { params }).pipe(
      catchError((error) => {
        console.error('Error getting device health:', error);
        return of({
          deviceId,
          status: 'unknown',
          health: { score: 0, grade: 'critical', status: 'unknown' }
        });
      })
    );
  }

  /**
   * Get devices overview from API
   */
  getDevicesOverview(companyId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/companies/${companyId}/devices/overview`).pipe(
      catchError((error) => {
        console.error('Error getting devices overview:', error);
        return of({
          totalDevices: 0,
          onlineDevices: 0,
          offlineDevices: 0,
          errorDevices: 0,
          maintenanceDevices: 0,
          averageHealth: 0,
          totalAlerts: 0,
          criticalAlerts: 0,
          systemUptime: 0,
          averagePerformance: 0
        });
      })
    );
  }

  // Metrics Collection
  private collectMetrics(deviceId: string): Observable<HardwareMetrics | null> {
    return new Observable(observer => {
      // Simulate metrics collection (fallback)
      const metrics: HardwareMetrics = {
        deviceId,
        timestamp: new Date(),
        cpu: {
          usage: Math.random() * 100,
          temperature: 30 + Math.random() * 40,
          cores: 8,
          loadAverage: [Math.random(), Math.random(), Math.random()]
        },
        memory: {
          total: 16 * 1024 * 1024 * 1024, // 16GB
          used: Math.random() * 8 * 1024 * 1024 * 1024, // 0-8GB
          free: 0,
          usage: 0,
          swap: {
            total: 2 * 1024 * 1024 * 1024, // 2GB
            used: Math.random() * 1024 * 1024 * 1024, // 0-1GB
            free: 0
          }
        },
        disk: {
          total: 1000 * 1024 * 1024 * 1024, // 1TB
          used: Math.random() * 500 * 1024 * 1024 * 1024, // 0-500GB
          free: 0,
          usage: 0,
          readSpeed: Math.random() * 100 * 1024 * 1024, // 0-100MB/s
          writeSpeed: Math.random() * 50 * 1024 * 1024, // 0-50MB/s
          iops: Math.random() * 1000 // 0-1000 IOPS
        },
        network: {
          interfaces: [
            {
              name: 'eth0',
              status: 'up',
              speed: 1000 * 1024 * 1024, // 1Gbps
              bytesIn: Math.random() * 1000000000,
              bytesOut: Math.random() * 1000000000,
              packetsIn: Math.random() * 1000000,
              packetsOut: Math.random() * 1000000,
              errors: Math.floor(Math.random() * 10),
              drops: Math.floor(Math.random() * 5)
            }
          ],
          totalBytesIn: 0,
          totalBytesOut: 0,
          bandwidth: 1000 * 1024 * 1024, // 1Gbps
          latency: Math.random() * 50 + 1 // 1-51ms
        },
        power: {
          consumption: 50 + Math.random() * 100, // 50-150W
          voltage: 12 + Math.random() * 2, // 12-14V
          current: 4 + Math.random() * 8, // 4-12A
          efficiency: 80 + Math.random() * 15, // 80-95%
          batteryLevel: Math.random() * 100 // 0-100%
        },
        temperature: {
          ambient: 20 + Math.random() * 10, // 20-30°C
          cpu: 30 + Math.random() * 40, // 30-70°C
          gpu: 35 + Math.random() * 35, // 35-70°C
          storage: 25 + Math.random() * 20, // 25-45°C
          max: 80,
          min: 20
        },
        uptime: {
          current: 86400 * 30 + Math.random() * 86400, // 30+ days
          lastReboot: new Date(Date.now() - 86400 * 30),
          totalUptime: 86400 * 365, // 1 year
          availability: 99.5 + Math.random() * 0.5 // 99.5-100%
        },
        processes: [
          {
            pid: 1,
            name: 'systemd',
            cpu: Math.random() * 5,
            memory: 1024 * 1024, // 1MB
            status: 'running',
            priority: 0,
            startTime: new Date(Date.now() - 86400 * 30)
          }
        ],
        alerts: []
      };

      // Calculate derived values
      metrics.memory.free = metrics.memory.total - metrics.memory.used;
      metrics.memory.usage = (metrics.memory.used / metrics.memory.total) * 100;
      metrics.memory.swap.free = metrics.memory.swap.total - metrics.memory.swap.used;

      metrics.disk.free = metrics.disk.total - metrics.disk.used;
      metrics.disk.usage = (metrics.disk.used / metrics.disk.total) * 100;

      metrics.network.totalBytesIn = metrics.network.interfaces.reduce((sum, iface) => sum + iface.bytesIn, 0);
      metrics.network.totalBytesOut = metrics.network.interfaces.reduce((sum, iface) => sum + iface.bytesOut, 0);

      observer.next(metrics);
      observer.complete();
    });
  }

  private updateMetrics(deviceId: string, metrics: HardwareMetrics): void {
    this._hardwareMetrics.update(currentMetrics => {
      const newMetrics = new Map(currentMetrics);
      newMetrics.set(deviceId, metrics);
      return newMetrics;
    });
  }

  private updateDashboard(deviceId: string, metrics: HardwareMetrics): void {
    this._monitoringDashboards.update(dashboards => {
      const newDashboards = new Map(dashboards);
      const existingDashboard = newDashboards.get(deviceId);

      const dashboard: MonitoringDashboard = {
        deviceId,
        name: `Device ${deviceId}`,
        status: this.calculateDeviceStatus(metrics),
        health: this.calculateDeviceHealth(metrics),
        lastUpdate: new Date(),
        metrics,
        trends: existingDashboard ? this.updateTrends(existingDashboard.trends, metrics) : this.initializeTrends(metrics),
        alerts: metrics.alerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          message: alert.message,
          timestamp: typeof alert.timestamp === 'string' ? new Date(alert.timestamp) : (alert.timestamp instanceof Date ? alert.timestamp : new Date()),
          resolved: alert.resolved
        })),
        performance: this.calculatePerformance(metrics)
      };

      newDashboards.set(deviceId, dashboard);
      return newDashboards;
    });
  }

  private checkThresholds(deviceId: string, metrics: HardwareMetrics): void {
    const config = this._monitoringConfigs().find(c => c.deviceId === deviceId);
    if (!config || !config.alerts.enabled) return;

    const alerts: MonitoringAlert[] = [];

    // Check CPU threshold
    if (metrics.cpu.usage > config.thresholds.cpu.critical) {
      alerts.push({
        id: this.generateId(),
        deviceId,
        type: 'threshold_exceeded',
        severity: 'critical',
        title: 'High CPU Usage',
        description: `CPU usage is ${metrics.cpu.usage.toFixed(1)}%, exceeding critical threshold of ${config.thresholds.cpu.critical}%`,
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
        metadata: { metric: 'cpu', value: metrics.cpu.usage, threshold: config.thresholds.cpu.critical }
      });
    } else if (metrics.cpu.usage > config.thresholds.cpu.warning) {
      alerts.push({
        id: this.generateId(),
        deviceId,
        type: 'threshold_exceeded',
        severity: 'medium',
        title: 'High CPU Usage',
        description: `CPU usage is ${metrics.cpu.usage.toFixed(1)}%, exceeding warning threshold of ${config.thresholds.cpu.warning}%`,
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
        metadata: { metric: 'cpu', value: metrics.cpu.usage, threshold: config.thresholds.cpu.warning }
      });
    }

    // Check memory threshold
    if (metrics.memory.usage > config.thresholds.memory.critical) {
      alerts.push({
        id: this.generateId(),
        deviceId,
        type: 'threshold_exceeded',
        severity: 'critical',
        title: 'High Memory Usage',
        description: `Memory usage is ${metrics.memory.usage.toFixed(1)}%, exceeding critical threshold of ${config.thresholds.memory.critical}%`,
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
        metadata: { metric: 'memory', value: metrics.memory.usage, threshold: config.thresholds.memory.critical }
      });
    }

    // Check temperature threshold
    if (metrics.temperature.cpu > config.thresholds.temperature.critical) {
      alerts.push({
        id: this.generateId(),
        deviceId,
        type: 'threshold_exceeded',
        severity: 'critical',
        title: 'High CPU Temperature',
        description: `CPU temperature is ${metrics.temperature.cpu.toFixed(1)}°C, exceeding critical threshold of ${config.thresholds.temperature.critical}°C`,
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
        metadata: { metric: 'temperature', value: metrics.temperature.cpu, threshold: config.thresholds.temperature.critical }
      });
    }

    // Add new alerts
    if (alerts.length > 0) {
      this._alerts.update(currentAlerts => [...currentAlerts, ...alerts]);
    }
  }

  // Dashboard Management
  getMonitoringDashboards(): Observable<MonitoringDashboard[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(Array.from(this._monitoringDashboards().values()));
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getMonitoringDashboard(deviceId: string): Observable<MonitoringDashboard | undefined> {
    return new Observable(observer => {
      observer.next(this._monitoringDashboards().get(deviceId));
      observer.complete();
    });
  }

  // Metrics Access
  getHardwareMetrics(deviceId: string): Observable<HardwareMetrics | undefined> {
    return new Observable(observer => {
      observer.next(this._hardwareMetrics().get(deviceId));
      observer.complete();
    });
  }

  getAllHardwareMetrics(): Observable<Map<string, HardwareMetrics>> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._hardwareMetrics());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  // Alert Management
  getAlerts(): Observable<MonitoringAlert[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._alerts());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getAlertsByDevice(deviceId: string): Observable<MonitoringAlert[]> {
    return new Observable(observer => {
      observer.next(this._alerts().filter(alert => alert.deviceId === deviceId));
      observer.complete();
    });
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): Observable<boolean> {
    this._alerts.update(alerts => {
      const index = alerts.findIndex((alert: MonitoringAlert) => alert.id === alertId);
      if (index !== -1) {
        alerts[index] = {
          ...alerts[index],
          acknowledged: true,
          acknowledgedBy,
          acknowledgedAt: new Date()
        };
        return [...alerts];
      }
      return alerts;
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  resolveAlert(alertId: string): Observable<boolean> {
    this._alerts.update(alerts => {
      const index = alerts.findIndex(alert => alert.id === alertId);
      if (index !== -1) {
        alerts[index] = {
          ...alerts[index],
          resolved: true,
          resolvedAt: new Date()
        };
        return [...alerts];
      }
      return alerts;
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Utility Methods
  private calculateDeviceStatus(metrics: HardwareMetrics): 'online' | 'offline' | 'error' | 'maintenance' {
    // Simple status calculation based on metrics
    if (metrics.cpu.usage > 95 || metrics.memory.usage > 95 || metrics.temperature.cpu > 80) {
      return 'error';
    }
    return 'online';
  }

  private calculateDeviceHealth(metrics: HardwareMetrics): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const cpuHealth = metrics.cpu.usage < 50 ? 100 : metrics.cpu.usage < 70 ? 80 : metrics.cpu.usage < 90 ? 60 : 20;
    const memoryHealth = metrics.memory.usage < 60 ? 100 : metrics.memory.usage < 80 ? 80 : metrics.memory.usage < 95 ? 60 : 20;
    const tempHealth = metrics.temperature.cpu < 50 ? 100 : metrics.temperature.cpu < 70 ? 80 : metrics.temperature.cpu < 80 ? 60 : 20;

    const averageHealth = (cpuHealth + memoryHealth + tempHealth) / 3;

    if (averageHealth >= 90) return 'excellent';
    if (averageHealth >= 70) return 'good';
    if (averageHealth >= 50) return 'fair';
    if (averageHealth >= 30) return 'poor';
    return 'critical';
  }

  private calculatePerformance(metrics: HardwareMetrics): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F'; recommendations: string[] } {
    const cpuScore = Math.max(0, 100 - metrics.cpu.usage);
    const memoryScore = Math.max(0, 100 - metrics.memory.usage);
    const diskScore = Math.max(0, 100 - metrics.disk.usage);
    const tempScore = Math.max(0, 100 - (metrics.temperature.cpu / 80) * 100);

    const score = (cpuScore + memoryScore + diskScore + tempScore) / 4;

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    const recommendations: string[] = [];
    if (metrics.cpu.usage > 80) recommendations.push('Consider CPU optimization or upgrade');
    if (metrics.memory.usage > 80) recommendations.push('Consider memory upgrade');
    if (metrics.disk.usage > 80) recommendations.push('Consider disk cleanup or expansion');
    if (metrics.temperature.cpu > 70) recommendations.push('Check cooling system');

    return { score, grade, recommendations };
  }

  private updateTrends(existingTrends: any, metrics: HardwareMetrics): any {
    const now = new Date();
    const maxPoints = 100; // Keep last 100 data points

    return {
      cpu: [...existingTrends.cpu, { timestamp: now, value: metrics.cpu.usage }].slice(-maxPoints),
      memory: [...existingTrends.memory, { timestamp: now, value: metrics.memory.usage }].slice(-maxPoints),
      disk: [...existingTrends.disk, { timestamp: now, value: metrics.disk.usage }].slice(-maxPoints),
      temperature: [...existingTrends.temperature, { timestamp: now, value: metrics.temperature.cpu }].slice(-maxPoints)
    };
  }

  private initializeTrends(metrics: HardwareMetrics): any {
    const now = new Date();
    return {
      cpu: [{ timestamp: now, value: metrics.cpu.usage }],
      memory: [{ timestamp: now, value: metrics.memory.usage }],
      disk: [{ timestamp: now, value: metrics.disk.usage }],
      temperature: [{ timestamp: now, value: metrics.temperature.cpu }]
    };
  }

  private generateId(): string {
    return 'alert-' + Math.random().toString(36).substr(2, 9);
  }
}

