/**
 * Module Subscription Models
 * Models สำหรับ Module Subscription Service
 */

export type ModuleCategory = 'core' | 'analytics' | 'security' | 'integration' | 'reporting' | 'mobile' | 'ai' | 'safety';
export type PricingType = 'free' | 'tiered' | 'per_user' | 'per_feature' | 'custom';
export type ModuleStatus = 'available' | 'subscribed' | 'trial' | 'expired' | 'suspended' | 'deprecated';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'suspended' | 'cancelled';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'trial';
export type TenantPlan = 'free' | 'basic' | 'professional' | 'enterprise' | 'custom';
export type SupportLevel = 'basic' | 'standard' | 'premium' | 'enterprise';

/**
 * Module Feature Model
 */
export interface ModuleFeature {
  id: string;
  name: string;
  description: string;
  isIncluded: boolean;
  isOptional: boolean;
  isPremium: boolean;
  limits?: {
    maxValue?: number;
    unlimited?: boolean;
  };
}

/**
 * Pricing Tier Model
 */
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  minUsers: number;
  maxUsers?: number;
  price: number;
  features: string[];
  isPopular: boolean;
}

/**
 * Module Model
 */
export interface Module {
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  version: string;
  isActive: boolean;
  isRequired: boolean;
  features: ModuleFeature[];
  pricing: {
    type: PricingType;
    basePrice: number;
    currency: string;
    tiers?: PricingTier[];
    perUserPrice?: number;
    customPrice?: number;
  };
  dependencies: string[];
  requirements: {
    minUsers: number;
    maxUsers?: number;
    storage: number; // in GB
    bandwidth: number; // in GB
    apiCalls: number; // per month
  };
  status: ModuleStatus;
  trialDays?: number;
  subscriptionStart?: Date | string;
  subscriptionEnd?: Date | string;
  lastUpdated: Date | string;
  icon: string;
  documentation: string;
  supportLevel: SupportLevel;
}

/**
 * Subscription Model
 */
export interface Subscription {
  id: string;
  moduleId: string;
  tenantId: string;
  status: SubscriptionStatus;
  plan: string;
  startDate: Date | string;
  endDate?: Date | string;
  autoRenew: boolean;
  billingCycle: BillingCycle;
  price: number;
  currency: string;
  features: string[];
  limits: {
    users: number;
    storage: number;
    apiCalls: number;
    bandwidth: number;
  };
  usage: {
    users: number;
    storage: number;
    apiCalls: number;
    bandwidth: number;
  };
  lastBillingDate?: Date | string;
  nextBillingDate?: Date | string;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Tenant Model
 */
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  status: TenantStatus;
  plan: TenantPlan;
  modules?: string[];
  limits?: {
    maxUsers: number;
    maxStorage: number;
    maxApiCalls: number;
    maxBandwidth: number;
  };
  usage?: {
    users: number;
    storage: number;
    apiCalls: number;
    bandwidth: number;
  };
  billing?: {
    address: string;
    city: string;
    country: string;
    postalCode: string;
    taxId?: string;
    paymentMethod?: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
  settings?: Record<string, any>;
}

