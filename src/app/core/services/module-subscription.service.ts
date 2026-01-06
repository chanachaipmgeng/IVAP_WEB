import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Module,
  ModuleFeature,
  PricingTier,
  Subscription,
  Tenant
} from '../models/module-subscription.model';

// Re-export for backward compatibility
export type {
  Module,
  ModuleFeature,
  PricingTier,
  Subscription,
  Tenant
} from '../models/module-subscription.model';

// Additional interfaces specific to this service
export interface SubscriptionMetrics {
  totalModules: number;
  activeModules: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  moduleDistribution: { [key: string]: number };
  planDistribution: { [key: string]: number };
  revenueByModule: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class ModuleSubscriptionService {
  // ✅ Signals for reactive state
  private _modules = signal<Module[]>([]);
  private _subscriptions = signal<Subscription[]>([]);
  private _tenants = signal<Tenant[]>([]);
  private _metrics = signal<SubscriptionMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly modules = this._modules.asReadonly();
  public readonly subscriptions = this._subscriptions.asReadonly();
  public readonly tenants = this._tenants.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly modulesCount = computed(() => this._modules().length);
  public readonly availableModulesCount = computed(() => this._modules().filter(m => m.status === 'available').length);
  public readonly subscriptionsCount = computed(() => this._subscriptions().length);
  public readonly activeSubscriptionsCount = computed(() => this._subscriptions().filter(s => s.status === 'active').length);
  public readonly tenantsCount = computed(() => this._tenants().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public modules$ = new Observable<Module[]>(observer => {
    observer.next(this._modules());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public subscriptions$ = new Observable<Subscription[]>(observer => {
    observer.next(this._subscriptions());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public tenants$ = new Observable<Tenant[]>(observer => {
    observer.next(this._tenants());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public metrics$ = new Observable<SubscriptionMetrics>(observer => {
    observer.next(this._metrics());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Get all modules
   */
  getModules(): Module[] {
    return this._modules();
  }

  /**
   * Get module by ID
   */
  getModule(moduleId: string): Module | undefined {
    return this._modules().find(m => m.id === moduleId);
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: string): Module[] {
    return this._modules().filter(m => m.category === category);
  }

  /**
   * Get available modules for tenant
   */
  getAvailableModules(tenantId: string): Module[] {
    const tenant = this._tenants().find(t => t.id === tenantId);
    if (!tenant) return [];

    const subscribedModules = this.getSubscriptionsByTenant(tenantId)
      .map(s => s.moduleId);

    return this._modules().filter(m =>
      m.status === 'available' && !subscribedModules.includes(m.id)
    );
  }

  /**
   * Subscribe to module
   */
  subscribeToModule(tenantId: string, moduleId: string, plan: string, billingCycle: 'monthly' | 'quarterly' | 'yearly'): Subscription | null {
    const module = this.getModule(moduleId);
    const tenant = this._tenants().find(t => t.id === tenantId);

    if (!module || !tenant) return null;

    // Check if already subscribed
    const existingSubscription = this.getSubscriptionsByTenant(tenantId)
      .find(s => s.moduleId === moduleId);

    if (existingSubscription) return null;

    // Calculate price
    const price = this.calculatePrice(module, plan, billingCycle);

    // Create subscription
    const subscription: Subscription = {
      id: this.generateId(),
      moduleId,
      tenantId,
      status: 'trial',
      plan,
      startDate: new Date(),
      endDate: new Date(Date.now() + (module.trialDays || 30) * 24 * 60 * 60 * 1000),
      autoRenew: true,
      billingCycle,
      price,
      currency: module.pricing.currency,
      features: module.features.filter(f => f.isIncluded).map(f => f.id),
      limits: {
        users: module.requirements.maxUsers || module.requirements.minUsers,
        storage: module.requirements.storage,
        apiCalls: module.requirements.apiCalls,
        bandwidth: module.requirements.bandwidth
      },
      usage: {
        users: 0,
        storage: 0,
        apiCalls: 0,
        bandwidth: 0
      }
    };

    this._subscriptions.update(subscriptions => [...subscriptions, subscription]);

    // Update tenant modules
    if (!tenant.modules) {
      tenant.modules = [];
    }
    tenant.modules.push(moduleId);
    this.updateTenant(tenant);

    this.updateMetrics();
    return subscription;
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(subscriptionId: string, reason?: string): boolean {
    const subscriptions = this._subscriptions();
    const subscription = subscriptions.find(s => s.id === subscriptionId);

    if (!subscription) return false;

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    subscription.notes = reason;

    this._subscriptions.set([...subscriptions]);

    // Update tenant modules
    const tenant = this._tenants().find((t: Tenant) => t.id === subscription.tenantId);
    if (tenant && tenant.modules) {
      tenant.modules = tenant.modules.filter((m: string) => m !== subscription.moduleId);
      this.updateTenant(tenant);
    }

    this.updateMetrics();
    return true;
  }

  /**
   * Upgrade subscription
   */
  upgradeSubscription(subscriptionId: string, newPlan: string, newBillingCycle: 'monthly' | 'quarterly' | 'yearly'): boolean {
    const subscriptions = this._subscriptions();
    const subscription = subscriptions.find(s => s.id === subscriptionId);

    if (!subscription) return false;

    const module = this.getModule(subscription.moduleId);
    if (!module) return false;

    const newPrice = this.calculatePrice(module, newPlan, newBillingCycle);

    subscription.plan = newPlan;
    subscription.billingCycle = newBillingCycle;
    subscription.price = newPrice;
    subscription.lastBillingDate = new Date();
    subscription.nextBillingDate = this.calculateNextBillingDate(newBillingCycle);

    this._subscriptions.set([...subscriptions]);
    this.updateMetrics();
    return true;
  }

  /**
   * Get subscriptions by tenant
   */
  getSubscriptionsByTenant(tenantId: string): Subscription[] {
    return this._subscriptions().filter(s => s.tenantId === tenantId);
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): Subscription | undefined {
    return this._subscriptions().find(s => s.id === subscriptionId);
  }

  /**
   * Update subscription usage
   */
  updateSubscriptionUsage(subscriptionId: string, usage: Partial<Subscription['usage']>): boolean {
    const subscriptions = this._subscriptions();
    const subscription = subscriptions.find(s => s.id === subscriptionId);

    if (!subscription) return false;

    subscription.usage = { ...subscription.usage, ...usage };
    this._subscriptions.set([...subscriptions]);
    this.updateMetrics();
    return true;
  }

  /**
   * Get tenants
   */
  getTenants(): Tenant[] {
    return this._tenants();
  }

  /**
   * Get tenant by ID
   */
  getTenant(tenantId: string): Tenant | undefined {
    return this._tenants().find(t => t.id === tenantId);
  }

  /**
   * Create tenant
   */
  createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'usage'>): Tenant {
    const newTenant: Tenant = {
      ...tenant,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: {
        users: 0,
        storage: 0,
        apiCalls: 0,
        bandwidth: 0
      }
    };

    this._tenants.update(tenants => [...tenants, newTenant]);

    return newTenant;
  }

  /**
   * Update tenant
   */
  updateTenant(tenant: Tenant): void {
    const tenants = this._tenants();
    const index = tenants.findIndex(t => t.id === tenant.id);

    if (index !== -1) {
      tenants[index] = { ...tenant, updatedAt: new Date() };
      this._tenants.set([...tenants]);
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): SubscriptionMetrics {
    return this._metrics();
  }

  /**
   * Generate subscription report
   */
  generateSubscriptionReport(options: {
    tenantId?: string;
    moduleId?: string;
    dateFrom: Date;
    dateTo: Date;
    includeUsage?: boolean;
  }): any {
    let subscriptions = this._subscriptions();

    if (options.tenantId) {
      subscriptions = subscriptions.filter((s: Subscription) => s.tenantId === options.tenantId);
    }
    if (options.moduleId) {
      subscriptions = subscriptions.filter((s: Subscription) => s.moduleId === options.moduleId);
    }

    const report = {
      period: {
        from: options.dateFrom,
        to: options.dateTo
      },
      summary: {
        totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter((s: Subscription) => s.status === 'active').length,
      trialSubscriptions: subscriptions.filter((s: Subscription) => s.status === 'trial').length,
      totalRevenue: subscriptions.reduce((sum: number, s: Subscription) => sum + s.price, 0),
        averagePrice: subscriptions.length > 0 ?
          subscriptions.reduce((sum: number, s: Subscription) => sum + s.price, 0) / subscriptions.length : 0
      },
      subscriptions: options.includeUsage ? subscriptions : subscriptions.map((s: Subscription) => ({
        id: s.id,
        moduleId: s.moduleId,
        tenantId: s.tenantId,
        status: s.status,
        plan: s.plan,
        price: s.price,
        currency: s.currency,
        startDate: s.startDate,
        endDate: s.endDate
      })),
      generatedAt: new Date()
    };

    return report;
  }

  /**
   * Calculate price
   */
  private calculatePrice(module: Module, plan: string, billingCycle: 'monthly' | 'quarterly' | 'yearly'): number {
    let basePrice = module.pricing.basePrice;

    // Apply plan multiplier
    const planMultipliers = {
      'basic': 1,
      'standard': 1.5,
      'premium': 2,
      'enterprise': 3
    };
    basePrice *= planMultipliers[plan as keyof typeof planMultipliers] || 1;

    // Apply billing cycle discount
    const cycleDiscounts = {
      'monthly': 1,
      'quarterly': 0.95,
      'yearly': 0.85
    };
    basePrice *= cycleDiscounts[billingCycle];

    return Math.round(basePrice * 100) / 100;
  }

  /**
   * Calculate next billing date
   */
  private calculateNextBillingDate(billingCycle: 'monthly' | 'quarterly' | 'yearly'): Date {
    const now = new Date();
    switch (billingCycle) {
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      case 'yearly':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const modules = this._modules();
    const subscriptions = this._subscriptions();
    const metrics = this.calculateMetrics(modules, subscriptions);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(modules: Module[], subscriptions: Subscription[]): SubscriptionMetrics {
    const totalModules = modules.length;
    const activeModules = modules.filter(m => m.isActive).length;
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const trialSubscriptions = subscriptions.filter(s => s.status === 'trial').length;
    const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired').length;

    const totalRevenue = subscriptions.reduce((sum, s) => sum + s.price, 0);
    const monthlyRecurringRevenue = subscriptions
      .filter(s => s.status === 'active' && s.billingCycle === 'monthly')
      .reduce((sum, s) => sum + s.price, 0);

    const averageRevenuePerUser = subscriptions.length > 0 ? totalRevenue / subscriptions.length : 0;
    const churnRate = expiredSubscriptions / Math.max(totalSubscriptions, 1) * 100;

    const moduleDistribution = this.groupBy(subscriptions, 'moduleId');
    const planDistribution = this.groupBy(subscriptions, 'plan');
    const revenueByModule = subscriptions.reduce((acc, s) => {
      acc[s.moduleId] = (acc[s.moduleId] || 0) + s.price;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalModules,
      activeModules,
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
      totalRevenue,
      monthlyRecurringRevenue,
      averageRevenuePerUser,
      churnRate,
      moduleDistribution,
      planDistribution,
      revenueByModule
    };
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
  private getDefaultMetrics(): SubscriptionMetrics {
    return {
      totalModules: 0,
      activeModules: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      trialSubscriptions: 0,
      expiredSubscriptions: 0,
      totalRevenue: 0,
      monthlyRecurringRevenue: 0,
      averageRevenuePerUser: 0,
      churnRate: 0,
      moduleDistribution: {},
      planDistribution: {},
      revenueByModule: {}
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo modules
    const demoModules: Module[] = [
      {
        id: 'module-1',
        name: 'Video Analytics',
        description: 'Advanced video analytics and AI-powered object detection',
        category: 'analytics',
        version: '2.1.0',
        isActive: true,
        isRequired: false,
        features: [
          { id: 'real-time-detection', name: 'Real-time Detection', description: 'Real-time object detection', isIncluded: true, isOptional: false, isPremium: false },
          { id: 'ai-analysis', name: 'AI Analysis', description: 'AI-powered video analysis', isIncluded: true, isOptional: false, isPremium: true },
          { id: 'custom-models', name: 'Custom Models', description: 'Custom AI model training', isIncluded: false, isOptional: true, isPremium: true }
        ],
        pricing: {
          type: 'tiered',
          basePrice: 99,
          currency: 'USD',
          tiers: [
            { id: 'basic', name: 'Basic', description: 'Basic video analytics', minUsers: 1, maxUsers: 10, price: 99, features: ['real-time-detection'], isPopular: false },
            { id: 'standard', name: 'Standard', description: 'Standard video analytics', minUsers: 11, maxUsers: 50, price: 199, features: ['real-time-detection', 'ai-analysis'], isPopular: true },
            { id: 'premium', name: 'Premium', description: 'Premium video analytics', minUsers: 51, maxUsers: 200, price: 399, features: ['real-time-detection', 'ai-analysis', 'custom-models'], isPopular: false }
          ]
        },
        dependencies: ['core'],
        requirements: {
          minUsers: 1,
          maxUsers: 200,
          storage: 100,
          bandwidth: 1000,
          apiCalls: 10000
        },
        status: 'available',
        trialDays: 30,
        lastUpdated: new Date(),
        icon: '📹',
        documentation: 'https://docs.company.com/video-analytics',
        supportLevel: 'standard'
      },
      {
        id: 'module-2',
        name: 'Face Recognition',
        description: 'Advanced face recognition and biometric authentication',
        category: 'security',
        version: '1.5.0',
        isActive: true,
        isRequired: false,
        features: [
          { id: 'face-detection', name: 'Face Detection', description: 'Real-time face detection', isIncluded: true, isOptional: false, isPremium: false },
          { id: 'face-recognition', name: 'Face Recognition', description: 'Face recognition and matching', isIncluded: true, isOptional: false, isPremium: true },
          { id: 'liveness-detection', name: 'Liveness Detection', description: 'Anti-spoofing liveness detection', isIncluded: false, isOptional: true, isPremium: true }
        ],
        pricing: {
          type: 'per_user',
          basePrice: 0,
          currency: 'USD',
          perUserPrice: 5
        },
        dependencies: ['core'],
        requirements: {
          minUsers: 1,
          storage: 50,
          bandwidth: 500,
          apiCalls: 5000
        },
        status: 'available',
        trialDays: 14,
        lastUpdated: new Date(),
        icon: '👤',
        documentation: 'https://docs.company.com/face-recognition',
        supportLevel: 'premium'
      },
      {
        id: 'module-3',
        name: 'Safety Monitoring',
        description: 'Workplace safety monitoring and violation detection',
        category: 'safety',
        version: '1.0.0',
        isActive: true,
        isRequired: false,
        features: [
          { id: 'safety-detection', name: 'Safety Detection', description: 'Safety violation detection', isIncluded: true, isOptional: false, isPremium: false },
          { id: 'environment-monitoring', name: 'Environment Monitoring', description: 'Environmental safety monitoring', isIncluded: true, isOptional: false, isPremium: true },
          { id: 'equipment-monitoring', name: 'Equipment Monitoring', description: 'Equipment health monitoring', isIncluded: false, isOptional: true, isPremium: true }
        ],
        pricing: {
          type: 'custom',
          basePrice: 0,
          currency: 'USD',
          customPrice: 299
        },
        dependencies: ['core', 'analytics'],
        requirements: {
          minUsers: 10,
          storage: 200,
          bandwidth: 2000,
          apiCalls: 20000
        },
        status: 'available',
        trialDays: 7,
        lastUpdated: new Date(),
        icon: '🛡️',
        documentation: 'https://docs.company.com/safety-monitoring',
        supportLevel: 'enterprise'
      }
    ];

    this._modules.set(demoModules);

    // Create demo tenants
    const demoTenants: Tenant[] = [
      {
        id: 'tenant-1',
        name: 'Acme Corporation',
        domain: 'acme.com',
        subdomain: 'acme',
        status: 'active',
        plan: 'enterprise',
        modules: ['module-1', 'module-2'],
        limits: {
          maxUsers: 1000,
          maxStorage: 1000,
          maxApiCalls: 100000,
          maxBandwidth: 10000
        },
        usage: {
          users: 150,
          storage: 250,
          apiCalls: 15000,
          bandwidth: 2000
        },
        billing: {
          address: '123 Business St',
          city: 'New York',
          country: 'USA',
          postalCode: '10001',
          taxId: '12-3456789',
          paymentMethod: 'credit_card'
        },
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        createdBy: 'admin'
      }
    ];

    this._tenants.set(demoTenants);

    // Create demo subscriptions
    const demoSubscriptions: Subscription[] = [
      {
        id: 'sub-1',
        moduleId: 'module-1',
        tenantId: 'tenant-1',
        status: 'active',
        plan: 'standard',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        billingCycle: 'monthly',
        price: 199,
        currency: 'USD',
        features: ['real-time-detection', 'ai-analysis'],
        limits: {
          users: 50,
          storage: 100,
          apiCalls: 10000,
          bandwidth: 1000
        },
        usage: {
          users: 25,
          storage: 45,
          apiCalls: 3500,
          bandwidth: 400
        },
        lastBillingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMethod: 'credit_card'
      }
    ];

    this._subscriptions.set(demoSubscriptions);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

