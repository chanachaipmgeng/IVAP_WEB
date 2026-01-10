import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Integration {
  integration_id: string;
  name: string;
  type: 'erp' | 'hr' | 'crm' | 'access_control' | 'fire_alarm' | 'parking' | 'payment' | 'messaging' | 'storage' | 'other';
  base_url: string;
  auth_type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
  status: 'active' | 'inactive' | 'error';
  last_sync?: string;
  config?: any;
}

export interface Webhook {
  webhook_id: string;
  name: string;
  url: string;
  event_types: string[];
  status: 'active' | 'inactive' | 'error';
  secret?: string;
  headers?: any;
  timeout?: number;
  retry_attempts?: number;
  last_triggered?: string;
  success_count?: number;
  failure_count?: number;
}

export interface IntegrationDashboardData {
  integrations: {
    total: number;
    active: number;
    inactive: number;
  };
  webhooks: {
    total: number;
    active: number;
    inactive: number;
  };
  recent_activity: any[];
  last_updated: string;
}

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {
  private api = inject(ApiService);

  // --- Integrations ---

  getIntegrations(): Observable<{ success: boolean; data: Integration[] }> {
    return this.api.get('/integrations/');
  }

  getIntegration(id: string): Observable<{ success: boolean; data: Integration }> {
    return this.api.get(`/integrations/${id}`);
  }

  registerIntegration(data: any): Observable<any> {
    return this.api.post('/integrations/', data);
  }

  testIntegration(id: string): Observable<any> {
    return this.api.post(`/integrations/${id}/test`, {});
  }

  // --- Webhooks ---

  getWebhooks(): Observable<{ success: boolean; data: Webhook[] }> {
    return this.api.get('/integrations/webhooks');
  }

  getWebhook(id: string): Observable<{ success: boolean; data: Webhook }> {
    return this.api.get(`/integrations/webhooks/${id}`);
  }

  registerWebhook(data: any): Observable<any> {
    return this.api.post('/integrations/webhooks', data);
  }

  getWebhookLogs(eventType?: string, page: number = 1, size: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (eventType) {
      params = params.set('event_type', eventType);
    }

    return this.api.get('/integrations/webhooks/logs', params);
  }

  // --- Dashboard ---

  getDashboardData(): Observable<{ success: boolean; data: IntegrationDashboardData }> {
    return this.api.get('/integrations/dashboard');
  }
}


