export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
}

export interface UserRole {
  id: string;
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
  companyId: string;
  companyName: string;
  assignedAt: string;
  assignedBy: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  granted: boolean;
  createdAt: string;
}

export interface RBACFilters {
  search: string;
  roleType: string;
  permissionCategory: string;
  companyId: string;
}

export interface RBACStatistics {
  totalRoles: number;
  totalPermissions: number;
  totalUserRoles: number;
  systemRoles: number;
  customRoles: number;
}

export interface RoleForm {
  name: string;
  description: string;
  permissions: string[];
}

export interface PermissionForm {
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
}

export interface UserRoleForm {
  userId: string;
  roleId: string;
  companyId: string;
}

export interface PermissionCategory {
  name: string;
  permissions: Permission[];
}
