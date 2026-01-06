import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Alert,
  CreateAlertDto,
  UpdateAlertDto,
  AlertAction,
  BulkAlertAction,
  AlertStatistics,
  AlertDashboard,
  AlertTestRequest,
  AlertTestResponse,
  AlertType,
  AlertSeverity,
  AlertStatus,
  PaginatedResponse
} from '../models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/alerts`;

  /**
   * Get all alerts with pagination and filters
   */
  getAlerts(
    companyId: string,
    page: number = 1,
    size: number = 10,
    alertType?: AlertType,
    severity?: AlertSeverity,
    status?: AlertStatus
  ): Observable<PaginatedResponse<Alert>> {
    let params = new HttpParams()
      .set('company_id', companyId)
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (alertType) {
      params = params.set('alert_type', alertType);
    }
    if (severity) {
      params = params.set('severity', severity);
    }
    if (status) {
      params = params.set('status', status);
    }
    
    return this.http.get<PaginatedResponse<Alert>>(`${this.apiUrl}`, { params });
  }

  /**
   * Get alert by ID
   */
  getAlertById(id: string): Observable<Alert> {
    return this.http.get<Alert>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new alert
   */
  createAlert(data: CreateAlertDto): Observable<Alert> {
    return this.http.post<Alert>(`${this.apiUrl}`, data);
  }

  /**
   * Update alert
   */
  updateAlert(id: string, data: UpdateAlertDto): Observable<Alert> {
    return this.http.put<Alert>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(id: string, action: AlertAction): Observable<Alert> {
    return this.http.post<Alert>(`${this.apiUrl}/${id}/acknowledge`, action);
  }

  /**
   * Resolve alert
   */
  resolveAlert(id: string, action: AlertAction): Observable<Alert> {
    return this.http.post<Alert>(`${this.apiUrl}/${id}/resolve`, action);
  }

  /**
   * Dismiss alert
   */
  dismissAlert(id: string, action: AlertAction): Observable<Alert> {
    return this.http.post<Alert>(`${this.apiUrl}/${id}/dismiss`, action);
  }

  /**
   * Bulk action on alerts
   */
  bulkAction(action: BulkAlertAction): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/alerts/bulk-action`, action);
  }

  /**
   * Get alert statistics
   */
  getStatistics(companyId: string, startDate?: string, endDate?: string): Observable<AlertStatistics> {
    let params = new HttpParams().set('company_id', companyId);
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }
    return this.http.get<AlertStatistics>(`${this.apiUrl}/alerts/statistics`, { params });
  }

  /**
   * Get alert dashboard data
   */
  getDashboard(companyId: string): Observable<AlertDashboard> {
    return this.http.get<AlertDashboard>(`${this.apiUrl}/alerts/dashboard`, {
      params: { company_id: companyId }
    });
  }

  /**
   * Test alert system
   */
  testAlertSystem(data: AlertTestRequest): Observable<AlertTestResponse> {
    return this.http.post<AlertTestResponse>(`${this.apiUrl}/alerts/test`, data);
  }
}

