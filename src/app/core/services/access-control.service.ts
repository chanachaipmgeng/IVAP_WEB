import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface AccessPoint {
  id: string;
  name: string;
  type: 'door' | 'gate' | 'elevator' | 'turnstile' | 'parking' | 'room' | 'building';
  location: string;
  zone: string;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  isEnabled: boolean;
  accessMethods: AccessMethod[];
  permissions: AccessPermission[];
  schedule: AccessSchedule;
  hardware: {
    controllerId: string;
    deviceType: string;
    firmware: string;
    lastSeen: Date;
    batteryLevel?: number;
    signalStrength?: number;
  };
  settings: {
    autoLock: boolean;
    lockTimeout: number; // in seconds
    maxAttempts: number;
    cooldownPeriod: number; // in seconds
    requireConfirmation: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AccessMethod {
  id: string;
  type: 'qr_code' | 'rfid' | 'fingerprint' | 'face_recognition' | 'pin' | 'otp' | 'proximity' | 'keycard';
  isEnabled: boolean;
  priority: number;
  settings: {
    timeout?: number;
    retryAttempts?: number;
    requireBackup?: boolean;
    backupMethod?: string;
  };
  hardware: {
    deviceId?: string;
    readerType?: string;
    position?: string;
  };
}

export interface AccessPermission {
  id: string;
  userId: string;
  userName: string;
  accessPointId: string;
  accessMethods: string[];
  schedule: {
    days: number[]; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    timezone: string;
  };
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
  grantedBy: string;
  grantedAt: Date;
  reason: string;
  metadata: {
    department?: string;
    role?: string;
    clearanceLevel?: number;
    notes?: string;
  };
}

export interface AccessEvent {
  id: string;
  userId: string;
  userName: string;
  accessPointId: string;
  accessPointName: string;
  method: string;
  action: 'grant' | 'deny' | 'timeout' | 'error';
  timestamp: Date;
  result: 'success' | 'failure' | 'partial';
  details: {
    reason?: string;
    errorCode?: string;
    duration?: number; // in milliseconds
    location?: string;
    deviceInfo?: any;
  };
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isAnomaly: boolean;
  riskScore: number; // 0-100
}

export interface AccessSchedule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  rules: AccessRule[];
  exceptions: AccessException[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AccessRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'require_approval' | 'log_only';
  priority: number;
  isEnabled: boolean;
  description: string;
  metadata: {
    timeRange?: { start: string; end: string };
    daysOfWeek?: number[];
    userGroups?: string[];
    accessMethods?: string[];
    clearanceLevel?: number;
  };
}

export interface AccessException {
  id: string;
  name: string;
  description: string;
  validFrom: Date;
  validTo: Date;
  userIds: string[];
  accessPointIds: string[];
  reason: string;
  approvedBy: string;
  approvedAt: Date;
  isActive: boolean;
}

export interface AccessMetrics {
  totalAccessPoints: number;
  activeAccessPoints: number;
  totalPermissions: number;
  activePermissions: number;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  averageResponseTime: number;
  securityIncidents: number;
  anomalyEvents: number;
  accessByMethod: { [key: string]: number };
  accessByTime: { [key: string]: number };
  topUsers: { [key: string]: number };
  topAccessPoints: { [key: string]: number };
  riskDistribution: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class AccessControlService {
  // ✅ Signals for reactive state
  private _accessPoints = signal<AccessPoint[]>([]);
  private _permissions = signal<AccessPermission[]>([]);
  private _events = signal<AccessEvent[]>([]);
  private _schedules = signal<AccessSchedule[]>([]);
  private _metrics = signal<AccessMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly accessPoints = this._accessPoints.asReadonly();
  public readonly permissions = this._permissions.asReadonly();
  public readonly events = this._events.asReadonly();
  public readonly schedules = this._schedules.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly accessPointsCount = computed(() => this._accessPoints().length);
  public readonly permissionsCount = computed(() => this._permissions().length);
  public readonly eventsCount = computed(() => this._events().length);
  public readonly activeAccessPointsCount = computed(() => this._accessPoints().filter(ap => ap.status === 'active').length);

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Get all access points
   */
  getAccessPoints(): AccessPoint[] {
    return this._accessPoints();
  }

  /**
   * Get access point by ID
   */
  getAccessPoint(accessPointId: string): AccessPoint | undefined {
    return this._accessPoints().find(ap => ap.id === accessPointId);
  }

  /**
   * Create access point
   */
  createAccessPoint(accessPoint: Omit<AccessPoint, 'id' | 'createdAt' | 'updatedAt'>): AccessPoint {
    const newAccessPoint: AccessPoint = {
      ...accessPoint,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this._accessPoints.update(accessPoints => [...accessPoints, newAccessPoint]);

    this.updateMetrics();
    return newAccessPoint;
  }

  /**
   * Update access point
   */
  updateAccessPoint(accessPointId: string, updates: Partial<AccessPoint>): boolean {
    this._accessPoints.update(accessPoints => {
      const accessPoint = accessPoints.find(ap => ap.id === accessPointId);
      if (!accessPoint) return accessPoints;

      Object.assign(accessPoint, updates);
      accessPoint.updatedAt = new Date();
      return [...accessPoints];
    });
    this.updateMetrics();
    return true;
  }

  /**
   * Grant access permission
   */
  grantAccessPermission(permission: Omit<AccessPermission, 'id' | 'grantedAt'>): AccessPermission {
    const newPermission: AccessPermission = {
      ...permission,
      id: this.generateId(),
      grantedAt: new Date()
    };

    this._permissions.update(permissions => [...permissions, newPermission]);

    // Log access event
    this.logAccessEvent({
      userId: permission.userId,
      userName: permission.userName,
      accessPointId: permission.accessPointId,
      accessPointName: this.getAccessPoint(permission.accessPointId)?.name || 'Unknown',
      method: 'admin_grant',
      action: 'grant',
      timestamp: new Date(),
      result: 'success',
      details: {
        reason: 'Permission granted by administrator',
        duration: 0
      },
      ipAddress: '127.0.0.1',
      userAgent: 'System',
      sessionId: 'system',
      severity: 'medium',
      isAnomaly: false,
      riskScore: 0
    });

    this.updateMetrics();
    return newPermission;
  }

  /**
   * Revoke access permission
   */
  revokeAccessPermission(permissionId: string, revokedBy: string): boolean {
    const permissions = this._permissions();
    const permission = permissions.find(p => p.id === permissionId);

    if (!permission) return false;

    this._permissions.update(permissions => {
      const permission = permissions.find(p => p.id === permissionId);
      if (permission) {
        permission.isActive = false;
      }
      return [...permissions];
    });

    // Log access event
    this.logAccessEvent({
      userId: permission.userId,
      userName: permission.userName,
      accessPointId: permission.accessPointId,
      accessPointName: this.getAccessPoint(permission.accessPointId)?.name || 'Unknown',
      method: 'admin_revoke',
      action: 'deny',
      timestamp: new Date(),
      result: 'success',
      details: {
        reason: 'Permission revoked by administrator',
        duration: 0
      },
      ipAddress: '127.0.0.1',
      userAgent: 'System',
      sessionId: 'system',
      severity: 'medium',
      isAnomaly: false,
      riskScore: 0
    });

    this.updateMetrics();
    return true;
  }

  /**
   * Attempt access
   */
  async attemptAccess(
    userId: string,
    accessPointId: string,
    method: string,
    credentials: any,
    ipAddress: string = '127.0.0.1',
    userAgent: string = 'Unknown'
  ): Promise<{ success: boolean; reason?: string; eventId: string }> {
    const startTime = Date.now();
    const accessPoint = this.getAccessPoint(accessPointId);

    if (!accessPoint || !accessPoint.isEnabled) {
      const eventId = this.logAccessEvent({
        userId,
        userName: 'Unknown',
        accessPointId,
        accessPointName: accessPoint?.name || 'Unknown',
        method,
        action: 'deny',
        timestamp: new Date(),
        result: 'failure',
        details: {
          reason: 'Access point not available',
          duration: Date.now() - startTime
        },
        ipAddress,
        userAgent,
        sessionId: 'unknown',
        severity: 'medium',
        isAnomaly: false,
        riskScore: 50
      });

      return { success: false, reason: 'Access point not available', eventId };
    }

    // Check permissions
    const permission = this.getUserPermission(userId, accessPointId);
    if (!permission || !permission.isActive) {
      const eventId = this.logAccessEvent({
        userId,
        userName: permission?.userName || 'Unknown',
        accessPointId,
        accessPointName: accessPoint.name,
        method,
        action: 'deny',
        timestamp: new Date(),
        result: 'failure',
        details: {
          reason: 'No permission for this access point',
          duration: Date.now() - startTime
        },
        ipAddress,
        userAgent,
        sessionId: 'unknown',
        severity: 'high',
        isAnomaly: true,
        riskScore: 80
      });

      return { success: false, reason: 'No permission', eventId };
    }

    // Check schedule
    if (!this.isAccessAllowed(permission)) {
      const eventId = this.logAccessEvent({
        userId,
        userName: permission.userName,
        accessPointId,
        accessPointName: accessPoint.name,
        method,
        action: 'deny',
        timestamp: new Date(),
        result: 'failure',
        details: {
          reason: 'Access not allowed at this time',
          duration: Date.now() - startTime
        },
        ipAddress,
        userAgent,
        sessionId: 'unknown',
        severity: 'medium',
        isAnomaly: false,
        riskScore: 30
      });

      return { success: false, reason: 'Access not allowed at this time', eventId };
    }

    // Validate credentials based on method
    const validationResult = await this.validateCredentials(method, credentials, permission);
    if (!validationResult.success) {
      const eventId = this.logAccessEvent({
        userId,
        userName: permission.userName,
        accessPointId,
        accessPointName: accessPoint.name,
        method,
        action: 'deny',
        timestamp: new Date(),
        result: 'failure',
        details: {
          reason: validationResult.reason || 'Invalid credentials',
          duration: Date.now() - startTime
        },
        ipAddress,
        userAgent,
        sessionId: 'unknown',
        severity: 'high',
        isAnomaly: true,
        riskScore: 90
      });

      return { success: false, reason: validationResult.reason, eventId };
    }

    // Grant access
    const eventId = this.logAccessEvent({
      userId,
      userName: permission.userName,
      accessPointId,
      accessPointName: accessPoint.name,
      method,
      action: 'grant',
      timestamp: new Date(),
      result: 'success',
      details: {
        reason: 'Access granted',
        duration: Date.now() - startTime
      },
      ipAddress,
      userAgent,
      sessionId: 'unknown',
      severity: 'low',
      isAnomaly: false,
      riskScore: 10
    });

    this.updateMetrics();
    return { success: true, eventId };
  }

  /**
   * Get all permissions
   */
  getPermissions(): AccessPermission[] {
    return this._permissions();
  }

  /**
   * Get all events
   */
  getEvents(): AccessEvent[] {
    return this._events();
  }

  /**
   * Get all schedules
   */
  getSchedules(): AccessSchedule[] {
    return this._schedules();
  }

  /**
   * Delete access point
   */
  deleteAccessPoint(accessPointId: string): boolean {
    this._accessPoints.update(accessPoints => {
      return accessPoints.filter(ap => ap.id !== accessPointId);
    });

    const beforeLength = this._accessPoints().length;
    this._accessPoints.update(accessPoints => accessPoints.filter(ap => ap.id !== accessPointId));
    const afterLength = this._accessPoints().length;

    if (beforeLength === afterLength) return false;
    this.updateMetrics();
    return true;
  }

  /**
   * Update access permission
   */
  updateAccessPermission(permissionId: string, updates: Partial<AccessPermission>): boolean {
    const permissions = this._permissions();
    const permission = permissions.find(p => p.id === permissionId);

    if (!permission) return false;

    this._permissions.update(permissions => {
      const permission = permissions.find(p => p.id === permissionId);
      if (!permission) return permissions;

      Object.assign(permission, updates);
      return [...permissions];
    });
    this.updateMetrics();
    return true;
  }

  /**
   * Get user permission for access point
   */
  getUserPermission(userId: string, accessPointId: string): AccessPermission | undefined {
    return this._permissions().find(p =>
      p.userId === userId &&
      p.accessPointId === accessPointId &&
      p.isActive &&
      (!p.validTo || p.validTo > new Date())
    );
  }

  /**
   * Check if access is allowed based on schedule
   */
  isAccessAllowed(permission: AccessPermission): boolean {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().substring(0, 5);

    // Check if current day is allowed
    if (!permission.schedule.days.includes(currentDay)) {
      return false;
    }

    // Check if current time is within allowed range
    if (currentTime < permission.schedule.startTime || currentTime > permission.schedule.endTime) {
      return false;
    }

    return true;
  }

  /**
   * Validate credentials based on method
   */
  private async validateCredentials(method: string, credentials: any, permission: AccessPermission): Promise<{ success: boolean; reason?: string }> {
    // Check if method is allowed for this permission
    if (!permission.accessMethods.includes(method)) {
      return { success: false, reason: 'Access method not allowed' };
    }

    // Simulate credential validation based on method
    switch (method) {
      case 'qr_code':
        return this.validateQRCode(credentials);
      case 'rfid':
        return this.validateRFID(credentials);
      case 'fingerprint':
        return this.validateFingerprint(credentials);
      case 'face_recognition':
        return this.validateFaceRecognition(credentials);
      case 'pin':
        return this.validatePIN(credentials);
      case 'otp':
        return this.validateOTP(credentials);
      default:
        return { success: false, reason: 'Unknown access method' };
    }
  }

  /**
   * Validate QR code
   */
  private async validateQRCode(credentials: any): Promise<{ success: boolean; reason?: string }> {
    // Simulate QR code validation
    if (!credentials.qrData || credentials.qrData.length < 10) {
      return { success: false, reason: 'Invalid QR code' };
    }
    return { success: true };
  }

  /**
   * Validate RFID
   */
  private async validateRFID(credentials: any): Promise<{ success: boolean; reason?: string }> {
    // Simulate RFID validation
    if (!credentials.cardId || credentials.cardId.length < 8) {
      return { success: false, reason: 'Invalid RFID card' };
    }
    return { success: true };
  }

  /**
   * Validate fingerprint
   */
  private async validateFingerprint(credentials: any): Promise<{ success: boolean; reason?: string }> {
    // Simulate fingerprint validation
    if (!credentials.template || credentials.template.length < 100) {
      return { success: false, reason: 'Invalid fingerprint template' };
    }
    return { success: true };
  }

  /**
   * Validate face recognition
   */
  private async validateFaceRecognition(credentials: any): Promise<{ success: boolean; reason?: string }> {
    // Simulate face recognition validation
    if (!credentials.faceData || credentials.faceData.length < 200) {
      return { success: false, reason: 'Invalid face data' };
    }
    return { success: true };
  }

  /**
   * Validate PIN
   */
  private async validatePIN(credentials: any): Promise<{ success: boolean; reason?: string }> {
    // Simulate PIN validation
    if (!credentials.pin || credentials.pin.length !== 4) {
      return { success: false, reason: 'Invalid PIN format' };
    }
    return { success: true };
  }

  /**
   * Validate OTP
   */
  private async validateOTP(credentials: any): Promise<{ success: boolean; reason?: string }> {
    // Simulate OTP validation
    if (!credentials.otp || credentials.otp.length !== 6) {
      return { success: false, reason: 'Invalid OTP format' };
    }
    return { success: true };
  }

  /**
   * Log access event
   */
  private logAccessEvent(event: Omit<AccessEvent, 'id'>): string {
    const accessEvent: AccessEvent = {
      ...event,
      id: this.generateId()
    };

    this._events.update(events => [accessEvent, ...events.slice(0, 9999)]); // Keep last 10000 events

    return accessEvent.id;
  }

  /**
   * Get access events
   */
  getAccessEvents(): AccessEvent[] {
    return this._events();
  }

  /**
   * Get access events by user
   */
  getAccessEventsByUser(userId: string): AccessEvent[] {
    return this._events().filter(e => e.userId === userId);
  }

  /**
   * Get access events by access point
   */
  getAccessEventsByAccessPoint(accessPointId: string): AccessEvent[] {
    return this._events().filter(e => e.accessPointId === accessPointId);
  }

  /**
   * Get access schedules
   */
  getAccessSchedules(): AccessSchedule[] {
    return this._schedules();
  }

  /**
   * Create access schedule
   */
  createAccessSchedule(schedule: Omit<AccessSchedule, 'id' | 'createdAt' | 'updatedAt'>): AccessSchedule {
    const newSchedule: AccessSchedule = {
      ...schedule,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this._schedules.update(schedules => [...schedules, newSchedule]);

    return newSchedule;
  }

  /**
   * Get metrics
   */
  getMetrics(): AccessMetrics {
    return this._metrics();
  }

  /**
   * Generate access report
   */
  generateAccessReport(options: {
    dateFrom: Date;
    dateTo: Date;
    userId?: string;
    accessPointId?: string;
    includeDetails?: boolean;
  }): any {
    let events = this._events().filter(e =>
      e.timestamp >= options.dateFrom && e.timestamp <= options.dateTo
    );

    if (options.userId) {
      events = events.filter(e => e.userId === options.userId);
    }
    if (options.accessPointId) {
      events = events.filter(e => e.accessPointId === options.accessPointId);
    }

    const report = {
      period: {
        from: options.dateFrom,
        to: options.dateTo
      },
      summary: {
        totalEvents: events.length,
        successfulEvents: events.filter(e => e.result === 'success').length,
        failedEvents: events.filter(e => e.result === 'failure').length,
        securityIncidents: events.filter(e => e.severity === 'critical').length,
        anomalyEvents: events.filter(e => e.isAnomaly).length
      },
      events: options.includeDetails ? events : events.map(e => ({
        id: e.id,
        userId: e.userId,
        userName: e.userName,
        accessPointName: e.accessPointName,
        method: e.method,
        action: e.action,
        timestamp: e.timestamp,
        result: e.result,
        severity: e.severity
      })),
      generatedAt: new Date()
    };

    return report;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const accessPoints = this._accessPoints();
    const permissions = this._permissions();
    const events = this._events();
    const metrics = this.calculateMetrics(accessPoints, permissions, events);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(accessPoints: AccessPoint[], permissions: AccessPermission[], events: AccessEvent[]): AccessMetrics {
    const totalAccessPoints = accessPoints.length;
    const activeAccessPoints = accessPoints.filter(ap => ap.isEnabled).length;
    const totalPermissions = permissions.length;
    const activePermissions = permissions.filter(p => p.isActive).length;
    const totalEvents = events.length;
    const successfulEvents = events.filter(e => e.result === 'success').length;
    const failedEvents = events.filter(e => e.result === 'failure').length;

    const averageResponseTime = events.reduce((sum, e) => sum + (e.details.duration || 0), 0) / Math.max(events.length, 1);
    const securityIncidents = events.filter(e => e.severity === 'critical').length;
    const anomalyEvents = events.filter(e => e.isAnomaly).length;

    const accessByMethod = this.groupBy(events, 'method');
    const accessByTime = this.groupBy(events, 'timestamp', (date: Date) => date.getHours().toString());
    const topUsers = this.groupBy(events, 'userId');
    const topAccessPoints = this.groupBy(events, 'accessPointId');
    const riskDistribution = this.groupBy(events, 'riskScore', (score: number) =>
      score < 30 ? 'low' : score < 70 ? 'medium' : 'high'
    );

    return {
      totalAccessPoints,
      activeAccessPoints,
      totalPermissions,
      activePermissions,
      totalEvents,
      successfulEvents,
      failedEvents,
      averageResponseTime,
      securityIncidents,
      anomalyEvents,
      accessByMethod,
      accessByTime,
      topUsers,
      topAccessPoints,
      riskDistribution
    };
  }

  /**
   * Group array by property
   */
  private groupBy<T>(array: T[], property: keyof T, transform?: (value: any) => string): { [key: string]: number } {
    return array.reduce((groups, item) => {
      let key = String(item[property]);
      if (transform) {
        key = transform(item[property]);
      }
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as { [key: string]: number });
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): AccessMetrics {
    return {
      totalAccessPoints: 0,
      activeAccessPoints: 0,
      totalPermissions: 0,
      activePermissions: 0,
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      averageResponseTime: 0,
      securityIncidents: 0,
      anomalyEvents: 0,
      accessByMethod: {},
      accessByTime: {},
      topUsers: {},
      topAccessPoints: {},
      riskDistribution: {}
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo access points
    const demoAccessPoints: AccessPoint[] = [
      {
        id: 'ap-1',
        name: 'Main Entrance',
        type: 'door',
        location: 'Building A, Ground Floor',
        zone: 'public',
        status: 'active',
        isEnabled: true,
        accessMethods: [
          {
            id: 'method-1',
            type: 'qr_code',
            isEnabled: true,
            priority: 1,
            settings: { timeout: 30, retryAttempts: 3 },
            hardware: { deviceId: 'qr-reader-1', readerType: 'scanner' }
          },
          {
            id: 'method-2',
            type: 'rfid',
            isEnabled: true,
            priority: 2,
            settings: { timeout: 10, retryAttempts: 2 },
            hardware: { deviceId: 'rfid-reader-1', readerType: 'proximity' }
          }
        ],
        permissions: [],
        schedule: {
          id: 'schedule-1',
          name: 'Main Entrance Schedule',
          description: 'Main entrance access schedule',
          isActive: true,
          rules: [],
          exceptions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'admin'
        },
        hardware: {
          controllerId: 'controller-1',
          deviceType: 'access_controller',
          firmware: '1.2.3',
          lastSeen: new Date(),
          batteryLevel: 85,
          signalStrength: 95
        },
        settings: {
          autoLock: true,
          lockTimeout: 30,
          maxAttempts: 3,
          cooldownPeriod: 60,
          requireConfirmation: false
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        createdBy: 'admin'
      }
    ];

    this._accessPoints.set(demoAccessPoints);

    // Create demo permissions
    const demoPermissions: AccessPermission[] = [
      {
        id: 'perm-1',
        userId: 'user-1',
        userName: 'John Doe',
        accessPointId: 'ap-1',
        accessMethods: ['qr_code', 'rfid'],
        schedule: {
          days: [1, 2, 3, 4, 5], // Monday to Friday
          startTime: '08:00',
          endTime: '18:00',
          timezone: 'UTC'
        },
        validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
        grantedBy: 'admin',
        grantedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        reason: 'Employee access',
        metadata: {
          department: 'Engineering',
          role: 'Developer',
          clearanceLevel: 1,
          notes: 'Regular employee access'
        }
      }
    ];

    this._permissions.set(demoPermissions);

    // Create demo events
    const demoEvents: AccessEvent[] = [
      {
        id: 'event-1',
        userId: 'user-1',
        userName: 'John Doe',
        accessPointId: 'ap-1',
        accessPointName: 'Main Entrance',
        method: 'qr_code',
        action: 'grant',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        result: 'success',
        details: {
          reason: 'Valid QR code',
          duration: 150
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mobile App',
        sessionId: 'session-123',
        severity: 'low',
        isAnomaly: false,
        riskScore: 10
      }
    ];

    this._events.set(demoEvents);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'access-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

