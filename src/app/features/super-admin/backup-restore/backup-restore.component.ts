/**
 * Backup Restore Component
 *
 * Backup and restore management component for super admin.
 * Supports backup creation, restore operations, scheduled backups, and statistics tracking.
 *
 * @example
 * ```html
 * <app-backup-restore></app-backup-restore>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { BackupService } from '../../../core/services/backup.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Backup, RestoreJob, BackupForm, RestoreForm, ScheduleForm, BackupStatistics } from '../../../core/models/backup.model';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-backup-restore',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent,
    StatisticsGridComponent
  ],
  templateUrl: './backup-restore.component.html',
  styleUrls: ['./backup-restore.component.scss']
})
export class BackupRestoreComponent extends BaseComponent implements OnInit {
  showScheduleModal = signal(false);

  backupForm: BackupForm = {
    name: '',
    type: 'full',
    description: '',
    includeFiles: true,
    compress: true
  };

  restoreForm: RestoreForm = {
    backupId: '',
    type: 'full',
    targetDb: ''
  };

  scheduleForm: ScheduleForm = {
    name: '',
    type: 'full',
    frequency: 'daily',
    time: '02:00',
    retentionDays: 30
  };

  // Computed signals for statistics
  backupStats = computed(() => this.backupService.getBackupStatistics());

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const stats = this.backupStats();
    return [
      {
        icon: '💾',
        label: 'Total Backups',
        value: stats.totalBackups,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '✅',
        label: 'Completed',
        value: stats.completedBackups,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '⏳',
        label: 'In Progress',
        value: stats.inProgressBackups,
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
      },
      {
        icon: '📦',
        label: 'Total Size',
        value: stats.totalSize,
        suffix: ' GB',
        iconBgClass: 'bg-purple-100 dark:bg-purple-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: 'Refresh',
      variant: 'secondary',
      onClick: () => this.loadBackups()
    },
    {
      label: 'Create Backup',
      variant: 'primary',
      onClick: () => this.createBackup()
    }
  ]);

  get columns(): TableColumn[] {
    return [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'size', label: 'Size', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'createdAt', label: 'Created', sortable: true },
      { key: 'description', label: 'Description' }
    ];
  }

  get actions(): TableAction[] {
    return [
      {
        icon: '📥',
        label: 'Download',
        onClick: (row) => this.downloadBackup(row)
      },
      {
        icon: '🔄',
        label: 'Restore',
        onClick: (row) => this.restoreFromBackup(row)
      },
      {
        icon: '🗑️',
        label: 'Delete',
        variant: 'danger',
        onClick: (row) => this.deleteBackup(row)
      }
    ];
  }

  constructor(
    public backupService: BackupService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadBackups();
    this.loadRestoreJobs();
  }

  // Getters from service
  getBackups = () => this.backupService.getBackups();
  getRestoreJobs = () => this.backupService.getRestoreJobs();
  getLoading = () => this.backupService.getLoading();

  // Load data methods
  loadBackups(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.backupService.loadBackups(),
      () => {
        // Data is automatically updated via service
      },
      (error) => {
        console.error('Error loading backups:', error);
      }
    );
  }

  loadRestoreJobs(): void {
    this.subscribe(
      this.backupService.loadRestoreJobs(),
      () => {
        // Data is automatically updated via service
      },
      (error) => {
        console.error('Error loading restore jobs:', error);
      }
    );
  }

  // Helper methods
  getAvailableBackups(): Backup[] {
    return this.backupService.getAvailableBackups();
  }

  formatDateTime(timestamp: string): string {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Modal methods
  openCreateBackupModal(): void {
    this.backupForm = {
      name: '',
      type: 'full',
      description: '',
      includeFiles: true,
      compress: true
    };
  }

  openScheduleModal(): void {
    this.scheduleForm = {
      name: '',
      type: 'full',
      frequency: 'daily',
      time: '02:00',
      retentionDays: 30
    };
    this.showScheduleModal.set(true);
  }

  closeScheduleModal(): void {
    this.showScheduleModal.set(false);
  }

  // Action methods
  createBackup(): void {
    if (!this.backupForm.name) {
      alert('Please enter a backup name');
      return;
    }

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.backupService.createBackup(this.backupForm),
      () => {
        this.loadBackups();
        alert('Backup created successfully!');
      },
      (error) => {
        console.error('Error creating backup:', error);
        alert('Error creating backup!');
      }
    );
  }

  downloadBackup(backup: Backup): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.backupService.downloadBackup(backup.id),
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${backup.name}.backup`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error downloading backup:', error);
        alert('Error downloading backup!');
      }
    );
  }

  restoreFromBackup(backup?: Backup): void {
    if (backup) {
      this.restoreForm.backupId = backup.id;
    }

    if (!this.restoreForm.backupId) {
      alert('Please select a backup to restore');
      return;
    }

    if (!confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
      return;
    }

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.backupService.restoreFromBackup(this.restoreForm),
      () => {
        this.loadRestoreJobs();
        alert('Restore job started successfully!');
      },
      (error) => {
        console.error('Error starting restore:', error);
        alert('Error starting restore!');
      }
    );
  }

  deleteBackup(backup: Backup): void {
    if (!confirm(`Delete backup "${backup.name}"? This action cannot be undone.`)) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.backupService.deleteBackup(backup.id),
      () => {
        this.loadBackups();
        alert('Backup deleted successfully!');
      },
      (error) => {
        console.error('Error deleting backup:', error);
        alert('Error deleting backup!');
      }
    );
  }

  createSchedule(): void {
    if (!this.scheduleForm.name) {
      alert('Please enter a schedule name');
      return;
    }

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.backupService.createSchedule(this.scheduleForm),
      () => {
        this.closeScheduleModal();
        alert('Backup schedule created successfully!');
      },
      (error) => {
        console.error('Error creating schedule:', error);
        alert('Error creating schedule!');
      }
    );
  }

  cancelRestore(jobId: string): void {
    if (!confirm('Cancel this restore job?')) return;

    this.backupService.cancelRestore(jobId).subscribe({
      next: () => {
        this.loadRestoreJobs();
        alert('Restore job cancelled!');
      },
      error: (error) => {
        console.error('Error cancelling restore:', error);
        alert('Error cancelling restore!');
      }
    });
  }

  cleanupOldBackups(): void {
    if (!confirm('Cleanup old backups? This will delete backups older than the retention period.')) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.backupService.cleanupOldBackups(),
      () => {
        this.loadBackups();
        alert('Old backups cleaned up successfully!');
      },
      (error) => {
        console.error('Error cleaning up backups:', error);
        alert('Error cleaning up backups!');
      }
    );
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}