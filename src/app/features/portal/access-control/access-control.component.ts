/**
 * Access Control Component
 *
 * Comprehensive access control management component with tabs for overview, access points, permissions, logs, rules, and schedules.
 * Supports real-time monitoring, access point management, permission assignment, and access event logging.
 *
 * @example
 * ```html
 * <app-access-control></app-access-control>
 * ```
 */

import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { TabsComponent, Tab } from '../../../shared/components/tabs/tabs.component';
import { AccessControlService, AccessPoint, AccessPermission, AccessEvent, AccessSchedule, AccessRule, AccessMetrics } from '../../../core/services/access-control.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassCardComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent,
    StatisticsGridComponent,
    FilterSectionComponent,
    TabsComponent
  ],
  templateUrl: './access-control.component.html',
  styleUrls: ['./access-control.component.scss']
})
export class AccessControlComponent extends BaseComponent implements OnInit {
  private accessControlService = inject(AccessControlService);
  private authService = inject(AuthService);
  private i18nService = inject(I18nService);
  private employeeService = inject(EmployeeService);

  // Tab management
  selectedTab = signal<'overview' | 'access-points' | 'permissions' | 'logs' | 'rules' | 'schedules'>('overview');

  // Modals
  showAccessPointModal = signal(false);
  showPermissionModal = signal(false);
  showRuleModal = signal(false);
  showScheduleModal = signal(false);
  showLogDetailsModal = signal(false);

  // Loading states
  loading = signal(false);
  saving = signal(false);

  // Selected items
  selectedAccessPoint = signal<AccessPoint | null>(null);
  selectedPermission = signal<AccessPermission | null>(null);
  selectedEvent = signal<AccessEvent | null>(null);
  selectedSchedule = signal<AccessSchedule | null>(null);

  // Form data
  accessPointForm: Partial<AccessPoint> = {
    name: '',
    type: 'door',
    location: '',
    zone: '',
    status: 'active',
    isEnabled: true,
    accessMethods: [],
    schedule: {} as AccessSchedule,
    settings: {
      autoLock: true,
      lockTimeout: 30,
      maxAttempts: 3,
      cooldownPeriod: 60,
      requireConfirmation: false
    }
  };

  permissionForm: Partial<AccessPermission> = {
    userId: '',
    accessPointId: '',
    accessMethods: [],
    schedule: {
      days: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'Asia/Bangkok'
    },
    isActive: true,
    reason: ''
  };

  ruleForm: Partial<AccessRule> = {
    name: '',
    condition: '',
    action: 'allow',
    priority: 1,
    isEnabled: true,
    description: '',
    metadata: {}
  };

  // Filters
  accessPointFilter = signal({
    type: '',
    status: '',
    search: ''
  });

  permissionFilter = signal({
    userId: '',
    accessPointId: '',
    status: ''
  });

  logFilter = signal({
    action: '',
    method: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Data signals
  accessPoints = signal<AccessPoint[]>([]);
  permissions = signal<AccessPermission[]>([]);
  events = signal<AccessEvent[]>([]);
  schedules = signal<AccessSchedule[]>([]);
  metrics = signal<AccessMetrics>(this.accessControlService.getMetrics());

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const m = this.metrics();
    return [
      {
        icon: '🚪',
        label: 'Total Access Points',
        value: m.totalAccessPoints,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '🔑',
        label: 'Total Permissions',
        value: m.totalPermissions,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '📊',
        label: 'Access Events (24h)',
        value: m.totalEvents,
        iconBgClass: 'bg-purple-100 dark:bg-purple-900'
      },
      {
        icon: '⚠️',
        label: 'Security Incidents',
        value: m.securityIncidents,
        iconBgClass: 'bg-red-100 dark:bg-red-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => {
    const tab = this.selectedTab();
    if (tab === 'access-points') {
      return [{
        label: '➕ Add Access Point',
        variant: 'primary',
        onClick: () => this.openAddAccessPointModal()
      }];
    } else if (tab === 'permissions') {
      return [{
        label: '➕ Grant Permission',
        variant: 'primary',
        onClick: () => this.openAddPermissionModal()
      }];
    }
    return [];
  });

  // Tabs configuration
  tabs = computed<Tab[]>(() => [
    { id: 'overview', label: '📊 Overview' },
    { id: 'access-points', label: '🔐 Access Points' },
    { id: 'permissions', label: '🔑 Permissions' },
    { id: 'logs', label: '📋 Access Logs' },
    { id: 'rules', label: '⚙️ Rules' },
    { id: 'schedules', label: '📅 Schedules' }
  ]);

  // Filter fields for access points
  accessPointFilterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18nService.t('common.search'),
      type: 'text',
      placeholder: 'Search access points...',
      value: this.accessPointFilter().search
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: this.i18nService.t('common.all') },
        { value: 'door', label: 'Door' },
        { value: 'gate', label: 'Gate' },
        { value: 'elevator', label: 'Elevator' }
      ],
      value: this.accessPointFilter().type
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: this.i18nService.t('common.all') },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      value: this.accessPointFilter().status
    }
  ]);

  // Filter fields for permissions
  permissionFilterFields = computed<FilterField[]>(() => [
    {
      key: 'userId',
      label: 'User ID',
      type: 'text',
      placeholder: 'Filter by user ID...',
      value: this.permissionFilter().userId
    },
    {
      key: 'accessPointId',
      label: 'Access Point ID',
      type: 'text',
      placeholder: 'Filter by access point ID...',
      value: this.permissionFilter().accessPointId
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: this.i18nService.t('common.all') },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      value: this.permissionFilter().status
    }
  ]);

  // Filter fields for logs
  logFilterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18nService.t('common.search'),
      type: 'text',
      placeholder: 'Search logs...',
      value: this.logFilter().search
    },
    {
      key: 'action',
      label: 'Action',
      type: 'select',
      options: [
        { value: '', label: this.i18nService.t('common.all') },
        { value: 'grant', label: 'Grant' },
        { value: 'revoke', label: 'Revoke' }
      ],
      value: this.logFilter().action
    },
    {
      key: 'method',
      label: 'Method',
      type: 'select',
      options: [
        { value: '', label: this.i18nService.t('common.all') },
        { value: 'card', label: 'Card' },
        { value: 'biometric', label: 'Biometric' },
        { value: 'qr', label: 'QR Code' }
      ],
      value: this.logFilter().method
    },
    {
      key: 'dateFrom',
      label: 'From Date',
      type: 'date',
      value: this.logFilter().dateFrom
    },
    {
      key: 'dateTo',
      label: 'To Date',
      type: 'date',
      value: this.logFilter().dateTo
    }
  ]);

  // Employees for permission assignment
  employees = signal<any[]>([]);

  // Computed data
  filteredAccessPoints = computed(() => {
    const points = this.accessPoints();
    const filter = this.accessPointFilter();

    return points.filter(ap => {
      if (filter.type && ap.type !== filter.type) return false;
      if (filter.status && ap.status !== filter.status) return false;
      if (filter.search) {
        const search = filter.search.toLowerCase();
        return ap.name.toLowerCase().includes(search) ||
               ap.location.toLowerCase().includes(search) ||
               ap.zone.toLowerCase().includes(search);
      }
      return true;
    });
  });

  filteredPermissions = computed(() => {
    const perms = this.permissions();
    const filter = this.permissionFilter();

    return perms.filter(p => {
      if (filter.userId && p.userId !== filter.userId) return false;
      if (filter.accessPointId && p.accessPointId !== filter.accessPointId) return false;
      if (filter.status) {
        if (filter.status === 'active' && !p.isActive) return false;
        if (filter.status === 'inactive' && p.isActive) return false;
      }
      return true;
    });
  });

  filteredEvents = computed(() => {
    const evts = this.events();
    const filter = this.logFilter();

    return evts.filter(e => {
      if (filter.action && e.action !== filter.action) return false;
      if (filter.method && e.method !== filter.method) return false;
      if (filter.search) {
        const search = filter.search.toLowerCase();
        return e.userName.toLowerCase().includes(search) ||
               e.accessPointName.toLowerCase().includes(search);
      }
      return true;
    });
  });

  // Table columns
  accessPointColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'zone', label: 'Zone' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => value || 'active'
    },
    {
      key: 'isEnabled',
      label: 'Enabled',
      render: (value) => value ? '✅' : '❌'
    }
  ];

  permissionColumns: TableColumn[] = [
    { key: 'userName', label: 'User', sortable: true },
    { key: 'accessPointId', label: 'Access Point', sortable: true },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => value ? '✅ Active' : '❌ Inactive'
    },
    {
      key: 'validFrom',
      label: 'Valid From',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'validTo',
      label: 'Valid To',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'No expiry'
    }
  ];

  eventColumns: TableColumn[] = [
    { key: 'userName', label: 'User', sortable: true },
    { key: 'accessPointName', label: 'Access Point', sortable: true },
    { key: 'method', label: 'Method' },
    {
      key: 'action',
      label: 'Action',
      render: (value) => {
        const icons = {
          grant: '✅',
          deny: '❌',
          timeout: '⏱️',
          error: '⚠️'
        };
        return `${icons[value as keyof typeof icons] || '❓'} ${value}`;
      }
    },
    {
      key: 'result',
      label: 'Result',
      render: (value) => {
        const colors = {
          success: 'text-green-500',
          failure: 'text-red-500',
          partial: 'text-yellow-500'
        };
        return value;
      }
    },
    {
      key: 'timestamp',
      label: 'Time',
      render: (value) => value ? new Date(value).toLocaleString() : '-',
      sortable: true
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value) => {
        const colors = {
          low: 'text-blue-500',
          medium: 'text-yellow-500',
          high: 'text-orange-500',
          critical: 'text-red-500'
        };
        return value;
      }
    }
  ];

  // Table actions
  accessPointActions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editAccessPoint(row)
    },
    {
      icon: '🔑',
      label: 'Manage Permissions',
      onClick: (row) => this.manageAccessPointPermissions(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteAccessPoint(row)
    }
  ];

  permissionActions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editPermission(row)
    },
    {
      icon: '🚫',
      label: 'Revoke',
      variant: 'danger',
      onClick: (row) => this.revokePermission(row)
    }
  ];

  eventActions: TableAction[] = [
    {
      icon: '👁️',
      label: 'View Details',
      onClick: (row) => this.viewEventDetails(row)
    }
  ];

  ngOnInit(): void {
    this.loadData();
    this.loadEmployees();
    this.setupSubscriptions();
  }

  private loadData(): void {
    this.accessPoints.set(this.accessControlService.getAccessPoints());
    this.permissions.set(this.accessControlService.getPermissions());
    this.events.set(this.accessControlService.getAccessEvents());
    this.schedules.set(this.accessControlService.getAccessSchedules());
    this.metrics.set(this.accessControlService.getMetrics());
  }

  private loadEmployees(): void {
    // Load employees for permission assignment
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.employeeService.getEmployees(),
      (response: any) => {
        const data = response.data || response.items || [];
        this.employees.set(data);
      },
      (error) => {
        console.warn('Error loading employees (API may not be available):', error);
        this.employees.set([]); // Set empty array instead of leaving undefined
      }
    );
  }

  private setupSubscriptions(): void {
    // ✅ Access Control - Using signals (no subscription needed)
    effect(() => {
      this.accessPoints.set(this.accessControlService.accessPoints());
    });

    effect(() => {
      this.permissions.set(this.accessControlService.permissions());
    });

    effect(() => {
      this.events.set(this.accessControlService.events());
    });

    effect(() => {
      this.metrics.set(this.accessControlService.metrics());
    });
  }

  // Tab management
  selectTab(tab: 'overview' | 'access-points' | 'permissions' | 'logs' | 'rules' | 'schedules'): void {
    this.selectedTab.set(tab);
  }

  selectTabFromString(tab: string): void {
    const validTabs: Array<'overview' | 'access-points' | 'permissions' | 'logs' | 'rules' | 'schedules'> =
      ['overview', 'access-points', 'permissions', 'logs', 'rules', 'schedules'];
    if (validTabs.includes(tab as any)) {
      this.selectedTab.set(tab as any);
    }
  }

  onTabChange(tabId: string): void {
    this.selectedTab.set(tabId as any);
  }

  onAccessPointFilterChange(event: { key: string; value: any }): void {
    const filter = this.accessPointFilter();
    (filter as any)[event.key] = event.value;
    this.accessPointFilter.set({ ...filter });
  }

  onPermissionFilterChange(event: { key: string; value: any }): void {
    const filter = this.permissionFilter();
    (filter as any)[event.key] = event.value;
    this.permissionFilter.set({ ...filter });
  }

  onLogFilterChange(event: { key: string; value: any }): void {
    const filter = this.logFilter();
    (filter as any)[event.key] = event.value;
    this.logFilter.set({ ...filter });
  }

  // Access Point management
  openAddAccessPointModal(): void {
    this.selectedAccessPoint.set(null);
    this.accessPointForm = {
      name: '',
      type: 'door',
      location: '',
      zone: '',
      status: 'active',
      isEnabled: true,
      accessMethods: [],
      settings: {
        autoLock: true,
        lockTimeout: 30,
        maxAttempts: 3,
        cooldownPeriod: 60,
        requireConfirmation: false
      }
    };
    this.showAccessPointModal.set(true);
  }

  editAccessPoint(accessPoint: AccessPoint): void {
    this.selectedAccessPoint.set(accessPoint);
    this.accessPointForm = { ...accessPoint };
    this.showAccessPointModal.set(true);
  }

  saveAccessPoint(): void {
    this.saving.set(true);

    const currentUser = this.authService.getCurrentUser();
    const formData = {
      ...this.accessPointForm,
      createdBy: currentUser?.id || 'system',
      createdAt: this.selectedAccessPoint()?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (this.selectedAccessPoint()) {
      // Update
      this.accessControlService.updateAccessPoint(
        this.selectedAccessPoint()!.id,
        formData as AccessPoint
      );
    } else {
      // Create
      this.accessControlService.createAccessPoint(formData as AccessPoint);
    }

    this.saving.set(false);
    this.closeAccessPointModal();
    this.loadData();
  }

  deleteAccessPoint(accessPoint: AccessPoint): void {
    if (!confirm(`Delete access point "${accessPoint.name}"?`)) return;

    this.accessControlService.deleteAccessPoint(accessPoint.id);
    this.loadData();
  }

  closeAccessPointModal(): void {
    this.showAccessPointModal.set(false);
    this.selectedAccessPoint.set(null);
  }

  // Permission management
  openAddPermissionModal(): void {
    this.selectedPermission.set(null);
    this.permissionForm = {
      userId: '',
      accessPointId: '',
      accessMethods: [],
      schedule: {
        days: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '18:00',
        timezone: 'Asia/Bangkok'
      },
      isActive: true,
      reason: ''
    };
    this.showPermissionModal.set(true);
  }

  manageAccessPointPermissions(accessPoint: AccessPoint): void {
    this.selectedAccessPoint.set(accessPoint);
    this.selectedTab.set('permissions');
    this.permissionFilter().accessPointId = accessPoint.id;
  }

  editPermission(permission: AccessPermission): void {
    this.selectedPermission.set(permission);
    this.permissionForm = { ...permission };
    this.showPermissionModal.set(true);
  }

  savePermission(): void {
    this.saving.set(true);

    const currentUser = this.authService.getCurrentUser();
    const formData = {
      ...this.permissionForm,
      grantedBy: currentUser?.id || 'system',
      grantedAt: this.selectedPermission()?.grantedAt || new Date()
    };

    if (this.selectedPermission()) {
      // Update
      this.accessControlService.updateAccessPermission(
        this.selectedPermission()!.id,
        formData as AccessPermission
      );
    } else {
      // Create
      this.accessControlService.grantAccessPermission(formData as AccessPermission);
    }

    this.saving.set(false);
    this.closePermissionModal();
    this.loadData();
  }

  revokePermission(permission: AccessPermission): void {
    if (!confirm(`Revoke access permission for "${permission.userName}"?`)) return;

    const currentUser = this.authService.getCurrentUser();
    this.accessControlService.revokeAccessPermission(
      permission.id,
      currentUser?.id || 'system'
    );
    this.loadData();
  }

  closePermissionModal(): void {
    this.showPermissionModal.set(false);
    this.selectedPermission.set(null);
  }

  // Event/Log management
  viewEventDetails(event: AccessEvent): void {
    this.selectedEvent.set(event);
    this.showLogDetailsModal.set(true);
  }

  closeLogDetailsModal(): void {
    this.showLogDetailsModal.set(false);
    this.selectedEvent.set(null);
  }

  // Rule management
  openAddRuleModal(): void {
    this.ruleForm = {
      name: '',
      condition: '',
      action: 'allow',
      priority: 1,
      isEnabled: true,
      description: '',
      metadata: {}
    };
    this.showRuleModal.set(true);
  }

  saveRule(): void {
    // Implementation for rule management
    this.closeRuleModal();
  }

  closeRuleModal(): void {
    this.showRuleModal.set(false);
  }

  // Schedule management
  openAddScheduleModal(): void {
    this.selectedSchedule.set(null);
    this.showScheduleModal.set(true);
  }

  saveSchedule(): void {
    // Implementation for schedule management
    this.closeScheduleModal();
  }

  closeScheduleModal(): void {
    this.showScheduleModal.set(false);
    this.selectedSchedule.set(null);
  }

  // Helper methods
  getAccessPointName(accessPointId: string): string {
    const ap = this.accessPoints().find(p => p.id === accessPointId);
    return ap?.name || 'Unknown';
  }

  getEmployeeName(userId: string): string {
    const emp = this.employees().find(e => e.id === userId);
    return emp ? `${emp.first_name} ${emp.last_name}` : userId;
  }

  getSeverityClass(severity: string): string {
    const classes = {
      low: 'text-blue-500 bg-blue-100 dark:bg-blue-900',
      medium: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900',
      high: 'text-orange-500 bg-orange-100 dark:bg-orange-900',
      critical: 'text-red-500 bg-red-100 dark:bg-red-900'
    };
    return classes[severity as keyof typeof classes] || '';
  }

  getActionIcon(action: string): string {
    const icons = {
      grant: '✅',
      deny: '❌',
      timeout: '⏱️',
      error: '⚠️'
    };
    return icons[action as keyof typeof icons] || '❓';
  }

  t(key: string): string {
    return this.i18nService.translate(key);
  }
}

