import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface EquipmentAlert {
  id: string;
  type: 'conveyor_belt_stopped' | 'forklift_restricted_area' | 'equipment_malfunction' | 'maintenance_due' | 'performance_degradation' | 'safety_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  equipmentId: string;
  equipmentName: string;
  location: string;
  zoneId: string;
  timestamp: Date;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  imageUrl?: string;
  videoUrl?: string;
  maintenanceRequired?: boolean;
  estimatedDowntime?: number; // in minutes
}

export interface Equipment {
  id: string;
  name: string;
  type: 'conveyor_belt' | 'forklift' | 'crane' | 'generator' | 'compressor' | 'pump' | 'motor' | 'sensor' | 'camera';
  model: string;
  manufacturer: string;
  serialNumber: string;
  location: string;
  zoneId: string;
  status: 'operational' | 'maintenance' | 'malfunction' | 'offline' | 'idle';
  isActive: boolean;
  lastMaintenance: Date;
  nextMaintenance: Date;
  maintenanceInterval: number; // in days
  operatingHours: number;
  totalOperatingHours: number;
  performance: {
    efficiency: number; // percentage
    throughput: number; // units per hour
    energyConsumption: number; // kWh
    vibration: number; // mm/s
    temperature: number; // °C
    pressure: number; // bar
  };
  healthScore: number; // 0-100
  lastUpdate: Date;
  batteryLevel?: number;
  signalStrength?: number;
  warrantyExpiry?: Date;
  assignedTechnician?: string;
}

export interface EquipmentMetrics {
  totalEquipment: number;
  equipmentByType: { [key: string]: number };
  equipmentByStatus: { [key: string]: number };
  equipmentByLocation: { [key: string]: number };
  averageHealthScore: number;
  maintenanceDue: number;
  criticalAlerts: number;
  averageEfficiency: number;
  totalOperatingHours: number;
  energyConsumption: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  description: string;
  performedBy: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  partsUsed: string[];
  cost: number;
  notes?: string;
  nextMaintenance?: Date;
}

export interface EquipmentZone {
  id: string;
  name: string;
  type: 'production' | 'warehouse' | 'maintenance' | 'storage' | 'office';
  equipment: string[];
  rules: EquipmentRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentRule {
  id: string;
  type: 'performance_threshold' | 'maintenance_schedule' | 'safety_zone' | 'energy_consumption' | 'vibration_limit';
  equipmentType: string;
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
export class EquipmentMonitoringService {
  // ✅ Signals for reactive state
  private _equipment = signal<Equipment[]>([]);
  private _alerts = signal<EquipmentAlert[]>([]);
  private _maintenance = signal<MaintenanceRecord[]>([]);
  private _zones = signal<EquipmentZone[]>([]);
  private _metrics = signal<EquipmentMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly equipment = this._equipment.asReadonly();
  public readonly alerts = this._alerts.asReadonly();
  public readonly maintenance = this._maintenance.asReadonly();
  public readonly zones = this._zones.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly equipmentCount = computed(() => this._equipment().length);
  public readonly activeAlertsCount = computed(() => this._alerts().filter(a => a.status === 'active').length);
  public readonly criticalAlertsCount = computed(() => this._alerts().filter(a => a.severity === 'critical').length);
  public readonly maintenanceDueCount = computed(() => this._equipment().filter(e => this.isMaintenanceDue(e)).length);

  private isMonitoring = false;
  private monitoringInterval?: any;

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Start equipment monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.simulateEquipmentMonitoring();
    }, 4000); // Check every 4 seconds
  }

  /**
   * Stop equipment monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }

  /**
   * Process equipment data
   */
  async processEquipmentData(equipmentId: string, data: any): Promise<EquipmentAlert[]> {
    const equipment = this._equipment().find(e => e.id === equipmentId);
    if (!equipment || !equipment.isActive) return [];

    const alerts: EquipmentAlert[] = [];
    const zone = this._zones().find(z => z.id === equipment.zoneId);
    if (!zone) return [];

    // Update equipment performance data
    equipment.performance = { ...equipment.performance, ...data };
    equipment.lastUpdate = new Date();
    equipment.healthScore = this.calculateHealthScore(equipment);

    // Check against rules
    const rules = zone.rules.filter(r => r.equipmentType === equipment.type);
    for (const rule of rules) {
      if (!rule.isEnabled) continue;

      const alert = this.checkRuleViolation(equipment, rule);
      if (alert) {
        alerts.push(alert);
      }
    }

    // Check maintenance due
    if (this.isMaintenanceDue(equipment)) {
      const maintenanceAlert: EquipmentAlert = {
        id: this.generateId(),
        type: 'maintenance_due',
        severity: 'medium',
        confidence: 1.0,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        location: equipment.location,
        zoneId: equipment.zoneId,
        timestamp: new Date(),
        description: `Maintenance due for ${equipment.name}`,
        status: 'active',
        maintenanceRequired: true,
        estimatedDowntime: this.estimateMaintenanceTime(equipment.type)
      };
      alerts.push(maintenanceAlert);
    }

    // Update equipment
    this.updateEquipment(equipment);

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
   * Get equipment by filter
   */
  getEquipment(filter?: {
    type?: string;
    status?: string;
    zoneId?: string;
    healthScoreMin?: number;
    maintenanceDue?: boolean;
  }): Equipment[] {
    let equipment = this._equipment();

    if (filter) {
      if (filter.type) {
        equipment = equipment.filter(e => e.type === filter.type);
      }
      if (filter.status) {
        equipment = equipment.filter(e => e.status === filter.status);
      }
      if (filter.zoneId) {
        equipment = equipment.filter(e => e.zoneId === filter.zoneId);
      }
      if (filter.healthScoreMin !== undefined) {
        equipment = equipment.filter(e => e.healthScore >= filter.healthScoreMin!);
      }
      if (filter.maintenanceDue) {
        equipment = equipment.filter(e => this.isMaintenanceDue(e));
      }
    }

    return equipment;
  }

  /**
   * Get alerts by filter
   */
  getAlerts(filter?: {
    type?: string;
    severity?: string;
    status?: string;
    equipmentId?: string;
    zoneId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): EquipmentAlert[] {
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
      if (filter.equipmentId) {
        alerts = alerts.filter(a => a.equipmentId === filter.equipmentId);
      }
      if (filter.zoneId) {
        alerts = alerts.filter(a => a.zoneId === filter.zoneId);
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
   * Get maintenance records
   */
  getMaintenanceRecords(equipmentId?: string): MaintenanceRecord[] {
    let records = this._maintenance();

    if (equipmentId) {
      records = records.filter(r => r.equipmentId === equipmentId);
    }

    return records.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Schedule maintenance
   */
  scheduleMaintenance(record: Omit<MaintenanceRecord, 'id' | 'startTime' | 'status'>): MaintenanceRecord {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: this.generateId(),
      startTime: new Date(),
      status: 'scheduled'
    };

    this._maintenance.update(records => [...records, newRecord]);

    return newRecord;
  }

  /**
   * Update maintenance record
   */
  updateMaintenanceRecord(recordId: string, updates: Partial<MaintenanceRecord>): void {
    this._maintenance.update(records => {
      const index = records.findIndex(r => r.id === recordId);
      if (index !== -1) {
        records[index] = { ...records[index], ...updates };
      }
      return [...records];
    });
  }

  /**
   * Get metrics
   */
  getMetrics(): EquipmentMetrics {
    return this._metrics();
  }

  /**
   * Generate equipment report
   */
  generateEquipmentReport(options: {
    dateFrom: Date;
    dateTo: Date;
    equipmentIds?: string[];
    zoneIds?: string[];
    includeMaintenance?: boolean;
  }): any {
    const equipment = this.getEquipment({
      zoneId: options.zoneIds?.[0]
    });

    const alerts = this.getAlerts({
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
      equipmentId: options.equipmentIds?.[0],
      zoneId: options.zoneIds?.[0]
    });

    const maintenanceRecords = options.includeMaintenance ?
      this.getMaintenanceRecords(options.equipmentIds?.[0]) : [];

    const report = {
      period: {
        from: options.dateFrom,
        to: options.dateTo
      },
      summary: {
        totalEquipment: equipment.length,
        equipmentByType: this.groupBy(equipment, 'type'),
        equipmentByStatus: this.groupBy(equipment, 'status'),
        averageHealthScore: this.calculateAverageHealthScore(equipment),
        totalAlerts: alerts.length,
        alertsByType: this.groupBy(alerts, 'type'),
        alertsBySeverity: this.groupBy(alerts, 'severity'),
        maintenanceRecords: maintenanceRecords.length
      },
      equipment: equipment,
      alerts: alerts,
      maintenanceRecords: maintenanceRecords,
      generatedAt: new Date()
    };

    return report;
  }

  /**
   * Check rule violation
   */
  private checkRuleViolation(equipment: Equipment, rule: EquipmentRule): EquipmentAlert | null {
    const value = this.getRuleValue(equipment, rule.type);
    if (value === null) return null;

    let severity: 'low' | 'medium' | 'high' | 'critical' | null = null;

    if (value >= rule.threshold.critical) {
      severity = 'critical';
    } else if (value >= rule.threshold.warning) {
      severity = 'high';
    } else if (value >= rule.threshold.warning * 0.8) {
      severity = 'medium';
    } else if (value >= rule.threshold.warning * 0.6) {
      severity = 'low';
    }

    if (!severity) return null;

    return {
      id: this.generateId(),
      type: this.mapRuleTypeToAlertType(rule.type),
      severity: severity,
      confidence: this.calculateConfidence(value, rule.threshold),
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      location: equipment.location,
      zoneId: equipment.zoneId,
      timestamp: new Date(),
      description: this.getAlertDescription(rule.type, value, rule.threshold),
      status: 'active'
    };
  }

  /**
   * Get rule value
   */
  private getRuleValue(equipment: Equipment, ruleType: string): number | null {
    const performance = equipment.performance;

    switch (ruleType) {
      case 'performance_threshold':
        return performance.efficiency;
      case 'energy_consumption':
        return performance.energyConsumption;
      case 'vibration_limit':
        return performance.vibration;
      case 'maintenance_schedule':
        return this.getDaysUntilMaintenance(equipment);
      default:
        return null;
    }
  }

  /**
   * Map rule type to alert type
   */
  private mapRuleTypeToAlertType(ruleType: string): EquipmentAlert['type'] {
    const mapping: { [key: string]: EquipmentAlert['type'] } = {
      performance_threshold: 'performance_degradation',
      maintenance_schedule: 'maintenance_due',
      safety_zone: 'safety_violation',
      energy_consumption: 'equipment_malfunction',
      vibration_limit: 'equipment_malfunction'
    };
    return mapping[ruleType] || 'equipment_malfunction';
  }

  /**
   * Get alert description
   */
  private getAlertDescription(ruleType: string, value: number, threshold: any): string {
    const descriptions = {
      performance_threshold: `Performance degradation: ${value.toFixed(1)}% (threshold: ${threshold.warning}%)`,
      energy_consumption: `High energy consumption: ${value.toFixed(1)} kWh (threshold: ${threshold.warning} kWh)`,
      vibration_limit: `High vibration: ${value.toFixed(2)} mm/s (threshold: ${threshold.warning} mm/s)`,
      maintenance_schedule: `Maintenance overdue: ${value} days`,
      safety_zone: `Safety zone violation detected`
    };
    return descriptions[ruleType as keyof typeof descriptions] || 'Equipment alert detected';
  }

  /**
   * Calculate health score
   */
  private calculateHealthScore(equipment: Equipment): number {
    const performance = equipment.performance;
    let score = 100;

    // Efficiency factor (40% weight)
    if (performance.efficiency < 80) score -= (80 - performance.efficiency) * 0.5;

    // Vibration factor (20% weight)
    if (performance.vibration > 5) score -= (performance.vibration - 5) * 2;

    // Temperature factor (20% weight)
    if (performance.temperature > 60) score -= (performance.temperature - 60) * 0.5;

    // Energy consumption factor (20% weight)
    if (performance.energyConsumption > 100) score -= (performance.energyConsumption - 100) * 0.1;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check if maintenance is due
   */
  private isMaintenanceDue(equipment: Equipment): boolean {
    const now = new Date();
    return equipment.nextMaintenance <= now;
  }

  /**
   * Get days until maintenance
   */
  private getDaysUntilMaintenance(equipment: Equipment): number {
    const now = new Date();
    const diffTime = equipment.nextMaintenance.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Estimate maintenance time
   */
  private estimateMaintenanceTime(equipmentType: string): number {
    const estimates = {
      conveyor_belt: 120, // 2 hours
      forklift: 180, // 3 hours
      crane: 240, // 4 hours
      generator: 300, // 5 hours
      compressor: 90, // 1.5 hours
      pump: 60, // 1 hour
      motor: 90, // 1.5 hours
      sensor: 30, // 30 minutes
      camera: 45 // 45 minutes
    };
    return estimates[equipmentType as keyof typeof estimates] || 120;
  }

  /**
   * Calculate confidence
   */
  private calculateConfidence(value: number, threshold: any): number {
    const normalizedValue = value / threshold.critical;
    return Math.min(1, Math.max(0.5, normalizedValue));
  }

  /**
   * Update equipment
   */
  private updateEquipment(equipment: Equipment): void {
    this._equipment.update(equipmentList => {
      const index = equipmentList.findIndex(e => e.id === equipment.id);
      if (index !== -1) {
        equipmentList[index] = { ...equipment };
      }
      return [...equipmentList];
    });
  }

  /**
   * Simulate equipment monitoring
   */
  private simulateEquipmentMonitoring(): void {
    const equipment = this._equipment().filter(e => e.isActive && e.status === 'operational');

    for (const eq of equipment) {
      if (Math.random() < 0.03) { // 3% chance per equipment
        const simulatedData = this.generateSimulatedData(eq);
        this.processEquipmentData(eq.id, simulatedData);
      }
    }
  }

  /**
   * Generate simulated equipment data
   */
  private generateSimulatedData(equipment: Equipment): any {
    const basePerformance = equipment.performance;
    const variation = 0.1; // 10% variation

    return {
      efficiency: Math.max(0, Math.min(100, basePerformance.efficiency + (Math.random() - 0.5) * variation * 100)),
      throughput: Math.max(0, basePerformance.throughput + (Math.random() - 0.5) * variation * basePerformance.throughput),
      energyConsumption: Math.max(0, basePerformance.energyConsumption + (Math.random() - 0.5) * variation * basePerformance.energyConsumption),
      vibration: Math.max(0, basePerformance.vibration + (Math.random() - 0.5) * variation * basePerformance.vibration),
      temperature: Math.max(0, basePerformance.temperature + (Math.random() - 0.5) * variation * basePerformance.temperature),
      pressure: Math.max(0, basePerformance.pressure + (Math.random() - 0.5) * variation * basePerformance.pressure)
    };
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const equipment = this._equipment();
    const alerts = this._alerts();
    const metrics = this.calculateMetrics(equipment, alerts);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(equipment: Equipment[], alerts: EquipmentAlert[]): EquipmentMetrics {
    const totalEquipment = equipment.length;
    const equipmentByType = this.groupBy(equipment, 'type');
    const equipmentByStatus = this.groupBy(equipment, 'status');
    const equipmentByLocation = this.groupBy(equipment, 'location');

    const averageHealthScore = this.calculateAverageHealthScore(equipment);
    const maintenanceDue = equipment.filter(e => this.isMaintenanceDue(e)).length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const averageEfficiency = this.calculateAverageEfficiency(equipment);
    const totalOperatingHours = equipment.reduce((sum, e) => sum + e.operatingHours, 0);
    const energyConsumption = equipment.reduce((sum, e) => sum + e.performance.energyConsumption, 0);
    const trend = this.calculateTrend(equipment);

    return {
      totalEquipment,
      equipmentByType,
      equipmentByStatus,
      equipmentByLocation,
      averageHealthScore,
      maintenanceDue,
      criticalAlerts,
      averageEfficiency,
      totalOperatingHours,
      energyConsumption,
      trend
    };
  }

  /**
   * Calculate average health score
   */
  private calculateAverageHealthScore(equipment: Equipment[]): number {
    if (equipment.length === 0) return 0;
    const totalScore = equipment.reduce((sum, e) => sum + e.healthScore, 0);
    return totalScore / equipment.length;
  }

  /**
   * Calculate average efficiency
   */
  private calculateAverageEfficiency(equipment: Equipment[]): number {
    if (equipment.length === 0) return 0;
    const totalEfficiency = equipment.reduce((sum, e) => sum + e.performance.efficiency, 0);
    return totalEfficiency / equipment.length;
  }

  /**
   * Calculate trend
   */
  private calculateTrend(equipment: Equipment[]): 'improving' | 'stable' | 'declining' {
    const avgHealthScore = this.calculateAverageHealthScore(equipment);

    if (avgHealthScore >= 85) return 'improving';
    if (avgHealthScore >= 70) return 'stable';
    return 'declining';
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
  private getDefaultMetrics(): EquipmentMetrics {
    return {
      totalEquipment: 0,
      equipmentByType: {},
      equipmentByStatus: {},
      equipmentByLocation: {},
      averageHealthScore: 0,
      maintenanceDue: 0,
      criticalAlerts: 0,
      averageEfficiency: 0,
      totalOperatingHours: 0,
      energyConsumption: 0,
      trend: 'stable'
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo zones
    const demoZones: EquipmentZone[] = [
      {
        id: 'eq-zone-1',
        name: 'Production Line A',
        type: 'production',
        equipment: ['conveyor-1', 'conveyor-2', 'motor-1'],
        rules: [
          {
            id: 'rule-1',
            type: 'performance_threshold',
            equipmentType: 'conveyor_belt',
            threshold: { warning: 80, critical: 70 },
            severity: 'high',
            isEnabled: true,
            description: 'Conveyor belt efficiency monitoring'
          },
          {
            id: 'rule-2',
            type: 'vibration_limit',
            equipmentType: 'motor',
            threshold: { warning: 5, critical: 8 },
            severity: 'critical',
            isEnabled: true,
            description: 'Motor vibration monitoring'
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'eq-zone-2',
        name: 'Warehouse Operations',
        type: 'warehouse',
        equipment: ['forklift-1', 'forklift-2', 'crane-1'],
        rules: [
          {
            id: 'rule-3',
            type: 'maintenance_schedule',
            equipmentType: 'forklift',
            threshold: { warning: 7, critical: 0 },
            severity: 'medium',
            isEnabled: true,
            description: 'Forklift maintenance schedule'
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this._zones.set(demoZones);

    // Create demo equipment
    const demoEquipment: Equipment[] = [
      {
        id: 'conveyor-1',
        name: 'Main Conveyor Belt',
        type: 'conveyor_belt',
        model: 'CB-2000',
        manufacturer: 'Industrial Systems Inc.',
        serialNumber: 'CB2000-001',
        location: 'Production Line A',
        zoneId: 'eq-zone-1',
        status: 'operational',
        isActive: true,
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        maintenanceInterval: 45,
        operatingHours: 240,
        totalOperatingHours: 8760,
        performance: {
          efficiency: 85.5,
          throughput: 120,
          energyConsumption: 45.2,
          vibration: 2.1,
          temperature: 35.5,
          pressure: 2.5
        },
        healthScore: 85,
        lastUpdate: new Date(),
        batteryLevel: 95,
        signalStrength: 98,
        warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        assignedTechnician: 'tech-001'
      },
      {
        id: 'forklift-1',
        name: 'Electric Forklift #1',
        type: 'forklift',
        model: 'FL-5000',
        manufacturer: 'Heavy Equipment Co.',
        serialNumber: 'FL5000-001',
        location: 'Warehouse Operations',
        zoneId: 'eq-zone-2',
        status: 'operational',
        isActive: true,
        lastMaintenance: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        nextMaintenance: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        maintenanceInterval: 30,
        operatingHours: 180,
        totalOperatingHours: 4320,
        performance: {
          efficiency: 92.3,
          throughput: 45,
          energyConsumption: 25.8,
          vibration: 1.8,
          temperature: 28.2,
          pressure: 1.2
        },
        healthScore: 92,
        lastUpdate: new Date(),
        batteryLevel: 88,
        signalStrength: 92,
        warrantyExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        assignedTechnician: 'tech-002'
      }
    ];

    this._equipment.set(demoEquipment);

    // Create demo maintenance records
    const demoMaintenance: MaintenanceRecord[] = [
      {
        id: 'maint-1',
        equipmentId: 'conveyor-1',
        type: 'preventive',
        description: 'Routine belt inspection and lubrication',
        performedBy: 'tech-001',
        startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        duration: 120,
        status: 'completed',
        partsUsed: ['lubricant', 'belt-tensioner'],
        cost: 150.00,
        notes: 'Belt tension adjusted, all bearings lubricated',
        nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      }
    ];

    this._maintenance.set(demoMaintenance);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'eq-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}
