/**
 * Monitoring Models
 * Models สำหรับ Monitoring Service
 * ตรงกับ backend schema: monitoring_schema.py
 */

export type DeviceStatusType = 'online' | 'offline' | 'error' | 'maintenance';
export type SecurityAlertType = 'unauthorized_access' | 'suspicious_activity' | 'system_breach' | 'device_tamper';
export type SecurityAlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * System Metrics Model
 */
export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  activeConnections: number;
  responseTime: number;
  uptime: number;
  timestamp: Date | string;
}

/**
 * Device Status Model
 */
export interface DeviceStatus {
  id: string;
  name: string;
  type: string;
  status: DeviceStatusType;
  lastSeen?: Date | string;
  location?: string;
  companyId?: string;
  metadata?: Record<string, any>;
}

/**
 * Security Alert Model
 */
export interface SecurityAlert {
  id: string;
  type: SecurityAlertType;
  severity: SecurityAlertSeverity;
  message: string;
  source: string;
  timestamp: Date | string;
  resolved: boolean;
  resolvedAt?: Date | string;
  resolvedBy?: string;
  metadata?: Record<string, any>;
}

/**
 * Activity Log Model
 */
export interface ActivityLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  resource: string;
  timestamp: Date | string;
  ipAddress?: string;
  success: boolean;
  details?: Record<string, any>;
}

/**
 * Backend Performance Metrics Model (from API)
 */
export interface BackendPerformanceMetrics {
  id?: string;
  endpoint?: string;
  method?: string;
  responseTime: number;
  statusCode?: number;
  timestamp: Date | string;
  metadata?: Record<string, any>;
}

