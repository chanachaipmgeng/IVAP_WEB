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
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { MemberService } from '../../../core/services/member.service';
import { CompanyService } from '../../../core/services/company.service';
import { RbacService } from '../../../core/services/rbac.service';
import { User, UserFilters, UserStatistics } from '../../../core/models/user.model';
import { Member, MemberCreate, MemberUpdate } from '../../../core/models/member.model';
import { memberToUser, membersToUsers, userToMember } from '../../../core/utils/member-utils';
import { BaseComponent } from '../../../core/base/base.component';
import { Role, RoleForm } from '../../../core/models/rbac.model';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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

  // Local state for companies and roles
  private companies = signal<any[]>([]);
  private roles = signal<Role[]>([]);

  // Public getters for template access
  getRoles = () => this.roles.asReadonly();
  getCompanies = () => this.companies.asReadonly();

  formData: any = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    phone_number: '',
    picture: '',
    actor_type: 'member',
    member_type: '',
    role: '',
    company_id: '',
    is_active: true
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
    company_id: ''
  };

  // Computed signals for statistics
  userStats = computed(() => {
    const memberStats = this.memberService.calculateStatistics();
    const members = this.memberService.getMembersSignal()();
    const adminUsers = members.filter(m => m.roles?.includes('admin') || m.roles?.includes('ADMIN')).length;

    return {
      totalUsers: memberStats.total_members,
      activeUsers: memberStats.active_members,
      inactiveUsers: memberStats.inactive_members,
      adminUsers: adminUsers
    } as UserStatistics;
  });

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const stats = this.userStats();
    return [
      {
        icon: '👥',
        label: 'ผู้ใช้งานทั้งหมด',
        value: stats.totalUsers,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '✅',
        label: 'ใช้งานอยู่',
        value: stats.activeUsers,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '🔒',
        label: 'ระงับการใช้งาน',
        value: stats.inactiveUsers,
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
      },
      {
        icon: '👑',
        label: 'ผู้ดูแลระบบ',
        value: stats.adminUsers,
        iconBgClass: 'bg-purple-100 dark:bg-purple-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: 'เพิ่มผู้ใช้งาน',
      icon: 'add',
      onClick: () => this.openAddModal(),
      variant: 'primary'
    },
    {
      label: 'จัดการบทบาท',
      icon: 'security',
      onClick: () => this.openRoleModal(),
      variant: 'secondary'
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: 'ค้นหา',
      type: 'text',
      placeholder: 'ค้นหา...'
    },
    {
      key: 'role',
      label: 'บทบาท',
      type: 'select',
      placeholder: 'เลือกบทบาท',
      options: this.roles().map((r: Role) => ({ label: r.name, value: r.name })) // Use local roles state
    },
    {
      key: 'status',
      label: 'สถานะ',
      type: 'select',
      placeholder: 'เลือกสถานะ',
      options: [
        { label: 'ใช้งานอยู่', value: 'active' },
        { label: 'ระงับการใช้งาน', value: 'inactive' }
      ]
    },
    {
      key: 'company_id',
      label: 'บริษัท',
      type: 'select',
      placeholder: 'เลือกบริษัท',
      options: []
    }
  ]);

  filteredUsers = computed(() => {
    // Convert UserFilters to MemberFilters
    const memberFilters: any = {
      search: this.filters.search,
      is_active: this.filters.status === 'active' ? true : (this.filters.status === 'inactive' ? false : undefined)
    };

    // Filter members using MemberService
    let filtered = this.memberService.filterMembers(memberFilters);

    // Convert to Users for backward compatibility
    let users = membersToUsers(filtered);

    // Additional filtering for role and company_id (not in MemberFilters)
    if (this.filters.role) {
      const role = this.filters.role;
      users = users.filter(user => user.roles?.includes(role) || user.roles?.includes(role.toUpperCase()));
    }

    if (this.filters.company_id) {
      users = users.filter(user => user.companyId === this.filters.company_id || user.company_id === this.filters.company_id);
    }

    return users;
  });

  get columns(): TableColumn[] {
    return [
      { key: 'username', label: 'ชื่อผู้ใช้', sortable: true },
      { key: 'first_name', label: 'ชื่อ', sortable: true },
      { key: 'last_name', label: 'นามสกุล', sortable: true },
      { key: 'email', label: 'อีเมล', sortable: true },
      { key: 'role', label: 'บทบาท', sortable: true },
      { key: 'company_name', label: 'บริษัท', sortable: true },
      {
        key: 'is_active',
        label: 'สถานะ',
        render: (value) => value ? '<span class="text-green-600">ใช้งานอยู่</span>' : '<span class="text-red-600">ระงับการใช้งาน</span>'
      },
      { key: 'last_login_at', label: 'ใช้งานล่าสุด', sortable: true }
    ];
  }

  get actions(): TableAction[] {
    return [
      {
        icon: '✏️',
        label: 'แก้ไข',
        onClick: (row) => this.editUser(row)
      },
      {
        icon: '🔒',
        label: 'รีเซ็ตรหัสผ่าน',
        onClick: (row) => this.resetPassword(row)
      },
      {
        icon: '🗑️',
        label: 'ลบ',
        variant: 'danger',
        onClick: (row) => this.deleteUser(row)
      }
    ];
  }

  constructor(
    public memberService: MemberService, // Use for member CRUD operations
    public companyService: CompanyService, // Use for company operations
    public rbacService: RbacService // Use for role operations
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
    // Use MemberService to load members (snake_case from backend)
    this.subscribe(
      this.memberService.loadMembers(),
      (members: Member[]) => {
        // Convert Members to Users for backward compatibility
        const users = membersToUsers(members);
        // No need to update UserService state anymore
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );
  }

  loadRoles(): void {
    // Use RbacService instead of UserService
    this.subscribe(
      this.rbacService.loadRoles(),
      (roles: Role[]) => {
        // Update local state
        this.roles.set(roles);
      },
      (error) => {
        console.error('Error loading roles:', error);
        this.roles.set([]);
      }
    );
  }

  loadCompanies(): void {
    // Use CompanyService instead of UserService
    this.subscribe(
      this.companyService.getCompanies(),
      (response) => {
        // Update local state
        const companies = response.data || response.items || [];
        this.companies.set(companies);
      },
      (error) => {
        console.error('Error loading companies:', error);
        this.companies.set([]);
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
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      phone_number: '',
      picture: '',
      actor_type: 'member',
      member_type: '',
      role: '',
      company_id: '',
      is_active: true
    };
    // Ensure companies and roles are loaded
    if (this.companies().length === 0) {
      this.loadCompanies();
    }
    if (this.roles().length === 0) {
      this.loadRoles();
    }
    this.showModal.set(true);
  }

  editUser(user: User): void {
    this.editingUser.set(user);

    // Find role ID from name (since API return names but form needs ID)
    let roleId = '';
    if (user.roles && user.roles.length > 0) {
      const roleName = user.roles[0];
      const roleObj = this.roles().find((r: Role) => r.name === roleName);
      if (roleObj) {
        roleId = roleObj.id;
      }
    }

    // Use snake_case from backend
    this.formData = {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      email: user.email || '',
      password: '', // Don't populate password
      phone_number: user.phone_number || '',
      picture: user.picture || '',
      actor_type: user.actor_type || 'member',
      member_type: user.member_type || '',
      role: roleId,
      company_id: user.company_id || '',
      is_active: user.is_active !== undefined ? user.is_active : true
    };
    // Ensure companies and roles are loaded
    if (this.companies().length === 0) {
      this.loadCompanies();
    }
    if (this.roles().length === 0) {
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
    if (!this.formData.username || !this.formData.email || !this.formData.first_name || !this.formData.last_name) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (!this.editingUser() && !this.formData.password) {
      alert('กรุณากรอกรหัสผ่าน');
      return;
    }

    // Validate actor_type
    if (!this.formData.actor_type) {
      alert('กรุณาระบุประเภทผู้ใช้งาน');
      return;
    }

    // Validate actor_type enum values
    const validActorTypes = ['member', 'admin_system', 'guest', 'public', 'device', 'api', 'system'];
    if (!validActorTypes.includes(this.formData.actor_type)) {
      alert('ประเภทผู้ใช้งานไม่ถูกต้อง');
      return;
    }

    this.saving.set(true);

    // Store role and company_id for later assignment
    const roleId = this.formData.role;
    const companyId = this.formData.company_id;

    const editingUserId = this.editingUser()?.memberId || this.editingUser()?.id || this.editingUser()?.member_id;

    // Use MemberService with snake_case models
    let request: Observable<Member>;

    if (this.editingUser() && editingUserId) {
      // Update existing member
      const updateData: MemberUpdate = {
        username: this.formData.username,
        email: this.formData.email,
        first_name: this.formData.first_name,
        last_name: this.formData.last_name,
        is_active: this.formData.is_active,
        phone_number: this.formData.phone_number || undefined,
        picture: this.formData.picture || undefined
      };

      // Optional password update
      if (this.formData.password) {
        updateData.password = this.formData.password;
      }

      request = this.memberService.updateMember(editingUserId, updateData);
    } else {
      // Create new member
      const createData: MemberCreate = {
        username: this.formData.username,
        email: this.formData.email,
        password: this.formData.password,
        first_name: this.formData.first_name,
        last_name: this.formData.last_name,
        phone_number: this.formData.phone_number || undefined,
        actor_type: this.formData.actor_type as any || 'member',
        member_type: this.formData.member_type as any || undefined
      };

      request = this.memberService.createMember(createData);
    }

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      (member: Member) => {
        // Convert Member to User for compatibility
        const user = memberToUser(member);
        const userId = member.member_id;

        if (!userId) {
          console.error('User ID is missing from response');
          this.saving.set(false);
          return;
        }

        // Assign role if provided
        if (roleId) {
          this.subscribe(
            this.assignRoleToUser(userId, roleId, companyId),
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
    if (!confirm(`คุณต้องการลบผู้ใช้งาน ${user.username}?`)) return;

    const userId = user.memberId || user.member_id || user.id;
    if (!userId) {
      console.error('User ID is missing');
      return;
    }

    // ✅ Auto-unsubscribe on component destroy
    // Use MemberService to delete
    this.subscribe(
      this.memberService.deleteMember(userId),
      () => {
        this.loadUsers();
      },
      (error) => {
        console.error('Error deleting user:', error);
        // Error already logged above
      }
    );
  }

  resetPassword(user: User): void {
    if (!confirm(`คุณต้องการรีเซ็ตรหัสผ่านของ ${user.username}?`)) return;

    const userId = user.memberId || user.member_id || user.id;
    if (!userId) {
      console.error('User ID is missing');
      return;
    }

    // ✅ Auto-unsubscribe on component destroy
    // Use MemberService instead of UserService
    this.subscribe(
      this.memberService.resetPassword(userId),
      () => {
        alert('รีเซ็ตรหัสผ่านเรียบร้อยแล้ว');
      },
      (error) => {
        console.error('Error resetting password:', error);
        // Error already logged above
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
    if (!confirm(`คุณต้องการลบบทบาท ${role.name}?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    // Use RbacService instead of UserService
    this.subscribe(
      this.rbacService.deleteRole(Number(role.id)),
      () => {
        this.loadRoles();
      },
      (error) => {
        console.error('Error deleting role:', error);
        alert('ลบบทบาทไม่สำเร็จ');
      }
    );
  }

  closeRoleFormModal(): void {
    this.showRoleFormModal.set(false);
    this.editingRoleRecord.set(null);
  }

  saveRole(): void {
    if (!this.roleFormData.name.trim()) {
      alert('กรุณาระบุชื่อบทบาท');
      return;
    }

    // Transform to backend format (with permissions)
    const payload: RoleForm = {
      name: this.roleFormData.name,
      description: this.roleFormData.description,
      permissions: this.roleFormData.permissionsInput.split(/[\n,]/)
        .map(permission => permission.trim())
        .filter(permission => permission.length > 0)
    };

    // Store permissions for later assignment
    const permissionNames = this.roleFormData.permissionsInput
      .split(/[\n,]/)
      .map(permission => permission.trim())
      .filter(permission => permission.length > 0);

    this.roleSaving.set(true);

    // For update, use Partial<RoleForm> which doesn't require permissions
    // For create, use payload with empty permissions array
    const request = this.editingRoleRecord()
      ? this.rbacService.updateRole(Number(this.editingRoleRecord()!.id), { name: payload.name, description: payload.description })
      : this.rbacService.createRole(payload);

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
        alert('บันทึกบทบาทไม่สำเร็จ');
      }
    );
  }

  exportUsers(): void {
    // ✅ Auto-unsubscribe on component destroy
    // Use MemberService instead of UserService
    this.subscribe(
      this.memberService.exportMembers('csv'),
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
        // Error already logged above
        alert('ส่งออกข้อมูลผู้ใช้งานไม่สำเร็จ');
      }
    );
  }

  assignRoleToUser(userId: string, roleId: string, companyId?: string) {
    // Use RbacService instead of UserService
    // Get company_id from parameter or formData
    const company_id = companyId || this.formData.company_id || '';

    return this.rbacService.assignUserRole(userId, Number(roleId));
  }

  assignCompanyToUser(userId: string, companyId: string) {
    // Use MemberService to update member with company_id
    const options = { skipTransform: true };
    return this.memberService.updateMember(userId, { company_id: companyId } as any);
  }

  updateRolePermissions(roleId: string, permissionNames: string[]) {
    // Use RbacService instead of UserService
    // First, load permissions to map names to IDs
    return this.rbacService.loadPermissions().pipe(
      switchMap((permissions: any) => {
        const permissionIds: number[] = [];
        const allPermissions = Array.isArray(permissions) ? permissions : (permissions?.data || permissions?.items || []);

        for (const permissionName of permissionNames) {
          const permission = allPermissions.find((p: any) =>
            p.permissionName === permissionName ||
            p.permission_name === permissionName ||
            p.permissionCode === permissionName ||
            p.permission_code === permissionName ||
            p.name === permissionName
          );
          if (permission) {
            permissionIds.push(permission.id);
          } else {
            console.warn(`Permission not found: ${permissionName}`);
          }
        }

        return this.rbacService.updateRolePermissions(Number(roleId), permissionIds);
      })
    );
  }
}
