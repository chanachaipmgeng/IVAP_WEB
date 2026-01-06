/**
 * Users Management Component
 *
 * Comprehensive user management component for super admin.
 * Supports user CRUD operations, role assignment, statistics, filtering, and export functionality.
 *
 * @example
 * ```html
 * <app-users></app-users>
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
import { UserService } from '../../../core/services/user.service';
import { I18nService } from '../../../core/services/i18n.service';
import { User, Role, UserFilters, UserStatistics } from '../../../core/models/user.model';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-users',
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
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent extends BaseComponent implements OnInit {
  showModal = signal(false);
  showRoleModal = signal(false);
  showRoleFormModal = signal(false);
  saving = signal(false);
  roleSaving = signal(false);
  editingUser = signal<User | null>(null);
  editingRoleRecord = signal<Role | null>(null);

  formData: any = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    picture: '',
    actorType: 'member',
    memberType: '',
    role: '',
    companyId: '',
    isActive: true
  };

  roleFormData: { name: string; description: string; permissionsInput: string } = {
    name: '',
    description: '',
    permissionsInput: ''
  };

  filters: UserFilters = {
    search: '',
    role: '',
    status: '',
    companyId: ''
  };

  // Computed signals for statistics
  userStats = computed(() => this.userService.getUserStatistics());

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const stats = this.userStats();
    return [
      {
        icon: '👥',
        label: this.i18n.t('pages.users.totalUsers'),
        value: stats.totalUsers,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '✅',
        label: this.i18n.t('pages.users.activeUsers'),
        value: stats.activeUsers,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '🔒',
        label: this.i18n.t('pages.users.inactiveUsers'),
        value: stats.inactiveUsers,
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
      },
      {
        icon: '👑',
        label: this.i18n.t('pages.users.adminUsers'),
        value: stats.adminUsers,
        iconBgClass: 'bg-purple-100 dark:bg-purple-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('pages.users.addUser'),
      icon: 'add',
      onClick: () => this.openAddModal(),
      variant: 'primary'
    },
    {
      label: this.i18n.t('pages.users.manageRoles'),
      icon: 'security',
      onClick: () => this.openRoleModal(),
      variant: 'secondary'
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18n.t('common.search'),
      type: 'text',
      placeholder: this.i18n.t('common.search')
    },
    {
      key: 'role',
      label: this.i18n.t('pages.users.filterRole'),
      type: 'select',
      placeholder: this.i18n.t('pages.users.filterRole'),
      options: this.userService.getRoles()().map((r: Role) => ({ label: r.name, value: r.name }))
    },
    {
      key: 'status',
      label: this.i18n.t('pages.users.filterStatus'),
      type: 'select',
      placeholder: this.i18n.t('pages.users.filterStatus'),
      options: [
        { label: this.i18n.t('common.active'), value: 'active' },
        { label: this.i18n.t('common.inactive'), value: 'inactive' }
      ]
    },
    {
      key: 'companyId',
      label: this.i18n.t('pages.users.filterCompany'),
      type: 'select',
      placeholder: this.i18n.t('pages.users.filterCompany'),
      options: []
    }
  ]);

filteredUsers = computed(() => {
  return this.userService.filterUsers(this.filters);
});

  get columns(): TableColumn[] {
  return [
    { key: 'username', label: this.i18n.t('pages.users.usernameLabel'), sortable: true },
    { key: 'firstName', label: this.i18n.t('pages.users.firstNameLabel'), sortable: true },
    { key: 'lastName', label: this.i18n.t('pages.users.lastNameLabel'), sortable: true },
    { key: 'email', label: this.i18n.t('pages.users.emailLabel'), sortable: true },
    { key: 'role', label: this.i18n.t('pages.users.roleLabel'), sortable: true },
    { key: 'companyName', label: this.i18n.t('pages.users.companyLabel'), sortable: true },
    {
      key: 'isActive',
      label: this.i18n.t('pages.users.statusLabel'),
      render: (value) => value ? '<span class="text-green-600">Active</span>' : '<span class="text-red-600">Inactive</span>'
    },
    { key: 'lastLogin', label: this.i18n.t('pages.users.lastLogin'), sortable: true }
  ];
}

  get actions(): TableAction[] {
  return [
    {
      icon: '✏️',
      label: this.i18n.t('pages.users.editUser'),
      onClick: (row) => this.editUser(row)
    },
    {
      icon: '🔒',
      label: this.i18n.t('pages.users.resetPassword'),
      onClick: (row) => this.resetPassword(row)
    },
    {
      icon: '🗑️',
      label: this.i18n.t('pages.users.deleteUser'),
      variant: 'danger',
      onClick: (row) => this.deleteUser(row)
    }
  ];
}

constructor(
  public userService: UserService,
  public i18n: I18nService
) {
  super();
}

ngOnInit(): void {
  this.loadUsers();
  this.loadRoles();
  this.loadCompanies();
}

loadUsers(): void {
  // ✅ Auto-unsubscribe on component destroy
  this.subscribe(
    this.userService.loadUsers(),
    () => {
      // Data is automatically updated via service
    },
    (error) => {
      console.error('Error loading users:', error);
    }
  );
}

loadRoles(): void {
  this.subscribe(
    this.userService.loadRoles(),
    () => {
      // Data is automatically updated via service
    },
    (error) => {
      console.error('Error loading roles:', error);
    }
  );
}

loadCompanies(): void {
  this.subscribe(
    this.userService.loadCompanies(),
    () => {
      // Data is automatically updated via service
    },
    (error) => {
      console.error('Error loading companies:', error);
    }
  );
}

applyFilters(): void {
  // Filters are applied automatically through computed signal
}

onFilterChange(event: { key: string; value: any }): void {
    (this.filters as any)[event.key] = event.value;
this.applyFilters();
  }

openAddModal(): void {
  this.editingUser.set(null);
  this.formData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    picture: '',
    actorType: 'member',
    memberType: '',
    role: '',
    companyId: '',
    isActive: true
  };
  // Ensure companies and roles are loaded
  if (this.userService.getCompanies()().length === 0) {
    this.loadCompanies();
  }
  if (this.userService.getRoles()().length === 0) {
    this.loadRoles();
  }
  this.showModal.set(true);
}

editUser(user: User): void {
  this.editingUser.set(user);

  // Find role ID from name (since API return names but form needs ID)
  let roleId = '';
  if(user.roles && user.roles.length > 0) {
    const roleName = user.roles[0];
    const roleObj = this.userService.getRoles()().find(r => r.name === roleName);
    if (roleObj) {
      roleId = roleObj.id;
    }
  }

  this.formData = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    username: user.username || '',
    email: user.email || '',
    password: '', // Don't populate password
    phoneNumber: (user as any).phoneNumber || (user as any).phone_number || '',
    picture: (user as any).picture || '',
    actorType: (user as any).actorType || (user as any).actor_type || 'member',
    memberType: (user as any).memberType || (user as any).member_type || '',
    role: roleId,
    companyId: user.companyId || (user as any).company_id || '',
    isActive: user.isActive !== undefined ? user.isActive : ((user as any).is_active !== undefined ? (user as any).is_active : true)
  };
  // Ensure companies and roles are loaded
  if (this.userService.getCompanies()().length === 0) {
    this.loadCompanies();
  }
  if (this.userService.getRoles()().length === 0) {
    this.loadRoles();
  }
  this.showModal.set(true);
}

closeModal(): void {
  this.showModal.set(false);
  this.editingUser.set(null);
}

saveUser(): void {
  // Validate required fields
  if (!this.formData.username || !this.formData.email || !this.formData.firstName || !this.formData.lastName) {
    alert(this.i18n.t('pages.users.requiredFieldsMissing') || 'Please fill in all required fields');
    return;
  }

  if (!this.editingUser() && !this.formData.password) {
    alert(this.i18n.t('pages.users.passwordRequired') || 'Password is required');
    return;
  }

  // Validate actor_type
  if (!this.formData.actorType) {
    alert(this.i18n.t('pages.users.actorTypeRequired') || 'Actor Type is required');
    return;
  }

  // Validate actor_type enum values
  const validActorTypes = ['member', 'admin_system', 'guest', 'public', 'device', 'api', 'system'];
  if (!validActorTypes.includes(this.formData.actorType)) {
    alert(this.i18n.t('pages.users.invalidActorType') || 'Invalid Actor Type');
    return;
  }

  this.saving.set(true);

  // Send camelCase - ApiService will convert to snake_case automatically
  const backendData: any = {
    username: this.formData.username,
    email: this.formData.email,
    firstName: this.formData.firstName,
    lastName: this.formData.lastName,
    isActive: this.formData.isActive,
    phoneNumber: this.formData.phoneNumber || null,
    picture: this.formData.picture || null
  };

  // Add actorType only for create (not in MemberUpdate schema)
  if (!this.editingUser()) {
    backendData.actorType = this.formData.actorType || 'member';
  }

  // Add password only for create
  if (!this.editingUser()) {
    backendData.password = this.formData.password;
    // Add member_type only for create (not in MemberUpdate schema)
    if (this.formData.memberType) {
      backendData.memberType = this.formData.memberType;
    }
  } else if (this.formData.password) {
    // Optional password update
    backendData.password = this.formData.password;
  }
  // Note: member_type is not in MemberUpdate schema, so we don't send it for updates

  // Store role and companyId for later assignment
  const roleId = this.formData.role;
  const companyId = this.formData.companyId;

  const editingUserId = this.editingUser()?.memberId || this.editingUser()?.id;
  const request = this.editingUser() && editingUserId
    ? this.userService.updateUser(editingUserId, backendData)
    : this.userService.createUser(backendData);

  // ✅ Auto-unsubscribe on component destroy
  this.subscribe(
    request,
    (response) => {
      const userId = (response as any).memberId || (response as any).member_id || (response as any).id || this.editingUser()?.memberId || this.editingUser()?.id;
      
      if (!userId) {
        console.error('User ID is missing from response');
        this.saving.set(false);
        return;
      }
      
      // Assign role if provided
      if (roleId) {
        this.subscribe(
          this.assignRoleToUser(userId, roleId),
          () => {
            // Assign company if provided
            if (companyId) {
              this.subscribe(
                this.assignCompanyToUser(userId, companyId),
                () => {
                  this.saving.set(false);
                  this.closeModal();
                  this.loadUsers();
                },
                (err) => {
                  console.error('Error assigning company:', err);
                  this.saving.set(false);
                  this.closeModal();
                  this.loadUsers();
                }
              );
            } else {
              this.saving.set(false);
              this.closeModal();
              this.loadUsers();
            }
          },
          (err) => {
            console.error('Error assigning role:', err);
            // Continue even if role assignment fails
            if (companyId) {
              this.subscribe(
                this.assignCompanyToUser(userId, companyId),
                () => {
                  this.saving.set(false);
                  this.closeModal();
                  this.loadUsers();
                },
                () => {
                  this.saving.set(false);
                  this.closeModal();
                  this.loadUsers();
                }
              );
            } else {
              this.saving.set(false);
              this.closeModal();
              this.loadUsers();
            }
          }
        );
      } else if (companyId) {
        // Only assign company if no role
        this.subscribe(
          this.assignCompanyToUser(userId, companyId),
          () => {
            this.saving.set(false);
            this.closeModal();
            this.loadUsers();
          },
          () => {
            this.saving.set(false);
            this.closeModal();
            this.loadUsers();
          }
        );
      } else {
        this.saving.set(false);
        this.closeModal();
        this.loadUsers();
      }
    },
    (error) => {
      console.error('Error saving user:', error);
      this.saving.set(false);
    }
  );
}

deleteUser(user: User): void {
  if(!confirm(`${this.i18n.t('pages.users.deleteUserConfirm')} ${user.username}?`)) return;

  const userId = user.memberId || user.id;
  if (!userId) {
    console.error('User ID is missing');
    return;
  }

  // ✅ Auto-unsubscribe on component destroy
  this.subscribe(
    this.userService.deleteUser(userId),
    () => {
      this.loadUsers();
    },
    (error) => {
      console.error('Error deleting user:', error);
    }
  );
}

resetPassword(user: User): void {
  if(!confirm(`${this.i18n.t('pages.users.resetPasswordConfirm')} ${user.username}?`)) return;

  const userId = user.memberId || user.id;
  if (!userId) {
    console.error('User ID is missing');
    return;
  }

  // ✅ Auto-unsubscribe on component destroy
  this.subscribe(
    this.userService.resetPassword(userId),
    () => {
      alert(this.i18n.t('pages.users.passwordResetSuccess'));
    },
    (error) => {
      console.error('Error resetting password:', error);
    }
  );
}

openRoleModal(): void {
  this.showRoleModal.set(true);
}

closeRoleModal(): void {
  this.showRoleModal.set(false);
}

openAddRoleModal(): void {
  this.editingRoleRecord.set(null);
  this.roleFormData = {
    name: '',
    description: '',
    permissionsInput: ''
  };
  this.showRoleFormModal.set(true);
}

editRole(role: Role): void {
  this.editingRoleRecord.set(role);
  this.roleFormData = {
    name: role.name,
    description: role.description,
    permissionsInput: role.permissions.join('\n')
  };
  this.showRoleFormModal.set(true);
}

deleteRole(role: Role): void {
  if(!confirm(`${this.i18n.t('pages.users.deleteRoleConfirm')} ${role.name}?`)) return;

  // ✅ Auto-unsubscribe on component destroy
  this.subscribe(
    this.userService.deleteRole(role.id),
    () => {
      this.loadRoles();
    },
    (error) => {
      console.error('Error deleting role:', error);
      alert(this.i18n.t('pages.users.failedToDeleteRole'));
    }
  );
  }

closeRoleFormModal(): void {
  this.showRoleFormModal.set(false);
  this.editingRoleRecord.set(null);
}

saveRole(): void {
  if (!this.roleFormData.name.trim()) {
    alert(this.i18n.t('pages.users.roleNameRequiredAlert'));
    return;
  }

  // Transform to backend format (without permissions)
  const payload = {
    name: this.roleFormData.name.trim(),
    description: this.roleFormData.description.trim()
  };

  // Store permissions for later assignment
  const permissionNames = this.roleFormData.permissionsInput
    .split(/[\n,]/)
    .map(permission => permission.trim())
    .filter(permission => permission.length > 0);

  this.roleSaving.set(true);

  const request = this.editingRoleRecord()
    ? this.userService.updateRole(this.editingRoleRecord()!.id, payload)
    : this.userService.createRole(payload);

  // ✅ Auto-unsubscribe on component destroy
  this.subscribe(
    request,
    (response) => {
      const roleId = response.id || this.editingRoleRecord()?.id;
      
      // Assign permissions separately if provided
      if (permissionNames.length > 0 && roleId) {
        this.subscribe(
          this.updateRolePermissions(roleId, permissionNames),
          () => {
            this.roleSaving.set(false);
            this.closeRoleFormModal();
            this.loadRoles();
          },
          (err) => {
            console.error('Error assigning permissions:', err);
            // Continue even if permission assignment fails
            this.roleSaving.set(false);
            this.closeRoleFormModal();
            this.loadRoles();
          }
        );
      } else {
        this.roleSaving.set(false);
        this.closeRoleFormModal();
        this.loadRoles();
      }
    },
    (error) => {
      console.error('Error saving role:', error);
      this.roleSaving.set(false);
      alert(this.i18n.t('pages.users.failedToSaveRole'));
    }
  );
}

exportUsers(): void {
  // ✅ Auto-unsubscribe on component destroy
  this.subscribe(
    this.userService.exportUsers(),
    (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'users.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    },
    (error) => {
      console.error('Error exporting users:', error);
      alert(this.i18n.t('pages.users.errorExportingUsers'));
    }
  );
}

assignRoleToUser(userId: string, roleId: string) {
  return this.userService.assignRoleToUser(userId, roleId);
}

assignCompanyToUser(userId: string, companyId: string) {
  return this.userService.assignCompanyToUser(userId, companyId);
}

updateRolePermissions(roleId: string, permissionNames: string[]) {
  return this.userService.updateRolePermissions(roleId, permissionNames);
}

t(key: string): string {
  return this.i18n.translate(key);
}
}
