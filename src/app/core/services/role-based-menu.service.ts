import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number; // 1-10, higher number = more privileges
  permissions: Permission[];
  isActive: boolean;
  isSystem: boolean; // System roles cannot be deleted
  parentRoleId?: string;
  children: string[]; // Child role IDs
  metadata: {
    department?: string;
    category?: string;
    color?: string;
    icon?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  isGranted: boolean;
  grantedAt?: Date;
  grantedBy?: string;
  expiresAt?: Date;
  metadata?: {
    reason?: string;
    notes?: string;
  };
}

export interface PermissionCondition {
  id: string;
  type: 'time' | 'location' | 'ip' | 'device' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
  description: string;
}

export interface MenuItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'page' | 'section' | 'action' | 'external' | 'divider';
  icon?: string;
  url?: string;
  externalUrl?: string;
  order: number;
  isVisible: boolean;
  isEnabled: boolean;
  parentId?: string;
  children: string[];
  permissions: string[]; // Required permission IDs
  roles: string[]; // Required role IDs
  conditions: MenuCondition[];
  metadata: {
    badge?: string;
    badgeColor?: string;
    tooltip?: string;
    shortcut?: string;
    category?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface MenuCondition {
  id: string;
  type: 'role' | 'permission' | 'time' | 'location' | 'device' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
  description: string;
  isRequired: boolean; // true = all conditions must be met, false = any condition can be met
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  assignedAt: Date;
  assignedBy: string;
  expiresAt?: Date;
  metadata: {
    reason?: string;
    department?: string;
    notes?: string;
  };
}

export interface MenuContext {
  userId: string;
  userRoles: string[];
  userPermissions: string[];
  location?: string;
  device?: string;
  time?: Date;
  customData?: { [key: string]: any };
}

export interface MenuMetrics {
  totalRoles: number;
  activeRoles: number;
  totalPermissions: number;
  totalMenuItems: number;
  visibleMenuItems: number;
  roleDistribution: { [key: string]: number };
  permissionDistribution: { [key: string]: number };
  menuUsage: { [key: string]: number };
  averageMenuDepth: number;
  mostUsedItems: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class RoleBasedMenuService {
  // ✅ Signals for reactive state
  private _roles = signal<Role[]>([]);
  private _permissions = signal<Permission[]>([]);
  private _menuItems = signal<MenuItem[]>([]);
  private _userRoles = signal<UserRole[]>([]);
  private _metrics = signal<MenuMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly roles = this._roles.asReadonly();
  public readonly permissions = this._permissions.asReadonly();
  public readonly menuItems = this._menuItems.asReadonly();
  public readonly userRoles = this._userRoles.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly rolesCount = computed(() => this._roles().length);
  public readonly activeRolesCount = computed(() => this._roles().filter(r => r.isActive).length);
  public readonly menuItemsCount = computed(() => this._menuItems().length);
  public readonly visibleMenuItemsCount = computed(() => this._menuItems().filter(m => m.isVisible).length);

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Get user menu based on context
   */
  getUserMenu(context: MenuContext): MenuItem[] {
    const userRoles = this.getUserRoles(context.userId);
    const userPermissions = this.getUserPermissions(context.userId);

    // Update context with actual data
    context.userRoles = userRoles.map(ur => ur.roleId);
    context.userPermissions = userPermissions.map(p => p.id);

    const allMenuItems = this._menuItems();
    const visibleMenuItems = allMenuItems.filter(item =>
      this.isMenuItemVisible(item, context)
    );

    return this.buildMenuTree(visibleMenuItems);
  }

  /**
   * Check if menu item is visible for user
   */
  isMenuItemVisible(menuItem: MenuItem, context: MenuContext): boolean {
    if (!menuItem.isVisible || !menuItem.isEnabled) {
      return false;
    }

    // Check role requirements
    if (menuItem.roles.length > 0) {
      const hasRequiredRole = menuItem.roles.some(roleId =>
        context.userRoles.includes(roleId)
      );
      if (!hasRequiredRole) {
        return false;
      }
    }

    // Check permission requirements
    if (menuItem.permissions.length > 0) {
      const hasRequiredPermission = menuItem.permissions.some(permissionId =>
        context.userPermissions.includes(permissionId)
      );
      if (!hasRequiredPermission) {
        return false;
      }
    }

    // Check conditions
    if (menuItem.conditions.length > 0) {
      const conditionResults = menuItem.conditions.map(condition =>
        this.evaluateCondition(condition, context)
      );

      const requiredConditions = menuItem.conditions.filter(c => c.isRequired);
      const optionalConditions = menuItem.conditions.filter(c => !c.isRequired);

      // All required conditions must be true
      const allRequiredMet = requiredConditions.length === 0 ||
        requiredConditions.every((_, index) => conditionResults[index]);

      // At least one optional condition must be true (if any exist)
      const anyOptionalMet = optionalConditions.length === 0 ||
        optionalConditions.some((_, index) => conditionResults[index]);

      if (!allRequiredMet || !anyOptionalMet) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate menu condition
   */
  private evaluateCondition(condition: MenuCondition, context: MenuContext): boolean {
    let actualValue: any;

    switch (condition.type) {
      case 'role':
        actualValue = context.userRoles;
        break;
      case 'permission':
        actualValue = context.userPermissions;
        break;
      case 'time':
        actualValue = context.time || new Date();
        break;
      case 'location':
        actualValue = context.location;
        break;
      case 'device':
        actualValue = context.device;
        break;
      case 'custom':
        actualValue = context.customData?.[condition.value.key];
        break;
      default:
        return false;
    }

    return this.compareValues(actualValue, condition.value, condition.operator);
  }

  /**
   * Compare values based on operator
   */
  private compareValues(actual: any, expected: any, operator: string): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'contains':
        return Array.isArray(actual) ? actual.includes(expected) :
               typeof actual === 'string' ? actual.includes(expected) : false;
      case 'not_contains':
        return Array.isArray(actual) ? !actual.includes(expected) :
               typeof actual === 'string' ? !actual.includes(expected) : true;
      case 'in':
        return Array.isArray(expected) ? expected.includes(actual) : false;
      case 'not_in':
        return Array.isArray(expected) ? !expected.includes(actual) : true;
      case 'greater_than':
        return typeof actual === 'number' && typeof expected === 'number' ? actual > expected : false;
      case 'less_than':
        return typeof actual === 'number' && typeof expected === 'number' ? actual < expected : false;
      default:
        return false;
    }
  }

  /**
   * Build menu tree from flat list
   */
  private buildMenuTree(menuItems: MenuItem[]): MenuItem[] {
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // Create map for quick lookup
    menuItems.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Build tree structure
    menuItems.forEach(item => {
      const menuItem = itemMap.get(item.id)!;

      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children.push(item.id);
        }
      } else {
        rootItems.push(menuItem);
      }
    });

    // Sort by order
    const sortByOrder = (items: MenuItem[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => {
        if (item.children.length > 0) {
          const childItems = item.children.map(id => itemMap.get(id)!).filter(Boolean);
          sortByOrder(childItems);
        }
      });
    };

    sortByOrder(rootItems);
    return rootItems;
  }

  /**
   * Get user roles
   */
  getUserRoles(userId: string): UserRole[] {
    return this._userRoles().filter(ur =>
      ur.userId === userId && ur.isActive
    );
  }

  /**
   * Get user permissions
   */
  getUserPermissions(userId: string): Permission[] {
    const userRoles = this.getUserRoles(userId);
    const roleIds = userRoles.map(ur => ur.roleId);

    const roles = this._roles().filter(r =>
      roleIds.includes(r.id) && r.isActive
    );

    const permissions: Permission[] = [];
    roles.forEach(role => {
      role.permissions.forEach(permission => {
        if (permission.isGranted && (!permission.expiresAt || permission.expiresAt > new Date())) {
          permissions.push(permission);
        }
      });
    });

    return permissions;
  }

  /**
   * Assign role to user
   */
  assignRoleToUser(userId: string, roleId: string, assignedBy: string, metadata?: any): UserRole {
    const userRole: UserRole = {
      id: this.generateId(),
      userId,
      roleId,
      roleName: this._roles().find(r => r.id === roleId)?.name || 'Unknown',
      isActive: true,
      assignedAt: new Date(),
      assignedBy,
      metadata: metadata || {}
    };

    this._userRoles.update(userRoles => [...userRoles, userRole]);

    this.updateMetrics();
    return userRole;
  }

  /**
   * Remove role from user
   */
  removeRoleFromUser(userId: string, roleId: string): boolean {
    this._userRoles.update(userRoles => {
      const userRole = userRoles.find(ur => ur.userId === userId && ur.roleId === roleId);
      if (!userRole) return userRoles;
      userRole.isActive = false;
      return [...userRoles];
    });

    this.updateMetrics();
    return true;
  }

  /**
   * Create role
   */
  createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'children'>): Role {
    const newRole: Role = {
      ...role,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      children: []
    };

    this._roles.update(roles => [...roles, newRole]);

    this.updateMetrics();
    return newRole;
  }

  /**
   * Update role
   */
  updateRole(roleId: string, updates: Partial<Role>): boolean {
    this._roles.update(roles => {
      const role = roles.find(r => r.id === roleId);
      if (!role || role.isSystem) return roles;
      Object.assign(role, updates);
      role.updatedAt = new Date();
      return [...roles];
    });
    this.updateMetrics();
    return true;
  }

  /**
   * Create menu item
   */
  createMenuItem(menuItem: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'children'>): MenuItem {
    const newMenuItem: MenuItem = {
      ...menuItem,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      children: []
    };

    this._menuItems.update(menuItems => [...menuItems, newMenuItem]);

    this.updateMetrics();
    return newMenuItem;
  }

  /**
   * Update menu item
   */
  updateMenuItem(menuItemId: string, updates: Partial<MenuItem>): boolean {
    this._menuItems.update(menuItems => {
      const menuItem = menuItems.find(m => m.id === menuItemId);
      if (!menuItem) return menuItems;
      Object.assign(menuItem, updates);
      menuItem.updatedAt = new Date();
      return [...menuItems];
    });
    this.updateMetrics();
    return true;
  }

  /**
   * Get menu metrics
   */
  getMetrics(): MenuMetrics {
    return this._metrics();
  }

  /**
   * Generate menu report
   */
  generateMenuReport(userId?: string): any {
    const roles = this._roles();
    const permissions = this._permissions();
    const menuItems = this._menuItems();
    const userRoles = userId ? this.getUserRoles(userId) : this._userRoles();

    const report = {
      summary: {
        totalRoles: roles.length,
        activeRoles: roles.filter(r => r.isActive).length,
        totalPermissions: permissions.length,
        totalMenuItems: menuItems.length,
        visibleMenuItems: menuItems.filter(m => m.isVisible).length
      },
      roles: roles,
      permissions: permissions,
      menuItems: menuItems,
      userRoles: userRoles,
      generatedAt: new Date()
    };

    return report;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const roles = this._roles();
    const permissions = this._permissions();
    const menuItems = this._menuItems();
    const userRoles = this._userRoles();
    const metrics = this.calculateMetrics(roles, permissions, menuItems, userRoles);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(roles: Role[], permissions: Permission[], menuItems: MenuItem[], userRoles: UserRole[]): MenuMetrics {
    const totalRoles = roles.length;
    const activeRoles = roles.filter(r => r.isActive).length;
    const totalPermissions = permissions.length;
    const totalMenuItems = menuItems.length;
    const visibleMenuItems = menuItems.filter(m => m.isVisible).length;

    const roleDistribution = this.groupBy(userRoles, 'roleId');
    const permissionDistribution = this.groupBy(permissions, 'resource');
    const menuUsage = this.groupBy(menuItems, 'type');

    const averageMenuDepth = this.calculateAverageMenuDepth(menuItems);
    const mostUsedItems = this.groupBy(menuItems, 'name');

    return {
      totalRoles,
      activeRoles,
      totalPermissions,
      totalMenuItems,
      visibleMenuItems,
      roleDistribution,
      permissionDistribution,
      menuUsage,
      averageMenuDepth,
      mostUsedItems
    };
  }

  /**
   * Calculate average menu depth
   */
  private calculateAverageMenuDepth(menuItems: MenuItem[]): number {
    const itemMap = new Map<string, MenuItem>();
    menuItems.forEach(item => itemMap.set(item.id, item));

    const calculateDepth = (item: MenuItem): number => {
      if (item.children.length === 0) return 1;
      const maxChildDepth = Math.max(...item.children.map(childId => {
        const child = itemMap.get(childId);
        return child ? calculateDepth(child) : 0;
      }));
      return maxChildDepth + 1;
    };

    const rootItems = menuItems.filter(item => !item.parentId);
    if (rootItems.length === 0) return 0;

    const totalDepth = rootItems.reduce((sum, item) => sum + calculateDepth(item), 0);
    return totalDepth / rootItems.length;
  }

  /**
   * Group array by property
   */
  private groupBy<T>(array: T[], property: keyof T): { [key: string]: number } {
    return array.reduce((groups, item) => {
      const key = String(item[property]);
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as { [key: string]: number });
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): MenuMetrics {
    return {
      totalRoles: 0,
      activeRoles: 0,
      totalPermissions: 0,
      totalMenuItems: 0,
      visibleMenuItems: 0,
      roleDistribution: {},
      permissionDistribution: {},
      menuUsage: {},
      averageMenuDepth: 0,
      mostUsedItems: {}
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo permissions
    const demoPermissions: Permission[] = [
      {
        id: 'perm-1',
        name: 'view_dashboard',
        resource: 'dashboard',
        action: 'read',
        isGranted: true,
        grantedAt: new Date(),
        grantedBy: 'system'
      },
      {
        id: 'perm-2',
        name: 'manage_users',
        resource: 'users',
        action: 'write',
        isGranted: true,
        grantedAt: new Date(),
        grantedBy: 'system'
      },
      {
        id: 'perm-3',
        name: 'view_reports',
        resource: 'reports',
        action: 'read',
        isGranted: true,
        grantedAt: new Date(),
        grantedBy: 'system'
      }
    ];

    this._permissions.set(demoPermissions);

    // Create demo roles
    const demoRoles: Role[] = [
      {
        id: 'role-1',
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access',
        level: 10,
        permissions: demoPermissions,
        isActive: true,
        isSystem: true,
        metadata: {
          department: 'IT',
          category: 'system',
          color: '#dc3545',
          icon: 'shield',
          tags: ['system', 'full_access']
        },
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        createdBy: 'system',
        children: []
      },
      {
        id: 'role-2',
        name: 'manager',
        displayName: 'Manager',
        description: 'Department management access',
        level: 7,
        permissions: demoPermissions.filter(p => p.id !== 'perm-2'),
        isActive: true,
        isSystem: false,
        metadata: {
          department: 'Management',
          category: 'management',
          color: '#28a745',
          icon: 'users',
          tags: ['management', 'department']
        },
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        createdBy: 'admin',
        children: []
      }
    ];

    this._roles.set(demoRoles);

    // Create demo menu items
    const demoMenuItems: MenuItem[] = [
      {
        id: 'menu-1',
        name: 'dashboard',
        displayName: 'Dashboard',
        description: 'Main dashboard',
        type: 'page',
        icon: 'home',
        url: '/dashboard',
        order: 1,
        isVisible: true,
        isEnabled: true,
        permissions: ['perm-1'],
        roles: [],
        conditions: [],
        metadata: {
          category: 'main',
          tags: ['dashboard', 'main']
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        children: []
      },
      {
        id: 'menu-2',
        name: 'users',
        displayName: 'User Management',
        description: 'Manage system users',
        type: 'page',
        icon: 'users',
        url: '/users',
        order: 2,
        isVisible: true,
        isEnabled: true,
        permissions: ['perm-2'],
        roles: ['role-1'],
        conditions: [],
        metadata: {
          category: 'administration',
          tags: ['users', 'management']
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        children: []
      }
    ];

    this._menuItems.set(demoMenuItems);

    // Create demo user roles
    const demoUserRoles: UserRole[] = [
      {
        id: 'ur-1',
        userId: 'admin',
        roleId: 'role-1',
        roleName: 'Administrator',
        isActive: true,
        assignedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        assignedBy: 'system',
        metadata: {
          reason: 'System administrator',
          department: 'IT'
        }
      }
    ];

    this._userRoles.set(demoUserRoles);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'menu-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

