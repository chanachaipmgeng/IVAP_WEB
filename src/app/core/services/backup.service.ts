import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Backup, RestoreJob, BackupForm, RestoreForm, ScheduleForm, BackupStatistics } from '../models/backup.model';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private backups = signal<Backup[]>([]);
  private restoreJobs = signal<RestoreJob[]>([]);
  private loading = signal(false);

  constructor(private api: ApiService) {}

  // Getters
  getBackups = () => this.backups.asReadonly();
  getRestoreJobs = () => this.restoreJobs.asReadonly();
  getLoading = () => this.loading.asReadonly();

  // Load data
  loadBackups(): Observable<Backup[]> {
    this.loading.set(true);
    return this.api.get<Backup[]>('/admin/backups').pipe(
      tap((response: any) => {
        const data = Array.isArray(response) ? response : (response?.data || []);
        this.backups.set(data);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading backups:', error);
        this.backups.set([]);
        this.loading.set(false);
        throw error;
      })
    );
  }

  loadRestoreJobs(): Observable<RestoreJob[]> {
    return this.api.get<RestoreJob[]>('/admin/restore-jobs').pipe(
      tap((response: any) => {
        const data = Array.isArray(response) ? response : (response?.data || []);
        this.restoreJobs.set(data);
      }),
      catchError((error) => {
        console.error('Error loading restore jobs:', error);
        this.restoreJobs.set([]);
        throw error;
      })
    );
  }

  // Backup operations
  createBackup(backupData: BackupForm): Observable<Backup> {
    return this.api.post<Backup>('/admin/backups', backupData);
  }

  deleteBackup(backupId: string): Observable<void> {
    return this.api.delete<void>(`/admin/backups/${backupId}`);
  }

  downloadBackup(backupId: string): Observable<Blob> {
    return this.api.get<Blob>(`/admin/backups/${backupId}/download`, { responseType: 'blob' });
  }

  // Restore operations
  restoreFromBackup(restoreData: RestoreForm): Observable<RestoreJob> {
    return this.api.post<RestoreJob>('/admin/restore', restoreData);
  }

  cancelRestore(jobId: string): Observable<void> {
    return this.api.post<void>(`/admin/restore-jobs/${jobId}/cancel`, {});
  }

  // Schedule operations
  createSchedule(scheduleData: ScheduleForm): Observable<void> {
    return this.api.post<void>('/admin/backup-schedules', scheduleData);
  }

  // Cleanup
  cleanupOldBackups(): Observable<void> {
    return this.api.delete<void>('/admin/backups/cleanup');
  }

  // Statistics
  getBackupStatistics(): BackupStatistics {
    const backups = this.backups();
    const totalBytes = backups
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + this.parseSize(b.size), 0);

    return {
      totalBackups: backups.length,
      completedBackups: backups.filter(b => b.status === 'completed').length,
      inProgressBackups: backups.filter(b => b.status === 'in_progress').length,
      totalSize: this.formatSize(totalBytes)
    };
  }

  // Helper methods
  getAvailableBackups(): Backup[] {
    return this.backups().filter(b => b.status === 'completed');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      case 'scheduled':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }

  parseSize(sizeStr: string): number {
    const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
    if (!match) return 0;
    return parseFloat(match[1]) * units[match[2].toUpperCase() as keyof typeof units];
  }

  formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}
