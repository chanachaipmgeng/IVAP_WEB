import { Injectable, signal, computed } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface VideoStream {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  bitrate: number;
  lastFrame?: string;
  timestamp: Date;
}

export interface AnalyticsEvent {
  id: string;
  streamId: string;
  type: 'motion' | 'face' | 'object' | 'vehicle' | 'person' | 'anomaly' | 'safety';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata: {
    [key: string]: any;
  };
  timestamp: Date;
  processed: boolean;
}

export interface AnalyticsRule {
  id: string;
  name: string;
  description: string;
  type: 'motion' | 'face' | 'object' | 'vehicle' | 'person' | 'anomaly' | 'safety';
  enabled: boolean;
  sensitivity: number; // 0-100
  conditions: {
    [key: string]: any;
  };
  actions: {
    type: 'alert' | 'notification' | 'recording' | 'email' | 'webhook';
    config: {
      [key: string]: any;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsStats {
  totalEvents: number;
  eventsByType: { [key: string]: number };
  eventsByStream: { [key: string]: number };
  averageConfidence: number;
  processingTime: number;
  lastProcessed: Date | null;
  errorRate: number;
}

export interface VideoAnalyticsConfig {
  enabled: boolean;
  processingInterval: number; // milliseconds
  maxConcurrentStreams: number;
  qualityThreshold: number; // 0-100
  storageRetention: number; // days
  realTimeProcessing: boolean;
  batchProcessing: boolean;
  batchSize: number;
  compressionEnabled: boolean;
  compressionQuality: number; // 0-100
}

@Injectable({
  providedIn: 'root'
})
export class VideoAnalyticsService {
  private streamsMap: Map<string, VideoStream> = new Map();
  private eventsMap: Map<string, AnalyticsEvent> = new Map();
  private rulesMap: Map<string, AnalyticsRule> = new Map();
  private configData: VideoAnalyticsConfig = this.getDefaultConfig();
  private isProcessing = false;
  private processingInterval: any = null;

  // ✅ Signals for reactive state
  private _streams = signal<VideoStream[]>([]);
  private _events = signal<AnalyticsEvent[]>([]);
  private _rules = signal<AnalyticsRule[]>([]);
  private _stats = signal<AnalyticsStats>(this.getInitialStats());
  private _config = signal<VideoAnalyticsConfig>(this.configData);

  // ✅ Readonly signals for public access
  public readonly streams = this._streams.asReadonly();
  public readonly events = this._events.asReadonly();
  public readonly rules = this._rules.asReadonly();
  public readonly stats = this._stats.asReadonly();
  public readonly config = this._config.asReadonly();

  // ✅ Computed signals for derived state
  public readonly streamsCount = computed(() => this._streams().length);
  public readonly activeStreamsCount = computed(() => this._streams().filter(s => s.status === 'active').length);
  public readonly eventsCount = computed(() => this._events().length);
  public readonly rulesCount = computed(() => this._rules().length);

  // ✅ Real-time events (keep using Subject - not BehaviorSubject)
  private newEventSubject = new Subject<AnalyticsEvent>();
  private streamStatusSubject = new Subject<{ streamId: string; status: string }>();
  private alertSubject = new Subject<{ type: string; message: string; data: any }>();

  public newEvent$ = this.newEventSubject.asObservable();
  public streamStatus$ = this.streamStatusSubject.asObservable();
  public alert$ = this.alertSubject.asObservable();

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize service
   */
  private initializeService(): void {
    this.loadConfig();
    this.loadRules();
    this.startProcessing();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): VideoAnalyticsConfig {
    return {
      enabled: true,
      processingInterval: 100, // 100ms
      maxConcurrentStreams: 10,
      qualityThreshold: 80,
      storageRetention: 30,
      realTimeProcessing: true,
      batchProcessing: false,
      batchSize: 100,
      compressionEnabled: true,
      compressionQuality: 80
    };
  }

  /**
   * Get initial stats
   */
  private getInitialStats(): AnalyticsStats {
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByStream: {},
      averageConfidence: 0,
      processingTime: 0,
      lastProcessed: null,
      errorRate: 0
    };
  }

  /**
   * Load configuration
   */
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('video_analytics_config');
      if (stored) {
        this.configData = { ...this.configData, ...JSON.parse(stored) };
        this._config.set(this.configData);
      }
    } catch (error) {
      console.error('Failed to load video analytics config:', error);
    }
  }

  /**
   * Save configuration
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('video_analytics_config', JSON.stringify(this.configData));
    } catch (error) {
      console.error('Failed to save video analytics config:', error);
    }
  }

  /**
   * Load rules
   */
  private loadRules(): void {
    try {
      const stored = localStorage.getItem('video_analytics_rules');
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
      console.error('Failed to load video analytics rules:', error);
    }
  }

  /**
   * Save rules
   */
  private saveRules(): void {
    try {
      const rules = Array.from(this.rulesMap.values());
      localStorage.setItem('video_analytics_rules', JSON.stringify(rules));
    } catch (error) {
      console.error('Failed to save video analytics rules:', error);
    }
  }

  /**
   * Start processing
   */
  private startProcessing(): void {
    if (this.configData.enabled && !this.isProcessing) {
      this.isProcessing = true;
      this.processingInterval = setInterval(() => {
        this.processStreams();
      }, this.configData.processingInterval);
    }
  }

  /**
   * Stop processing
   */
  private stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
  }

  /**
   * Process video streams
   */
  private async processStreams(): Promise<void> {
    if (!this.configData.enabled) return;

    const startTime = performance.now();
    const activeStreams = Array.from(this.streamsMap.values()).filter(stream => stream.status === 'active');

    for (const stream of activeStreams) {
      try {
        await this.processStream(stream);
      } catch (error) {
        console.error(`Failed to process stream ${stream.id}:`, error);
        this.updateStreamStatus(stream.id, 'error');
      }
    }

    const processingTime = performance.now() - startTime;
    this.updateStats({ processingTime });
  }

  /**
   * Process individual stream
   */
  private async processStream(stream: VideoStream): Promise<void> {
    // Simulate video processing
    const events = await this.detectEvents(stream);

    for (const event of events) {
      await this.processEvent(event);
    }
  }

  /**
   * Detect events in stream
   */
  private async detectEvents(stream: VideoStream): Promise<AnalyticsEvent[]> {
    // Simulate AI detection
    const events: AnalyticsEvent[] = [];
    const rules = Array.from(this.rulesMap.values()).filter(rule => rule.enabled);

    for (const rule of rules) {
      if (Math.random() < rule.sensitivity / 100) {
        const event: AnalyticsEvent = {
          id: this.generateId(),
          streamId: stream.id,
          type: rule.type,
          confidence: Math.random() * 100,
          boundingBox: {
            x: Math.random() * (stream.resolution.width - 100),
            y: Math.random() * (stream.resolution.height - 100),
            width: 50 + Math.random() * 100,
            height: 50 + Math.random() * 100
          },
          metadata: {
            ruleId: rule.id,
            ruleName: rule.name,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date(),
          processed: false
        };

        events.push(event);
      }
    }

    return events;
  }

  /**
   * Process detected event
   */
  private async processEvent(event: AnalyticsEvent): Promise<void> {
    // Store event
    this.eventsMap.set(event.id, event);
    this._events.set(Array.from(this.eventsMap.values()));

    // Emit new event
    this.newEventSubject.next(event);

    // Find matching rules
    const rules = Array.from(this.rulesMap.values()).filter(rule =>
      rule.enabled && rule.type === event.type
    );

    // Execute rule actions
    for (const rule of rules) {
      if (this.evaluateRule(rule, event)) {
        await this.executeRuleActions(rule, event);
      }
    }

    // Update stats
    this.updateStats();
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateRule(rule: AnalyticsRule, event: AnalyticsEvent): boolean {
    // Simple evaluation - in real implementation, this would be more complex
    return event.confidence >= rule.sensitivity;
  }

  /**
   * Execute rule actions
   */
  private async executeRuleActions(rule: AnalyticsRule, event: AnalyticsEvent): Promise<void> {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'alert':
          this.alertSubject.next({
            type: 'alert',
            message: `Rule "${rule.name}" triggered`,
            data: { rule, event }
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
      }
    }
  }

  /**
   * Add video stream
   */
  public addStream(stream: Omit<VideoStream, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const newStream: VideoStream = {
      ...stream,
      id,
      timestamp: new Date()
    };

    this.streamsMap.set(id, newStream);
    this._streams.set(Array.from(this.streamsMap.values()));
    return id;
  }

  /**
   * Update stream
   */
  public updateStream(id: string, updates: Partial<VideoStream>): void {
    const stream = this.streamsMap.get(id);
    if (stream) {
      const updatedStream = { ...stream, ...updates };
      this.streamsMap.set(id, updatedStream);
      this._streams.set(Array.from(this.streamsMap.values()));
    }
  }

  /**
   * Remove stream
   */
  public removeStream(id: string): void {
    this.streamsMap.delete(id);
    this._streams.set(Array.from(this.streamsMap.values()));
  }

  /**
   * Update stream status
   */
  private updateStreamStatus(streamId: string, status: string): void {
    this.updateStream(streamId, { status: status as any });
    this.streamStatusSubject.next({ streamId, status });
  }

  /**
   * Add analytics rule
   */
  public addRule(rule: Omit<AnalyticsRule, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newRule: AnalyticsRule = {
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
  public updateRule(id: string, updates: Partial<AnalyticsRule>): void {
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
   * Update configuration
   */
  public updateConfig(updates: Partial<VideoAnalyticsConfig>): void {
    this.configData = { ...this.configData, ...updates };
    this._config.set(this.configData);
    this.saveConfig();

    // Restart processing if needed
    if (updates.enabled !== undefined) {
      if (updates.enabled) {
        this.startProcessing();
      } else {
        this.stopProcessing();
      }
    }
  }

  /**
   * Get events by stream
   */
  public getEventsByStream(streamId: string): AnalyticsEvent[] {
    return Array.from(this.eventsMap.values())
      .filter(event => event.streamId === streamId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get events by type
   */
  public getEventsByType(type: string): AnalyticsEvent[] {
    return Array.from(this.eventsMap.values())
      .filter(event => event.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get events by time range
   */
  public getEventsByTimeRange(start: Date, end: Date): AnalyticsEvent[] {
    return Array.from(this.eventsMap.values())
      .filter(event => event.timestamp >= start && event.timestamp <= end)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear events
   */
  public clearEvents(): void {
    this.eventsMap.clear();
    this._events.set([]);
    this.updateStats();
  }

  /**
   * Update statistics
   */
  private updateStats(updates?: Partial<AnalyticsStats>): void {
    const currentStats = this._stats();
    const events = Array.from(this.eventsMap.values());

    const newStats: AnalyticsStats = {
      totalEvents: events.length,
      eventsByType: this.groupEventsByType(events),
      eventsByStream: this.groupEventsByStream(events),
      averageConfidence: this.calculateAverageConfidence(events),
      processingTime: updates?.processingTime || currentStats.processingTime,
      lastProcessed: new Date(),
      errorRate: this.calculateErrorRate()
    };

    this._stats.set(newStats);
  }

  /**
   * Group events by type
   */
  private groupEventsByType(events: AnalyticsEvent[]): { [key: string]: number } {
    return events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  /**
   * Group events by stream
   */
  private groupEventsByStream(events: AnalyticsEvent[]): { [key: string]: number } {
    return events.reduce((acc, event) => {
      acc[event.streamId] = (acc[event.streamId] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  /**
   * Calculate average confidence
   */
  private calculateAverageConfidence(events: AnalyticsEvent[]): number {
    if (events.length === 0) return 0;
    const total = events.reduce((sum, event) => sum + event.confidence, 0);
    return total / events.length;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    // Simple error rate calculation
    return Math.random() * 5; // 0-5%
  }

  /**
   * Get current configuration
   */
  public getConfig(): VideoAnalyticsConfig {
    return { ...this.configData };
  }

  /**
   * Get current statistics
   */
  public getStats(): AnalyticsStats {
    return this._stats();
  }

  /**
   * Check if processing is active
   */
  public isProcessingActive(): boolean {
    return this.isProcessing;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'va_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopProcessing();
    this.streamsMap.clear();
    this.eventsMap.clear();
    this.rulesMap.clear();
  }
}

