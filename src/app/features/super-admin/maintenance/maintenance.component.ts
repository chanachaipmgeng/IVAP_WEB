/**
 * Maintenance Component
 *
 * System maintenance management component for super admin.
 * Supports maintenance task management, scheduling, filtering, and statistics tracking with tabs.
 *
 * @example
 * ```html
 * <app-maintenance></app-maintenance>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { TabsComponent, Tab } from '../../../shared/components/tabs/tabs.component';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { I18nService } from '../../../core/services/i18n.service';
import { MaintenanceTask, MaintenanceSchedule, MaintenanceFilters, MaintenanceStatistics, TaskForm, ScheduleForm } from '../../../core/models/maintenance.model';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassButtonComponent,
    GlassCardComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent,
    StatisticsGridComponent,
    FilterSectionComponent,
    TabsComponent
  ],
  templateUrl: './maintenance.component.html',
  styles: []
})
export class MaintenanceComponent implements OnInit {
  activeTab = signal('tasks');
  showTaskModal = signal(false);
  showScheduleModal = signal(false);
  saving = signal(false);
  editingTask = signal<MaintenanceTask | null>(null);
  editingSchedule = signal<MaintenanceSchedule | null>(null);

  taskForm: TaskForm = {
    name: '',
    description: '',
    type: 'backup',
    priority: 'medium',
    scheduledAt: ''
  };

  scheduleForm: ScheduleForm = {
    name: '',
    description: '',
    taskType: 'backup',
    frequency: 'daily',
    cronExpression: '0 0 * * *',
    isActive: true
  };

  filters: MaintenanceFilters = {
    search: '',
    type: '',
    status: '',
    priority: '',
    dateFrom: '',
    dateTo: ''
  };

  // Computed signals for statistics
  maintenanceStats = computed(() => this.maintenanceService.getMaintenanceStatistics());
  getSystemHealth = () => this.maintenanceService.getSystemHealth();

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const stats = this.maintenanceStats();
    return [
      {
        icon: '📋',
        label: this.i18n.t('pages.maintenance.totalTasks'),
        value: stats.totalTasks,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '✅',
        label: this.i18n.t('pages.maintenance.completedTasks'),
        value: stats.completedTasks,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '⏳',
        label: this.i18n.t('pages.maintenance.pendingTasks'),
        value: stats.pendingTasks,
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
      },
      {
        icon: '❌',
        label: this.i18n.t('pages.maintenance.failedTasks'),
        value: stats.failedTasks,
        iconBgClass: 'bg-red-100 dark:bg-red-900'
      },
      {
        icon: '▶️',
        label: this.i18n.t('pages.maintenance.runningTasks'),
        value: stats.runningTasks,
        iconBgClass: 'bg-purple-100 dark:bg-purple-900'
      },
      {
        icon: '📅',
        label: this.i18n.t('pages.maintenance.scheduledTasks'),
        value: stats.totalSchedules,
        iconBgClass: 'bg-indigo-100 dark:bg-indigo-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('pages.maintenance.refresh'),
      variant: 'secondary',
      onClick: () => this.loadData()
    },
    {
      label: this.i18n.t('pages.maintenance.addTask'),
      variant: 'primary',
      onClick: () => this.openAddTaskModal()
    }
  ]);

  // Tabs configuration
  tabs = computed<Tab[]>(() => [
    { id: 'tasks', label: this.i18n.t('pages.maintenance.taskName') },
    { id: 'schedules', label: this.i18n.t('pages.maintenance.scheduled') }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18n.t('pages.maintenance.search'),
      type: 'text',
      placeholder: this.i18n.t('pages.maintenance.search'),
      value: this.filters.search
    },
    {
      key: 'type',
      label: this.i18n.t('pages.maintenance.type'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'backup', label: 'Backup' },
        { value: 'cleanup', label: 'Cleanup' },
        { value: 'update', label: 'Update' }
      ],
      value: this.filters.type
    },
    {
      key: 'status',
      label: this.i18n.t('pages.maintenance.status'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'pending', label: 'Pending' },
        { value: 'running', label: 'Running' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' }
      ],
      value: this.filters.status
    },
    {
      key: 'priority',
      label: this.i18n.t('pages.maintenance.priority'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ],
      value: this.filters.priority
    }
  ]);

  filteredTasks = computed(() => {
    return this.maintenanceService.filterTasks(this.filters);
  });

  get taskColumns(): TableColumn[] {
    return [
      { key: 'name', label: this.i18n.t('pages.maintenance.taskName'), sortable: true },
      { key: 'type', label: this.i18n.t('pages.maintenance.type'), sortable: true },
      { key: 'priority', label: this.i18n.t('pages.maintenance.priority'), sortable: true },
      { key: 'status', label: this.i18n.t('pages.maintenance.status'), sortable: true },
      { key: 'progress', label: this.i18n.t('pages.maintenance.progress'), render: (value) => `${value}%` },
      { key: 'scheduledAt', label: this.i18n.t('pages.maintenance.scheduled'), sortable: true },
      { key: 'duration', label: this.i18n.t('pages.maintenance.duration'), render: (value) => this.formatDuration(value) }
    ];
  }

  get taskActions(): TableAction[] {
    return [
      {
        icon: '▶️',
        label: this.i18n.t('pages.maintenance.run'),
        onClick: (row) => this.runTask(row)
      },
      {
        icon: '⏹️',
        label: this.i18n.t('pages.maintenance.cancel'),
        onClick: (row) => this.cancelTask(row)
      },
      {
        icon: '✏️',
        label: this.i18n.t('pages.maintenance.edit'),
        onClick: (row) => this.editTask(row)
      },
      {
        icon: '🗑️',
        label: this.i18n.t('pages.maintenance.delete'),
        variant: 'danger',
        onClick: (row) => this.deleteTask(row)
      }
    ];
  }

  scheduleColumns: TableColumn[] = [
    { key: 'name', label: 'Schedule Name', sortable: true },
    { key: 'taskType', label: 'Task Type', sortable: true },
    { key: 'frequency', label: 'Frequency', sortable: true },
    { key: 'isActive', label: 'Active', render: (value) => value ? 'Yes' : 'No' },
    { key: 'lastRun', label: 'Last Run', sortable: true },
    { key: 'nextRun', label: 'Next Run', sortable: true }
  ];

  scheduleActions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editSchedule(row)
    },
    {
      icon: '🔄',
      label: 'Toggle',
      onClick: (row) => this.toggleSchedule(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteSchedule(row)
    }
  ];

  constructor(
    public maintenanceService: MaintenanceService,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // Getters from service
  getTasks = () => this.maintenanceService.getTasks();
  getSchedules = () => this.maintenanceService.getSchedules();
  getLogs = () => this.maintenanceService.getLogs();
  getLoading = () => this.maintenanceService.getLoading();

  // Load data methods
  loadData(): void {
    this.maintenanceService.loadTasks().subscribe({
      next: () => { /* Data automatically updated */ },
      error: (error) => console.error('Error loading tasks:', error)
    });

    this.maintenanceService.loadSchedules().subscribe({
      next: () => { /* Data automatically updated */ },
      error: (error) => console.error('Error loading schedules:', error)
    });

    this.maintenanceService.loadLogs().subscribe({
      next: () => { /* Data automatically updated */ },
      error: (error) => console.error('Error loading logs:', error)
    });

    this.maintenanceService.loadSystemHealth().subscribe({
      next: () => { /* Data automatically updated */ },
      error: (error) => console.error('Error loading system health:', error)
    });
  }

  // Filter methods
  applyFilters(): void {
    // Filters are applied automatically through computed signals
  }

  onFilterChange(event: { key: string; value: any }): void {
    (this.filters as any)[event.key] = event.value;
    this.applyFilters();
  }

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId);
  }

  // Modal methods
  openAddTaskModal(): void {
    this.editingTask.set(null);
    this.taskForm = {
      name: '',
      description: '',
      type: 'backup',
      priority: 'medium',
      scheduledAt: ''
    };
    this.showTaskModal.set(true);
  }

  editTask(task: MaintenanceTask): void {
    this.editingTask.set(task);
    this.taskForm = {
      name: task.name,
      description: task.description,
      type: task.type,
      priority: task.priority,
      scheduledAt: task.scheduledAt
    };
    this.showTaskModal.set(true);
  }

  closeTaskModal(): void {
    this.showTaskModal.set(false);
    this.editingTask.set(null);
  }

  openAddScheduleModal(): void {
    this.editingSchedule.set(null);
    this.scheduleForm = {
      name: '',
      description: '',
      taskType: 'backup',
      frequency: 'daily',
      cronExpression: '0 0 * * *',
      isActive: true
    };
    this.showScheduleModal.set(true);
  }

  editSchedule(schedule: MaintenanceSchedule): void {
    this.editingSchedule.set(schedule);
    this.scheduleForm = {
      name: schedule.name,
      description: schedule.description,
      taskType: schedule.taskType,
      frequency: schedule.frequency,
      cronExpression: schedule.cronExpression,
      isActive: schedule.isActive
    };
    this.showScheduleModal.set(true);
  }

  closeScheduleModal(): void {
    this.showScheduleModal.set(false);
    this.editingSchedule.set(null);
  }

  // Action methods
  saveTask(): void {
    this.saving.set(true);

    const request = this.editingTask()
      ? this.maintenanceService.updateTask(this.editingTask()!.id, this.taskForm)
      : this.maintenanceService.createTask(this.taskForm);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeTaskModal();
        this.loadData();
      },
      error: (error) => {
        console.error('Error saving task:', error);
        this.saving.set(false);
      }
    });
  }

  deleteTask(task: MaintenanceTask): void {
    if (!confirm(`Delete task "${task.name}"?`)) return;

    this.maintenanceService.deleteTask(task.id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      }
    });
  }

  runTask(task: MaintenanceTask): void {
    this.maintenanceService.runTask(task.id).subscribe({
      next: () => {
        this.loadData();
        alert('Task started successfully!');
      },
      error: (error) => {
        console.error('Error running task:', error);
        alert('Error running task!');
      }
    });
  }

  cancelTask(task: MaintenanceTask): void {
    this.maintenanceService.cancelTask(task.id).subscribe({
      next: () => {
        this.loadData();
        alert('Task cancelled successfully!');
      },
      error: (error) => {
        console.error('Error cancelling task:', error);
        alert('Error cancelling task!');
      }
    });
  }

  saveSchedule(): void {
    this.saving.set(true);

    const request = this.editingSchedule()
      ? this.maintenanceService.updateSchedule(this.editingSchedule()!.id, this.scheduleForm)
      : this.maintenanceService.createSchedule(this.scheduleForm);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeScheduleModal();
        this.loadData();
      },
      error: (error) => {
        console.error('Error saving schedule:', error);
        this.saving.set(false);
      }
    });
  }

  deleteSchedule(schedule: MaintenanceSchedule): void {
    if (!confirm(`Delete schedule "${schedule.name}"?`)) return;

    this.maintenanceService.deleteSchedule(schedule.id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (error) => {
        console.error('Error deleting schedule:', error);
      }
    });
  }

  toggleSchedule(schedule: MaintenanceSchedule): void {
    this.maintenanceService.toggleSchedule(schedule.id, !schedule.isActive).subscribe({
      next: () => {
        this.loadData();
        alert(`Schedule ${schedule.isActive ? 'deactivated' : 'activated'} successfully!`);
      },
      error: (error) => {
        console.error('Error toggling schedule:', error);
        alert('Error toggling schedule!');
      }
    });
  }

  runSystemCheck(): void {
    this.maintenanceService.runSystemCheck().subscribe({
      next: () => {
        this.loadData();
        alert('System check completed!');
      },
      error: (error) => {
        console.error('Error running system check:', error);
        alert('Error running system check!');
      }
    });
  }

  // Helper methods
  getLogLevelClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      case 'debug':
        return 'text-gray-400';
      default:
        return 'text-white';
    }
  }

  formatDate(dateStr: string): string {
    return this.maintenanceService.formatDate(dateStr);
  }

  formatDateTime(dateStr: string): string {
    return this.maintenanceService.formatDateTime(dateStr);
  }

  formatDuration(seconds: number): string {
    return this.maintenanceService.formatDuration(seconds);
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
