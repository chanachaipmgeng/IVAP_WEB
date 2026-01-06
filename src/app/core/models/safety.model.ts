/**
 * Safety Models
 * Models สำหรับ Safety Dashboard (Worker Safety, Safety Violations, Safety Zones)
 */

export type SafetyViolationType = 'helmet' | 'safety_vest' | 'smoking' | 'phone_usage' | 'fall_detection';
export type SafetySeverity = 'low' | 'medium' | 'high' | 'critical';
export type SafetyViolationStatus = 'active' | 'acknowledged' | 'resolved';
export type SafetyZoneType = 'construction' | 'manufacturing' | 'warehouse' | 'office' | 'general';
export type SafetyRuleType = 'helmet_required' | 'safety_vest_required' | 'no_smoking' | 'no_phone' | 'fall_protection';
export type SafetyAlertType = 'immediate' | 'escalation' | 'reminder';
export type SafetyAlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type SafetyAlertStatus = 'pending' | 'sent' | 'delivered' | 'failed';
export type SafetyDeliveryMethod = 'email' | 'sms' | 'push' | 'dashboard';
export type SafetyTrend = 'improving' | 'stable' | 'declining';

/**
 * Safety Violation Model
 */
export interface SafetyViolation {
  id: string;
  companyId?: string;
  type: SafetyViolationType;
  severity: SafetySeverity;
  confidence: number;
  location: string;
  zoneId?: string;
  timestamp: Date | string;
  imageUrl?: string;
  videoUrl?: string;
  employeeId?: string;
  description: string;
  status: SafetyViolationStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: Date | string;
  resolvedBy?: string;
  resolvedAt?: Date | string;
  metadata?: Record<string, any>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Safety Metrics Model
 */
export interface SafetyMetrics {
  totalViolations: number;
  violationsByType: { [key: string]: number };
  violationsBySeverity: { [key: string]: number };
  violationsByLocation: { [key: string]: number };
  averageResponseTime: number;
  resolutionRate: number;
  safetyScore: number;
  trend: SafetyTrend;
}

/**
 * Safety Zone Model
 */
export interface SafetyZone {
  id: string;
  companyId?: string;
  name: string;
  type: SafetyZoneType;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | Record<string, any>;
  rules?: SafetyRule[];
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Safety Rule Model
 */
export interface SafetyRule {
  id: string;
  type: SafetyRuleType;
  severity: SafetySeverity;
  isEnabled: boolean;
  threshold: number;
  description: string;
}

/**
 * Safety Alert Model
 */
export interface SafetyAlert {
  id: string;
  violationId: string;
  type: SafetyAlertType;
  priority: SafetyAlertPriority;
  message: string;
  recipients: string[];
  sentAt: Date | string;
  status: SafetyAlertStatus;
  deliveryMethod: SafetyDeliveryMethod;
}

