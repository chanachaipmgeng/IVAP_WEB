/**
 * Hardware Monitoring Models
 * Models สำหรับ Hardware Monitoring และ Device Metrics
 */

export type HardwareDeviceStatus = 'online' | 'offline' | 'error' | 'maintenance';
export type ProcessStatus = 'running' | 'sleeping' | 'stopped' | 'zombie';
export type AlertType = 'warning' | 'error' | 'critical';
export type HealthGrade = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Hardware Metrics Model
 */
export interface HardwareMetrics {
  deviceId: string;
  timestamp: Date | string;
  cpu: {
    usage: number; // percentage
    temperature: number; // celsius
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number; // bytes
    used: number; // bytes
    free: number; // bytes
    usage: number; // percentage
    swap: {
      total: number;
      used: number;
      free: number;
    };
  };
  disk: {
    total: number; // bytes
    used: number; // bytes
    free: number; // bytes
    usage: number; // percentage
    readSpeed: number; // bytes per second
    writeSpeed: number; // bytes per second
    iops: number; // operations per second
  };
  network: {
    interfaces: NetworkInterface[];
    totalBytesIn: number;
    totalBytesOut: number;
    bandwidth: number; // bps
    latency: number; // ms
  };
  power: {
    consumption: number; // watts
    voltage: number; // volts
    current: number; // amperes
    efficiency: number; // percentage
    batteryLevel?: number; // percentage
  };
  temperature: {
    ambient: number; // celsius
    cpu: number; // celsius
    gpu?: number; // celsius
    storage: number; // celsius
    max: number; // celsius
    min: number; // celsius
  };
  uptime: {
    current: number; // seconds
    lastReboot: Date | string;
    totalUptime: number; // seconds
    availability: number; // percentage
  };
  processes: ProcessInfo[];
  alerts: HardwareAlert[];
}

/**
 * Network Interface Model
 */
export interface NetworkInterface {
  name: string;
  status: 'up' | 'down';
  speed: number; // bps
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  errors: number;
  drops: number;
}

/**
 * Process Info Model
 */
export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number; // percentage
  memory: number; // bytes
  status: ProcessStatus;
  priority: number;
  startTime: Date | string;
}

/**
 * Hardware Alert Model
 */
export interface HardwareAlert {
  id: string;
  type: AlertType;
  message: string;
  timestamp: Date | string;
  resolved: boolean;
}

/**
 * Monitoring Config Model
 */
export interface MonitoringConfig {
  deviceId: string;
  enabled: boolean;
  interval: number; // seconds
  metrics: {
    cpu: boolean;
    memory: boolean;
    disk: boolean;
    network: boolean;
    power: boolean;
    temperature: boolean;
    uptime: boolean;
    processes: boolean;
  };
  thresholds: {
    cpu: { warning: number; critical: number };
    memory: { warning: number; critical: number };
    disk: { warning: number; critical: number };
    temperature: { warning: number; critical: number };
    power?: { warning: number; critical: number };
  };
  alerts: {
    enabled: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
    webhook?: boolean;
    webhookUrl?: string;
  };
}

/**
 * Device Health Model
 */
export interface DeviceHealth {
  deviceId: string;
  status: HardwareDeviceStatus;
  health: {
    score: number; // 0-100
    grade: HealthGrade;
    status: HardwareDeviceStatus;
  };
  lastCheck?: Date | string;
}

/**
 * Devices Overview Model
 */
export interface DevicesOverview {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  errorDevices: number;
  maintenanceDevices: number;
  averageHealth: number;
  totalAlerts: number;
  criticalAlerts: number;
  systemUptime: number;
  averagePerformance: number;
}

