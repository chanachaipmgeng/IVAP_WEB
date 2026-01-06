/**
 * Notification Models
 * Models สำหรับ Notification Service
 * ตรงกับ backend schemas: notification_schema.py, notification_enhanced_schema.py
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'custom';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'webhook' | 'line';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Notification Config Model
 */
export interface NotificationConfig {
  id?: string;
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number;
  position?: NotificationPosition;
  showCloseButton?: boolean;
  showProgressBar?: boolean;
  pauseOnHover?: boolean;
  clickToClose?: boolean;
  enableHtml?: boolean;
  icon?: string;
  actions?: NotificationAction[];
  data?: any;
  priority?: NotificationPriority;
  category?: string;
  tags?: string[];
  sound?: boolean;
  vibration?: boolean;
  persistent?: boolean;
  autoClose?: boolean;
}

/**
 * Notification Action Model
 */
export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  icon?: string;
}

/**
 * Notification History Model
 */
export interface NotificationHistory {
  id: string;
  config: NotificationConfig;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
}

/**
 * Notification Settings Model
 */
export interface NotificationSettings {
  enableSound: boolean;
  enableVibration: boolean;
  enableDesktop: boolean;
  maxNotifications: number;
  defaultDuration: number;
  position: NotificationPosition;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

/**
 * Backend Notification Models (from API)
 */

/**
 * Email Notification Request
 */
export interface EmailNotificationRequest {
  to: string; // EmailStr
  subject: string;
  body: string;
  htmlBody?: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * SMS Notification Request
 */
export interface SMSNotificationRequest {
  phone: string;
  message: string;
  provider?: string; // Default: "twilio"
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
  notificationId?: string;
  sentAt?: Date | string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
}

/**
 * Notification List Item (from backend)
 */
export interface NotificationListItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  sentAt?: Date | string;
  deliveredAt?: Date | string;
  readAt?: Date | string;
  createdAt: Date | string;
  metadata?: Record<string, any>;
}

