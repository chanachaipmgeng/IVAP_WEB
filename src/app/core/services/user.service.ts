import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, Role, UserFilters, UserStatistics } from '../models/user.model';
import { API_ENDPOINTS } from '../utils/api-endpoints';
import { handleApiResponse, handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users = signal<User[]>([]);
  private roles = signal<Role[]>([]);
  private companies = signal<any[]>([]);
  private loading = signal(false);

  constructor(private api: ApiService) {}

  // Getters
  getUsers = () => this.users.asReadonly();
  getRoles = () => this.roles.asReadonly();
  getCompanies = () => this.companies.asReadonly();
  getLoading = () => this.loading.asReadonly();

  // Load data
  loadUsers(): Observable<User[]> {
    this.loading.set(true);
    return this.api.get<any>(API_ENDPOINTS.ADMIN.MEMBERS).pipe(
      tap((response: any) => {
        // Handle different response structures
        const users = response.items || response.data || (Array.isArray(response) ? response : []);
        this.users.set(users);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading users:', error);
        this.users.set([]);
        this.loading.set(false);
        throw error;
      })
    );
  }

  loadRoles(): Observable<Role[]> {
    return this.api.get<Role[]>(API_ENDPOINTS.ADMIN.ROLES).pipe(
      tap((response: any) => {
        const roles = Array.isArray(response) ? response : (response.data || response.items || []);
        this.roles.set(roles);
      }),
      catchError((error) => {
        console.error('Error loading roles:', error);
        this.roles.set([]);
        throw error;
      })
    );
  }

  loadCompanies(): Observable<any[]> {
    return this.api.get<any[]>(API_ENDPOINTS.ADMIN.COMPANIES).pipe(
      tap((response: any) => {
        const companies = response.data || response.items || (Array.isArray(response) ? response : []);
        this.companies.set(companies);
      }),
      catchError((error) => {
        console.error('Error loading companies:', error);
        this.companies.set([]);
        throw error;
      })
    );
  }

  // CRUD operations
  createUser(userData: Partial<User>): Observable<User> {
    return this.api.post<User>(API_ENDPOINTS.ADMIN.MEMBERS, userData);
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.api.put<User>(API_ENDPOINTS.ADMIN.MEMBER_BY_ID(userId), userData);
  }

  deleteUser(userId: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.ADMIN.MEMBER_BY_ID(userId));
  }

  resetPassword(userId: string): Observable<void> {
    // Note: This endpoint might need to be added to API_ENDPOINTS if it exists
    return this.api.post<void>(`${API_ENDPOINTS.ADMIN.MEMBER_BY_ID(userId)}/reset-password`, {});
  }

  createRole(roleData: Partial<Role>): Observable<Role> {
    return this.api.post<Role>(API_ENDPOINTS.ADMIN.ROLES, roleData);
  }

  updateRole(roleId: string, roleData: Partial<Role>): Observable<Role> {
    return this.api.put<Role>(API_ENDPOINTS.ADMIN.ROLE_BY_ID(roleId), roleData);
  }

  deleteRole(roleId: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.ADMIN.ROLE_BY_ID(roleId));
  }

  // Statistics
  getUserStatistics(): UserStatistics {
    const users = this.users();
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      inactiveUsers: users.filter(u => !u.isActive).length,
      adminUsers: users.filter(u => u.roles?.includes('admin') || u.roles?.includes('ADMIN')).length
    };
  }

  // Filter users
  filterUsers(filters: UserFilters): User[] {
    let filtered = this.users();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    if (filters.role) {
      filtered = filtered.filter(user => user.roles?.includes(filters.role) || user.roles?.includes(filters.role.toUpperCase()));
    }

    if (filters.status) {
      filtered = filtered.filter(user =>
        filters.status === 'active' ? user.isActive : !user.isActive
      );
    }

    if (filters.companyId) {
      filtered = filtered.filter(user => user.companyId === filters.companyId);
    }

    return filtered;
  }

  // Export
  exportUsers(): Observable<Blob> {
    // Note: This endpoint might need to be added to API_ENDPOINTS if it exists
    return this.api.get<Blob>(`${API_ENDPOINTS.ADMIN.MEMBERS}/export`, undefined, { responseType: 'blob' });
  }

  // Role Assignment
  /**
   * Assign role to user
   * Backend: POST /api/v1/roles/users/{user_id}/roles/{role_id}
   * @param userId User ID (UUID)
   * @param roleId Role ID (number)
   * @returns Observable containing updated user
   */
  assignRoleToUser(userId: string, roleId: string): Observable<User> {
    const roleIdNum = parseInt(roleId, 10);
    if (isNaN(roleIdNum)) {
      throw new Error(`Invalid role ID: ${roleId}`);
    }
    return this.api.post<any>(`/roles/users/${userId}/roles/${roleIdNum}`, {}).pipe(
      map(response => handleApiResponse<User>(response))
    );
  }

  /**
   * Assign company to user (via member update)
   * Backend: PUT /api/v1/admin/members/{member_id}
   * @param userId User ID (UUID)
   * @param companyId Company ID (UUID)
   * @returns Observable containing updated user
   */
  assignCompanyToUser(userId: string, companyId: string): Observable<User> {
    // Update member with company_id
    return this.api.put<any>(API_ENDPOINTS.ADMIN.MEMBER_BY_ID(userId), { companyId }).pipe(
      map(response => handleApiResponse<User>(response))
    );
  }

  /**
   * Update role permissions
   * Backend: PUT /api/v1/roles/{role_id}/permissions
   * Note: Backend expects permission_ids (List[int]), so we need to map permissionNames to IDs
   * @param roleId Role ID (string, will be converted to number)
   * @param permissionNames Array of permission names (will be mapped to permission IDs)
   * @returns Observable containing updated role
   */
  updateRolePermissions(roleId: string, permissionNames: string[]): Observable<Role> {
    const roleIdNum = parseInt(roleId, 10);
    if (isNaN(roleIdNum)) {
      throw new Error(`Invalid role ID: ${roleId}`);
    }
    
    // Load all permissions first to map names to IDs
    return this.api.get<any>(API_ENDPOINTS.ADMIN.PERMISSIONS).pipe(
      switchMap((permissions: any) => {
        // Map permission names to IDs
        const permissionIds: number[] = [];
        let allPermissions: any[] = [];
        if (Array.isArray(permissions)) {
          allPermissions = permissions;
        } else if (permissions && typeof permissions === 'object') {
          allPermissions = permissions.data || permissions.items || [];
        }
        
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
        
        // Now call the backend with permission IDs
        return this.api.put<any>(`/roles/${roleIdNum}/permissions`, permissionIds).pipe(
          map(response => handleApiResponse<Role>(response))
        );
      })
    );
  }
}
