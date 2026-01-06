export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  category: string;
  isEditable: boolean;
}

export interface SystemInfo {
  version: string;
  uptime: string;
  memoryUsage: string;
  diskUsage: string;
  cpuUsage: string;
  databaseStatus: string;
  lastBackup: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  category: string;  // category in backend
  message: string;
  source: string;
  details?: string;  // details in backend
  userId?: string;  // userId in backend
  ipAddress?: string;  // ipAddress in backend
}

export interface SystemAction {
  type: 'clear_cache' | 'restart_services' | 'maintenance_mode';
  description: string;
  confirmationRequired: boolean;
}

/**
 * System Health Response
 * Backend: GET /api/v1/admin/system-health
 */
export interface SystemHealth {
  database: 'healthy' | 'unhealthy';  // database in backend
  tables: 'healthy' | 'unhealthy';  // tables in backend
  overall: 'healthy' | 'unhealthy';  // overall in backend
  timestamp: string;  // timestamp in backend
  error?: string;  // error in backend (optional)
}

/**
 * Performance Metrics Response
 * Backend: GET /api/v1/admin/performance-metrics
 */
export interface PerformanceMetrics {
  responseTime: string;  // responseTime in backend
  memoryUsage: string;  // memoryUsage in backend
  cpuUsage: string;  // cpuUsage in backend
  diskUsage: string;  // diskUsage in backend
  activeConnections: number;  // activeConnections in backend
  timestamp: string;  // timestamp in backend
}

/**
 * System Statistics
 * Backend: GET /api/v1/admin/system-stats
 */
export interface SystemStats {
  totalCompanies: number;  // totalCompanies in backend
  totalMembers: number;  // totalMembers in backend
  activeDevices: number;  // activeDevices in backend
  systemStatus: string;  // systemStatus in backend
}

/**
 * Device Statistics
 * Backend: GET /api/v1/admin/device-stats
 */
export interface DeviceStats {
  totalDevices: number;  // totalDevices in backend
  activeDevices: number;  // activeDevices in backend
  inactiveDevices: number;  // inactiveDevices in backend
}

/**
 * Chart Data
 * Backend: GET /api/v1/admin/charts/user-registrations, GET /api/v1/admin/charts/user-distribution
 */
export interface ChartData {
  labels: string[];  // labels in backend
  datasets: Array<{
    label: string;  // label in backend
    data: number[];  // data in backend
    fill?: boolean;  // fill in backend
    borderColor?: string;  // borderColor in backend
    tension?: number;  // tension in backend
    backgroundColor?: string | string[];  // backgroundColor in backend
  }>;
}

/**
 * Activity
 * Backend: GET /api/v1/admin/activities
 */
export interface Activity {
  id: string;  // id in backend
  adminName: string;  // adminName in backend
  action: string;  // action in backend
  target: string;  // target in backend
  timestamp: string;  // timestamp in backend (ISO datetime string)
}
