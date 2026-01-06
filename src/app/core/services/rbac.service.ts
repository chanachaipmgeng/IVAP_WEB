import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Role, Permission, UserRole, RolePermission, RBACFilters, RBACStatistics, RoleForm, PermissionForm, UserRoleForm, PermissionCategory } from '../models/rbac.model';

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private roles = signal<Role[]>([]);
  private permissions = signal<Permission[]>([]);
  private userRoles = signal<UserRole[]>([]);
  private loading = signal(false);

  constructor(private api: ApiService) {}

  // Getters
  getRoles = () => this.roles.asReadonly();
  getPermissions = () => this.permissions.asReadonly();
  getUserRoles = () => this.userRoles.asReadonly();
  getLoading = () => this.loading.asReadonly();

  // Load data
  loadRoles(): Observable<Role[]> {
    this.loading.set(true);
    // Backend: GET /api/v1/rbac/roles
    const options = { skipTransform: true };
    return this.api.get<Role[]>('/rbac/roles', undefined, options).pipe(
      tap((response: any) => {
        const data = Array.isArray(response) ? response : (response?.data || []);
        this.roles.set(data);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading roles:', error);
        this.roles.set([]);
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  loadPermissions(): Observable<Permission[]> {
    // Backend: GET /api/v1/rbac/permissions
    const options = { skipTransform: true };
    return this.api.get<Permission[]>('/rbac/permissions', undefined, options).pipe(
      tap((response: any) => {
        const data = Array.isArray(response) ? response : (response?.data || []);
        this.permissions.set(data);
      }),
      catchError((error) => {
        console.error('Error loading permissions:', error);
        this.permissions.set([]);
        return throwError(() => error);
      })
    );
  }

  loadUserRoles(): Observable<UserRole[]> {
    // Note: Backend doesn't have a dedicated user-roles endpoint
    // This is a client-side computed list from roles and members
    // Return empty observable and let components construct from roles and members
    return new Observable(observer => {
      this.userRoles.set([]);
      observer.next([]);
      observer.complete();
    });
  }

  // Role operations
  createRole(roleData: RoleForm): Observable<Role> {
    // Backend: POST /api/v1/rbac/roles
    const options = { skipTransform: true };
    return this.api.post<Role>('/rbac/roles', roleData, undefined, options).pipe(
      tap((role: any) => {
        // Update local state
        const roles = this.roles();
        this.roles.set([...roles, role]);
      })
    );
  }

  updateRole(roleId: number, roleData: Partial<RoleForm>): Observable<Role> {
    // Backend: PUT /api/v1/rbac/roles/{role_id}
    // Note: Backend expects role_id as number, but frontend Role.id is string
    const options = { skipTransform: true };
    return this.api.put<Role>(`/rbac/roles/${roleId}`, roleData, undefined, options).pipe(
      tap((role: any) => {
        // Update local state
        const roles = this.roles();
        const roleIdStr = String(roleId);
        const index = roles.findIndex(r => r.id === roleIdStr || String(r.id) === roleIdStr);
        if (index >= 0) {
          roles[index] = role;
          this.roles.set([...roles]);
        }
      })
    );
  }

  deleteRole(roleId: number): Observable<void> {
    // Backend: DELETE /api/v1/rbac/roles/{role_id}
    // Note: Backend expects role_id as number, but frontend Role.id is string
    const options = { skipTransform: true };
    return this.api.delete<void>(`/rbac/roles/${roleId}`, undefined, undefined, options).pipe(
      tap(() => {
        // Update local state
        const roles = this.roles();
        const roleIdStr = String(roleId);
        this.roles.set(roles.filter(r => r.id !== roleIdStr && String(r.id) !== roleIdStr));
      })
    );
  }

  // Permission operations
  // Note: Backend permissions are predefined (read-only), no CRUD operations available
  createPermission(permissionData: PermissionForm): Observable<Permission> {
    // Backend doesn't support creating permissions (they are predefined)
    throw new Error('Permissions are predefined and cannot be created');
  }

  updatePermission(permissionId: string, permissionData: Partial<PermissionForm>): Observable<Permission> {
    // Backend doesn't support updating permissions (they are predefined)
    throw new Error('Permissions are predefined and cannot be updated');
  }

  deletePermission(permissionId: string): Observable<void> {
    // Backend doesn't support deleting permissions (they are predefined)
    throw new Error('Permissions are predefined and cannot be deleted');
  }

  // User role operations
  assignUserRole(userId: string, roleId: number): Observable<any> {
    // Backend: POST /api/v1/rbac/users/{user_id}/roles/{role_id}
    // Note: Backend expects user_id as UUID (string) and role_id as number
    const options = { skipTransform: true };
    return this.api.post<any>(`/rbac/users/${userId}/roles/${roleId}`, {}, undefined, options);
  }

  removeUserRole(userId: string, roleId: number): Observable<void> {
    // Backend: DELETE /api/v1/rbac/users/{user_id}/roles/{role_id}
    // Note: Backend expects user_id as UUID (string) and role_id as number
    const options = { skipTransform: true };
    return this.api.delete<void>(`/rbac/users/${userId}/roles/${roleId}`, undefined, undefined, options);
  }

  // Role permission operations
  assignPermissionToRole(roleId: number, permissionId: number): Observable<Role> {
    // Backend: POST /api/v1/rbac/roles/{role_id}/permissions/{permission_id}
    // Note: Backend expects role_id and permission_id as numbers, but frontend Role.id is string
    const options = { skipTransform: true };
    return this.api.post<Role>(`/rbac/roles/${roleId}/permissions/${permissionId}`, {}, undefined, options).pipe(
      tap((role: any) => {
        // Update local state
        const roles = this.roles();
        const roleIdStr = String(roleId);
        const index = roles.findIndex(r => r.id === roleIdStr || String(r.id) === roleIdStr);
        if (index >= 0) {
          roles[index] = role;
          this.roles.set([...roles]);
        }
      })
    );
  }

  removePermissionFromRole(roleId: number, permissionId: number): Observable<Role> {
    // Backend: DELETE /api/v1/rbac/roles/{role_id}/permissions/{permission_id}
    // Note: Backend expects role_id and permission_id as numbers, but frontend Role.id is string
    const options = { skipTransform: true };
    return this.api.delete<Role>(`/rbac/roles/${roleId}/permissions/${permissionId}`, undefined, undefined, options).pipe(
      tap((role: any) => {
        // Update local state
        const roles = this.roles();
        const roleIdStr = String(roleId);
        const index = roles.findIndex(r => r.id === roleIdStr || String(r.id) === roleIdStr);
        if (index >= 0) {
          roles[index] = role;
          this.roles.set([...roles]);
        }
      })
    );
  }

  bulkAssignPermissionsToRole(roleId: number, permissionIds: number[]): Observable<Role> {
    // Backend: POST /api/v1/rbac/roles/{role_id}/permissions/bulk
    // Note: Backend expects role_id as number and permission_ids as array of numbers, but frontend Role.id is string
    const options = { skipTransform: true };
    return this.api.post<Role>(`/rbac/roles/${roleId}/permissions/bulk`, permissionIds, undefined, options).pipe(
      tap((role: any) => {
        // Update local state
        const roles = this.roles();
        const roleIdStr = String(roleId);
        const index = roles.findIndex(r => r.id === roleIdStr || String(r.id) === roleIdStr);
        if (index >= 0) {
          roles[index] = role;
          this.roles.set([...roles]);
        }
      })
    );
  }

  bulkRemovePermissionsFromRole(roleId: number, permissionIds: number[]): Observable<Role> {
    // Backend: DELETE /api/v1/rbac/roles/{role_id}/permissions/bulk
    // Backend accepts body in DELETE request
    // Note: Backend expects role_id as number and permission_ids as array of numbers, but frontend Role.id is string
    const options = { skipTransform: true };
    return this.api.delete<Role>(`/rbac/roles/${roleId}/permissions/bulk`, undefined, permissionIds, options).pipe(
      tap((role: any) => {
        // Update local state
        const roles = this.roles();
        const roleIdStr = String(roleId);
        const index = roles.findIndex(r => r.id === roleIdStr || String(r.id) === roleIdStr);
        if (index >= 0) {
          roles[index] = role;
          this.roles.set([...roles]);
        }
      })
    );
  }

  updateRolePermissions(roleId: number, permissionIds: number[]): Observable<Role> {
    // Backend: PUT /api/v1/rbac/roles/{role_id}/permissions
    // Note: Backend expects role_id as number and permission_ids as array of numbers, but frontend Role.id is string
    const options = { skipTransform: true };
    return this.api.put<Role>(`/rbac/roles/${roleId}/permissions`, permissionIds, undefined, options).pipe(
      tap((role: any) => {
        // Update local state
        const roles = this.roles();
        const roleIdStr = String(roleId);
        const index = roles.findIndex(r => r.id === roleIdStr || String(r.id) === roleIdStr);
        if (index >= 0) {
          roles[index] = role;
          this.roles.set([...roles]);
        }
      })
    );
  }

  // Statistics
  getRBACStatistics(): RBACStatistics {
    try {
      const roles = this.roles() || [];
      const permissions = this.permissions() || [];
      const userRoles = this.userRoles() || [];

    return {
      totalRoles: roles.length,
      totalPermissions: permissions.length,
      totalUserRoles: userRoles.length,
        systemRoles: roles.filter(r => r?.isSystem).length,
        customRoles: roles.filter(r => !r?.isSystem).length
    };
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
  }

  // Filter methods
  filterRoles(filters: RBACFilters): Role[] {
    try {
      let filtered = this.roles() || [];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(role =>
          role?.name?.toLowerCase().includes(search) ||
          role?.description?.toLowerCase().includes(search)
      );
    }

    if (filters.roleType) {
      filtered = filtered.filter(role =>
          filters.roleType === 'system' ? role?.isSystem : !role?.isSystem
      );
    }

    return filtered;
    } catch (error) {
      console.error('Error filtering roles:', error);
      return [];
    }
  }

  filterPermissions(filters: RBACFilters): Permission[] {
    try {
      let filtered = this.permissions() || [];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(permission =>
          permission?.name?.toLowerCase().includes(search) ||
          permission?.description?.toLowerCase().includes(search) ||
          permission?.resource?.toLowerCase().includes(search)
      );
    }

    if (filters.permissionCategory) {
        filtered = filtered.filter(permission => permission?.category === filters.permissionCategory);
    }

    return filtered;
    } catch (error) {
      console.error('Error filtering permissions:', error);
      return [];
    }
  }

  filterUserRoles(filters: RBACFilters): UserRole[] {
    try {
      let filtered = this.userRoles() || [];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(userRole =>
          userRole?.userName?.toLowerCase().includes(search) ||
          userRole?.roleName?.toLowerCase().includes(search) ||
          userRole?.companyName?.toLowerCase().includes(search)
      );
    }

    if (filters.companyId) {
        filtered = filtered.filter(userRole => userRole?.companyId === filters.companyId);
    }

    return filtered;
    } catch (error) {
      console.error('Error filtering user roles:', error);
      return [];
    }
  }

  // Helper methods
  getPermissionsByCategory(): PermissionCategory[] {
    const permissions = this.permissions();
    const categories = [...new Set(permissions.map(p => p.category))];

    return categories.map(category => ({
      name: category,
      permissions: permissions.filter(p => p.category === category)
    }));
  }

  getRolePermissions(roleId: string): string[] {
    const role = this.roles().find(r => r.id === roleId);
    return role ? role.permissions : [];
  }

  hasPermission(userId: string, permission: string): boolean {
    const userRole = this.userRoles().find(ur => ur.userId === userId);
    if (!userRole) return false;

    const role = this.roles().find(r => r.id === userRole.roleId);
    return role ? role.permissions.includes(permission) : false;
  }

  getRoleClass(isSystem: boolean): string {
    return isSystem ? 'text-blue-600' : 'text-green-600';
  }

  getPermissionClass(category: string): string {
    switch (category.toLowerCase()) {
      case 'admin':
        return 'text-red-600';
      case 'user':
        return 'text-blue-600';
      case 'company':
        return 'text-green-600';
      case 'system':
        return 'text-purple-600';
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
}

