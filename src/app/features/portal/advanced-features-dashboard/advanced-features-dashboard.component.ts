/**
 * Advanced Features Dashboard Component
 *
 * Dashboard for advanced features including video analytics, AI security, advanced reports, and multi-tenant management.
 * Displays analytics events, security threats, report templates, and tenant statistics.
 *
 * @example
 * ```html
 * <app-advanced-features-dashboard></app-advanced-features-dashboard>
 * ```
 */

import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { GlassInputComponent } from '../../../shared/components/glass-input/glass-input.component';
import { VideoAnalyticsService, VideoStream, AnalyticsEvent, AnalyticsRule, AnalyticsStats } from '../../../core/services/video-analytics.service';
import { AiSecurityService, SecurityThreat, SecurityRule, SecurityZone, SecurityStats } from '../../../core/services/ai-security.service';
import { AdvancedReportsService, ReportTemplate, ReportData, ReportStats } from '../../../core/services/advanced-reports.service';
import { MultiTenantService, Tenant, TenantStats } from '../../../core/services/multi-tenant.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-advanced-features-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    GlassInputComponent
  ],
  templateUrl: './advanced-features-dashboard.component.html',
  styleUrls: ['./advanced-features-dashboard.component.scss']
})
export class AdvancedFeaturesDashboardComponent extends BaseComponent implements OnInit {
  // Data
  videoStreams: VideoStream[] = [];
  analyticsEvents: AnalyticsEvent[] = [];
  analyticsRules: AnalyticsRule[] = [];
  analyticsStats: AnalyticsStats = {
    totalEvents: 0,
    eventsByType: {},
    eventsByStream: {},
    averageConfidence: 0,
    processingTime: 0,
    lastProcessed: null,
    errorRate: 0
  };

  securityThreats: SecurityThreat[] = [];
  securityRules: SecurityRule[] = [];
  securityZones: SecurityZone[] = [];
  securityStats: SecurityStats = {
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

  reportTemplates: ReportTemplate[] = [];
  reports: ReportData[] = [];
  reportStats: ReportStats = {
    totalReports: 0,
    reportsByCategory: {},
    reportsByType: {},
    totalTemplates: 0,
    activeSchedules: 0,
    totalDownloads: 0,
    averageGenerationTime: 0,
    lastGenerated: null
  };

  tenants: Tenant[] = [];
  tenantStats: TenantStats = {
    totalTenants: 0,
    activeTenants: 0,
    inactiveTenants: 0,
    suspendedTenants: 0,
    tenantsByPlan: {},
    totalUsers: 0,
    totalDevices: 0,
    totalStorage: 0,
    totalApiCalls: 0,
    totalRevenue: 0,
    averageUsage: 0,
    lastActivity: null
  };

  // UI State
  selectedTab: 'overview' | 'video-analytics' | 'ai-security' | 'reports' | 'multi-tenant' = 'overview';
  showAddStream = false;
  showAddRule = false;
  showAddZone = false;
  showAddTemplate = false;
  showAddTenant = false;

  // Form data
  newStream: Partial<VideoStream> = {
    name: '',
    url: '',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    bitrate: 2000
  };

  newRule: Partial<AnalyticsRule> = {
    name: '',
    description: '',
    type: 'motion',
    enabled: true,
    sensitivity: 75,
    conditions: {},
    actions: []
  };

  newZone: Partial<SecurityZone> = {
    name: '',
    description: '',
    type: 'monitored',
    coordinates: [],
    rules: [],
    enabled: true
  };

  newTemplate: Partial<ReportTemplate> = {
    name: '',
    description: '',
    category: 'security',
    type: 'summary',
    dataSource: [],
    filters: {},
    metrics: {},
    visualizations: []
  };

  newTenant: Partial<Tenant> = {
    name: '',
    domain: '',
    subdomain: '',
    plan: 'basic',
    features: {},
    limits: {
      maxUsers: 10,
      maxDevices: 5,
      maxStorage: 10,
      maxApiCalls: 1000,
      maxReports: 50
    },
    settings: {}
  };

  constructor(
    private videoAnalytics: VideoAnalyticsService,
    private aiSecurity: AiSecurityService,
    private advancedReports: AdvancedReportsService,
    private multiTenant: MultiTenantService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToServices();
    this.loadDemoData();
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToServices(): void {
    // ✅ Video Analytics - Using signals (no subscription needed)
    effect(() => {
      this.videoStreams = this.videoAnalytics.streams();
    });

    effect(() => {
      this.analyticsEvents = this.videoAnalytics.events();
    });

    effect(() => {
      this.analyticsRules = this.videoAnalytics.rules();
    });

    effect(() => {
      this.analyticsStats = this.videoAnalytics.stats();
    });

    // ✅ AI Security - Using signals (no subscription needed)
    effect(() => {
      this.securityThreats = this.aiSecurity.threats();
    });

    effect(() => {
      this.securityRules = this.aiSecurity.rules();
    });

    effect(() => {
      this.securityZones = this.aiSecurity.zones();
    });

    effect(() => {
      this.securityStats = this.aiSecurity.stats();
    });

    // ✅ Advanced Reports - Using signals (no subscription needed)
    effect(() => {
      this.reportTemplates = this.advancedReports.templates();
    });

    effect(() => {
      this.reports = this.advancedReports.reports();
    });

    effect(() => {
      this.reportStats = this.advancedReports.stats();
    });

    // ✅ Multi Tenant - Using signals (no subscription needed)
    effect(() => {
      this.tenants = this.multiTenant.tenants();
    });

    effect(() => {
      this.tenantStats = this.multiTenant.stats();
    });
  }

  /**
   * Load demo data
   */
  private loadDemoData(): void {
    // Add demo video streams
    this.videoAnalytics.addStream({
      name: 'Main Entrance Camera',
      url: 'rtsp://demo.camera.com/stream1',
      status: 'active',
      resolution: { width: 1920, height: 1080 },
      fps: 30,
      bitrate: 2000
    });

    this.videoAnalytics.addStream({
      name: 'Parking Lot Camera',
      url: 'rtsp://demo.camera.com/stream2',
      status: 'active',
      resolution: { width: 1280, height: 720 },
      fps: 25,
      bitrate: 1500
    });

    // Add demo analytics rules
    this.videoAnalytics.addRule({
      name: 'Motion Detection',
      description: 'Detect motion in restricted areas',
      type: 'motion',
      enabled: true,
      sensitivity: 80,
      conditions: { minArea: 100 },
      actions: [{ type: 'alert', config: {} }]
    });

    this.videoAnalytics.addRule({
      name: 'Face Recognition',
      description: 'Recognize faces for access control',
      type: 'face',
      enabled: true,
      sensitivity: 90,
      conditions: { minConfidence: 0.8 },
      actions: [{ type: 'notification', config: {} }]
    });

    // Add demo security zones
    this.aiSecurity.addZone({
      name: 'Main Building',
      description: 'Main building security zone',
      type: 'restricted',
      coordinates: [{ x: 0, y: 0, width: 800, height: 600 }],
      rules: [],
      enabled: true
    });

    // Add demo report templates
    this.advancedReports.createTemplate({
      name: 'Security Summary Report',
      description: 'Daily security summary report',
      category: 'security',
      type: 'summary',
      dataSource: ['security_events', 'threats'],
      filters: {},
      metrics: {
        totalThreats: { type: 'count', field: 'id', label: 'Total Threats' },
        averageConfidence: { type: 'average', field: 'confidence', label: 'Average Confidence' }
      },
      visualizations: [
        { type: 'chart', config: { chartType: 'line' } },
        { type: 'table', config: {} }
      ],
      createdBy: 'system'
    });

    // Add demo tenants
    this.multiTenant.createTenant({
      name: 'Demo Company',
      domain: 'demo.com',
      subdomain: 'demo',
      status: 'active',
      plan: 'premium',
      features: {
        videoAnalytics: true,
        aiSecurity: true,
        advancedReports: true,
        multiTenant: true
      },
      settings: {
        theme: 'dark',
        language: 'en'
      },
      limits: {
        maxUsers: 100,
        maxDevices: 50,
        maxStorage: 1000,
        maxApiCalls: 1000,
        maxReports: 100
      },
      createdBy: 'admin'
    });
  }

  /**
   * Select tab
   */
  selectTab(tab: string): void {
    this.selectedTab = tab as any;
  }

  /**
   * Toggle add stream
   */
  toggleAddStream(): void {
    this.showAddStream = !this.showAddStream;
  }

  /**
   * Add video stream
   */
  addVideoStream(): void {
    if (this.newStream.name && this.newStream.url) {
      this.videoAnalytics.addStream({
        name: this.newStream.name,
        url: this.newStream.url,
        status: 'active',
        resolution: this.newStream.resolution || { width: 1920, height: 1080 },
        fps: this.newStream.fps || 30,
        bitrate: this.newStream.bitrate || 2000
      });
      this.newStream = {
        name: '',
        url: '',
        resolution: { width: 1920, height: 1080 },
        fps: 30,
        bitrate: 2000
      };
      this.showAddStream = false;
    }
  }

  /**
   * Toggle add rule
   */
  toggleAddRule(): void {
    this.showAddRule = !this.showAddRule;
  }

  /**
   * Add analytics rule
   */
  addAnalyticsRule(): void {
    if (this.newRule.name && this.newRule.description) {
      this.videoAnalytics.addRule({
        name: this.newRule.name,
        description: this.newRule.description,
        type: this.newRule.type || 'motion',
        enabled: this.newRule.enabled || true,
        sensitivity: this.newRule.sensitivity || 75,
        conditions: this.newRule.conditions || {},
        actions: this.newRule.actions || []
      });
      this.newRule = {
        name: '',
        description: '',
        type: 'motion',
        enabled: true,
        sensitivity: 75,
        conditions: {},
        actions: []
      };
      this.showAddRule = false;
    }
  }

  /**
   * Toggle add zone
   */
  toggleAddZone(): void {
    this.showAddZone = !this.showAddZone;
  }

  /**
   * Add security zone
   */
  addSecurityZone(): void {
    if (this.newZone.name && this.newZone.description) {
      this.aiSecurity.addZone({
        name: this.newZone.name,
        description: this.newZone.description,
        type: this.newZone.type || 'monitored',
        coordinates: this.newZone.coordinates || [],
        rules: this.newZone.rules || [],
        enabled: this.newZone.enabled || true
      });
      this.newZone = {
        name: '',
        description: '',
        type: 'monitored',
        coordinates: [],
        rules: [],
        enabled: true
      };
      this.showAddZone = false;
    }
  }

  /**
   * Toggle add template
   */
  toggleAddTemplate(): void {
    this.showAddTemplate = !this.showAddTemplate;
  }

  /**
   * Add report template
   */
  addReportTemplate(): void {
    if (this.newTemplate.name && this.newTemplate.description) {
      this.advancedReports.createTemplate({
        name: this.newTemplate.name,
        description: this.newTemplate.description,
        category: this.newTemplate.category || 'security',
        type: this.newTemplate.type || 'summary',
        dataSource: this.newTemplate.dataSource || [],
        filters: this.newTemplate.filters || {},
        metrics: this.newTemplate.metrics || {},
        visualizations: this.newTemplate.visualizations || [],
        createdBy: 'current_user'
      });
      this.newTemplate = {
        name: '',
        description: '',
        category: 'security',
        type: 'summary',
        dataSource: [],
        filters: {},
        metrics: {},
        visualizations: []
      };
      this.showAddTemplate = false;
    }
  }

  /**
   * Toggle add tenant
   */
  toggleAddTenant(): void {
    this.showAddTenant = !this.showAddTenant;
  }

  /**
   * Add tenant
   */
  addTenant(): void {
    if (this.newTenant.name && this.newTenant.domain) {
      this.multiTenant.createTenant({
        name: this.newTenant.name,
        domain: this.newTenant.domain,
        subdomain: this.newTenant.subdomain || this.newTenant.name.toLowerCase(),
        status: 'active',
        plan: this.newTenant.plan || 'basic',
        features: this.newTenant.features || {},
        limits: this.newTenant.limits || {
          maxUsers: 10,
          maxDevices: 5,
          maxStorage: 10,
          maxApiCalls: 1000,
          maxReports: 50
        },
        settings: this.newTenant.settings || {},
        createdBy: 'admin'
      });
      this.newTenant = {
        name: '',
        domain: '',
        subdomain: '',
        plan: 'basic',
        features: {},
        limits: {
          maxUsers: 10,
          maxDevices: 5,
          maxStorage: 10,
          maxApiCalls: 1000,
          maxReports: 50
        },
        settings: {}
      };
      this.showAddTenant = false;
    }
  }

  /**
   * Generate report
   */
  async generateReport(templateId: string): Promise<void> {
    try {
      await this.advancedReports.generateReport(templateId, {});
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  }

  /**
   * Download report
   */
  downloadReport(reportId: string): void {
    this.advancedReports.downloadReport(reportId);
  }

  /**
   * Acknowledge threat
   */
  acknowledgeThreat(threatId: string): void {
    this.aiSecurity.acknowledgeThreat(threatId);
  }

  /**
   * Resolve threat
   */
  resolveThreat(threatId: string): void {
    this.aiSecurity.resolveThreat(threatId);
  }

  /**
   * Get tab icon
   */
  getTabIcon(tab: string): string {
    const icons: { [key: string]: string } = {
      overview: 'fa-tachometer-alt',
      'video-analytics': 'fa-video',
      'ai-security': 'fa-shield-alt',
      reports: 'fa-chart-bar',
      'multi-tenant': 'fa-building'
    };
    return icons[tab] || 'fa-circle';
  }

  /**
   * Get tab label
   */
  getTabLabel(tab: string): string {
    const labels: { [key: string]: string } = {
      overview: 'ภาพรวม',
      'video-analytics': 'การวิเคราะห์วิดีโอ',
      'ai-security': 'ความปลอดภัย AI',
      reports: 'รายงาน',
      'multi-tenant': 'Multi-tenant'
    };
    return labels[tab] || tab;
  }

  /**
   * Format date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('th-TH');
  }

  /**
   * Format number
   */
  formatNumber(value: number): string {
    return value.toLocaleString('th-TH');
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: '#10B981',
      inactive: '#6B7280',
      error: '#EF4444',
      pending: '#F59E0B',
      completed: '#10B981',
      failed: '#EF4444',
      generating: '#3B82F6'
    };
    return colors[status] || '#6B7280';
  }

  /**
   * Get severity color
   */
  getSeverityColor(severity: string): string {
    const colors: { [key: string]: string } = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626'
    };
    return colors[severity] || '#6B7280';
  }

  /**
   * Get plan color
   */
  getPlanColor(plan: string): string {
    const colors: { [key: string]: string } = {
      basic: '#6B7280',
      standard: '#3B82F6',
      premium: '#8B5CF6',
      enterprise: '#F59E0B'
    };
    return colors[plan] || '#6B7280';
  }
}
