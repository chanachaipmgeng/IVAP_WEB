/**
 * Audit Logs Component
 *
 * Audit log management and viewing component for super admin.
 * Supports log filtering, searching, statistics, and detailed log viewing.
 *
 * @example
 * ```html
 * <app-audit-logs></app-audit-logs>
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
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { AuditService } from '../../../core/services/audit.service';
import { I18nService } from '../../../core/services/i18n.service';
import { AuditLog, AuditFilters, AuditStatistics } from '../../../core/models/audit.model';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent,
    StatisticsGridComponent,
    FilterSectionComponent
  ],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent extends BaseComponent implements OnInit {
  showModal = signal(false);
  selectedLog = signal<AuditLog | null>(null);

  filters: AuditFilters = {
    search: '',
    userName: '',
    action: '',
    severity: '',
    status: '',
    fromDate: '',
    toDate: ''
  };

  // Computed signals for statistics
  logStats = computed(() => this.auditService.getLogStatistics());

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const stats = this.logStats();
    return [
      {
        icon: '📋',
        label: this.i18n.t('pages.auditLogs.totalLogs'),
        value: stats.totalLogs,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '✅',
        label: this.i18n.t('pages.auditLogs.successLogs'),
        value: stats.successLogs,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '❌',
        label: this.i18n.t('pages.auditLogs.failedLogs'),
        value: stats.failureLogs,
        iconBgClass: 'bg-red-100 dark:bg-red-900'
      },
      {
        icon: '⚠️',
        label: this.i18n.t('pages.auditLogs.warningLogs'),
        value: stats.criticalLogs,
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('pages.auditLogs.refresh'),
      variant: 'secondary',
      onClick: () => this.loadLogs()
    },
    {
      label: this.i18n.t('pages.auditLogs.export'),
      variant: 'primary',
      onClick: () => this.exportLogs()
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18n.t('pages.auditLogs.search'),
      type: 'text',
      placeholder: this.i18n.t('pages.auditLogs.search'),
      value: this.filters.search
    },
    {
      key: 'userName',
      label: this.i18n.t('pages.auditLogs.userName'),
      type: 'text',
      placeholder: this.i18n.t('pages.auditLogs.userName'),
      value: this.filters.userName
    },
    {
      key: 'action',
      label: this.i18n.t('pages.auditLogs.action'),
      type: 'text',
      placeholder: this.i18n.t('pages.auditLogs.action'),
      value: this.filters.action
    },
    {
      key: 'severity',
      label: this.i18n.t('pages.auditLogs.severity'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' }
      ],
      value: this.filters.severity
    },
    {
      key: 'status',
      label: this.i18n.t('pages.auditLogs.status'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'success', label: 'Success' },
        { value: 'failed', label: 'Failed' },
        { value: 'warning', label: 'Warning' }
      ],
      value: this.filters.status
    },
    {
      key: 'fromDate',
      label: this.i18n.t('pages.auditLogs.fromDate'),
      type: 'date',
      value: this.filters.fromDate
    },
    {
      key: 'toDate',
      label: this.i18n.t('pages.auditLogs.toDate'),
      type: 'date',
      value: this.filters.toDate
    }
  ]);

  filteredLogs = computed(() => {
    return this.auditService.filterLogs(this.filters);
  });

  get columns(): TableColumn[] {
    return [
      { key: 'timestamp', label: this.i18n.t('pages.auditLogs.timestamp'), sortable: true },
      { key: 'userName', label: this.i18n.t('pages.auditLogs.userName'), sortable: true },
      { key: 'action', label: this.i18n.t('pages.auditLogs.action'), sortable: true },
      { key: 'resource', label: this.i18n.t('pages.auditLogs.resource'), sortable: true },
      {
        key: 'severity',
        label: this.i18n.t('pages.auditLogs.severity'),
        render: (value) => `<span class="${this.auditService.getSeverityClass(value)}">${value.toUpperCase()}</span>`
      },
      {
        key: 'status',
        label: this.i18n.t('pages.auditLogs.status'),
        render: (value) => `<span class="${this.auditService.getStatusClass(value)}">${value.toUpperCase()}</span>`
      },
      { key: 'ipAddress', label: this.i18n.t('pages.auditLogs.ipAddress'), sortable: true }
    ];
  }

  get actions(): TableAction[] {
    return [
      {
        icon: '👁️',
        label: this.i18n.t('pages.auditLogs.viewDetails'),
        onClick: (row) => this.viewLogDetails(row)
      }
    ];
  }

  constructor(
    public auditService: AuditService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadLogs();
  }

  // Getters from service
  getLogs = () => this.auditService.getLogs();
  getLoading = () => this.auditService.getLoading();

  // Load data methods
  loadLogs(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.auditService.loadLogs(),
      () => {
        // Data is automatically updated via service
      },
      (error) => {
        console.error('Error loading audit logs:', error);
      }
    );
  }

  // Filter methods
  applyFilters(): void {
    // Filters are applied automatically through computed signal
  }

  onFilterChange(event: { key: string; value: any }): void {
    (this.filters as any)[event.key] = event.value;
    this.applyFilters();
  }

  // Modal methods
  viewLogDetails(log: AuditLog): void {
    this.selectedLog.set(log);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedLog.set(null);
  }

  // Action methods
  exportLogs(): void {
    const logs = this.filteredLogs();
    const csvContent = this.auditService.convertToCSV(logs);
    this.auditService.downloadCSV(csvContent, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
  }

  clearOldLogs(): void {
    if (!confirm('Clear old audit logs? This action cannot be undone.')) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.auditService.clearOldLogs(),
      () => {
        this.loadLogs();
        alert('Old logs cleared successfully!');
      },
      (error) => {
        console.error('Error clearing old logs:', error);
        alert('Error clearing old logs!');
      }
    )
    ;
  }

  // Helper methods
  formatDateTime(timestamp: string): string {
    return this.auditService.formatDateTime(timestamp);
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
