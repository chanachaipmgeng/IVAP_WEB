export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  type: 'backup' | 'cleanup' | 'update' | 'optimization' | 'security';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledAt: string;
  startedAt: string;
  completedAt: string;
  duration: number;
  progress: number;
  result: string;
  error: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  name: string;
  description: string;
  taskType: 'backup' | 'cleanup' | 'update' | 'optimization' | 'security';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression: string;
  isActive: boolean;
  lastRun: string;
  nextRun: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  databaseStatus: 'connected' | 'disconnected' | 'error';
  apiStatus: 'online' | 'offline' | 'degraded';
  lastCheck: string;
  uptime: string;
  version: string;
}

export interface MaintenanceLog {
  id: string;
  taskId: string;
  taskName: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  details: string;
}

export interface MaintenanceFilters {
  search: string;
  type: string;
  status: string;
  priority: string;
  dateFrom: string;
  dateTo: string;
}

export interface MaintenanceStatistics {
  totalTasks: number;
  pendingTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalSchedules: number;
  activeSchedules: number;
  systemHealth: SystemHealth;
}

export interface TaskForm {
  name: string;
  description: string;
  type: 'backup' | 'cleanup' | 'update' | 'optimization' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledAt: string;
}

export interface ScheduleForm {
  name: string;
  description: string;
  taskType: 'backup' | 'cleanup' | 'update' | 'optimization' | 'security';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression: string;
  isActive: boolean;
}
