/**
 * Notification API Models
 * 
 * Models for backend notification API endpoints
 * Matches backend notification_schema.py
 */

import { UUID } from './base.model';

/**
 * Email Notification Request
 */
export interface EmailNotificationRequest {
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * LINE Notification Request
 */
export interface LineNotificationRequest {
  message: string;
  imagePath?: string;
  stickerPackageId?: number;
  stickerId?: number;
}

/**
 * Webhook Notification Request
 */
export interface WebhookNotificationRequest {
  webhookName: string;
  data: Record<string, any>;
  headers?: Record<string, string>;
}

/**
 * SMS Notification Request
 */
export interface SMSNotificationRequest {
  phone: string;
  message: string;
  provider?: string;
}

/**
 * Bulk Notification Item
 */
export interface BulkNotificationItem {
  type: 'email' | 'line' | 'webhook' | 'sms';
  data: Record<string, any>;
}

/**
 * Bulk Notification Request
 */
export interface BulkNotificationRequest {
  notifications: BulkNotificationItem[];
}

/**
 * Notification Response
 */
export interface NotificationResponse {
  success: boolean;
  message: string;
  recipient?: string;
  webhookName?: string;
  timestamp: string;
}

/**
 * Bulk Notification Response
 */
export interface BulkNotificationResponse {
  success: boolean;
  message: string;
  results: NotificationResponse[];
  timestamp: string;
}

/**
 * Notification Template
 */
export interface NotificationTemplate {
  templateId: string;
  name: string;
  type: 'email' | 'line' | 'webhook' | 'sms';
  subject?: string;
  body: string;
  variables: string[];
}

/**
 * Template Notification Request
 */
export interface TemplateNotificationRequest {
  templateId: string;
  recipient: string;
  variables: Record<string, string>;
  additionalData?: Record<string, any>;
}

/**
 * Event Notification Request
 */
export interface EventNotificationRequest {
  eventType: string;
  companyId: string;
  userId?: string;
  data: Record<string, any>;
  notificationChannels: ('email' | 'line' | 'webhook' | 'sms')[];
}

/**
 * System Notification Request
 */
export interface SystemNotificationRequest {
  title: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  companyId?: string;
  userId?: string;
  channels: ('email' | 'line' | 'webhook' | 'sms')[];
  data?: Record<string, any>;
}

/**
 * Notification Status Response
 */
export interface NotificationStatusResponse {
  emailEnabled: boolean;
  smsEnabled: boolean;
  lineEnabled: boolean;
  webhookEnabled: boolean;
  activeTemplates: number;
  totalSent: number;
  totalFailed: number;
}
