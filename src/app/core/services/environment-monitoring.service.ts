import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface EnvironmentAlert {
  id: string;
  type: 'smoke_fire' | 'emergency_exit_blocked' | 'liquid_spill' | 'temperature_anomaly' | 'gas_leak' | 'flooding';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  location: string;
  zoneId: string;
  timestamp: Date;
  sensorId: string;
  sensorType: 'camera' | 'smoke_detector' | 'temperature_sensor' | 'gas_sensor' | 'motion_sensor' | 'water_sensor';
  value: number;
  unit: string;
  threshold: number;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  imageUrl?: string;
  videoUrl?: string;
}

export interface EnvironmentSensor {
  id: string;
  name: string;
  type: 'camera' | 'smoke_detector' | 'temperature_sensor' | 'gas_sensor' | 'motion_sensor' | 'water_sensor';
  location: string;
  zoneId: string;
  isActive: boolean;
  lastReading: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastUpdate: Date;
  batteryLevel?: number;
  signalStrength?: number;
}

export interface EnvironmentMetrics {
  totalAlerts: number;
  alertsByType: { [key: string]: number };
  alertsBySeverity: { [key: string]: number };
  alertsByLocation: { [key: string]: number };
  sensorStatus: {
    online: number;
    offline: number;
    maintenance: number;
    error: number;
  };
  averageResponseTime: number;
  resolutionRate: number;
  environmentScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface EnvironmentZone {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'warehouse' | 'office' | 'factory' | 'storage';
  sensors: string[];
  rules: EnvironmentRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentRule {
  id: string;
  type: 'temperature_range' | 'humidity_range' | 'smoke_detection' | 'gas_detection' | 'water_detection' | 'motion_detection';
  sensorType: string;
  threshold: {
    min?: number;
    max?: number;
    warning: number;
    critical: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  isEnabled: boolean;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentMonitoringService {
  // ✅ Signals for reactive state
  private _alerts = signal<EnvironmentAlert[]>([]);
  private _sensors = signal<EnvironmentSensor[]>([]);
  private _zones = signal<EnvironmentZone[]>([]);
  private _metrics = signal<EnvironmentMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly alerts = this._alerts.asReadonly();
  public readonly sensors = this._sensors.asReadonly();
  public readonly zones = this._zones.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly alertsCount = computed(() => this._alerts().length);
  public readonly activeAlertsCount = computed(() => this._alerts().filter(a => a.status === 'active').length);
  public readonly sensorsCount = computed(() => this._sensors().length);
  public readonly onlineSensorsCount = computed(() => this._sensors().filter(s => s.status === 'online').length);

  private isMonitoring = false;
  private monitoringInterval?: any;

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Start environment monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.simulateEnvironmentMonitoring();
    }, 3000); // Check every 3 seconds
  }

  /**
   * Stop environment monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }

  /**
   * Process sensor data
   */
  async processSensorData(sensorId: string, value: number, timestamp: Date = new Date()): Promise<EnvironmentAlert[]> {
    const sensor = this._sensors().find(s => s.id === sensorId);
    if (!sensor || !sensor.isActive) return [];

    const alerts: EnvironmentAlert[] = [];
    const zone = this._zones().find(z => z.id === sensor.zoneId);
    if (!zone) return [];

    // Check against thresholds
    const rule = zone.rules.find(r => r.sensorType === sensor.type);
    if (!rule || !rule.isEnabled) return [];

    const severity = this.calculateSeverity(value, rule.threshold);
    if (severity) {
      const alert: EnvironmentAlert = {
        id: this.generateId(),
        type: this.mapSensorTypeToAlertType(sensor.type),
        severity: severity,
        confidence: this.calculateConfidence(value, rule.threshold),
        location: sensor.location,
        zoneId: sensor.zoneId,
        timestamp: timestamp,
        sensorId: sensorId,
        sensorType: sensor.type,
        value: value,
        unit: sensor.unit,
        threshold: rule.threshold.critical,
        description: this.getAlertDescription(sensor.type, value, rule.threshold),
        status: 'active'
      };

      alerts.push(alert);
    }

    // Update sensor reading
    sensor.lastReading = value;
    sensor.lastUpdate = timestamp;
    this.updateSensor(sensor);

    // Add alerts
    if (alerts.length > 0) {
      this._alerts.update(current => [...current, ...alerts]);
      this.updateMetrics();
    }

    return alerts;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    this._alerts.update(alerts => {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.status = 'acknowledged';
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
      }
      return [...alerts];
    });
    this.updateMetrics();
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string, resolvedBy: string): void {
    this._alerts.update(alerts => {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.status = 'resolved';
        alert.resolvedBy = resolvedBy;
        alert.resolvedAt = new Date();
      }
      return [...alerts];
    });
    this.updateMetrics();
  }

  /**
   * Get alerts by filter
   */
  getAlerts(filter?: {
    type?: string;
    severity?: string;
    status?: string;
    zoneId?: string;
    sensorType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): EnvironmentAlert[] {
    let alerts = this._alerts();

    if (filter) {
      if (filter.type) {
        alerts = alerts.filter(a => a.type === filter.type);
      }
      if (filter.severity) {
        alerts = alerts.filter(a => a.severity === filter.severity);
      }
      if (filter.status) {
        alerts = alerts.filter(a => a.status === filter.status);
      }
      if (filter.zoneId) {
        alerts = alerts.filter(a => a.zoneId === filter.zoneId);
      }
      if (filter.sensorType) {
        alerts = alerts.filter(a => a.sensorType === filter.sensorType);
      }
      if (filter.dateFrom) {
        alerts = alerts.filter(a => a.timestamp >= filter.dateFrom!);
      }
      if (filter.dateTo) {
        alerts = alerts.filter(a => a.timestamp <= filter.dateTo!);
      }
    }

    return alerts;
  }

  /**
   * Get sensors
   */
  getSensors(): EnvironmentSensor[] {
    return this._sensors();
  }

  /**
   * Get sensor by ID
   */
  getSensor(sensorId: string): EnvironmentSensor | undefined {
    return this._sensors().find(s => s.id === sensorId);
  }

  /**
   * Update sensor
   */
  updateSensor(sensor: EnvironmentSensor): void {
    this._sensors.update(sensors => {
      const index = sensors.findIndex(s => s.id === sensor.id);
      if (index !== -1) {
        sensors[index] = { ...sensor };
      }
      return [...sensors];
    });
  }

  /**
   * Get zones
   */
  getZones(): EnvironmentZone[] {
    return this._zones();
  }

  /**
   * Create zone
   */
  createZone(zone: Omit<EnvironmentZone, 'id' | 'createdAt' | 'updatedAt'>): EnvironmentZone {
    const newZone: EnvironmentZone = {
      ...zone,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this._zones.update(zones => [...zones, newZone]);

    return newZone;
  }

  /**
   * Get metrics
   */
  getMetrics(): EnvironmentMetrics {
    return this._metrics();
  }

  /**
   * Generate environment report
   */
  generateEnvironmentReport(options: {
    dateFrom: Date;
    dateTo: Date;
    zoneIds?: string[];
    sensorTypes?: string[];
  }): any {
    const alerts = this.getAlerts({
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
      zoneId: options.zoneIds?.[0],
      sensorType: options.sensorTypes?.[0]
    });

    const sensors = this._sensors();
    const zones = this._zones();

    const report = {
      period: {
        from: options.dateFrom,
        to: options.dateTo
      },
      summary: {
        totalAlerts: alerts.length,
        alertsByType: this.groupBy(alerts, 'type'),
        alertsBySeverity: this.groupBy(alerts, 'severity'),
        alertsByLocation: this.groupBy(alerts, 'location'),
        sensorStatus: this.calculateSensorStatus(sensors),
        averageResponseTime: this.calculateAverageResponseTime(alerts),
        resolutionRate: this.calculateResolutionRate(alerts)
      },
      alerts: alerts,
      sensors: sensors.filter(s => options.zoneIds?.includes(s.zoneId) || !options.zoneIds),
      zones: zones.filter(z => options.zoneIds?.includes(z.id) || !options.zoneIds),
      generatedAt: new Date()
    };

    return report;
  }

  /**
   * Simulate environment monitoring
   */
  private simulateEnvironmentMonitoring(): void {
    const sensors = this._sensors().filter(s => s.isActive && s.status === 'online');

    for (const sensor of sensors) {
      if (Math.random() < 0.02) { // 2% chance per sensor
        const simulatedValue = this.generateSimulatedValue(sensor);
        this.processSensorData(sensor.id, simulatedValue);
      }
    }
  }

  /**
   * Generate simulated sensor value
   */
  private generateSimulatedValue(sensor: EnvironmentSensor): number {
    const baseValue = this.getBaseValueForSensorType(sensor.type);
    const variation = (Math.random() - 0.5) * baseValue * 0.2; // ±10% variation
    return Math.max(0, baseValue + variation);
  }

  /**
   * Get base value for sensor type
   */
  private getBaseValueForSensorType(type: string): number {
    const baseValues = {
      temperature_sensor: 22, // Celsius
      humidity_sensor: 50, // Percentage
      smoke_detector: 0.1, // mg/m³
      gas_sensor: 0.5, // ppm
      water_sensor: 0, // mm
      motion_sensor: 0 // motion detected (0 or 1)
    };
    return baseValues[type as keyof typeof baseValues] || 0;
  }

  /**
   * Calculate severity based on value and threshold
   */
  private calculateSeverity(value: number, threshold: any): 'low' | 'medium' | 'high' | 'critical' | null {
    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'high';
    if (value >= threshold.warning * 0.8) return 'medium';
    if (value >= threshold.warning * 0.6) return 'low';
    return null;
  }

  /**
   * Calculate confidence based on value and threshold
   */
  private calculateConfidence(value: number, threshold: any): number {
    const normalizedValue = value / threshold.critical;
    return Math.min(1, Math.max(0.5, normalizedValue));
  }

  /**
   * Map sensor type to alert type
   */
  private mapSensorTypeToAlertType(sensorType: string): EnvironmentAlert['type'] {
    const mapping: { [key: string]: EnvironmentAlert['type'] } = {
      smoke_detector: 'smoke_fire',
      temperature_sensor: 'temperature_anomaly',
      gas_sensor: 'gas_leak',
      water_sensor: 'flooding',
      motion_sensor: 'emergency_exit_blocked',
      camera: 'liquid_spill'
    };
    return mapping[sensorType] || 'temperature_anomaly';
  }

  /**
   * Get alert description
   */
  private getAlertDescription(sensorType: string, value: number, threshold: any): string {
    const descriptions = {
      smoke_detector: `Smoke detected: ${value.toFixed(2)} mg/m³ (threshold: ${threshold.critical} mg/m³)`,
      temperature_sensor: `Temperature anomaly: ${value.toFixed(1)}°C (threshold: ${threshold.critical}°C)`,
      gas_sensor: `Gas leak detected: ${value.toFixed(2)} ppm (threshold: ${threshold.critical} ppm)`,
      water_sensor: `Water detected: ${value.toFixed(1)} mm (threshold: ${threshold.critical} mm)`,
      motion_sensor: `Motion detected in restricted area`,
      camera: `Liquid spill detected in monitored area`
    };
    return descriptions[sensorType as keyof typeof descriptions] || 'Environment alert detected';
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const alerts = this._alerts();
    const sensors = this._sensors();
    const metrics = this.calculateMetrics(alerts, sensors);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(alerts: EnvironmentAlert[], sensors: EnvironmentSensor[]): EnvironmentMetrics {
    const totalAlerts = alerts.length;
    const alertsByType = this.groupBy(alerts, 'type');
    const alertsBySeverity = this.groupBy(alerts, 'severity');
    const alertsByLocation = this.groupBy(alerts, 'location');

    const sensorStatus = this.calculateSensorStatus(sensors);
    const averageResponseTime = this.calculateAverageResponseTime(alerts);
    const resolutionRate = this.calculateResolutionRate(alerts);
    const environmentScore = this.calculateEnvironmentScore(alerts, sensors);
    const trend = this.calculateTrend(alerts);

    return {
      totalAlerts,
      alertsByType,
      alertsBySeverity,
      alertsByLocation,
      sensorStatus,
      averageResponseTime,
      resolutionRate,
      environmentScore,
      trend
    };
  }

  /**
   * Calculate sensor status
   */
  private calculateSensorStatus(sensors: EnvironmentSensor[]): { online: number; offline: number; maintenance: number; error: number } {
    const grouped = this.groupBy(sensors, 'status');
    return {
      online: grouped['online'] || 0,
      offline: grouped['offline'] || 0,
      maintenance: grouped['maintenance'] || 0,
      error: grouped['error'] || 0
    };
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(alerts: EnvironmentAlert[]): number {
    const acknowledgedAlerts = alerts.filter(a => a.acknowledgedAt);
    if (acknowledgedAlerts.length === 0) return 0;

    const totalTime = acknowledgedAlerts.reduce((sum, a) => {
      if (a.acknowledgedAt) {
        return sum + (a.acknowledgedAt.getTime() - a.timestamp.getTime());
      }
      return sum;
    }, 0);

    return totalTime / acknowledgedAlerts.length / 1000 / 60; // in minutes
  }

  /**
   * Calculate resolution rate
   */
  private calculateResolutionRate(alerts: EnvironmentAlert[]): number {
    if (alerts.length === 0) return 0;
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved');
    return (resolvedAlerts.length / alerts.length) * 100;
  }

  /**
   * Calculate environment score
   */
  private calculateEnvironmentScore(alerts: EnvironmentAlert[], sensors: EnvironmentSensor[]): number {
    if (alerts.length === 0) return 100;

    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const highAlerts = alerts.filter(a => a.severity === 'high').length;
    const mediumAlerts = alerts.filter(a => a.severity === 'medium').length;
    const lowAlerts = alerts.filter(a => a.severity === 'low').length;

    const offlineSensors = sensors.filter(s => s.status === 'offline').length;
    const totalSensors = sensors.length;

    const alertScore = 100 - (criticalAlerts * 15 + highAlerts * 10 + mediumAlerts * 5 + lowAlerts * 2);
    const sensorScore = totalSensors > 0 ? ((totalSensors - offlineSensors) / totalSensors) * 100 : 100;

    return Math.max(0, Math.min(100, (alertScore + sensorScore) / 2));
  }

  /**
   * Calculate trend
   */
  private calculateTrend(alerts: EnvironmentAlert[]): 'improving' | 'stable' | 'declining' {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentAlerts = alerts.filter(a => a.timestamp >= lastWeek);
    const olderAlerts = alerts.filter(a => a.timestamp >= twoWeeksAgo && a.timestamp < lastWeek);

    if (recentAlerts.length < olderAlerts.length) return 'improving';
    if (recentAlerts.length > olderAlerts.length) return 'declining';
    return 'stable';
  }

  /**
   * Group array by property
   */
  private groupBy<T>(array: T[], property: keyof T): { [key: string]: number } {
    return array.reduce((groups, item) => {
      const key = String(item[property]);
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as { [key: string]: number });
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): EnvironmentMetrics {
    return {
      totalAlerts: 0,
      alertsByType: {},
      alertsBySeverity: {},
      alertsByLocation: {},
      sensorStatus: { online: 0, offline: 0, maintenance: 0, error: 0 },
      averageResponseTime: 0,
      resolutionRate: 0,
      environmentScore: 100,
      trend: 'stable'
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo zones
    const demoZones: EnvironmentZone[] = [
      {
        id: 'env-zone-1',
        name: 'Main Office Floor',
        type: 'office',
        sensors: ['temp-sensor-1', 'humidity-sensor-1', 'smoke-detector-1'],
        rules: [
          {
            id: 'rule-1',
            type: 'temperature_range',
            sensorType: 'temperature_sensor',
            threshold: { min: 18, max: 26, warning: 25, critical: 30 },
            severity: 'high',
            isEnabled: true,
            description: 'Office temperature monitoring'
          },
          {
            id: 'rule-2',
            type: 'smoke_detection',
            sensorType: 'smoke_detector',
            threshold: { warning: 0.5, critical: 1.0 },
            severity: 'critical',
            isEnabled: true,
            description: 'Smoke detection in office'
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'env-zone-2',
        name: 'Warehouse Storage',
        type: 'warehouse',
        sensors: ['temp-sensor-2', 'water-sensor-1', 'gas-sensor-1'],
        rules: [
          {
            id: 'rule-3',
            type: 'temperature_range',
            sensorType: 'temperature_sensor',
            threshold: { min: 15, max: 25, warning: 24, critical: 28 },
            severity: 'medium',
            isEnabled: true,
            description: 'Warehouse temperature monitoring'
          },
          {
            id: 'rule-4',
            type: 'water_detection',
            sensorType: 'water_sensor',
            threshold: { warning: 1, critical: 5 },
            severity: 'high',
            isEnabled: true,
            description: 'Water leak detection'
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this._zones.set(demoZones);

    // Create demo sensors
    const demoSensors: EnvironmentSensor[] = [
      {
        id: 'temp-sensor-1',
        name: 'Office Temperature Sensor',
        type: 'temperature_sensor',
        location: 'Main Office Floor',
        zoneId: 'env-zone-1',
        isActive: true,
        lastReading: 22.5,
        unit: '°C',
        threshold: { warning: 25, critical: 30 },
        status: 'online',
        lastUpdate: new Date(),
        batteryLevel: 85,
        signalStrength: 95
      },
      {
        id: 'smoke-detector-1',
        name: 'Office Smoke Detector',
        type: 'smoke_detector',
        location: 'Main Office Floor',
        zoneId: 'env-zone-1',
        isActive: true,
        lastReading: 0.1,
        unit: 'mg/m³',
        threshold: { warning: 0.5, critical: 1.0 },
        status: 'online',
        lastUpdate: new Date(),
        batteryLevel: 90,
        signalStrength: 98
      },
      {
        id: 'temp-sensor-2',
        name: 'Warehouse Temperature Sensor',
        type: 'temperature_sensor',
        location: 'Warehouse Storage',
        zoneId: 'env-zone-2',
        isActive: true,
        lastReading: 20.8,
        unit: '°C',
        threshold: { warning: 24, critical: 28 },
        status: 'online',
        lastUpdate: new Date(),
        batteryLevel: 78,
        signalStrength: 88
      },
      {
        id: 'water-sensor-1',
        name: 'Warehouse Water Sensor',
        type: 'water_sensor',
        location: 'Warehouse Storage',
        zoneId: 'env-zone-2',
        isActive: true,
        lastReading: 0,
        unit: 'mm',
        threshold: { warning: 1, critical: 5 },
        status: 'online',
        lastUpdate: new Date(),
        batteryLevel: 92,
        signalStrength: 85
      }
    ];

    this._sensors.set(demoSensors);

    // Create demo alerts
    const demoAlerts: EnvironmentAlert[] = [
      {
        id: 'env-alert-1',
        type: 'temperature_anomaly',
        severity: 'medium',
        confidence: 0.85,
        location: 'Main Office Floor',
        zoneId: 'env-zone-1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        sensorId: 'temp-sensor-1',
        sensorType: 'temperature_sensor',
        value: 26.5,
        unit: '°C',
        threshold: 30,
        description: 'Temperature anomaly: 26.5°C (threshold: 30°C)',
        status: 'acknowledged',
        acknowledgedBy: 'admin-1',
        acknowledgedAt: new Date(Date.now() - 25 * 60 * 1000)
      }
    ];

    this._alerts.set(demoAlerts);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'env-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}
