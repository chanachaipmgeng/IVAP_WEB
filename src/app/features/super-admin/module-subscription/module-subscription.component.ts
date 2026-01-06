/**
 * Module Subscription Component
 *
 * Module and subscription management component for super admin.
 * Supports module management, subscription handling, tenant management, and metrics tracking with tabs.
 *
 * @example
 * ```html
 * <app-module-subscription></app-module-subscription>
 * ```
 */

import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { TabsComponent, Tab } from '../../../shared/components/tabs/tabs.component';
import { ModuleSubscriptionService, Module, Subscription, Tenant, SubscriptionMetrics } from '../../../core/services/module-subscription.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-module-subscription',
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
  templateUrl: './module-subscription.component.html',
  styleUrls: ['./module-subscription.component.scss']
})
export class ModuleSubscriptionComponent extends BaseComponent implements OnInit {
  private subscriptionService = inject(ModuleSubscriptionService);
  private i18nService = inject(I18nService);

  // Tab management
  selectedTab = signal<'overview' | 'modules' | 'subscriptions' | 'tenants'>('overview');

  // Modals
  showSubscribeModal = signal(false);
  showUpgradeModal = signal(false);
  showCancelModal = signal(false);
  loading = signal(false);
  saving = signal(false);

  // Selected items
  selectedModule = signal<Module | null>(null);
  selectedSubscription = signal<Subscription | null>(null);
  selectedTenant = signal<Tenant | null>(null);

  // Form data
  subscribeForm = {
    tenantId: '',
    plan: 'basic',
    billingCycle: 'monthly' as 'monthly' | 'quarterly' | 'yearly'
  };

  cancelReason = signal('');

  // Filters
  moduleFilter = signal({ category: '', search: '', status: '' });
  subscriptionFilter = signal({ tenantId: '', status: '', moduleId: '' });

  // Data signals
  modules = signal<Module[]>([]);
  moduleSubscriptions = signal<Subscription[]>([]);
  tenants = signal<Tenant[]>([]);
  metrics = signal<SubscriptionMetrics>(this.subscriptionService.getMetrics());

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const m = this.metrics();
    return [
      {
        icon: '📦',
        label: 'Total Modules',
        value: m.totalModules,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '💳',
        label: 'Total Subscriptions',
        value: m.totalSubscriptions,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '💰',
        label: 'Total Revenue',
        value: `$${m.totalRevenue.toFixed(2)}`,
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
      },
      {
        icon: '📉',
        label: 'Churn Rate',
        value: `${m.churnRate.toFixed(2)}%`,
        iconBgClass: 'bg-red-100 dark:bg-red-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: 'Refresh',
      variant: 'secondary',
      onClick: () => this.loadData()
    }
  ]);

  // Tabs configuration
  tabs = computed<Tab[]>(() => [
    { id: 'overview', label: '📊 Overview' },
    { id: 'modules', label: '📦 Modules' },
    { id: 'subscriptions', label: '💳 Subscriptions' },
    { id: 'tenants', label: '🏢 Tenants' }
  ]);

  // Filter fields for modules
  moduleFilterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search modules...',
      value: this.moduleFilter().search
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: '', label: 'All Categories' },
        { value: 'core', label: 'Core' },
        { value: 'analytics', label: 'Analytics' },
        { value: 'security', label: 'Security' },
        { value: 'integration', label: 'Integration' }
      ],
      value: this.moduleFilter().category
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      value: this.moduleFilter().status
    }
  ]);

  // Computed
  filteredModules = computed(() => {
    const mods = this.modules();
    const filter = this.moduleFilter();

    return mods.filter(m => {
      if (filter.category && m.category !== filter.category) return false;
      if (filter.status && m.status !== filter.status) return false;
      if (filter.search) {
        const search = filter.search.toLowerCase();
        return m.name.toLowerCase().includes(search) ||
               m.description.toLowerCase().includes(search);
      }
      return true;
    });
  });

  filteredSubscriptions = computed(() => {
    const subs = this.moduleSubscriptions();
    const filter = this.subscriptionFilter();

    return subs.filter(s => {
      if (filter.tenantId && s.tenantId !== filter.tenantId) return false;
      if (filter.moduleId && s.moduleId !== filter.moduleId) return false;
      if (filter.status && s.status !== filter.status) return false;
      return true;
    });
  });

  // Table columns
  moduleColumns: TableColumn[] = [
    { key: 'icon', label: '', render: (value) => value || '📦' },
    { key: 'name', label: 'Module', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'version', label: 'Version' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => value || 'available'
    },
    {
      key: 'pricing.basePrice',
      label: 'Price',
      render: (value, row: Module) => {
        if (row.pricing.type === 'free') return 'Free';
        if (row.pricing.type === 'per_user') return `$${row.pricing.perUserPrice}/user`;
        return `$${row.pricing.basePrice}`;
      }
    }
  ];

  subscriptionColumns: TableColumn[] = [
    { key: 'moduleId', label: 'Module', sortable: true },
    { key: 'tenantId', label: 'Tenant', sortable: true },
    { key: 'plan', label: 'Plan', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => value || 'active'
    },
    {
      key: 'price',
      label: 'Price',
      render: (value, row: Subscription) => `${row.currency} ${value}`
    },
    {
      key: 'billingCycle',
      label: 'Billing Cycle'
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  // Actions
  moduleActions: TableAction[] = [
    {
      icon: '➕',
      label: 'Subscribe',
      onClick: (row) => this.openSubscribeModal(row)
    }
  ];

  subscriptionActions: TableAction[] = [
    {
      icon: '⬆️',
      label: 'Upgrade',
      onClick: (row) => this.openUpgradeModal(row)
    },
    {
      icon: '❌',
      label: 'Cancel',
      variant: 'danger',
      onClick: (row) => this.openCancelModal(row)
    }
  ];

  ngOnInit(): void {
    this.loadData();
    this.setupSubscriptions();
  }

  private loadData(): void {
    this.modules.set(this.subscriptionService.getModules());
    // Get all subscriptions - need to get from all tenants
    const allTenants = this.subscriptionService.getTenants();
    const allSubscriptions: Subscription[] = [];
    allTenants.forEach(tenant => {
      const tenantSubs = this.subscriptionService.getSubscriptionsByTenant(tenant.id);
      allSubscriptions.push(...tenantSubs);
    });
    this.moduleSubscriptions.set(allSubscriptions);
    this.tenants.set(allTenants);
    this.metrics.set(this.subscriptionService.getMetrics());
  }

  private setupSubscriptions(): void {
    // ✅ Auto-unsubscribe on component destroy
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const modules = this.subscriptionService.modules();
      this.modules.set(modules);
    });

    effect(() => {
      const subscriptions = this.subscriptionService.subscriptions();
      this.moduleSubscriptions.set(subscriptions);
    });

    effect(() => {
      const metrics = this.subscriptionService.metrics();
      this.metrics.set(metrics);
    });
  }

  selectTab(tab: 'overview' | 'modules' | 'subscriptions' | 'tenants'): void {
    this.selectedTab.set(tab);
  }

  selectTabFromString(tab: string): void {
    const validTabs: Array<'overview' | 'modules' | 'subscriptions' | 'tenants'> =
      ['overview', 'modules', 'subscriptions', 'tenants'];
    if (validTabs.includes(tab as any)) {
      this.selectedTab.set(tab as any);
    }
  }

  onTabChange(tabId: string): void {
    this.selectedTab.set(tabId as any);
  }

  onModuleFilterChange(event: { key: string; value: any }): void {
    const filter = this.moduleFilter();
    (filter as any)[event.key] = event.value;
    this.moduleFilter.set({ ...filter });
  }

  openSubscribeModal(module: Module): void {
    this.selectedModule.set(module);
    this.subscribeForm = {
      tenantId: this.tenants()[0]?.id || '',
      plan: 'basic',
      billingCycle: 'monthly'
    };
    this.showSubscribeModal.set(true);
  }

  subscribeToModule(): void {
    if (!this.selectedModule() || !this.subscribeForm.tenantId) return;

    this.saving.set(true);
    const subscription = this.subscriptionService.subscribeToModule(
      this.subscribeForm.tenantId,
      this.selectedModule()!.id,
      this.subscribeForm.plan,
      this.subscribeForm.billingCycle
    );

    if (subscription) {
      this.loadData();
      alert('Subscription created successfully!');
    } else {
      alert('Failed to create subscription');
    }

    this.saving.set(false);
    this.closeSubscribeModal();
  }

  closeSubscribeModal(): void {
    this.showSubscribeModal.set(false);
    this.selectedModule.set(null);
  }

  openUpgradeModal(subscription: Subscription): void {
    this.selectedSubscription.set(subscription);
    this.showUpgradeModal.set(true);
  }

  upgrade(): void {
    // Implementation for upgrade
    this.closeUpgradeModal();
  }

  closeUpgradeModal(): void {
    this.showUpgradeModal.set(false);
    this.selectedSubscription.set(null);
  }

  openCancelModal(subscription: Subscription): void {
    this.selectedSubscription.set(subscription);
    this.cancelReason.set('');
    this.showCancelModal.set(true);
  }

  cancel(): void {
    if (!this.selectedSubscription()) return;

    this.saving.set(true);
    const success = this.subscriptionService.cancelSubscription(
      this.selectedSubscription()!.id,
      this.cancelReason()
    );

    if (success) {
      this.loadData();
      alert('Subscription cancelled successfully!');
    } else {
      alert('Failed to cancel subscription');
    }

    this.saving.set(false);
    this.closeCancelModal();
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.selectedSubscription.set(null);
    this.cancelReason.set('');
  }

  getModuleName(moduleId: string): string {
    const module = this.modules().find(m => m.id === moduleId);
    return module?.name || moduleId;
  }

  getTenantName(tenantId: string): string {
    const tenant = this.tenants().find(t => t.id === tenantId);
    return tenant?.name || tenantId;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      expired: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      suspended: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };
    return classes[status] || '';
  }

  t(key: string): string {
    return this.i18nService.translate(key);
  }
}

