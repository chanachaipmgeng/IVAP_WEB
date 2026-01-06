import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { License, LicenseUsage, LicenseActivationForm, LicenseUpgradeForm, LicenseStatistics } from '../models/license.model';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  private license = signal<License>({
    id: '',
    type: 'trial',
    status: 'active',
    issuedTo: '',
    issuedDate: '',
    expiryDate: '',
    maxUsers: 0,
    maxCompanies: 0,
    features: [],
    supportLevel: 'basic',
    autoRenewal: false,
    lastChecked: ''
  });
  private usage = signal<LicenseUsage>({
    totalUsers: 0,
    activeUsers: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    apiCalls: 0,
    storageUsed: '0 MB',
    featuresUsed: []
  });

  constructor(private api: ApiService) {}

  // Getters
  getLicense = () => this.license.asReadonly();
  getUsage = () => this.usage.asReadonly();

  // Load data
  loadLicense(): Observable<License> {
    return this.api.get<License>('/admin/license').pipe(
      tap((response: any) => {
        this.license.set(response.data || response || this.license());
      }),
      catchError((error) => {
        console.error('Error loading license:', error);
        throw error;
      })
    );
  }

  loadUsage(): Observable<LicenseUsage> {
    return this.api.get<LicenseUsage>('/admin/license/usage').pipe(
      tap((response: any) => {
        this.usage.set(response.data || response || this.usage());
      }),
      catchError((error) => {
        console.error('Error loading usage:', error);
        throw error;
      })
    );
  }

  // License operations
  checkLicense(): Observable<void> {
    return this.api.post<void>('/admin/license/check', {});
  }

  activateLicense(activationData: LicenseActivationForm): Observable<License> {
    return this.api.post<License>('/admin/license/activate', activationData);
  }

  renewLicense(): Observable<void> {
    return this.api.post<void>('/admin/license/renew', {});
  }

  upgradeLicense(upgradeData: LicenseUpgradeForm): Observable<License> {
    return this.api.post<License>('/admin/license/upgrade', upgradeData);
  }

  // Statistics
  getLicenseStatistics(): LicenseStatistics {
    const license = this.license();
    const usage = this.usage();
    const expiryDate = new Date(license.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      daysUntilExpiry,
      usagePercentage: (usage.activeUsers / license.maxUsers) * 100,
      featuresAvailable: license.features
    };
  }

  // Helper methods
  getStatusIcon(status: string): string {
    switch (status) {
      case 'active':
        return '✅';
      case 'expired':
        return '❌';
      case 'suspended':
        return '⏸️';
      case 'invalid':
        return '⚠️';
      default:
        return '❓';
    }
  }

  getStatusColorClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900';
      case 'expired':
        return 'bg-red-100 dark:bg-red-900';
      case 'suspended':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'invalid':
        return 'bg-orange-100 dark:bg-orange-900';
      default:
        return 'bg-gray-100 dark:bg-gray-900';
    }
  }

  getStatusTextClass(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'expired':
        return 'text-red-600 dark:text-red-400';
      case 'suspended':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'invalid':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  getExpiryClass(): string {
    const license = this.license();
    const expiryDate = new Date(license.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'text-red-600 dark:text-red-400';
    if (daysUntilExpiry < 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-900 dark:text-gray-100';
  }

  getUsagePercentage(type: 'users' | 'companies'): number {
    const license = this.license();
    const usage = this.usage();

    if (type === 'users') {
      return (usage.activeUsers / license.maxUsers) * 100;
    } else {
      return (usage.activeCompanies / license.maxCompanies) * 100;
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
