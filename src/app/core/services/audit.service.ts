import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuditLog, AuditFilters, AuditStatistics } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private logs = signal<AuditLog[]>([]);
  private loading = signal(false);

  constructor(private api: ApiService) {}

  // Getters
  getLogs = () => this.logs.asReadonly();
  getLoading = () => this.loading.asReadonly();

  // Load data
  loadLogs(): Observable<AuditLog[]> {
    this.loading.set(true);
    // Use correct backend endpoint: /log-management/audit-trails
    return this.api.get<AuditLog[]>('/log-management/audit-trails').pipe(
      tap((response: any) => {
        const data = Array.isArray(response) ? response : (response?.data || []);
        this.logs.set(data);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading audit logs:', error);
        this.logs.set([]);
        this.loading.set(false);
        throw error;
      })
    );
  }

  // Filter logs
  filterLogs(filters: AuditFilters): AuditLog[] {
    let filtered = this.logs();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(search) ||
        log.resource.toLowerCase().includes(search) ||
        log.details.toLowerCase().includes(search) ||
        log.userName.toLowerCase().includes(search)
      );
    }

    if (filters.userName) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(filters.userName.toLowerCase())
      );
    }

    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.severity) {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      filtered = filtered.filter(log => new Date(log.timestamp) <= toDate);
    }

    return filtered;
  }

  // Statistics
  getLogStatistics(): AuditStatistics {
    const logs = this.logs();
    return {
      totalLogs: logs.length,
      successLogs: logs.filter(log => log.status === 'success').length,
      failureLogs: logs.filter(log => log.status === 'failure').length,
      criticalLogs: logs.filter(log => log.severity === 'critical').length
    };
  }

  // Export
  exportLogs(): Observable<Blob> {
    // Use correct backend endpoint: /log-management/export
    return this.api.get<Blob>('/log-management/export', { responseType: 'blob' });
  }

  // Cleanup
  clearOldLogs(): Observable<void> {
    // Use correct backend endpoint: /log-management/old
    return this.api.delete<void>('/log-management/old');
  }

  // Helper methods
  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'text-red-600 font-bold';
      case 'high':
        return 'text-orange-600 font-semibold';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failure':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
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

  convertToCSV(data: AuditLog[]): string {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Severity', 'Status', 'IP Address', 'Details'];
    const rows = data.map(log => [
      this.formatDateTime(log.timestamp),
      log.userName,
      log.action,
      log.resource,
      log.severity,
      log.status,
      log.ipAddress,
      log.details
    ]);

    return [headers, ...rows].map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
