export interface License {
  id: string;
  type: 'trial' | 'standard' | 'professional' | 'enterprise';
  status: 'active' | 'expired' | 'suspended' | 'invalid';
  issuedTo: string;
  issuedDate: string;
  expiryDate: string;
  maxUsers: number;
  maxCompanies: number;
  features: string[];
  supportLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
  autoRenewal: boolean;
  lastChecked: string;
}

export interface LicenseUsage {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  activeCompanies: number;
  apiCalls: number;
  storageUsed: string;
  featuresUsed: string[];
}

export interface LicenseActivationForm {
  licenseKey: string;
  companyName: string;
}

export interface LicenseUpgradeForm {
  currentLicense: string;
  selectedUpgrade: 'professional' | 'enterprise';
}

export interface LicenseStatistics {
  daysUntilExpiry: number;
  usagePercentage: number;
  featuresAvailable: string[];
}
