import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Company, CompanyFilters, CompanyStatistics, CompanyForm, CompanySettings } from '../models/company.model';
import { tap, catchError, map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../utils/api-endpoints';
import { handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';
import { FileUploadService } from './file-upload.service';

// Re-export for backward compatibility
export type { Company, CompanyFilters, CompanyStatistics, CompanyForm, CompanySettings } from '../models/company.model';

export interface CompanyApiResponse {
  data: Company[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  readonly loading = signal(false);

  constructor(
    private api: ApiService,
    private fileUploadService: FileUploadService
  ) { }

  loadCompanies(params?: any): Observable<CompanyApiResponse> {
    this.loading.set(true);
    return this.api.get<PaginatedApiResponse<any>>('/companies', params).pipe(
      map(response => ({
        data: response.data.map(item => this.mapCompanyFromBackend(item)),
        total: response.total
      })),
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  getCompanyById(id: string): Observable<Company> {
    this.loading.set(true);
    return this.api.get<any>(`/companies/${id}`).pipe(
      map(item => this.mapCompanyFromBackend(item)),
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  createCompany(data: CompanyForm): Observable<Company> {
    this.loading.set(true);
    return this.api.post<any>('/companies', data).pipe(
      map(item => this.mapCompanyFromBackend(item)),
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  updateCompany(id: string, data: Partial<CompanyForm>): Observable<Company> {
    this.loading.set(true);
    return this.api.put<any>(`/companies/${id}`, data).pipe(
      map(item => this.mapCompanyFromBackend(item)),
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  deleteCompany(id: string): Observable<void> {
    this.loading.set(true);
    return this.api.delete<void>(`/companies/${id}`).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.loading.set(false);
        throw error;
      })
    );
  }

  getStatistics(): Observable<CompanyStatistics> {
    return this.api.get<any>('/admin/company-stats').pipe(
      map(response => {
        // Map backend response to frontend model
        // Backend: total_companies, public_companies, pending_companies, suspended_companies
        // Frontend: totalCompanies, publicCompanies, pendingCompanies, suspendedCompanies
        const stats = response.data || response;
        return {
          totalCompanies: stats.totalCompanies || stats.total_companies || 0,
          publicCompanies: stats.publicCompanies || stats.public_companies || 0,
          pendingCompanies: stats.pendingCompanies || stats.pending_companies || 0,
          suspendedCompanies: stats.suspendedCompanies || stats.suspended_companies || 0,
          statusDistribution: stats.statusDistribution || {
            PUBLIC: stats.publicCompanies || stats.public_companies || 0,
            PENDING: stats.pendingCompanies || stats.pending_companies || 0
          },
          // Legacy fields for backward compatibility
          activeCompanies: stats.publicCompanies || stats.public_companies || 0,
          inactiveCompanies: stats.pendingCompanies || stats.pending_companies || 0
        };
      })
    );
  }

  exportCompanies(): Observable<Blob> {
    return this.api.get<Blob>('/companies/export', { responseType: 'blob' });
  }

  // Status Management (Admin endpoints)
  activateCompany(id: string): Observable<any> {
    return this.api.post(`/admin/companies/${id}/activate`, {});
  }

  deactivateCompany(id: string): Observable<any> {
    return this.api.post(`/admin/companies/${id}/deactivate`, {});
  }

  suspendCompany(id: string, reason: string): Observable<any> {
    return this.api.post(`/admin/companies/${id}/suspend`, { reason });
  }

  // Settings Management (Admin endpoints)
  getCompanySettings(id: string): Observable<CompanySettings> {
    return this.api.get<any>(`/admin/companies/${id}/settings`).pipe(
      map(response => {
        const settings = response.data || response;
        return {
          companyId: settings.companyId || settings.company_id || id,
          maxUsers: settings.maxUsers || settings.max_users,
          maxDevices: settings.maxDevices || settings.max_devices,
          maxStorageGb: settings.maxStorageGb || settings.max_storage_gb,
          subscriptionType: settings.subscriptionType || settings.subscription_type,
          features: settings.features || [],
          additionalSettings: settings.additionalSettings || settings.additional_settings || {},
          updatedAt: settings.updatedAt || settings.updated_at,
          // Frontend-only fields (extracted from additionalSettings if present)
          timezone: settings.timezone || settings.additionalSettings?.timezone || settings.additional_settings?.timezone,
          language: settings.language || settings.additionalSettings?.language || settings.additional_settings?.language,
          dateFormat: settings.dateFormat || settings.additionalSettings?.dateFormat || settings.additional_settings?.dateFormat,
          timeFormat: settings.timeFormat || settings.additionalSettings?.timeFormat || settings.additional_settings?.timeFormat,
          currency: settings.currency || settings.additionalSettings?.currency || settings.additional_settings?.currency,
          notifications: settings.notifications || settings.additionalSettings?.notifications || settings.additional_settings?.notifications,
          security: settings.security || settings.additionalSettings?.security || settings.additional_settings?.security,
          integrations: settings.integrations || settings.additionalSettings?.integrations || settings.additional_settings?.integrations
        };
      })
    );
  }

  updateCompanySettings(id: string, settings: Partial<CompanySettings>): Observable<CompanySettings> {
    // Map frontend settings to backend format
    const backendSettings: any = {
      max_users: settings.maxUsers,
      max_devices: settings.maxDevices,
      max_storage_gb: settings.maxStorageGb,
      subscription_type: settings.subscriptionType,
      features: settings.features || [],
      additional_settings: {
        ...(settings.additionalSettings || {}),
        // Include frontend-only fields in additional_settings
        ...(settings.timezone ? { timezone: settings.timezone } : {}),
        ...(settings.language ? { language: settings.language } : {}),
        ...(settings.dateFormat ? { dateFormat: settings.dateFormat } : {}),
        ...(settings.timeFormat ? { timeFormat: settings.timeFormat } : {}),
        ...(settings.currency ? { currency: settings.currency } : {}),
        ...(settings.notifications ? { notifications: settings.notifications } : {}),
        ...(settings.security ? { security: settings.security } : {}),
        ...(settings.integrations ? { integrations: settings.integrations } : {})
      }
    };
    
    return this.api.put<any>(`/admin/companies/${id}/settings`, backendSettings).pipe(
      map(response => {
        const updatedSettings = response.data || response;
        return {
          companyId: updatedSettings.companyId || updatedSettings.company_id || id,
          maxUsers: updatedSettings.maxUsers || updatedSettings.max_users,
          maxDevices: updatedSettings.maxDevices || updatedSettings.max_devices,
          maxStorageGb: updatedSettings.maxStorageGb || updatedSettings.max_storage_gb,
          subscriptionType: updatedSettings.subscriptionType || updatedSettings.subscription_type,
          features: updatedSettings.features || [],
          additionalSettings: updatedSettings.additionalSettings || updatedSettings.additional_settings || {},
          updatedAt: updatedSettings.updatedAt || updatedSettings.updated_at,
          // Frontend-only fields
          timezone: updatedSettings.timezone || updatedSettings.additionalSettings?.timezone || updatedSettings.additional_settings?.timezone,
          language: updatedSettings.language || updatedSettings.additionalSettings?.language || updatedSettings.additional_settings?.language,
          dateFormat: updatedSettings.dateFormat || updatedSettings.additionalSettings?.dateFormat || updatedSettings.additional_settings?.dateFormat,
          timeFormat: updatedSettings.timeFormat || updatedSettings.additionalSettings?.timeFormat || updatedSettings.additional_settings?.timeFormat,
          currency: updatedSettings.currency || updatedSettings.additionalSettings?.currency || updatedSettings.additional_settings?.currency,
          notifications: updatedSettings.notifications || updatedSettings.additionalSettings?.notifications || updatedSettings.additional_settings?.notifications,
          security: updatedSettings.security || updatedSettings.additionalSettings?.security || updatedSettings.additional_settings?.security,
          integrations: updatedSettings.integrations || updatedSettings.additionalSettings?.integrations || updatedSettings.additional_settings?.integrations
        };
      })
    );
  }

  // Image Handling
  uploadImage(file: File): Observable<{ path: string; filename: string; message: string }> {
    return this.fileUploadService.uploadImage(file);
  }

  // Helper Methods
  getStatusClass(status: string | number): string {
    const statusStr = typeof status === 'string' ? status.toLowerCase() : (status === 1 ? 'public' : 'pending');
    switch (statusStr) {
      case 'public':
      case 'active':
        return 'text-green-600';
      case 'pending':
      case 'inactive':
        return 'text-yellow-600';
      case 'suspended':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getSubscriptionClass(subscriptionType: string): string {
    switch (subscriptionType) {
      case 'trial': return 'text-yellow-600';
      case 'basic': return 'text-blue-600';
      case 'premium': return 'text-purple-600';
      case 'enterprise': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Map backend company response to frontend Company model
   */
  private mapCompanyFromBackend(backendCompany: any): Company {
    // Map status from number/enum to string
    let status: 'active' | 'inactive' | 'suspended' | 'pending' | 'public' = 'pending';
    if (backendCompany.status !== undefined) {
      if (typeof backendCompany.status === 'number') {
        // Backend uses PublicType enum: 1 = PUBLIC, 2 = PENDING
        status = backendCompany.status === 1 ? 'public' : 'pending';
      } else if (typeof backendCompany.status === 'string') {
        const statusLower = backendCompany.status.toLowerCase();
        if (['public', 'pending', 'active', 'inactive', 'suspended'].includes(statusLower)) {
          status = statusLower as any;
        }
      }
    }

    return {
      // Primary identifier - support both camelCase and snake_case
      id: backendCompany.companyId || backendCompany.company_id || backendCompany.id || '',
      
      // Basic information - support both camelCase and snake_case
      name: backendCompany.companyName || backendCompany.company_name || backendCompany.name || '',
      code: backendCompany.companyCode || backendCompany.company_code || backendCompany.code || '',
      description: backendCompany.companyInfo || backendCompany.company_info || backendCompany.description || '',
      address: backendCompany.address || '',
      latitude: backendCompany.latitude ?? 0,
      longitude: backendCompany.longitude ?? 0,
      picture: backendCompany.picture || null,
      
      // Status - support both formats
      status: status as 'public' | 'pending' | number,
      
      // Owner and contact - support both camelCase and snake_case
      ownerName: backendCompany.ownerName || backendCompany.owner_name || '',
      contact: backendCompany.contact || '',
      
      // Timestamps - support both camelCase and snake_case
      createdAt: backendCompany.createdAt || backendCompany.created_at || '',
      updatedAt: backendCompany.updatedAt || backendCompany.updated_at || '',
      
      // Optional extended fields (not in backend schema, but kept for compatibility)
      phone: backendCompany.phone,
      email: backendCompany.email,
      website: backendCompany.website,
      subscriptionType: backendCompany.subscriptionType || backendCompany.subscription_type,
      maxUsers: backendCompany.maxUsers || backendCompany.max_users,
      maxDevices: backendCompany.maxDevices || backendCompany.max_devices,
      features: backendCompany.features
    };
  }
}