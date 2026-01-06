import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { MaintenanceTask, MaintenanceSchedule, SystemHealth, MaintenanceLog, MaintenanceFilters, MaintenanceStatistics, TaskForm, ScheduleForm } from '../models/maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private tasks = signal<MaintenanceTask[]>([]);
  private schedules = signal<MaintenanceSchedule[]>([]);
  private logs = signal<MaintenanceLog[]>([]);
  private systemHealth = signal<SystemHealth>({
    status: 'healthy',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    databaseStatus: 'connected',
    apiStatus: 'online',
    lastCheck: '',
    uptime: '',
    version: '1.0.0'
  });
  private loading = signal(false);

  constructor(private api: ApiService) {}

  // Getters
  getTasks = () => this.tasks.asReadonly();
  getSchedules = () => this.schedules.asReadonly();
  getLogs = () => this.logs.asReadonly();
  getSystemHealth = () => this.systemHealth.asReadonly();
  getLoading = () => this.loading.asReadonly();

  // Load data
  loadTasks(): Observable<MaintenanceTask[]> {
    this.loading.set(true);
    return this.api.get<MaintenanceTask[]>('/admin/maintenance/tasks').pipe(
      tap((response: any) => {
        this.tasks.set(response.data || response || []);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading tasks:', error);
        this.tasks.set([]);
        this.loading.set(false);
        throw error;
      })
    );
  }

  loadSchedules(): Observable<MaintenanceSchedule[]> {
    return this.api.get<MaintenanceSchedule[]>('/admin/maintenance/schedules').pipe(
      tap((response: any) => {
        this.schedules.set(response.data || response || []);
      }),
      catchError((error) => {
        console.error('Error loading schedules:', error);
        this.schedules.set([]);
        throw error;
      })
    );
  }

  loadLogs(): Observable<MaintenanceLog[]> {
    return this.api.get<MaintenanceLog[]>('/admin/maintenance/logs').pipe(
      tap((response: any) => {
        this.logs.set(response.data || response || []);
      }),
      catchError((error) => {
        console.error('Error loading logs:', error);
        this.logs.set([]);
        throw error;
      })
    );
  }

  loadSystemHealth(): Observable<SystemHealth> {
    return this.api.get<SystemHealth>('/admin/maintenance/health').pipe(
      tap((response: any) => {
        this.systemHealth.set(response.data || response || this.systemHealth());
      }),
      catchError((error) => {
        console.error('Error loading system health:', error);
        throw error;
      })
    );
  }

  // Task operations
  createTask(taskData: TaskForm): Observable<MaintenanceTask> {
    return this.api.post<MaintenanceTask>('/admin/maintenance/tasks', taskData);
  }

  updateTask(taskId: string, taskData: Partial<TaskForm>): Observable<MaintenanceTask> {
    return this.api.put<MaintenanceTask>(`/admin/maintenance/tasks/${taskId}`, taskData);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.api.delete<void>(`/admin/maintenance/tasks/${taskId}`);
  }

  runTask(taskId: string): Observable<void> {
    return this.api.post<void>(`/admin/maintenance/tasks/${taskId}/run`, {});
  }

  cancelTask(taskId: string): Observable<void> {
    return this.api.post<void>(`/admin/maintenance/tasks/${taskId}/cancel`, {});
  }

  // Schedule operations
  createSchedule(scheduleData: ScheduleForm): Observable<MaintenanceSchedule> {
    return this.api.post<MaintenanceSchedule>('/admin/maintenance/schedules', scheduleData);
  }

  updateSchedule(scheduleId: string, scheduleData: Partial<ScheduleForm>): Observable<MaintenanceSchedule> {
    return this.api.put<MaintenanceSchedule>(`/admin/maintenance/schedules/${scheduleId}`, scheduleData);
  }

  deleteSchedule(scheduleId: string): Observable<void> {
    return this.api.delete<void>(`/admin/maintenance/schedules/${scheduleId}`);
  }

  toggleSchedule(scheduleId: string, isActive: boolean): Observable<void> {
    return this.api.put<void>(`/admin/maintenance/schedules/${scheduleId}/toggle`, { isActive });
  }

  // System operations
  runSystemCheck(): Observable<SystemHealth> {
    return this.api.post<SystemHealth>('/admin/maintenance/check', {});
  }

  restartSystem(): Observable<void> {
    return this.api.post<void>('/admin/maintenance/restart', {});
  }

  shutdownSystem(): Observable<void> {
    return this.api.post<void>('/admin/maintenance/shutdown', {});
  }

  // Statistics
  getMaintenanceStatistics(): MaintenanceStatistics {
    const tasks = this.tasks();
    const schedules = this.schedules();

    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      runningTasks: tasks.filter(t => t.status === 'running').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      totalSchedules: schedules.length,
      activeSchedules: schedules.filter(s => s.isActive).length,
      systemHealth: this.systemHealth()
    };
  }

  // Filter methods
  filterTasks(filters: MaintenanceFilters): MaintenanceTask[] {
    let filtered = this.tasks();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search)
      );
    }

    if (filters.type) {
      filtered = filtered.filter(task => task.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(task => new Date(task.scheduledAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(task => new Date(task.scheduledAt) <= toDate);
    }

    return filtered;
  }

  // Helper methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'backup':
        return 'text-blue-600';
      case 'cleanup':
        return 'text-green-600';
      case 'update':
        return 'text-purple-600';
      case 'optimization':
        return 'text-yellow-600';
      case 'security':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getHealthStatusClass(status: string): string {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }
}
