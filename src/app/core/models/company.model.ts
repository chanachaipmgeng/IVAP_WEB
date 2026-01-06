export interface Company {
  // Primary fields matching backend schema (CompanyResponse)
  id: string;  // company_id from backend
  name: string;  // company_name from backend
  code: string;  // company_code from backend
  description: string;  // company_info from backend (mapped from company_info)
  address: string;  // address from backend
  latitude: number;  // latitude from backend (REQUIRED in backend)
  longitude: number;  // longitude from backend (REQUIRED in backend)
  picture?: string;  // picture from backend (optional)
  status: 'public' | 'pending' | number;  // status from backend (PublicType: 1=PUBLIC, 2=PENDING)
  ownerName: string;  // owner_name from backend (REQUIRED in backend)
  contact: string;  // contact from backend (REQUIRED in backend)
  
  // Timestamps
  createdAt: string;  // created_at from backend
  updatedAt: string;  // updated_at from backend
  
  // Optional extended fields (may not exist in backend, but kept for compatibility)
  phone?: string;  // May be extracted from contact
  email?: string;  // May be extracted from contact
  website?: string;  // Not in backend schema
  logo?: string;  // Use picture instead
  city?: string;  // Not in backend schema
  state?: string;  // Not in backend schema
  country?: string;  // Not in backend schema
  postalCode?: string;  // Not in backend schema
  subscriptionType?: 'trial' | 'basic' | 'premium' | 'enterprise';  // Not in backend schema
  maxUsers?: number;  // Not in backend schema
  maxDevices?: number;  // Not in backend schema
  features?: string[];  // Not in backend schema
  settings?: CompanySettings;  // Not in backend schema (may need separate endpoint)
}

export interface CompanySettings {
  // Backend fields (from CompanySettingsResponse schema)
  companyId?: string;  // company_id from backend (UUID as string)
  maxUsers?: number;  // max_users from backend
  maxDevices?: number;  // max_devices from backend
  maxStorageGb?: number;  // max_storage_gb from backend
  subscriptionType?: 'trial' | 'basic' | 'premium' | 'enterprise';  // subscription_type from backend
  features?: string[];  // features from backend
  additionalSettings?: Record<string, any>;  // additional_settings from backend
  updatedAt?: string;  // updated_at from backend (ISO datetime string)
  
  // Frontend-only fields (stored in additionalSettings)
  timezone?: string;
  language?: string;
  dateFormat?: string;
  timeFormat?: string;
  currency?: string;
  notifications?: NotificationSettings;
  security?: SecuritySettings;
  integrations?: IntegrationSettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  webhook: boolean;
  webhookUrl: string;
}

export interface SecuritySettings {
  twoFactorRequired: boolean;
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  ipWhitelist: string[];
  allowedDomains: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
}

export interface IntegrationSettings {
  ldap: LdapSettings;
  sso: SsoSettings;
  api: ApiSettings;
}

export interface LdapSettings {
  enabled: boolean;
  server: string;
  port: number;
  baseDn: string;
  bindDn: string;
  bindPassword: string;
}

export interface SsoSettings {
  enabled: boolean;
  provider: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface ApiSettings {
  enabled: boolean;
  rateLimit: number;
  allowedOrigins: string[];
  apiKey: string;
}

export interface CompanyFilters {
  search: string;
  status: string;
  subscriptionType: string;
  country: string;
  createdFrom: string;
  createdTo: string;
}

export interface CompanyStatistics {
  // Backend fields (from CompanyStatistics schema)
  totalCompanies: number;  // total_companies from backend
  publicCompanies: number;  // public_companies from backend
  pendingCompanies: number;  // pending_companies from backend
  suspendedCompanies: number;  // suspended_companies from backend
  statusDistribution?: {  // statusDistribution in backend
    PUBLIC?: number;
    PENDING?: number;
  };
  
  // Legacy fields (kept for backward compatibility, may not exist in backend)
  activeCompanies?: number;  // Alias for publicCompanies
  inactiveCompanies?: number;  // Alias for pendingCompanies
  trialCompanies?: number;  // Not in backend schema
  premiumCompanies?: number;  // Not in backend schema
  enterpriseCompanies?: number;  // Not in backend schema
}

export interface CompanyForm {
  // Required fields matching backend CompanyBase schema
  name: string;  // company_name
  code: string;  // company_code
  description: string;  // company_info
  address: string;
  latitude: number;  // REQUIRED in backend
  longitude: number;  // REQUIRED in backend
  ownerName: string;  // owner_name, REQUIRED in backend
  contact: string;  // REQUIRED in backend
  status?: 'public' | 'pending';  // Optional, defaults to 'pending'
  picture?: string;  // Optional
  
  // Optional extended fields (not in backend schema, but kept for compatibility)
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  subscriptionType?: 'trial' | 'basic' | 'premium' | 'enterprise';
  maxUsers?: number;
  maxDevices?: number;
  features?: string[];
}
