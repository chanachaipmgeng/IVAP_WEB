/**
 * RBAC (Role-Based Access Control) Component
 *
 * Comprehensive RBAC management component with tabs for roles, permissions, and user-role assignments.
 * Supports role/permission CRUD operations, statistics, filtering, and access control management.
 *
 * @example
 * ```html
 * <app-rbac></app-rbac>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { TabsComponent, Tab } from '../../../shared/components/tabs/tabs.component';
import { RbacService } from '../../../core/services/rbac.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Role, Permission, UserRole, RBACFilters, RBACStatistics, RoleForm, PermissionForm, UserRoleForm } from '../../../core/models/rbac.model';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-rbac',
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
    FilterSectionComponent,
    TabsComponent
  ],
  templateUrl: './rbac.component.html',
  styles: []
})
export class RbacComponent extends BaseComponent implements OnInit {
  activeTab = signal('roles');
  showRoleModal = signal(false);
  showPermissionModal = signal(false);
  showAssignRoleModal = signal(false);
  showRoleDetailModal = signal(false);
  showPermissionDetailModal = signal(false);
  saving = signal(false);
  editingRole = signal<Role | null>(null);
  editingPermission = signal<Permission | null>(null);
  viewingRole = signal<Role | null>(null);
  viewingPermission = signal<Permission | null>(null);

  roleForm: RoleForm = {
    name: '',
    description: '',
    permissions: []
  };

  permissionForm: PermissionForm = {
    name: '',
    description: '',
    resource: '',
    action: '',
    category: 'user'
  };

  userRoleForm: UserRoleForm = {
    userId: '',
    roleId: '',
    companyId: ''
  };

  filters: RBACFilters = {
    search: '',
    roleType: '',
    permissionCategory: '',
    companyId: ''
  };

  // Computed signals for statistics
  rbacStats = computed(() => {
    try {
      return this.rbacService.getRBACStatistics();
    } catch (error) {
      console.error('Error computing RBAC statistics:', error);
      return {
        totalRoles: 0,
        totalPermissions: 0,
        totalUserRoles: 0,
        systemRoles: 0,
        customRoles: 0
      };
    }
  });

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    try {
    const stats = this.rbacStats();
    return [
      {
        icon: '👥',
        label: this.i18n.t('pages.rbac.totalRoles'),
        value: stats.totalRoles,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '🔑',
        label: this.i18n.t('pages.rbac.permissions'),
        value: stats.totalPermissions,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '🔗',
        label: this.i18n.t('pages.rbac.userRoles'),
        value: stats.totalUserRoles,
        iconBgClass: 'bg-purple-100 dark:bg-purple-900'
      },
      {
        icon: '⚙️',
        label: this.i18n.t('pages.rbac.systemRoles'),
        value: stats.systemRoles,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '🛠️',
        label: this.i18n.t('pages.rbac.customRoles'),
        value: stats.customRoles,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      }
    ];
    } catch (error) {
      console.error('Error computing statistics cards:', error);
      return [];
    }
  });

  // Tabs configuration
  tabs = computed<Tab[]>(() => [
    { id: 'roles', label: this.i18n.t('pages.rbac.roles') },
    { id: 'permissions', label: this.i18n.t('pages.rbac.permissionsTab') },
    { id: 'user-roles', label: this.i18n.t('pages.rbac.userRolesTab') }
  ]);

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('pages.rbac.refresh'),
      variant: 'secondary',
      onClick: () => this.loadData()
    },
    {
      label: this.i18n.t('pages.rbac.addRole'),
      variant: 'primary',
      onClick: () => this.openAddRoleModal()
    }
  ]);

  // Filter fields for roles tab
  roleFilterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18n.t('pages.rbac.search'),
      type: 'text',
      placeholder: this.i18n.t('pages.rbac.searchRolesPlaceholder'),
      value: this.filters.search
    },
    {
      key: 'roleType',
      label: this.i18n.t('pages.rbac.type'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('pages.rbac.allTypes') },
        { value: 'system', label: this.i18n.t('pages.rbac.systemRoles') },
        { value: 'custom', label: this.i18n.t('pages.rbac.customRoles') }
      ],
      value: this.filters.roleType
    }
  ]);

  // Filter fields for permissions tab
  permissionFilterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18n.t('pages.rbac.search'),
      type: 'text',
      placeholder: this.i18n.t('pages.rbac.searchPermissionsPlaceholder'),
      value: this.filters.search
    },
    {
      key: 'permissionCategory',
      label: this.i18n.t('pages.rbac.category'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('pages.rbac.allCategories') },
        { value: 'admin', label: this.i18n.t('pages.rbac.admin') },
        { value: 'user', label: this.i18n.t('pages.rbac.user') },
        { value: 'company', label: this.i18n.t('pages.rbac.company') },
        { value: 'system', label: this.i18n.t('pages.rbac.system') }
      ],
      value: this.filters.permissionCategory
    }
  ]);

  // Filter fields for user-roles tab
  userRoleFilterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18n.t('pages.rbac.search'),
      type: 'text',
      placeholder: this.i18n.t('pages.rbac.searchUserRolesPlaceholder'),
      value: this.filters.search
    },
    {
      key: 'companyId',
      label: this.i18n.t('pages.rbac.companyId'),
      type: 'text',
      placeholder: this.i18n.t('pages.rbac.enterCompanyId'),
      value: this.filters.companyId
    }
  ]);

  filteredRoles = computed(() => {
    try {
    return this.rbacService.filterRoles(this.filters);
    } catch (error) {
      console.error('Error filtering roles:', error);
      return [];
    }
  });

  filteredPermissions = computed(() => {
    try {
    return this.rbacService.filterPermissions(this.filters);
    } catch (error) {
      console.error('Error filtering permissions:', error);
      return [];
    }
  });

  filteredUserRoles = computed(() => {
    try {
    return this.rbacService.filterUserRoles(this.filters);
    } catch (error) {
      console.error('Error filtering user roles:', error);
      return [];
    }
  });

  get roleColumns(): TableColumn[] {
    return [
      { key: 'name', label: this.i18n.t('pages.rbac.roleNameColumn'), sortable: true },
      { key: 'description', label: this.i18n.t('pages.rbac.descriptionColumn'), sortable: true },
      {
        key: 'isSystem',
        label: this.i18n.t('pages.rbac.typeColumn'),
        render: (value) => value ? `<span class="text-blue-600">${this.i18n.t('pages.rbac.systemRole')}</span>` : `<span class="text-green-600">${this.i18n.t('pages.rbac.customRole')}</span>`
      },
      { key: 'permissions', label: this.i18n.t('pages.rbac.permissionsColumn'), render: (value) => `${value.length} ${this.i18n.t('pages.rbac.permissions')}` },
      { key: 'createdAt', label: this.i18n.t('pages.rbac.createdColumn'), sortable: true }
    ];
  }

  get roleActions(): TableAction[] {
    return [
      {
        icon: '👁️',
        label: this.i18n.t('pages.rbac.viewDetails'),
        onClick: (row) => this.viewRoleDetails(row)
      },
      {
        icon: '✏️',
        label: this.i18n.t('pages.rbac.edit'),
        onClick: (row) => this.editRole(row)
      },
      {
        icon: '🔑',
        label: this.i18n.t('pages.rbac.permissions'),
        onClick: (row) => this.manageRolePermissions(row)
      },
      {
        icon: '🗑️',
        label: this.i18n.t('pages.rbac.delete'),
        variant: 'danger',
        onClick: (row) => this.deleteRole(row)
      }
    ];
  }

  get userRoleColumns(): TableColumn[] {
    return [
      { key: 'userName', label: this.i18n.t('pages.rbac.userNameColumn'), sortable: true },
      { key: 'roleName', label: this.i18n.t('pages.rbac.roleNameColumn2'), sortable: true },
      { key: 'companyName', label: this.i18n.t('pages.rbac.companyNameColumn'), sortable: true },
      { key: 'assignedAt', label: this.i18n.t('pages.rbac.assignedAtColumn'), sortable: true },
      { key: 'assignedBy', label: this.i18n.t('pages.rbac.assignedByColumn'), sortable: true }
    ];
  }

  get userRoleActions(): TableAction[] {
    return [
      {
        icon: '🗑️',
        label: this.i18n.t('pages.rbac.remove'),
        variant: 'danger',
        onClick: (row) => this.removeUserRole(row)
      }
    ];
  }

  constructor(
    public rbacService: RbacService,
    public i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    // Add a small delay to ensure component is fully initialized
    setTimeout(() => {
    this.loadData();
    }, 0);
  }

  // Getters from service
  getRoles = () => this.rbacService.getRoles();
  getPermissions = () => this.rbacService.getPermissions();
  getUserRoles = () => this.rbacService.getUserRoles();
  getLoading = () => this.rbacService.getLoading();

  // Load data methods
  loadData(): void {
    // Only load if not already loading to prevent multiple simultaneous requests
    if (this.rbacService.getLoading()()) {
      return;
    }

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.rbacService.loadRoles(),
      () => {
        // Roles loaded successfully
      },
      (error) => {
        console.error('Error loading roles:', error);
        // Don't block the UI, continue loading other data
      }
    );

    this.subscribe(
      this.rbacService.loadPermissions(),
      () => {
        // Permissions loaded successfully
      },
      (error) => {
        console.error('Error loading permissions:', error);
        // Don't block the UI, continue loading other data
      }
    );

    this.subscribe(
      this.rbacService.loadUserRoles(),
      () => {
        // User roles loaded successfully
      },
      (error) => {
        console.error('Error loading user roles:', error);
        // Don't block the UI
      }
    );
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

  // Helper methods
  getPermissionsByCategory() {
    return this.rbacService.getPermissionsByCategory();
  }

  // Modal methods
  openAddRoleModal(): void {
    this.editingRole.set(null);
    this.roleForm = {
      name: '',
      description: '',
      permissions: []
    };
    this.showRoleModal.set(true);
  }

  editRole(role: Role): void {
    this.editingRole.set(role);
    this.roleForm = {
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    };
    this.showRoleModal.set(true);
  }

  closeRoleModal(): void {
    this.showRoleModal.set(false);
    this.editingRole.set(null);
  }

  openAddPermissionModal(): void {
    this.editingPermission.set(null);
    this.permissionForm = {
      name: '',
      description: '',
      resource: '',
      action: '',
      category: 'user'
    };
    this.showPermissionModal.set(true);
  }

  editPermission(permission: Permission): void {
    this.editingPermission.set(permission);
    this.permissionForm = {
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      category: permission.category
    };
    this.showPermissionModal.set(true);
  }

  closePermissionModal(): void {
    this.showPermissionModal.set(false);
    this.editingPermission.set(null);
  }

  openAssignRoleModal(): void {
    this.userRoleForm = {
      userId: '',
      roleId: '',
      companyId: ''
    };
    this.showAssignRoleModal.set(true);
  }

  closeAssignRoleModal(): void {
    this.showAssignRoleModal.set(false);
  }

  // Action methods
  saveRole(): void {
    this.saving.set(true);

    const request = this.editingRole()
      ? this.rbacService.updateRole(this.editingRole()!.id, this.roleForm)
      : this.rbacService.createRole(this.roleForm);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.saving.set(false);
        this.closeRoleModal();
        this.loadData();
      },
      (error) => {
        console.error('Error saving role:', error);
        this.saving.set(false);
      }
    );
  }

  deleteRole(role: Role): void {
    if (!confirm(`${this.i18n.t('pages.rbac.deleteRoleConfirm')} "${role.name}"?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.rbacService.deleteRole(role.id),
      () => {
        this.loadData();
      },
      (error) => {
        console.error('Error deleting role:', error);
      }
    );
  }

  savePermission(): void {
    this.saving.set(true);

    const request = this.editingPermission()
      ? this.rbacService.updatePermission(this.editingPermission()!.id, this.permissionForm)
      : this.rbacService.createPermission(this.permissionForm);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.saving.set(false);
        this.closePermissionModal();
        this.loadData();
      },
      (error) => {
        console.error('Error saving permission:', error);
        this.saving.set(false);
      }
    );
  }

  deletePermission(permission: Permission): void {
    if (!confirm(`${this.i18n.t('pages.rbac.deletePermissionConfirm')} "${permission.name}"?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.rbacService.deletePermission(permission.id),
      () => {
        this.loadData();
      },
      (error) => {
        console.error('Error deleting permission:', error);
      }
    );
  }

  assignRole(): void {
    this.saving.set(true);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.rbacService.assignUserRole(this.userRoleForm),
      () => {
        this.saving.set(false);
        this.closeAssignRoleModal();
        this.loadData();
      },
      (error) => {
        console.error('Error assigning role:', error);
        this.saving.set(false);
      }
    );
  }

  removeUserRole(userRole: UserRole): void {
    if (!confirm(`${this.i18n.t('pages.rbac.removeRoleConfirm')} "${userRole.roleName}" ${this.i18n.t('pages.rbac.fromUser')} "${userRole.userName}"?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.rbacService.removeUserRole(userRole.userId, userRole.roleId),
      () => {
        this.loadData();
      },
      (error) => {
        console.error('Error removing user role:', error);
      }
    );
  }

  viewRoleDetails(role: Role): void {
    this.viewingRole.set(role);
    this.showRoleDetailModal.set(true);
  }

  closeRoleDetailModal(): void {
    this.showRoleDetailModal.set(false);
    this.viewingRole.set(null);
  }

  viewPermissionDetails(permission: Permission): void {
    this.viewingPermission.set(permission);
    this.showPermissionDetailModal.set(true);
  }

  closePermissionDetailModal(): void {
    this.showPermissionDetailModal.set(false);
    this.viewingPermission.set(null);
  }

  manageRolePermissions(role: Role): void {
    // TODO: Implement role permissions management
    alert(`${this.i18n.t('pages.rbac.managePermissions')} "${role.name}" - ${this.i18n.t('pages.rbac.comingSoon')}`);
  }

  // Helper methods
  formatDate(dateStr: string): string {
    return this.rbacService.formatDate(dateStr);
  }

  formatDateTime(dateStr: string): string {
    return this.rbacService.formatDateTime(dateStr);
  }

  getPermissionName(permissionId: string): string {
    const permissions = this.rbacService.getPermissions()();
    const permission = permissions.find((p: Permission) => p.id === permissionId);
    return permission?.name || permissionId;
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
