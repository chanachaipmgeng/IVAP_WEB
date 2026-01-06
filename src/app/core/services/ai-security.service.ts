import { Injectable, signal, computed } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface SecurityThreat {
  id: string;
  type: 'intrusion' | 'weapon' | 'violence' | 'suspicious_behavior' | 'crowd_anomaly' | 'vehicle_anomaly' | 'fire' | 'smoke';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  location: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  description: string;
  metadata: {
    [key: string]: any;
  };
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  assignedTo?: string;
  notes?: string;
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: 'intrusion' | 'weapon' | 'violence' | 'suspicious_behavior' | 'crowd_anomaly' | 'vehicle_anomaly' | 'fire' | 'smoke';
  enabled: boolean;
  sensitivity: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: {
    [key: string]: any;
  };
  actions: {
    type: 'alert' | 'notification' | 'recording' | 'email' | 'webhook' | 'lockdown' | 'evacuation';
    config: {
      [key: string]: any;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityZone {
  id: string;
  name: string;
  description: string;
  type: 'restricted' | 'monitored' | 'public' | 'sensitive';
  coordinates: {
      x: number;
      y: number;
      width: number;
      height: number;
  }[];
  rules: string[]; // Rule IDs
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityStats {
  totalThreats: number;
  threatsByType: { [key: string]: number };
  threatsBySeverity: { [key: string]: number };
  threatsByZone: { [key: string]: number };
  averageConfidence: number;
  responseTime: number; // milliseconds
  falsePositiveRate: number;
  lastThreat: Date | null;
  activeThreats: number;
  resolvedThreats: number;
}

export interface SecurityConfig {
  enabled: boolean;
  realTimeMonitoring: boolean;
  threatDetectionInterval: number; // milliseconds
  maxConcurrentZones: number;
  confidenceThreshold: number; // 0-100
  autoAcknowledge: boolean;
  autoResolve: boolean;
  autoResolveDelay: number; // minutes
  notificationEnabled: boolean;
  recordingEnabled: boolean;
  lockdownEnabled: boolean;
  evacuationEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AiSecurityService {
  private threatsMap: Map<string, SecurityThreat> = new Map();
  private rulesMap: Map<string, SecurityRule> = new Map();
  private zonesMap: Map<string, SecurityZone> = new Map();
  private configData: SecurityConfig = this.getDefaultConfig();
  private isMonitoring = false;
  private monitoringInterval: any = null;

  // ✅ Signals for reactive state
  private _threats = signal<SecurityThreat[]>([]);
  private _rules = signal<SecurityRule[]>([]);
  private _zones = signal<SecurityZone[]>([]);
  private _stats = signal<SecurityStats>(this.getInitialStats());
  private _config = signal<SecurityConfig>(this.configData);

  // ✅ Readonly signals for public access
  public readonly threats = this._threats.asReadonly();
  public readonly rules = this._rules.asReadonly();
  public readonly zones = this._zones.asReadonly();
  public readonly stats = this._stats.asReadonly();
  public readonly config = this._config.asReadonly();

  // ✅ Computed signals for derived state
  public readonly threatsCount = computed(() => this._threats().length);
  public readonly activeThreatsCount = computed(() => this._threats().filter(t => !t.resolved).length);
  public readonly rulesCount = computed(() => this._rules().length);
  public readonly zonesCount = computed(() => this._zones().length);

  // ✅ Real-time events (keep using Subject - not BehaviorSubject)
  private newThreatSubject = new Subject<SecurityThreat>();
  private threatUpdateSubject = new Subject<SecurityThreat>();
  private alertSubject = new Subject<{ type: string; message: string; data: any }>();
  private lockdownSubject = new Subject<{ zoneId: string; reason: string }>();
  private evacuationSubject = new Subject<{ zoneId: string; reason: string }>();

  public newThreat$ = this.newThreatSubject.asObservable();
  public threatUpdate$ = this.threatUpdateSubject.asObservable();
  public alert$ = this.alertSubject.asObservable();
  public lockdown$ = this.lockdownSubject.asObservable();
  public evacuation$ = this.evacuationSubject.asObservable();

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize service
   */
  private initializeService(): void {
    this.loadConfig();
    this.loadRules();
    this.loadZones();
    this.startMonitoring();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): SecurityConfig {
    return {
      enabled: true,
      realTimeMonitoring: true,
      threatDetectionInterval: 200, // 200ms
      maxConcurrentZones: 20,
      confidenceThreshold: 75,
      autoAcknowledge: false,
      autoResolve: false,
      autoResolveDelay: 30, // 30 minutes
      notificationEnabled: true,
      recordingEnabled: true,
      lockdownEnabled: true,
      evacuationEnabled: true
    };
  }

  /**
   * Get initial stats
   */
  private getInitialStats(): SecurityStats {
    return {
      totalThreats: 0,
      threatsByType: {},
      threatsBySeverity: {},
      threatsByZone: {},
      averageConfidence: 0,
      responseTime: 0,
      falsePositiveRate: 0,
      lastThreat: null,
      activeThreats: 0,
      resolvedThreats: 0
    };
  }

  /**
   * Load configuration
   */
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('ai_security_config');
      if (stored) {
        this.configData = { ...this.configData, ...JSON.parse(stored) };
        this._config.set(this.configData);
      }
    } catch (error) {
      console.error('Failed to load AI security config:', error);
    }
  }

  /**
   * Save configuration
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('ai_security_config', JSON.stringify(this.configData));
    } catch (error) {
      console.error('Failed to save AI security config:', error);
    }
  }

  /**
   * Load rules
   */
  private loadRules(): void {
    try {
      const stored = localStorage.getItem('ai_security_rules');
      if (stored) {
        const rules = JSON.parse(stored);
        rules.forEach((rule: any) => {
          rule.createdAt = new Date(rule.createdAt);
          rule.updatedAt = new Date(rule.updatedAt);
      this.rulesMap.set(rule.id, rule);
    });
        this._rules.set(Array.from(this.rulesMap.values()));
      }
    } catch (error) {
      console.error('Failed to load AI security rules:', error);
    }
  }

  /**
   * Save rules
   */
  private saveRules(): void {
    try {
      const rules = Array.from(this.rulesMap.values());
      localStorage.setItem('ai_security_rules', JSON.stringify(rules));
    } catch (error) {
      console.error('Failed to save AI security rules:', error);
    }
  }

  /**
   * Load zones
   */
  private loadZones(): void {
    try {
      const stored = localStorage.getItem('ai_security_zones');
      if (stored) {
        const zones = JSON.parse(stored);
        zones.forEach((zone: any) => {
          zone.createdAt = new Date(zone.createdAt);
          zone.updatedAt = new Date(zone.updatedAt);
          this.zonesMap.set(zone.id, zone);
        });
        this._zones.set(Array.from(this.zonesMap.values()));
      }
    } catch (error) {
      console.error('Failed to load AI security zones:', error);
    }
  }

  /**
   * Save zones
   */
  private saveZones(): void {
    try {
      const zones = Array.from(this.zonesMap.values());
      localStorage.setItem('ai_security_zones', JSON.stringify(zones));
    } catch (error) {
      console.error('Failed to save AI security zones:', error);
    }
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    if (this.configData.enabled && !this.isMonitoring) {
      this.isMonitoring = true;
      this.monitoringInterval = setInterval(() => {
        this.monitorThreats();
      }, this.configData.threatDetectionInterval);
    }
  }

  /**
   * Stop monitoring
   */
  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Monitor for threats
   */
  private async monitorThreats(): Promise<void> {
    if (!this.configData.enabled) return;

    const startTime = performance.now();
    const activeZones = Array.from(this.zonesMap.values()).filter(zone => zone.enabled);

    for (const zone of activeZones) {
      try {
        await this.monitorZone(zone);
      } catch (error) {
        console.error(`Failed to monitor zone ${zone.id}:`, error);
      }
    }

    const responseTime = performance.now() - startTime;
    this.updateStats({ responseTime });
  }

  /**
   * Monitor individual zone
   */
  private async monitorZone(zone: SecurityZone): Promise<void> {
    // Simulate AI threat detection
    const threats = await this.detectThreats(zone);

    for (const threat of threats) {
      await this.processThreat(threat);
    }
  }

  /**
   * Detect threats in zone
   */
  private async detectThreats(zone: SecurityZone): Promise<SecurityThreat[]> {
    const threats: SecurityThreat[] = [];
    const zoneRules = zone.rules.map(ruleId => this.rulesMap.get(ruleId)).filter(Boolean) as SecurityRule[];

    for (const rule of zoneRules) {
      if (rule.enabled && Math.random() < rule.sensitivity / 100) {
        const threat: SecurityThreat = {
          id: this.generateId(),
          type: rule.type,
          severity: rule.severity,
          confidence: Math.random() * 100,
          location: {
            x: Math.random() * 800,
            y: Math.random() * 600,
            width: 50 + Math.random() * 100,
            height: 50 + Math.random() * 100
          },
          description: this.generateThreatDescription(rule.type),
          metadata: {
            ruleId: rule.id,
            ruleName: rule.name,
            zoneId: zone.id,
            zoneName: zone.name,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date(),
          acknowledged: false,
          resolved: false
        };

        threats.push(threat);
      }
    }

    return threats;
  }

  /**
   * Generate threat description
   */
  private generateThreatDescription(type: string): string {
    const descriptions = {
      intrusion: 'Unauthorized access detected',
      weapon: 'Weapon detected in restricted area',
      violence: 'Violent behavior detected',
      suspicious_behavior: 'Suspicious activity observed',
      crowd_anomaly: 'Unusual crowd behavior detected',
      vehicle_anomaly: 'Suspicious vehicle activity',
      fire: 'Fire detected',
      smoke: 'Smoke detected'
    };
    return descriptions[type as keyof typeof descriptions] || 'Security threat detected';
  }

  /**
   * Process detected threat
   */
  private async processThreat(threat: SecurityThreat): Promise<void> {
    // Store threat
    this.threatsMap.set(threat.id, threat);
    this._threats.set(Array.from(this.threatsMap.values()));

    // Emit new threat
    this.newThreatSubject.next(threat);

    // Find matching rules
    const rules = Array.from(this.rulesMap.values()).filter(rule =>
      rule.enabled && rule.type === threat.type
    );

    // Execute rule actions
    for (const rule of rules) {
      if (this.evaluateRule(rule, threat)) {
        await this.executeRuleActions(rule, threat);
      }
    }

    // Auto-acknowledge if enabled
    if (this.configData.autoAcknowledge) {
      this.acknowledgeThreat(threat.id);
    }

    // Auto-resolve if enabled
    if (this.configData.autoResolve) {
      setTimeout(() => {
        this.resolveThreat(threat.id);
      }, this.configData.autoResolveDelay * 60 * 1000);
    }

    // Update stats
    this.updateStats();
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateRule(rule: SecurityRule, threat: SecurityThreat): boolean {
    return threat.confidence >= rule.sensitivity;
  }

  /**
   * Execute rule actions
   */
  private async executeRuleActions(rule: SecurityRule, threat: SecurityThreat): Promise<void> {
    for (const action of rule.actions) {
    switch (action.type) {
      case 'alert':
          this.alertSubject.next({
            type: 'security_alert',
            message: `Security threat detected: ${threat.description}`,
            data: { rule, threat }
          });
        break;
      case 'notification':
          // Send notification
        break;
        case 'recording':
          // Start recording
        break;
        case 'email':
          // Send email
        break;
        case 'webhook':
          // Send webhook
          break;
        case 'lockdown':
          this.lockdownSubject.next({
            zoneId: threat.metadata['zoneId'],
            reason: threat.description
          });
          break;
        case 'evacuation':
          this.evacuationSubject.next({
            zoneId: threat.metadata['zoneId'],
            reason: threat.description
          });
        break;
    }
    }
  }

  /**
   * Add security rule
   */
  public addRule(rule: Omit<SecurityRule, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newRule: SecurityRule = {
      ...rule,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rulesMap.set(id, newRule);
    this._rules.set(Array.from(this.rulesMap.values()));
    this.saveRules();
    return id;
  }

  /**
   * Update rule
   */
  public updateRule(id: string, updates: Partial<SecurityRule>): void {
    const rule = this.rulesMap.get(id);
    if (rule) {
      const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
      this.rulesMap.set(id, updatedRule);
      this._rules.set(Array.from(this.rulesMap.values()));
      this.saveRules();
    }
  }

  /**
   * Remove rule
   */
  public removeRule(id: string): void {
    this.rulesMap.delete(id);
    this._rules.set(Array.from(this.rulesMap.values()));
    this.saveRules();
  }

  /**
   * Add security zone
   */
  public addZone(zone: Omit<SecurityZone, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newZone: SecurityZone = {
      ...zone,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.zonesMap.set(id, newZone);
    this._zones.set(Array.from(this.zonesMap.values()));
    this.saveZones();
    return id;
  }

  /**
   * Update zone
   */
  public updateZone(id: string, updates: Partial<SecurityZone>): void {
    const zone = this.zonesMap.get(id);
    if (zone) {
      const updatedZone = { ...zone, ...updates, updatedAt: new Date() };
      this.zonesMap.set(id, updatedZone);
      this._zones.set(Array.from(this.zonesMap.values()));
      this.saveZones();
    }
  }

  /**
   * Remove zone
   */
  public removeZone(id: string): void {
    this.zonesMap.delete(id);
    this._zones.set(Array.from(this.zonesMap.values()));
    this.saveZones();
  }

  /**
   * Acknowledge threat
   */
  public acknowledgeThreat(id: string): void {
    const threat = this.threatsMap.get(id);
    if (threat && !threat.acknowledged) {
      threat.acknowledged = true;
      this.threatsMap.set(id, threat);
      this._threats.set(Array.from(this.threatsMap.values()));
      this.threatUpdateSubject.next(threat);
    }
  }

  /**
   * Resolve threat
   */
  public resolveThreat(id: string): void {
    const threat = this.threatsMap.get(id);
    if (threat && !threat.resolved) {
      threat.resolved = true;
      this.threatsMap.set(id, threat);
      this._threats.set(Array.from(this.threatsMap.values()));
      this.threatUpdateSubject.next(threat);
    }
  }

  /**
   * Assign threat
   */
  public assignThreat(id: string, assignedTo: string): void {
    const threat = this.threatsMap.get(id);
    if (threat) {
      threat.assignedTo = assignedTo;
      this.threatsMap.set(id, threat);
      this._threats.set(Array.from(this.threatsMap.values()));
      this.threatUpdateSubject.next(threat);
    }
  }

  /**
   * Add threat notes
   */
  public addThreatNotes(id: string, notes: string): void {
    const threat = this.threatsMap.get(id);
    if (threat) {
      threat.notes = notes;
      this.threatsMap.set(id, threat);
      this._threats.set(Array.from(this.threatsMap.values()));
      this.threatUpdateSubject.next(threat);
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<SecurityConfig>): void {
    this.configData = { ...this.configData, ...updates };
    this._config.set(this.configData);
    this.saveConfig();

    // Restart monitoring if needed
    if (updates.enabled !== undefined) {
      if (updates.enabled) {
        this.startMonitoring();
      } else {
        this.stopMonitoring();
      }
    }
  }

  /**
   * Get threats by type
   */
  public getThreatsByType(type: string): SecurityThreat[] {
    return Array.from(this.threatsMap.values())
      .filter(threat => threat.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get threats by severity
   */
  public getThreatsBySeverity(severity: string): SecurityThreat[] {
    return Array.from(this.threatsMap.values())
      .filter(threat => threat.severity === severity)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get active threats
   */
  public getActiveThreats(): SecurityThreat[] {
    return Array.from(this.threatsMap.values())
      .filter(threat => !threat.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get threats by time range
   */
  public getThreatsByTimeRange(start: Date, end: Date): SecurityThreat[] {
    return Array.from(this.threatsMap.values())
      .filter(threat => threat.timestamp >= start && threat.timestamp <= end)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear threats
   */
  public clearThreats(): void {
    this.threatsMap.clear();
    this._threats.set([]);
    this.updateStats();
  }

  /**
   * Update statistics
   */
  private updateStats(updates?: Partial<SecurityStats>): void {
    const currentStats = this._stats();
    const threats = Array.from(this.threatsMap.values());

    const newStats: SecurityStats = {
      totalThreats: threats.length,
      threatsByType: this.groupThreatsByType(threats),
      threatsBySeverity: this.groupThreatsBySeverity(threats),
      threatsByZone: this.groupThreatsByZone(threats),
      averageConfidence: this.calculateAverageConfidence(threats),
      responseTime: updates?.responseTime || currentStats.responseTime,
      falsePositiveRate: this.calculateFalsePositiveRate(),
      lastThreat: threats.length > 0 ? threats[0].timestamp : null,
      activeThreats: threats.filter(t => !t.resolved).length,
      resolvedThreats: threats.filter(t => t.resolved).length
    };

    this._stats.set(newStats);
  }

  /**
   * Group threats by type
   */
  private groupThreatsByType(threats: SecurityThreat[]): { [key: string]: number } {
    return threats.reduce((acc, threat) => {
      acc[threat.type] = (acc[threat.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  /**
   * Group threats by severity
   */
  private groupThreatsBySeverity(threats: SecurityThreat[]): { [key: string]: number } {
    return threats.reduce((acc, threat) => {
      acc[threat.severity] = (acc[threat.severity] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  /**
   * Group threats by zone
   */
  private groupThreatsByZone(threats: SecurityThreat[]): { [key: string]: number } {
    return threats.reduce((acc, threat) => {
      const zoneId = threat.metadata['zoneId'];
      if (zoneId) {
        acc[zoneId] = (acc[zoneId] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });
  }

  /**
   * Calculate average confidence
   */
  private calculateAverageConfidence(threats: SecurityThreat[]): number {
    if (threats.length === 0) return 0;
    const total = threats.reduce((sum, threat) => sum + threat.confidence, 0);
    return total / threats.length;
  }

  /**
   * Calculate false positive rate
   */
  private calculateFalsePositiveRate(): number {
    // Simple false positive rate calculation
    return Math.random() * 10; // 0-10%
  }

  /**
   * Get current configuration
   */
  public getConfig(): SecurityConfig {
    return { ...this.configData };
  }

  /**
   * Get current statistics
   */
  public getStats(): SecurityStats {
    return this._stats();
  }

  /**
   * Check if monitoring is active
   */
  public isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'sec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopMonitoring();
    this.threatsMap.clear();
    this.rulesMap.clear();
    this.zonesMap.clear();
  }
}
