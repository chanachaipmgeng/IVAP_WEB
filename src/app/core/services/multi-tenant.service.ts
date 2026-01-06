import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  plan: 'basic' | 'standard' | 'premium' | 'enterprise';
  features: {
    [key: string]: boolean;
  };
  limits: {
    maxUsers: number;
    maxDevices: number;
    maxStorage: number; // in GB
    maxApiCalls: number;
    maxReports: number;
  };
  usage: {
    users: number;
    devices: number;
    storage: number; // in GB
    apiCalls: number;
    reports: number;
  };
  settings: {
    [key: string]: any;
  };
  billing: {
    cycle: 'monthly' | 'yearly';
    amount: number;
    currency: string;
    nextBilling: Date;
    status: 'active' | 'past_due' | 'canceled';
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'user' | 'viewer';
  permissions: {
    [key: string]: boolean;
  };
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantConfig {
  id: string;
  tenantId: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  suspendedTenants: number;
  tenantsByPlan: { [key: string]: number };
  totalUsers: number;
  totalDevices: number;
  totalStorage: number;
  totalApiCalls: number;
  totalRevenue: number;
  averageUsage: number;
  lastActivity: Date | null;
}

export interface MultiTenantConfig {
  enabled: boolean;
  defaultPlan: 'basic' | 'standard' | 'premium' | 'enterprise';
  allowSubdomains: boolean;
  allowCustomDomains: boolean;
  maxTenantsPerUser: number;
  autoProvisioning: boolean;
  dataIsolation: 'shared' | 'separate' | 'hybrid';
  billingEnabled: boolean;
  usageTracking: boolean;
  auditLogging: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MultiTenantService {
  private tenantsMap: Map<string, Tenant> = new Map();
  private tenantUsersMap: Map<string, TenantUser> = new Map();
  private tenantConfigsMap: Map<string, TenantConfig> = new Map();
  private configData: MultiTenantConfig = this.getDefaultConfig();
  private _currentTenant = signal<Tenant | null>(null);

  // ✅ Signals for reactive state
  private _tenants = signal<Tenant[]>([]);
  private _tenantUsers = signal<TenantUser[]>([]);
  private _tenantConfigs = signal<TenantConfig[]>([]);
  private _stats = signal<TenantStats>(this.getInitialStats());
  private _config = signal<MultiTenantConfig>(this.configData);

  // ✅ Readonly signals for public access
  public readonly tenants = this._tenants.asReadonly();
  public readonly tenantUsers = this._tenantUsers.asReadonly();
  public readonly tenantConfigs = this._tenantConfigs.asReadonly();
  public readonly stats = this._stats.asReadonly();
  public readonly config = this._config.asReadonly();
  public readonly currentTenant = this._currentTenant.asReadonly();

  // ✅ Computed signals for derived state
  public readonly tenantsCount = computed(() => this._tenants().length);
  public readonly activeTenantsCount = computed(() => this._tenants().filter(t => t.status === 'active').length);
  public readonly tenantUsersCount = computed(() => this._tenantUsers().length);

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize service
   */
  private initializeService(): void {
    this.loadConfig();
    this.loadTenants();
    this.loadTenantUsers();
    this.loadTenantConfigs();
    this.detectCurrentTenant();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): MultiTenantConfig {
    return {
      enabled: true,
      defaultPlan: 'basic',
      allowSubdomains: true,
      allowCustomDomains: false,
      maxTenantsPerUser: 5,
      autoProvisioning: false,
      dataIsolation: 'separate',
      billingEnabled: true,
      usageTracking: true,
      auditLogging: true
    };
  }

  /**
   * Get initial stats
   */
  private getInitialStats(): TenantStats {
    return {
      totalTenants: 0,
      activeTenants: 0,
      inactiveTenants: 0,
      suspendedTenants: 0,
      tenantsByPlan: {},
      totalUsers: 0,
      totalDevices: 0,
      totalStorage: 0,
      totalApiCalls: 0,
      totalRevenue: 0,
      averageUsage: 0,
      lastActivity: null
    };
  }

  /**
   * Load configuration
   */
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('multi_tenant_config');
      if (stored) {
        this.configData = { ...this.configData, ...JSON.parse(stored) };
        this._config.set(this.configData);
      }
    } catch (error) {
      console.error('Failed to load multi-tenant config:', error);
    }
  }

  /**
   * Save configuration
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('multi_tenant_config', JSON.stringify(this.configData));
    } catch (error) {
      console.error('Failed to save multi-tenant config:', error);
    }
  }

  /**
   * Load tenants
   */
  private loadTenants(): void {
    try {
      const stored = localStorage.getItem('multi_tenant_tenants');
      if (stored) {
        const tenants = JSON.parse(stored);
        tenants.forEach((tenant: any) => {
          tenant.createdAt = new Date(tenant.createdAt);
          tenant.updatedAt = new Date(tenant.updatedAt);
          tenant.billing.nextBilling = new Date(tenant.billing.nextBilling);
          this.tenantsMap.set(tenant.id, tenant);
        });
        this._tenants.set(Array.from(this.tenantsMap.values()));
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  }

  /**
   * Save tenants
   */
  private saveTenants(): void {
    try {
      const tenants = Array.from(this.tenantsMap.values());
      localStorage.setItem('multi_tenant_tenants', JSON.stringify(tenants));
    } catch (error) {
      console.error('Failed to save tenants:', error);
    }
  }

  /**
   * Load tenant users
   */
  private loadTenantUsers(): void {
    try {
      const stored = localStorage.getItem('multi_tenant_users');
      if (stored) {
        const users = JSON.parse(stored);
        users.forEach((user: any) => {
          user.createdAt = new Date(user.createdAt);
          user.updatedAt = new Date(user.updatedAt);
          user.lastLogin = user.lastLogin ? new Date(user.lastLogin) : undefined;
          this.tenantUsersMap.set(user.id, user);
        });
        this._tenantUsers.set(Array.from(this.tenantUsersMap.values()));
      }
    } catch (error) {
      console.error('Failed to load tenant users:', error);
    }
  }

  /**
   * Save tenant users
   */
  private saveTenantUsers(): void {
    try {
      const users = Array.from(this.tenantUsersMap.values());
      localStorage.setItem('multi_tenant_users', JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save tenant users:', error);
    }
  }

  /**
   * Load tenant configs
   */
  private loadTenantConfigs(): void {
    try {
      const stored = localStorage.getItem('multi_tenant_configs');
      if (stored) {
        const configs = JSON.parse(stored);
        configs.forEach((config: any) => {
          config.createdAt = new Date(config.createdAt);
          config.updatedAt = new Date(config.updatedAt);
          this.tenantConfigsMap.set(config.id, config);
        });
        this._tenantConfigs.set(Array.from(this.tenantConfigsMap.values()));
      }
    } catch (error) {
      console.error('Failed to load tenant configs:', error);
    }
  }

  /**
   * Save tenant configs
   */
  private saveTenantConfigs(): void {
    try {
      const configs = Array.from(this.tenantConfigsMap.values());
      localStorage.setItem('multi_tenant_configs', JSON.stringify(configs));
    } catch (error) {
      console.error('Failed to save tenant configs:', error);
    }
  }

  /**
   * Detect current tenant
   */
  private detectCurrentTenant(): void {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];

    if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
      const tenant = Array.from(this.tenantsMap.values())
        .find(t => t.subdomain === subdomain);

      if (tenant) {
        this.setCurrentTenant(tenant);
      }
    }
  }

  /**
   * Create tenant
   */
  public createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'usage' | 'billing'>): string {
    const id = this.generateId();
    const newTenant: Tenant = {
      ...tenant,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: {
        users: 0,
        devices: 0,
        storage: 0,
        apiCalls: 0,
        reports: 0
      },
      billing: {
        cycle: 'monthly',
        amount: this.getPlanAmount(tenant.plan),
        currency: 'USD',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      }
    };

    this.tenantsMap.set(id, newTenant);
    this._tenants.set(Array.from(this.tenantsMap.values()));
    this.saveTenants();
    this.updateStats();
    return id;
  }

  /**
   * Get plan amount
   */
  private getPlanAmount(plan: string): number {
    const amounts = {
      basic: 29,
      standard: 79,
      premium: 199,
      enterprise: 499
    };
    return amounts[plan as keyof typeof amounts] || 29;
  }

  /**
   * Update tenant
   */
  public updateTenant(id: string, updates: Partial<Tenant>): void {
    const tenant = this.tenantsMap.get(id);
    if (tenant) {
      const updatedTenant = { ...tenant, ...updates, updatedAt: new Date() };
      this.tenantsMap.set(id, updatedTenant);
      this._tenants.set(Array.from(this.tenantsMap.values()));
      this.saveTenants();
      this.updateStats();
    }
  }

  /**
   * Delete tenant
   */
  public deleteTenant(id: string): void {
    this.tenantsMap.delete(id);
    this._tenants.set(Array.from(this.tenantsMap.values()));
    this.saveTenants();
    this.updateStats();
  }

  /**
   * Set current tenant
   */
  public setCurrentTenant(tenant: Tenant): void {
    this._currentTenant.set(tenant);
  }

  /**
   * Get current tenant
   */
  public getCurrentTenant(): Tenant | null {
    return this._currentTenant();
  }

  /**
   * Switch tenant
   */
  public switchTenant(tenantId: string): boolean {
    const tenant = this._tenants().find(t => t.id === tenantId);
    if (tenant) {
      this.setCurrentTenant(tenant);
      return true;
    }
    return false;
  }

  /**
   * Add tenant user
   */
  public addTenantUser(user: Omit<TenantUser, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newUser: TenantUser = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tenantUsersMap.set(id, newUser);
    this._tenantUsers.set(Array.from(this.tenantUsersMap.values()));
    this.saveTenantUsers();
    this.updateStats();
    return id;
  }

  /**
   * Update tenant user
   */
  public updateTenantUser(id: string, updates: Partial<TenantUser>): void {
    const user = this.tenantUsersMap.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      this.tenantUsersMap.set(id, updatedUser);
      this._tenantUsers.set(Array.from(this.tenantUsersMap.values()));
      this.saveTenantUsers();
    }
  }

  /**
   * Remove tenant user
   */
  public removeTenantUser(id: string): void {
    this.tenantUsersMap.delete(id);
    this._tenantUsers.set(Array.from(this.tenantUsersMap.values()));
    this.saveTenantUsers();
    this.updateStats();
  }

  /**
   * Get users by tenant
   */
  public getUsersByTenant(tenantId: string): TenantUser[] {
    return Array.from(this.tenantUsersMap.values())
      .filter(user => user.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Set tenant config
   */
  public setTenantConfig(tenantId: string, key: string, value: any, type: string, description?: string, isSecret: boolean = false): string {
    const id = this.generateId();
    const config: TenantConfig = {
      id,
      tenantId,
      key,
      value,
      type: type as any,
      description,
      isSecret,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tenantConfigsMap.set(id, config);
    this._tenantConfigs.set(Array.from(this.tenantConfigsMap.values()));
    this.saveTenantConfigs();
    return id;
  }

  /**
   * Get tenant config
   */
  public getTenantConfig(tenantId: string, key: string): any {
    const config = Array.from(this.tenantConfigsMap.values())
      .find(c => c.tenantId === tenantId && c.key === key);
    return config ? config.value : null;
  }

  /**
   * Get all tenant configs
   */
  public getTenantConfigs(tenantId: string): TenantConfig[] {
    return Array.from(this.tenantConfigsMap.values())
      .filter(c => c.tenantId === tenantId)
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  /**
   * Update tenant config
   */
  public updateTenantConfig(id: string, updates: Partial<TenantConfig>): void {
    const config = this.tenantConfigsMap.get(id);
    if (config) {
      const updatedConfig = { ...config, ...updates, updatedAt: new Date() };
      this.tenantConfigsMap.set(id, updatedConfig);
      this._tenantConfigs.set(Array.from(this.tenantConfigsMap.values()));
      this.saveTenantConfigs();
    }
  }

  /**
   * Delete tenant config
   */
  public deleteTenantConfig(id: string): void {
    this.tenantConfigsMap.delete(id);
    this._tenantConfigs.set(Array.from(this.tenantConfigsMap.values()));
    this.saveTenantConfigs();
  }

  /**
   * Update tenant usage
   */
  public updateTenantUsage(tenantId: string, usage: Partial<Tenant['usage']>): void {
    this._tenants.update(tenants => {
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
        tenant.usage = { ...tenant.usage, ...usage };
        tenant.updatedAt = new Date();
      }
      return [...tenants];
    });
    this.updateStats();
  }

  /**
   * Check tenant limits
   */
  public checkTenantLimits(tenantId: string): { [key: string]: { current: number; limit: number; exceeded: boolean } } {
    const tenant = this._tenants().find(t => t.id === tenantId);
    if (!tenant) return {};

    const limits = tenant.limits;
    const usage = tenant.usage;

    return {
      users: {
        current: usage.users,
        limit: limits.maxUsers,
        exceeded: usage.users >= limits.maxUsers
      },
      devices: {
        current: usage.devices,
        limit: limits.maxDevices,
        exceeded: usage.devices >= limits.maxDevices
      },
      storage: {
        current: usage.storage,
        limit: limits.maxStorage,
        exceeded: usage.storage >= limits.maxStorage
      },
      apiCalls: {
        current: usage.apiCalls,
        limit: limits.maxApiCalls,
        exceeded: usage.apiCalls >= limits.maxApiCalls
      },
      reports: {
        current: usage.reports,
        limit: limits.maxReports,
        exceeded: usage.reports >= limits.maxReports
      }
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<MultiTenantConfig>): void {
    this.configData = { ...this.configData, ...updates };
    this._config.set(this.configData);
    this.saveConfig();
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const tenants = Array.from(this.tenantsMap.values());
    const users = Array.from(this.tenantUsersMap.values());

    const newStats: TenantStats = {
      totalTenants: tenants.length,
      activeTenants: tenants.filter(t => t.status === 'active').length,
      inactiveTenants: tenants.filter(t => t.status === 'inactive').length,
      suspendedTenants: tenants.filter(t => t.status === 'suspended').length,
      tenantsByPlan: this.groupTenantsByPlan(tenants),
      totalUsers: users.length,
      totalDevices: tenants.reduce((sum, t) => sum + t.usage.devices, 0),
      totalStorage: tenants.reduce((sum, t) => sum + t.usage.storage, 0),
      totalApiCalls: tenants.reduce((sum, t) => sum + t.usage.apiCalls, 0),
      totalRevenue: tenants.reduce((sum, t) => sum + t.billing.amount, 0),
      averageUsage: this.calculateAverageUsage(tenants),
      lastActivity: tenants.length > 0 ? tenants[0].updatedAt : null
    };

    this._stats.set(newStats);
  }

  /**
   * Group tenants by plan
   */
  private groupTenantsByPlan(tenants: Tenant[]): { [key: string]: number } {
    return tenants.reduce((acc, tenant) => {
      acc[tenant.plan] = (acc[tenant.plan] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  /**
   * Calculate average usage
   */
  private calculateAverageUsage(tenants: Tenant[]): number {
    if (tenants.length === 0) return 0;
    const totalUsage = tenants.reduce((sum, tenant) => {
      return sum + tenant.usage.users + tenant.usage.devices + tenant.usage.storage;
    }, 0);
    return totalUsage / tenants.length;
  }

  /**
   * Get current configuration
   */
  public getConfig(): MultiTenantConfig {
    return { ...this.configData };
  }

  /**
   * Get current statistics
   */
  public getStats(): TenantStats {
    return this._stats();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'tenant_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.tenantsMap.clear();
    this.tenantUsersMap.clear();
    this.tenantConfigsMap.clear();
  }
}

