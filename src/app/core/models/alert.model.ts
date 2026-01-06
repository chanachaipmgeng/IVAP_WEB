export interface Alert {
  id: string;
  company_id: string;
  title: string;
  description: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  source_type: string;
  source_id?: string;
  source_name?: string;
  location?: string;
  coordinates?: [number, number];
  metadata?: Record<string, any>;
  raw_data?: any;
  confidence_score?: number;
  ai_model_name?: string;
  created_at: string;
  updated_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
  resolved_by?: string;
}

export enum AlertType {
  SECURITY = 'security',
  SAFETY = 'safety',
  ENVIRONMENTAL = 'environmental',
  EQUIPMENT = 'equipment',
  ACCESS = 'access',
  SYSTEM = 'system',
  CUSTOM = 'custom'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export interface CreateAlertDto {
  company_id: string;
  title: string;
  description: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  source_type: string;
  source_id?: string;
  source_name?: string;
  location?: string;
  coordinates?: [number, number];
  metadata?: Record<string, any>;
  raw_data?: any;
  confidence_score?: number;
  ai_model_name?: string;
}

export interface UpdateAlertDto {
  title?: string;
  description?: string;
  severity?: AlertSeverity;
  status?: AlertStatus;
  metadata?: Record<string, any>;
}

export interface AlertAction {
  user_id: string;
  note?: string;
}

export interface BulkAlertAction {
  alert_ids: string[];
  action: 'acknowledge' | 'resolve' | 'dismiss';
  user_id: string;
}

export interface AlertStatistics {
  total: number;
  by_type: Record<AlertType, number>;
  by_severity: Record<AlertSeverity, number>;
  by_status: Record<AlertStatus, number>;
  recent_count: number;
  critical_count: number;
  unresolved_count: number;
}

export interface AlertDashboard {
  recent_alerts: Alert[];
  statistics: AlertStatistics;
  critical_alerts: Alert[];
  unresolved_alerts: Alert[];
}

export interface AlertTestRequest {
  title: string;
  description: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  test_notifications: boolean;
  test_recipients?: string[];
}

export interface AlertTestResponse {
  alert: Alert;
  notifications_sent: number;
  test_results: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  [AlertType.SECURITY]: 'ความปลอดภัย',
  [AlertType.SAFETY]: 'ความปลอดภัยในการทำงาน',
  [AlertType.ENVIRONMENTAL]: 'สิ่งแวดล้อม',
  [AlertType.EQUIPMENT]: 'อุปกรณ์',
  [AlertType.ACCESS]: 'การเข้าถึง',
  [AlertType.SYSTEM]: 'ระบบ',
  [AlertType.CUSTOM]: 'กำหนดเอง'
};

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  [AlertSeverity.LOW]: 'ต่ำ',
  [AlertSeverity.MEDIUM]: 'ปานกลาง',
  [AlertSeverity.HIGH]: 'สูง',
  [AlertSeverity.CRITICAL]: 'วิกฤต'
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  [AlertStatus.PENDING]: 'รอดำเนินการ',
  [AlertStatus.ACKNOWLEDGED]: 'รับทราบแล้ว',
  [AlertStatus.RESOLVED]: 'แก้ไขแล้ว',
  [AlertStatus.DISMISSED]: 'ยกเลิก'
};

