/**
 * Notification API Service
 * 
 * Service for backend notification API endpoints
 * Matches backend notification routes at /api/v1/notifications
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { handleApiResponse } from '../utils/response-handler';
import {
  EmailNotificationRequest,
  LineNotificationRequest,
  WebhookNotificationRequest,
  SMSNotificationRequest,
  BulkNotificationRequest,
  TemplateNotificationRequest,
  EventNotificationRequest,
  SystemNotificationRequest,
  NotificationResponse,
  BulkNotificationResponse,
  NotificationTemplate,
  NotificationStatusResponse
} from '../models/notification-api.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationApiService {
  private baseEndpoint = '/notifications';

  constructor(private api: ApiService) {}

  /**
   * Send email notification
   * Backend: POST /api/v1/notifications/email
   */
  sendEmail(request: EmailNotificationRequest): Observable<NotificationResponse> {
    return this.api.post<any>(`${this.baseEndpoint}/email`, {
      to: request.to,
      subject: request.subject,
      body: request.body,
      html_body: request.htmlBody,
      cc: request.cc,
      bcc: request.bcc
    }).pipe(
      map(response => handleApiResponse<NotificationResponse>(response))
    );
  }

  /**
   * Send LINE notification
   * Backend: POST /api/v1/notifications/line
   */
  sendLine(request: LineNotificationRequest): Observable<NotificationResponse> {
    return this.api.post<any>(`${this.baseEndpoint}/line`, {
      message: request.message,
      image_path: request.imagePath,
      sticker_package_id: request.stickerPackageId,
      sticker_id: request.stickerId
    }).pipe(
      map(response => handleApiResponse<NotificationResponse>(response))
    );
  }

  /**
   * Send webhook notification
   * Backend: POST /api/v1/notifications/webhook
   */
  sendWebhook(request: WebhookNotificationRequest): Observable<NotificationResponse> {
    return this.api.post<any>(`${this.baseEndpoint}/webhook`, {
      webhook_name: request.webhookName,
      data: request.data,
      headers: request.headers
    }).pipe(
      map(response => handleApiResponse<NotificationResponse>(response))
    );
  }

  /**
   * Send SMS notification
   * Backend: POST /api/v1/notifications/sms
   */
  sendSMS(request: SMSNotificationRequest): Observable<NotificationResponse> {
    return this.api.post<any>(`${this.baseEndpoint}/sms`, {
      phone: request.phone,
      message: request.message,
      provider: request.provider || 'twilio'
    }).pipe(
      map(response => handleApiResponse<NotificationResponse>(response))
    );
  }

  /**
   * Send bulk notifications
   * Backend: POST /api/v1/notifications/bulk
   */
  sendBulk(request: BulkNotificationRequest): Observable<BulkNotificationResponse> {
    return this.api.post<any>(`${this.baseEndpoint}/bulk`, {
      notifications: request.notifications
    }).pipe(
      map(response => handleApiResponse<BulkNotificationResponse>(response))
    );
  }

  /**
   * Send notification using template
   * Backend: POST /api/v1/notifications/template
   */
  sendTemplate(request: TemplateNotificationRequest): Observable<NotificationResponse> {
    return this.api.post<any>(`${this.baseEndpoint}/template`, {
      template_id: request.templateId,
      recipient: request.recipient,
      variables: request.variables,
      additional_data: request.additionalData
    }).pipe(
      map(response => handleApiResponse<NotificationResponse>(response))
    );
  }

  /**
   * Send event-based notification
   * Backend: POST /api/v1/notifications/event
   */
  sendEvent(request: EventNotificationRequest): Observable<BulkNotificationResponse> {
    return this.api.post<any>(`${this.baseEndpoint}/event`, {
      event_type: request.eventType,
      company_id: request.companyId,
      user_id: request.userId,
      data: request.data,
      notification_channels: request.notificationChannels
    }).pipe(
      map(response => handleApiResponse<BulkNotificationResponse>(response))
    );
  }

  /**
   * Send system notification
   * Backend: POST /api/v1/notifications/system
   */
  sendSystem(request: SystemNotificationRequest): Observable<BulkNotificationResponse> {
    return this.api.post<any>(`${this.baseEndpoint}/system`, {
      title: request.title,
      message: request.message,
      level: request.level,
      company_id: request.companyId,
      user_id: request.userId,
      channels: request.channels,
      data: request.data
    }).pipe(
      map(response => handleApiResponse<BulkNotificationResponse>(response))
    );
  }

  /**
   * Get notification templates
   * Backend: GET /api/v1/notifications/templates
   */
  getTemplates(): Observable<NotificationTemplate[]> {
    return this.api.get<any>(`${this.baseEndpoint}/templates`).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        return (response as any).data || [];
      })
    );
  }

  /**
   * Get notification status
   * Backend: GET /api/v1/notifications/status
   */
  getStatus(): Observable<NotificationStatusResponse> {
    return this.api.get<any>(`${this.baseEndpoint}/status`).pipe(
      map(response => handleApiResponse<NotificationStatusResponse>(response))
    );
  }
}
