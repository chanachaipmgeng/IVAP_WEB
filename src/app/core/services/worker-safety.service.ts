import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval, of } from 'rxjs';
import { map, takeUntil, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  SafetyViolation,
  SafetyMetrics,
  SafetyZone,
  SafetyRule,
  SafetyAlert
} from '../models/safety.model';

@Injectable({
  providedIn: 'root'
})
export class WorkerSafetyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/safety`;

  // ✅ Signals for reactive state
  private _violations = signal<SafetyViolation[]>([]);
  private _zones = signal<SafetyZone[]>([]);
  private _alerts = signal<SafetyAlert[]>([]);
  private _metrics = signal<SafetyMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly violations = this._violations.asReadonly();
  public readonly zones = this._zones.asReadonly();
  public readonly alerts = this._alerts.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly violationsCount = computed(() => this._violations().length);
  public readonly activeViolationsCount = computed(() => this._violations().filter(v => v.status === 'active').length);
  public readonly zonesCount = computed(() => this._zones().length);
  public readonly activeZonesCount = computed(() => this._zones().filter(z => z.isActive).length);
  public readonly alertsCount = computed(() => this._alerts().length);
  public readonly unreadAlertsCount = computed(() => this._alerts().filter(a => a.status === 'pending' || a.status === 'sent').length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public violations$ = new Observable<SafetyViolation[]>(observer => {
    observer.next(this._violations());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public zones$ = new Observable<SafetyZone[]>(observer => {
    observer.next(this._zones());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public alerts$ = new Observable<SafetyAlert[]>(observer => {
    observer.next(this._alerts());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public metrics$ = new Observable<SafetyMetrics>(observer => {
    observer.next(this._metrics());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  private isMonitoring = false;
  private monitoringInterval?: any;

  constructor() {
    // Initialize with empty data, load from API when needed
  }

  /**
   * Start safety monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.simulateSafetyDetection();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stop safety monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }

  /**
   * Detect safety violations from video frame
   */
  async detectViolations(frameData: any, zoneId: string): Promise<SafetyViolation[]> {
    const violations: SafetyViolation[] = [];

    // Simulate AI detection
    const detectionResults = await this.simulateAIDetection(frameData);

    for (const result of detectionResults) {
      const violation: SafetyViolation = {
        id: this.generateId(),
        type: result.type,
        severity: this.calculateSeverity(result.confidence, result.type),
        confidence: result.confidence,
        location: result.location,
        zoneId: zoneId,
        timestamp: new Date(),
        imageUrl: result.imageUrl,
        videoUrl: result.videoUrl,
        employeeId: result.employeeId,
        description: this.getViolationDescription(result.type),
        status: 'active'
      };

      violations.push(violation);
    }

    // Add to violations list
    this._violations.update(current => [...current, ...violations]);

    // Generate alerts for high severity violations
    for (const violation of violations) {
      if (violation.severity === 'high' || violation.severity === 'critical') {
        await this.generateAlert(violation);
      }
    }

    // Update metrics
    this.updateMetrics();

    return violations;
  }

  /**
   * Acknowledge violation
   */
  acknowledgeViolation(violationId: string, companyId: string, acknowledgedBy: string): Observable<SafetyViolation> {
    return this.http.post<SafetyViolation>(`${this.apiUrl}/violations/${violationId}/acknowledge`, {}, {
      params: new HttpParams().set('company_id', companyId)
    }).pipe(
      tap((violation) => {
        const violations = this._violations();
        const index = violations.findIndex(v => v.id === violation.id);
        if (index !== -1) {
          violations[index] = violation;
          this._violations.set([...violations]);
          this.loadMetrics(companyId).subscribe();
        }
      }),
      catchError((error) => {
        console.error('Error acknowledging violation:', error);
        // Fallback to local update
        const violations = this._violations();
        const violation = violations.find(v => v.id === violationId);
        if (violation) {
          violation.status = 'acknowledged';
          violation.acknowledgedBy = acknowledgedBy;
          violation.acknowledgedAt = new Date();
          this._violations.set([...violations]);
          this.updateMetrics();
        }
        return of(violation!);
      })
    );
  }

  /**
   * Resolve violation
   */
  resolveViolation(violationId: string, companyId: string, resolvedBy: string): Observable<SafetyViolation> {
    return this.http.post<SafetyViolation>(`${this.apiUrl}/violations/${violationId}/resolve`, {}, {
      params: new HttpParams().set('company_id', companyId)
    }).pipe(
      tap((violation) => {
        const violations = this._violations();
        const index = violations.findIndex(v => v.id === violation.id);
        if (index !== -1) {
          violations[index] = violation;
          this._violations.set([...violations]);
          this.loadMetrics(companyId).subscribe();
        }
      }),
      catchError((error) => {
        console.error('Error resolving violation:', error);
        // Fallback to local update
        const violations = this._violations();
        const violation = violations.find(v => v.id === violationId);
        if (violation) {
          violation.status = 'resolved';
          violation.resolvedBy = resolvedBy;
          violation.resolvedAt = new Date();
          this._violations.set([...violations]);
          this.updateMetrics();
        }
        return of(violation!);
      })
    );
  }

  /**
   * Load violations from API
   */
  loadViolations(companyId: string, filter?: {
    type?: string;
    severity?: string;
    status?: string;
    zoneId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    size?: number;
  }): Observable<SafetyViolation[]> {
    let params = new HttpParams().set('company_id', companyId);

    if (filter) {
      if (filter.type) params = params.set('violation_type', filter.type);
      if (filter.severity) params = params.set('severity', filter.severity);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.zoneId) params = params.set('zone_id', filter.zoneId);
      if (filter.dateFrom) params = params.set('start_date', filter.dateFrom.toISOString());
      if (filter.dateTo) params = params.set('end_date', filter.dateTo.toISOString());
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.size) params = params.set('size', filter.size.toString());
    }

    return this.http.get<{ items: SafetyViolation[], total: number }>(`${this.apiUrl}/violations`, { params }).pipe(
      map((response) => {
        const violations = response.items.map(v => ({
          ...v,
          timestamp: new Date(v.timestamp),
          acknowledgedAt: v.acknowledgedAt ? new Date(v.acknowledgedAt) : undefined,
          resolvedAt: v.resolvedAt ? new Date(v.resolvedAt) : undefined
        }));
        this._violations.set(violations);
        return violations;
      }),
      catchError((error) => {
        console.error('Error loading violations:', error);
        return of(this._violations());
      })
    );
  }

  /**
   * Get violations by filter (from local cache)
   */
  getViolations(filter?: {
    type?: string;
    severity?: string;
    status?: string;
    zoneId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): SafetyViolation[] {
    let violations = this._violations();

    if (filter) {
      if (filter.type) {
        violations = violations.filter(v => v.type === filter.type);
      }
      if (filter.severity) {
        violations = violations.filter(v => v.severity === filter.severity);
      }
      if (filter.status) {
        violations = violations.filter(v => v.status === filter.status);
      }
      if (filter.zoneId) {
        violations = violations.filter(v => v.zoneId === filter.zoneId);
      }
      if (filter.dateFrom) {
        violations = violations.filter(v => v.timestamp >= filter.dateFrom!);
      }
      if (filter.dateTo) {
        violations = violations.filter(v => v.timestamp <= filter.dateTo!);
      }
    }

    return violations;
  }

  /**
   * Load safety metrics from API
   */
  loadMetrics(companyId: string): Observable<SafetyMetrics> {
    const params = new HttpParams().set('company_id', companyId);

    return this.http.get<SafetyMetrics>(`${this.apiUrl}/metrics`, { params }).pipe(
      tap((metrics) => {
        this._metrics.set(metrics);
      }),
      catchError((error) => {
        console.error('Error loading metrics:', error);
        return of(this._metrics());
      })
    );
  }

  /**
   * Get safety metrics (from local cache)
   */
  getMetrics(): SafetyMetrics {
    return this._metrics();
  }

  /**
   * Load safety zones from API
   */
  loadZones(companyId: string): Observable<SafetyZone[]> {
    const params = new HttpParams().set('company_id', companyId);

    return this.http.get<SafetyZone[]>(`${this.apiUrl}/zones`, { params }).pipe(
      map((zones) => {
        const formattedZones = zones.map(z => ({
          ...z,
          createdAt: z.createdAt ? (typeof z.createdAt === 'string' ? new Date(z.createdAt) : z.createdAt) : new Date(),
          updatedAt: z.updatedAt ? (typeof z.updatedAt === 'string' ? new Date(z.updatedAt) : z.updatedAt) : new Date()
        }));
        this._zones.set(formattedZones);
        return formattedZones;
      }),
      catchError((error) => {
        console.error('Error loading zones:', error);
        return of(this._zones());
      })
    );
  }

  /**
   * Get safety zones (from local cache)
   */
  getZones(): SafetyZone[] {
    return this._zones();
  }

  /**
   * Create safety zone
   */
  createZone(companyId: string, zone: Omit<SafetyZone, 'id' | 'createdAt' | 'updatedAt'>): Observable<SafetyZone> {
    const params = new HttpParams().set('company_id', companyId);

    return this.http.post<SafetyZone>(`${this.apiUrl}/zones`, {
      name: zone.name,
      zone_type: zone.type,
      coordinates: zone.coordinates,
      rules: zone.rules,
      metadata: {}
    }, { params }).pipe(
      map((newZone) => {
        const formattedZone: SafetyZone = {
          ...newZone,
          createdAt: newZone.createdAt ? (typeof newZone.createdAt === 'string' ? new Date(newZone.createdAt) : newZone.createdAt) : new Date(),
          updatedAt: newZone.updatedAt ? (typeof newZone.updatedAt === 'string' ? new Date(newZone.updatedAt) : newZone.updatedAt) : new Date()
        };
        const zones = this._zones();
        this._zones.set([...zones, formattedZone]);
        return formattedZone;
      }),
      catchError((error) => {
        console.error('Error creating zone:', error);
        // Fallback to local creation
        const fallbackZone: SafetyZone = {
          ...zone,
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const zones = this._zones();
        this._zones.set([...zones, fallbackZone]);
        return of(fallbackZone);
      })
    );
  }

  /**
   * Update safety zone
   */
  updateZone(zoneId: string, companyId: string, updates: Partial<SafetyZone>): Observable<SafetyZone> {
    const params = new HttpParams().set('company_id', companyId);

    return this.http.put<SafetyZone>(`${this.apiUrl}/zones/${zoneId}`, {
      name: updates.name,
      zone_type: updates.type,
      coordinates: updates.coordinates,
      is_active: updates.isActive,
      rules: updates.rules,
      metadata: {}
    }, { params }).pipe(
      map((updatedZone) => {
        const formattedZone: SafetyZone = {
          ...updatedZone,
          createdAt: updatedZone.createdAt ? (typeof updatedZone.createdAt === 'string' ? new Date(updatedZone.createdAt) : updatedZone.createdAt) : new Date(),
          updatedAt: updatedZone.updatedAt ? (typeof updatedZone.updatedAt === 'string' ? new Date(updatedZone.updatedAt) : updatedZone.updatedAt) : new Date()
        };
        const zones = this._zones();
        const zoneIndex = zones.findIndex(z => z.id === zoneId);
        if (zoneIndex !== -1) {
          zones[zoneIndex] = formattedZone;
          this._zones.set([...zones]);
        }
        return formattedZone;
      }),
      catchError((error) => {
        console.error('Error updating zone:', error);
        // Fallback to local update
        const zones = this._zones();
        const zoneIndex = zones.findIndex(z => z.id === zoneId);
        if (zoneIndex !== -1) {
          zones[zoneIndex] = {
            ...zones[zoneIndex],
            ...updates,
            updatedAt: new Date()
          };
          this._zones.set([...zones]);
        }
        return of(zones[zoneIndex]);
      })
    );
  }

  /**
   * Delete safety zone
   */
  deleteZone(zoneId: string, companyId: string): Observable<void> {
    const params = new HttpParams().set('company_id', companyId);

    return this.http.delete<void>(`${this.apiUrl}/zones/${zoneId}`, { params }).pipe(
      tap(() => {
        const zones = this._zones();
        this._zones.set(zones.filter(z => z.id !== zoneId));
      }),
      catchError((error) => {
        console.error('Error deleting zone:', error);
        // Fallback to local delete
        const zones = this._zones();
        this._zones.set(zones.filter(z => z.id !== zoneId));
        return of(undefined);
      })
    );
  }

  /**
   * Get safety alerts
   */
  getAlerts(): SafetyAlert[] {
    return this._alerts();
  }

  /**
   * Generate safety report
   */
  generateSafetyReport(options: {
    dateFrom: Date;
    dateTo: Date;
    zoneIds?: string[];
    includeImages?: boolean;
  }): any {
    const violations = this.getViolations({
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
      zoneId: options.zoneIds?.[0]
    });

    const report = {
      period: {
        from: options.dateFrom,
        to: options.dateTo
      },
      summary: {
        totalViolations: violations.length,
        violationsByType: this.groupBy(violations, 'type'),
        violationsBySeverity: this.groupBy(violations, 'severity'),
        violationsByLocation: this.groupBy(violations, 'location'),
        averageResponseTime: this.calculateAverageResponseTime(violations),
        resolutionRate: this.calculateResolutionRate(violations)
      },
      violations: violations.map(v => ({
        ...v,
        imageUrl: options.includeImages ? v.imageUrl : undefined
      })),
      generatedAt: new Date()
    };

    return report;
  }

  /**
   * Simulate AI detection
   */
  private async simulateAIDetection(frameData: any): Promise<any[]> {
    // Simulate random detection results
    const detectionTypes = ['helmet', 'safety_vest', 'smoking', 'phone_usage', 'fall_detection'];
    const results = [];

    // Random chance of detection
    if (Math.random() < 0.1) { // 10% chance
      const type = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
      results.push({
        type: type,
        confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
        location: `Zone ${Math.floor(Math.random() * 5) + 1}`,
        imageUrl: `assets/images/safety-violations/${type}-${Date.now()}.jpg`,
        videoUrl: `assets/videos/safety-violations/${type}-${Date.now()}.mp4`,
        employeeId: `EMP${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      });
    }

    return results;
  }

  /**
   * Simulate safety detection
   */
  private simulateSafetyDetection(): void {
    if (Math.random() < 0.05) { // 5% chance every 5 seconds
      const zones = this._zones().filter(z => z.isActive);
      if (zones.length > 0) {
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        this.detectViolations({}, randomZone.id);
      }
    }
  }

  /**
   * Generate alert for violation
   */
  private async generateAlert(violation: SafetyViolation): Promise<void> {
    const alert: SafetyAlert = {
      id: this.generateId(),
      violationId: violation.id,
      type: 'immediate',
      priority: violation.severity === 'critical' ? 'critical' : 'high',
      message: `Safety violation detected: ${violation.description} in ${violation.location}`,
      recipients: ['safety@company.com', 'supervisor@company.com'],
      sentAt: new Date(),
      status: 'sent',
      deliveryMethod: 'dashboard'
    };

    this._alerts.update(alerts => [...alerts, alert]);
  }

  /**
   * Calculate violation severity
   */
  private calculateSeverity(confidence: number, type: string): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence >= 0.9) return 'critical';
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  }

  /**
   * Get violation description
   */
  private getViolationDescription(type: string): string {
    const descriptions = {
      helmet: 'Worker not wearing safety helmet',
      safety_vest: 'Worker not wearing safety vest',
      smoking: 'Smoking detected in restricted area',
      phone_usage: 'Phone usage detected during work',
      fall_detection: 'Potential fall or slip detected'
    };
    return descriptions[type as keyof typeof descriptions] || 'Unknown safety violation';
  }

  /**
   * Update safety metrics
   */
  private updateMetrics(): void {
    const violations = this._violations();
    const metrics = this.calculateMetrics(violations);
    this._metrics.set(metrics);
  }

  /**
   * Calculate safety metrics
   */
  private calculateMetrics(violations: SafetyViolation[]): SafetyMetrics {
    const totalViolations = violations.length;
    const violationsByType = this.groupBy(violations, 'type');
    const violationsBySeverity = this.groupBy(violations, 'severity');
    const violationsByLocation = this.groupBy(violations, 'location');

    const averageResponseTime = this.calculateAverageResponseTime(violations);
    const resolutionRate = this.calculateResolutionRate(violations);

    const safetyScore = this.calculateSafetyScore(violations);
    const trend = this.calculateTrend(violations);

    return {
      totalViolations,
      violationsByType,
      violationsBySeverity,
      violationsByLocation,
      averageResponseTime,
      resolutionRate,
      safetyScore,
      trend
    };
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(violations: SafetyViolation[]): number {
    const acknowledgedViolations = violations.filter(v => v.acknowledgedAt && v.timestamp);
    if (acknowledgedViolations.length === 0) return 0;

    const totalTime = acknowledgedViolations.reduce((sum, v) => {
      if (v.acknowledgedAt && v.timestamp) {
        const acknowledgedAt = typeof v.acknowledgedAt === 'string' ? new Date(v.acknowledgedAt) : v.acknowledgedAt;
        const timestamp = typeof v.timestamp === 'string' ? new Date(v.timestamp) : v.timestamp;
        return sum + (acknowledgedAt.getTime() - timestamp.getTime());
      }
      return sum;
    }, 0);

    return totalTime / acknowledgedViolations.length / 1000 / 60; // in minutes
  }

  /**
   * Calculate resolution rate
   */
  private calculateResolutionRate(violations: SafetyViolation[]): number {
    if (violations.length === 0) return 0;
    const resolvedViolations = violations.filter(v => v.status === 'resolved');
    return (resolvedViolations.length / violations.length) * 100;
  }

  /**
   * Calculate safety score
   */
  private calculateSafetyScore(violations: SafetyViolation[]): number {
    if (violations.length === 0) return 100;

    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const highViolations = violations.filter(v => v.severity === 'high').length;
    const mediumViolations = violations.filter(v => v.severity === 'medium').length;
    const lowViolations = violations.filter(v => v.severity === 'low').length;

    const score = 100 - (criticalViolations * 10 + highViolations * 5 + mediumViolations * 2 + lowViolations * 1);
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate trend
   */
  private calculateTrend(violations: SafetyViolation[]): 'improving' | 'stable' | 'declining' {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentViolations = violations.filter(v => v.timestamp >= lastWeek);
    const olderViolations = violations.filter(v => v.timestamp >= twoWeeksAgo && v.timestamp < lastWeek);

    if (recentViolations.length < olderViolations.length) return 'improving';
    if (recentViolations.length > olderViolations.length) return 'declining';
    return 'stable';
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
   * Get default metrics
   */
  private getDefaultMetrics(): SafetyMetrics {
    return {
      totalViolations: 0,
      violationsByType: {},
      violationsBySeverity: {},
      violationsByLocation: {},
      averageResponseTime: 0,
      resolutionRate: 0,
      safetyScore: 100,
      trend: 'stable'
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo zones
    const demoZones: SafetyZone[] = [
      {
        id: 'zone-1',
        name: 'Construction Site A',
        type: 'construction',
        coordinates: { x: 100, y: 100, width: 200, height: 150 },
        rules: [
          {
            id: 'rule-1',
            type: 'helmet_required',
            severity: 'critical',
            isEnabled: true,
            threshold: 0.8,
            description: 'Hard hat required in construction area'
          },
          {
            id: 'rule-2',
            type: 'safety_vest_required',
            severity: 'high',
            isEnabled: true,
            threshold: 0.7,
            description: 'Safety vest required in construction area'
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'zone-2',
        name: 'Manufacturing Floor',
        type: 'manufacturing',
        coordinates: { x: 300, y: 100, width: 250, height: 200 },
        rules: [
          {
            id: 'rule-3',
            type: 'no_smoking',
            severity: 'high',
            isEnabled: true,
            threshold: 0.9,
            description: 'No smoking in manufacturing area'
          },
          {
            id: 'rule-4',
            type: 'no_phone',
            severity: 'medium',
            isEnabled: true,
            threshold: 0.8,
            description: 'No phone usage during work'
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this._zones.set(demoZones);

    // Create demo violations
    const demoViolations: SafetyViolation[] = [
      {
        id: 'violation-1',
        type: 'helmet',
        severity: 'high',
        confidence: 0.92,
        location: 'Construction Site A',
        zoneId: 'zone-1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        imageUrl: 'assets/images/safety-violations/helmet-1.jpg',
        description: 'Worker not wearing safety helmet',
        status: 'acknowledged',
        acknowledgedBy: 'supervisor-1',
        acknowledgedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
      },
      {
        id: 'violation-2',
        type: 'smoking',
        severity: 'critical',
        confidence: 0.95,
        location: 'Manufacturing Floor',
        zoneId: 'zone-2',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        imageUrl: 'assets/images/safety-violations/smoking-1.jpg',
        description: 'Smoking detected in restricted area',
        status: 'active'
      }
    ];

    this._violations.set(demoViolations);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'safety-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

