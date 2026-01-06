import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: {
    before?: any;
    after?: any;
    changes?: any;
    metadata?: any;
  };
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'security' | 'configuration' | 'user_management';
  status: 'success' | 'failure' | 'warning';
  errorMessage?: string;
  duration?: number; // in milliseconds
  tags: string[];
  environment: 'development' | 'staging' | 'production';
  retentionDays: number;
  isArchived: boolean;
  archivedAt?: Date;
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  resource?: string;
  category?: string;
  severity?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  ipAddress?: string;
  tags?: string[];
  environment?: string;
}

export interface AuditMetrics {
  totalLogs: number;
  logsByCategory: { [key: string]: number };
  logsBySeverity: { [key: string]: number };
  logsByStatus: { [key: string]: number };
  logsByUser: { [key: string]: number };
  logsByAction: { [key: string]: number };
  averageDuration: number;
  errorRate: number;
  criticalEvents: number;
  securityIncidents: number;
  retentionCompliance: number;
  lastArchived: Date;
  nextArchival: Date;
}

export interface AuditReport {
  id: string;
  name: string;
  description: string;
  filters: AuditFilter;
  generatedAt: Date;
  generatedBy: string;
  period: {
    from: Date;
    to: Date;
  };
  summary: {
    totalEvents: number;
    criticalEvents: number;
    securityIncidents: number;
    topUsers: { [key: string]: number };
    topActions: { [key: string]: number };
    topResources: { [key: string]: number };
  };
  data: AuditLog[];
  format: 'json' | 'csv' | 'pdf' | 'excel';
  isScheduled: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
}

export interface AuditPolicy {
  id: string;
  name: string;
  description: string;
  rules: AuditRule[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AuditRule {
  id: string;
  name: string;
  condition: string;
  action: 'log' | 'alert' | 'block' | 'notify';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isEnabled: boolean;
  description: string;
  notificationChannels: string[];
  escalationLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLoggingService {
  // ✅ Signals for reactive state
  private _logs = signal<AuditLog[]>([]);
  private _reports = signal<AuditReport[]>([]);
  private _policies = signal<AuditPolicy[]>([]);
  private _metrics = signal<AuditMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly logs = this._logs.asReadonly();
  public readonly reports = this._reports.asReadonly();
  public readonly policies = this._policies.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly logsCount = computed(() => this._logs().length);
  public readonly criticalLogsCount = computed(() =>
    this._logs().filter(l => l.severity === 'critical').length
  );
  public readonly securityIncidentsCount = computed(() =>
    this._logs().filter(l => l.category === 'security' && l.severity === 'critical').length
  );
  public readonly reportsCount = computed(() => this._reports().length);
  public readonly policiesCount = computed(() => this._policies().length);
  public readonly activePoliciesCount = computed(() =>
    this._policies().filter(p => p.isActive).length
  );

  // ✅ Observable compatibility layer (for backward compatibility)
  public logs$ = new Observable<AuditLog[]>(observer => {
    observer.next(this._logs());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public reports$ = new Observable<AuditReport[]>(observer => {
    observer.next(this._reports());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public policies$ = new Observable<AuditPolicy[]>(observer => {
    observer.next(this._policies());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public metrics$ = new Observable<AuditMetrics>(observer => {
    observer.next(this._metrics());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Log audit event
   */
  logEvent(event: Omit<AuditLog, 'id' | 'timestamp' | 'isArchived'>): AuditLog {
    const auditLog: AuditLog = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
      isArchived: false
    };

    this._logs.update(logs => [auditLog, ...logs.slice(0, 9999)]); // Keep last 10000 events

    // Check audit policies
    this.checkAuditPolicies(auditLog);

    this.updateMetrics();
    return auditLog;
  }

  /**
   * Get audit logs with filter
   */
  getAuditLogs(filter?: AuditFilter): AuditLog[] {
    let logs = this._logs();

    if (filter) {
      if (filter.userId) {
        logs = logs.filter(l => l.userId === filter.userId);
      }
      if (filter.action) {
        logs = logs.filter(l => l.action === filter.action);
      }
      if (filter.resource) {
        logs = logs.filter(l => l.resource === filter.resource);
      }
      if (filter.category) {
        logs = logs.filter(l => l.category === filter.category);
      }
      if (filter.severity) {
        logs = logs.filter(l => l.severity === filter.severity);
      }
      if (filter.status) {
        logs = logs.filter(l => l.status === filter.status);
      }
      if (filter.dateFrom) {
        logs = logs.filter(l => l.timestamp >= filter.dateFrom!);
      }
      if (filter.dateTo) {
        logs = logs.filter(l => l.timestamp <= filter.dateTo!);
      }
      if (filter.ipAddress) {
        logs = logs.filter(l => l.ipAddress === filter.ipAddress);
      }
      if (filter.tags && filter.tags.length > 0) {
        logs = logs.filter(l => filter.tags!.some(tag => l.tags.includes(tag)));
      }
      if (filter.environment) {
        logs = logs.filter(l => l.environment === filter.environment);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get audit log by ID
   */
  getAuditLog(logId: string): AuditLog | undefined {
    return this._logs().find(l => l.id === logId);
  }

  /**
   * Search audit logs
   */
  searchAuditLogs(query: string, filter?: AuditFilter): AuditLog[] {
    const logs = this.getAuditLogs(filter);
    const searchTerm = query.toLowerCase();

    return logs.filter(log =>
      log.action.toLowerCase().includes(searchTerm) ||
      log.resource.toLowerCase().includes(searchTerm) ||
      log.userName.toLowerCase().includes(searchTerm) ||
      log.details.before && JSON.stringify(log.details.before).toLowerCase().includes(searchTerm) ||
      log.details.after && JSON.stringify(log.details.after).toLowerCase().includes(searchTerm) ||
      log.errorMessage?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get audit policies
   */
  getAuditPolicies(): AuditPolicy[] {
    return this._policies();
  }

  /**
   * Create audit policy
   */
  createAuditPolicy(policy: Omit<AuditPolicy, 'id' | 'createdAt' | 'updatedAt'>): AuditPolicy {
    const newPolicy: AuditPolicy = {
      ...policy,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this._policies.update(policies => [...policies, newPolicy]);

    return newPolicy;
  }

  /**
   * Update audit policy
   */
  updateAuditPolicy(policyId: string, updates: Partial<AuditPolicy>): boolean {
    const policies = this._policies();
    const policy = policies.find(p => p.id === policyId);

    if (!policy) return false;

    const updatedPolicy = { ...policy, ...updates, updatedAt: new Date() };
    this._policies.update(policies => {
      const index = policies.findIndex(p => p.id === policyId);
      if (index !== -1) {
        policies[index] = updatedPolicy;
        return [...policies];
      }
      return policies;
    });
    return true;
  }

  /**
   * Get audit reports
   */
  getAuditReports(): AuditReport[] {
    return this._reports();
  }

  /**
   * Generate audit report
   */
  generateAuditReport(report: Omit<AuditReport, 'id' | 'generatedAt' | 'data' | 'summary'>): AuditReport {
    const logs = this.getAuditLogs(report.filters);

    const newReport: AuditReport = {
      ...report,
      id: this.generateId(),
      generatedAt: new Date(),
      data: logs,
      summary: this.calculateReportSummary(logs)
    };

    this._reports.update(reports => [...reports, newReport]);

    return newReport;
  }

  /**
   * Export audit logs
   */
  exportAuditLogs(filter?: AuditFilter, format: 'json' | 'csv' = 'json'): string {
    const logs = this.getAuditLogs(filter);

    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);
      case 'csv':
        return this.convertToCsv(logs);
      default:
        return JSON.stringify(logs, null, 2);
    }
  }

  /**
   * Archive old logs
   */
  archiveOldLogs(retentionDays: number = 90): number {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let archivedCount = 0;
    this._logs.update(logs => {
      const updatedLogs = logs.map((log: AuditLog) => {
        if (log.timestamp < cutoffDate && !log.isArchived) {
          archivedCount++;
          return {
            ...log,
            isArchived: true,
            archivedAt: new Date()
          };
        }
        return log;
      });
      return updatedLogs;
    });

    if (archivedCount > 0) {
      this.updateMetrics();
    }

    return archivedCount;
  }

  /**
   * Get audit metrics
   */
  getMetrics(): AuditMetrics {
    return this._metrics();
  }

  /**
   * Get real-time audit stream
   */
  getRealTimeAuditStream(): Observable<AuditLog[]> {
    return this.logs$;
  }

  /**
   * Check audit policies
   */
  private checkAuditPolicies(log: AuditLog): void {
    const policies = this._policies().filter(p => p.isActive);

    for (const policy of policies) {
      for (const rule of policy.rules) {
        if (rule.isEnabled && this.evaluateRule(rule, log)) {
          this.executeRuleAction(rule, log);
        }
      }
    }
  }

  /**
   * Evaluate audit rule
   */
  private evaluateRule(rule: AuditRule, log: AuditLog): boolean {
    // Simple rule evaluation - in a real app, this would be more sophisticated
    const condition = rule.condition.toLowerCase();

    if (condition.includes('critical') && log.severity === 'critical') {
      return true;
    }
    if (condition.includes('failed') && log.status === 'failure') {
      return true;
    }
    if (condition.includes('security') && log.category === 'security') {
      return true;
    }
    if (condition.includes('admin') && log.userId.includes('admin')) {
      return true;
    }

    return false;
  }

  /**
   * Execute rule action
   */
  private executeRuleAction(rule: AuditRule, log: AuditLog): void {
    switch (rule.action) {
      case 'alert':
        // AUDIT ALERT triggered - implement alert logic if needed
        break;
      case 'notify':
        // AUDIT NOTIFICATION triggered - implement notification logic if needed
        break;
      case 'block':
        // AUDIT BLOCK triggered - implement block logic if needed
        break;
      default:
        // Already logged
        break;
    }
  }

  /**
   * Calculate report summary
   */
  private calculateReportSummary(logs: AuditLog[]): any {
    const totalEvents = logs.length;
    const criticalEvents = logs.filter(l => l.severity === 'critical').length;
    const securityIncidents = logs.filter(l => l.category === 'security' && l.status === 'failure').length;

    const topUsers = this.groupBy(logs, 'userId');
    const topActions = this.groupBy(logs, 'action');
    const topResources = this.groupBy(logs, 'resource');

    return {
      totalEvents,
      criticalEvents,
      securityIncidents,
      topUsers,
      topActions,
      topResources
    };
  }

  /**
   * Convert to CSV
   */
  private convertToCsv(logs: AuditLog[]): string {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'Severity', 'IP Address'];
    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.userName,
      log.action,
      log.resource,
      log.status,
      log.severity,
      log.ipAddress
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Group array by property
   */
  private groupBy<T>(array: T[], property: keyof T): { [key: string]: number } {
    return array.reduce((groups, item) => {
      const key = String(item[property]);
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as { [key: string]: number });
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const logs = this._logs();
    const metrics = this.calculateMetrics(logs);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(logs: AuditLog[]): AuditMetrics {
    const totalLogs = logs.length;
    const logsByCategory = this.groupBy(logs, 'category');
    const logsBySeverity = this.groupBy(logs, 'severity');
    const logsByStatus = this.groupBy(logs, 'status');
    const logsByUser = this.groupBy(logs, 'userId');
    const logsByAction = this.groupBy(logs, 'action');

    const averageDuration = logs.filter(l => l.duration).reduce((sum, l) => sum + (l.duration || 0), 0) /
      Math.max(logs.filter(l => l.duration).length, 1);

    const errorRate = logs.filter(l => l.status === 'failure').length / Math.max(totalLogs, 1) * 100;
    const criticalEvents = logs.filter(l => l.severity === 'critical').length;
    const securityIncidents = logs.filter(l => l.category === 'security' && l.status === 'failure').length;

    const retentionCompliance = logs.filter(l => !l.isArchived).length / Math.max(totalLogs, 1) * 100;
    const lastArchived = logs.filter(l => l.isArchived).sort((a, b) =>
      (b.archivedAt?.getTime() || 0) - (a.archivedAt?.getTime() || 0)
    )[0]?.archivedAt || new Date();

    const nextArchival = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next day

    return {
      totalLogs,
      logsByCategory,
      logsBySeverity,
      logsByStatus,
      logsByUser,
      logsByAction,
      averageDuration,
      errorRate,
      criticalEvents,
      securityIncidents,
      retentionCompliance,
      lastArchived,
      nextArchival
    };
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): AuditMetrics {
    return {
      totalLogs: 0,
      logsByCategory: {},
      logsBySeverity: {},
      logsByStatus: {},
      logsByUser: {},
      logsByAction: {},
      averageDuration: 0,
      errorRate: 0,
      criticalEvents: 0,
      securityIncidents: 0,
      retentionCompliance: 0,
      lastArchived: new Date(),
      nextArchival: new Date()
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo audit logs
    const demoLogs: AuditLog[] = [
      {
        id: 'audit-1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        userId: 'admin',
        userName: 'Administrator',
        action: 'LOGIN',
        resource: 'authentication',
        resourceId: 'auth-123',
        details: {
          before: null,
          after: { loginTime: new Date().toISOString() },
          metadata: { loginMethod: 'password' }
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session-123',
        severity: 'medium',
        category: 'authentication',
        status: 'success',
        duration: 150,
        tags: ['login', 'admin'],
        environment: 'production',
        retentionDays: 365,
        isArchived: false
      },
      {
        id: 'audit-2',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        userId: 'user-1',
        userName: 'John Doe',
        action: 'CREATE_USER',
        resource: 'user_management',
        resourceId: 'user-456',
        details: {
          before: null,
          after: {
            userId: 'user-456',
            email: 'john.doe@company.com',
            role: 'user'
          },
          metadata: { createdBy: 'admin' }
        },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session-124',
        severity: 'high',
        category: 'user_management',
        status: 'success',
        duration: 300,
        tags: ['user_creation', 'admin_action'],
        environment: 'production',
        retentionDays: 365,
        isArchived: false
      },
      {
        id: 'audit-3',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        userId: 'user-2',
        userName: 'Jane Smith',
        action: 'UNAUTHORIZED_ACCESS',
        resource: 'admin_panel',
        resourceId: 'admin-789',
        details: {
          before: null,
          after: null,
          metadata: { attemptedAction: 'view_sensitive_data' }
        },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session-125',
        severity: 'critical',
        category: 'security',
        status: 'failure',
        errorMessage: 'Insufficient permissions',
        duration: 50,
        tags: ['security_incident', 'unauthorized_access'],
        environment: 'production',
        retentionDays: 365,
        isArchived: false
      }
    ];

    this._logs.set(demoLogs);

    // Create demo policies
    const demoPolicies: AuditPolicy[] = [
      {
        id: 'policy-1',
        name: 'Security Incident Detection',
        description: 'Detect and alert on security incidents',
        rules: [
          {
            id: 'rule-1',
            name: 'Critical Security Events',
            condition: 'severity = critical AND category = security',
            action: 'alert',
            severity: 'critical',
            isEnabled: true,
            description: 'Alert on critical security events',
            notificationChannels: ['email', 'slack'],
            escalationLevel: 1
          }
        ],
        isActive: true,
        priority: 1,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        createdBy: 'admin'
      }
    ];

    this._policies.set(demoPolicies);

    // Create demo reports
    const demoReports: AuditReport[] = [
      {
        id: 'report-1',
        name: 'Daily Security Report',
        description: 'Daily security audit report',
        filters: {
          category: 'security',
          dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
          dateTo: new Date()
        },
        generatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        generatedBy: 'admin',
        period: {
          from: new Date(Date.now() - 24 * 60 * 60 * 1000),
          to: new Date()
        },
        summary: {
          totalEvents: 5,
          criticalEvents: 1,
          securityIncidents: 1,
          topUsers: { 'admin': 3, 'user-1': 2 },
          topActions: { 'LOGIN': 2, 'UNAUTHORIZED_ACCESS': 1 },
          topResources: { 'authentication': 2, 'admin_panel': 1 }
        },
        data: demoLogs.filter(l => l.category === 'security'),
        format: 'pdf',
        isScheduled: true,
        schedule: {
          frequency: 'daily',
          time: '09:00',
          recipients: ['security@company.com', 'admin@company.com']
        }
      }
    ];

    this._reports.set(demoReports);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'audit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}
