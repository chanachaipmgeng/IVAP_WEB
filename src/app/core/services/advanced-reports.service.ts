import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'attendance' | 'performance' | 'compliance' | 'custom';
  type: 'summary' | 'detailed' | 'analytical' | 'comparative' | 'trend';
  dataSource: string[];
  filters: {
    [key: string]: any;
  };
  metrics: {
    [key: string]: {
      type: 'count' | 'sum' | 'average' | 'percentage' | 'trend' | 'distribution';
      field: string;
      label: string;
      format?: string;
    };
  };
  visualizations: {
    type: 'chart' | 'table' | 'map' | 'gauge' | 'heatmap' | 'timeline';
    config: {
      [key: string]: any;
    };
  }[];
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    time: string; // HH:mm format
  recipients: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ReportData {
  id: string;
  templateId: string;
  name: string;
  data: any;
  filters: {
    [key: string]: any;
  };
  generatedAt: Date;
  generatedBy: string;
  status: 'generating' | 'completed' | 'failed';
  filePath?: string;
  fileSize?: number;
  downloadCount: number;
}

export interface ReportSchedule {
  id: string;
  templateId: string;
  name: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  time: string;
  recipients: string[];
  lastRun?: Date;
  nextRun: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportStats {
  totalReports: number;
  reportsByCategory: { [key: string]: number };
  reportsByType: { [key: string]: number };
  totalTemplates: number;
  activeSchedules: number;
  totalDownloads: number;
  averageGenerationTime: number;
  lastGenerated: Date | null;
}

export interface ReportConfig {
  enabled: boolean;
  maxConcurrentGenerations: number;
  defaultFormat: 'pdf' | 'excel' | 'csv' | 'json';
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  retentionDays: number;
  autoCleanup: boolean;
  emailNotifications: boolean;
  webhookNotifications: boolean;
  storagePath: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdvancedReportsService {
  private templatesMap: Map<string, ReportTemplate> = new Map();
  private reportsMap: Map<string, ReportData> = new Map();
  private schedulesMap: Map<string, ReportSchedule> = new Map();
  private configData: ReportConfig = this.getDefaultConfig();

  // ✅ Signals for reactive state
  private _templates = signal<ReportTemplate[]>([]);
  private _reports = signal<ReportData[]>([]);
  private _schedules = signal<ReportSchedule[]>([]);
  private _stats = signal<ReportStats>(this.getInitialStats());
  private _config = signal<ReportConfig>(this.configData);

  // ✅ Readonly signals for public access
  public readonly templates = this._templates.asReadonly();
  public readonly reports = this._reports.asReadonly();
  public readonly schedules = this._schedules.asReadonly();
  public readonly stats = this._stats.asReadonly();
  public readonly config = this._config.asReadonly();

  // ✅ Computed signals for derived state
  public readonly templatesCount = computed(() => this._templates().length);
  public readonly reportsCount = computed(() => this._reports().length);
  public readonly schedulesCount = computed(() => this._schedules().length);

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize service
   */
  private initializeService(): void {
    this.loadConfig();
    this.loadTemplates();
    this.loadReports();
    this.loadSchedules();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): ReportConfig {
    return {
      enabled: true,
      maxConcurrentGenerations: 5,
      defaultFormat: 'pdf',
      compressionEnabled: true,
      encryptionEnabled: false,
      retentionDays: 90,
      autoCleanup: true,
      emailNotifications: true,
      webhookNotifications: false,
      storagePath: '/reports'
    };
  }

  /**
   * Get initial stats
   */
  private getInitialStats(): ReportStats {
    return {
      totalReports: 0,
      reportsByCategory: {},
      reportsByType: {},
      totalTemplates: 0,
      activeSchedules: 0,
      totalDownloads: 0,
      averageGenerationTime: 0,
      lastGenerated: null
    };
  }

  /**
   * Load configuration
   */
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('advanced_reports_config');
      if (stored) {
        this.configData = { ...this.configData, ...JSON.parse(stored) };
        this._config.set(this.configData);
      }
    } catch (error) {
      console.error('Failed to load advanced reports config:', error);
    }
  }

  /**
   * Save configuration
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('advanced_reports_config', JSON.stringify(this.configData));
    } catch (error) {
      console.error('Failed to save advanced reports config:', error);
    }
  }

  /**
   * Load templates
   */
  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem('advanced_reports_templates');
      if (stored) {
        const templates = JSON.parse(stored);
        templates.forEach((template: any) => {
          template.createdAt = new Date(template.createdAt);
          template.updatedAt = new Date(template.updatedAt);
          this.templatesMap.set(template.id, template);
        });
        this._templates.set(Array.from(this.templatesMap.values()));
      }
    } catch (error) {
      console.error('Failed to load advanced reports templates:', error);
    }
  }

  /**
   * Save templates
   */
  private saveTemplates(): void {
    try {
      const templates = Array.from(this.templatesMap.values());
      localStorage.setItem('advanced_reports_templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save advanced reports templates:', error);
    }
  }

  /**
   * Load reports
   */
  private loadReports(): void {
    try {
      const stored = localStorage.getItem('advanced_reports_data');
      if (stored) {
        const reports = JSON.parse(stored);
        reports.forEach((report: any) => {
          report.generatedAt = new Date(report.generatedAt);
          this.reportsMap.set(report.id, report);
        });
        this._reports.set(Array.from(this.reportsMap.values()));
      }
    } catch (error) {
      console.error('Failed to load advanced reports data:', error);
    }
  }

  /**
   * Save reports
   */
  private saveReports(): void {
    try {
      const reports = Array.from(this.reportsMap.values());
      localStorage.setItem('advanced_reports_data', JSON.stringify(reports));
    } catch (error) {
      console.error('Failed to save advanced reports data:', error);
    }
  }

  /**
   * Load schedules
   */
  private loadSchedules(): void {
    try {
      const stored = localStorage.getItem('advanced_reports_schedules');
      if (stored) {
        const schedules = JSON.parse(stored);
        schedules.forEach((schedule: any) => {
          schedule.createdAt = new Date(schedule.createdAt);
          schedule.updatedAt = new Date(schedule.updatedAt);
          schedule.lastRun = schedule.lastRun ? new Date(schedule.lastRun) : undefined;
          schedule.nextRun = new Date(schedule.nextRun);
          this.schedulesMap.set(schedule.id, schedule);
        });
        this._schedules.set(Array.from(this.schedulesMap.values()));
      }
    } catch (error) {
      console.error('Failed to load advanced reports schedules:', error);
    }
  }

  /**
   * Save schedules
   */
  private saveSchedules(): void {
    try {
      const schedules = Array.from(this.schedulesMap.values());
      localStorage.setItem('advanced_reports_schedules', JSON.stringify(schedules));
    } catch (error) {
      console.error('Failed to save advanced reports schedules:', error);
    }
  }

  /**
   * Create report template
   */
  public createTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newTemplate: ReportTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.templatesMap.set(id, newTemplate);
    this._templates.set(Array.from(this.templatesMap.values()));
    this.saveTemplates();
    this.updateStats();
    return id;
  }

  /**
   * Update template
   */
  public updateTemplate(id: string, updates: Partial<ReportTemplate>): void {
    const template = this.templatesMap.get(id);
    if (template) {
      const updatedTemplate = { ...template, ...updates, updatedAt: new Date() };
      this.templatesMap.set(id, updatedTemplate);
      this._templates.set(Array.from(this.templatesMap.values()));
      this.saveTemplates();
    }
  }

  /**
   * Delete template
   */
  public deleteTemplate(id: string): void {
    this.templatesMap.delete(id);
    this._templates.set(Array.from(this.templatesMap.values()));
    this.saveTemplates();
    this.updateStats();
  }

  /**
   * Generate report
   */
  public async generateReport(templateId: string, filters: { [key: string]: any }, name?: string): Promise<string> {
    const template = this.templatesMap.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const reportId = this.generateId();
    const report: ReportData = {
      id: reportId,
      templateId,
      name: name || `${template.name} - ${new Date().toLocaleString()}`,
      data: {},
      filters,
      generatedAt: new Date(),
      generatedBy: 'current_user', // In real app, get from auth service
      status: 'generating',
      downloadCount: 0
    };

    this.reportsMap.set(reportId, report);
    this._reports.set(Array.from(this.reportsMap.values()));

    // Simulate report generation
    try {
      const data = await this.generateReportData(template, filters);
      report.data = data;
      report.status = 'completed';
      report.filePath = `/reports/${reportId}.pdf`;
      report.fileSize = Math.floor(Math.random() * 1000000) + 100000; // 100KB - 1MB
    } catch (error) {
      report.status = 'failed';
      console.error('Failed to generate report:', error);
    }

    this.reportsMap.set(reportId, report);
    this._reports.set(Array.from(this.reportsMap.values()));
    this.updateStats();

    return reportId;
  }

  /**
   * Generate report data
   */
  private async generateReportData(template: ReportTemplate, filters: { [key: string]: any }): Promise<any> {
    // Simulate data generation
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = {
          summary: {
            totalRecords: Math.floor(Math.random() * 10000) + 1000,
            dateRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            },
            generatedAt: new Date().toISOString()
          },
          metrics: this.generateMetrics(template.metrics),
          charts: this.generateCharts(template.visualizations),
          tables: this.generateTables(template.visualizations),
          filters: filters
        };
        resolve(data);
      }, 2000); // 2 second delay
    });
  }

  /**
   * Generate metrics
   */
  private generateMetrics(metrics: { [key: string]: any }): { [key: string]: any } {
    const result: { [key: string]: any } = {};

    for (const [key, metric] of Object.entries(metrics)) {
      switch (metric.type) {
        case 'count':
          result[key] = Math.floor(Math.random() * 1000) + 100;
          break;
        case 'sum':
          result[key] = Math.floor(Math.random() * 100000) + 10000;
          break;
        case 'average':
          result[key] = Math.floor(Math.random() * 100) + 10;
          break;
        case 'percentage':
          result[key] = Math.floor(Math.random() * 100);
          break;
        case 'trend':
          result[key] = Math.floor(Math.random() * 20) - 10; // -10 to +10
          break;
        case 'distribution':
          result[key] = {
            'Category A': Math.floor(Math.random() * 100),
            'Category B': Math.floor(Math.random() * 100),
            'Category C': Math.floor(Math.random() * 100)
          };
          break;
      }
    }

    return result;
  }

  /**
   * Generate charts
   */
  private generateCharts(visualizations: any[]): any[] {
    return visualizations
      .filter(viz => viz.type === 'chart')
      .map(viz => ({
        type: viz.type,
        title: `Chart ${Math.floor(Math.random() * 100)}`,
        data: this.generateChartData(viz.config.chartType || 'line')
      }));
  }

  /**
   * Generate chart data
   */
  private generateChartData(chartType: string): any {
    const dataPoints = 12; // 12 months
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      data.push({
        x: new Date(Date.now() - (dataPoints - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        y: Math.floor(Math.random() * 1000) + 100
      });
    }

    return data;
  }

  /**
   * Generate tables
   */
  private generateTables(visualizations: any[]): any[] {
    return visualizations
      .filter(viz => viz.type === 'table')
      .map(viz => ({
        type: viz.type,
        title: `Table ${Math.floor(Math.random() * 100)}`,
        columns: ['Name', 'Value', 'Status', 'Date'],
        data: Array.from({ length: 10 }, (_, i) => ({
          name: `Item ${i + 1}`,
          value: Math.floor(Math.random() * 1000),
          status: ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)],
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }))
      }));
  }

  /**
   * Create schedule
   */
  public createSchedule(schedule: Omit<ReportSchedule, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>): string {
    const id = this.generateId();
    const nextRun = this.calculateNextRun(schedule.frequency, schedule.time);

    const newSchedule: ReportSchedule = {
      ...schedule,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextRun
    };

    this.schedulesMap.set(id, newSchedule);
    this._schedules.set(Array.from(this.schedulesMap.values()));
    this.saveSchedules();
    this.updateStats();
    return id;
  }

  /**
   * Update schedule
   */
  public updateSchedule(id: string, updates: Partial<ReportSchedule>): void {
    const schedule = this.schedulesMap.get(id);
    if (schedule) {
      const updatedSchedule = { ...schedule, ...updates, updatedAt: new Date() };
      if (updates.frequency || updates.time) {
        updatedSchedule.nextRun = this.calculateNextRun(updatedSchedule.frequency, updatedSchedule.time);
      }
      this.schedulesMap.set(id, updatedSchedule);
      this._schedules.set(Array.from(this.schedulesMap.values()));
      this.saveSchedules();
    }
  }

  /**
   * Delete schedule
   */
  public deleteSchedule(id: string): void {
    this.schedulesMap.delete(id);
    this._schedules.set(Array.from(this.schedulesMap.values()));
    this.saveSchedules();
    this.updateStats();
  }

  /**
   * Calculate next run time
   */
  private calculateNextRun(frequency: string, time: string): Date {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
        case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
          break;
        case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
          break;
        case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
      case 'yearly':
        nextRun.setFullYear(nextRun.getFullYear() + 1);
          break;
      }

    return nextRun;
  }

  /**
   * Download report
   */
  public downloadReport(reportId: string): void {
    const report = this.reportsMap.get(reportId);
    if (report) {
      report.downloadCount++;
      this.reportsMap.set(reportId, report);
      this._reports.set(Array.from(this.reportsMap.values()));
      this.updateStats();

      // Simulate download
      // Report download initiated
    }
  }

  /**
   * Delete report
   */
  public deleteReport(reportId: string): void {
    this.reportsMap.delete(reportId);
    this._reports.set(Array.from(this.reportsMap.values()));
    this.updateStats();
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<ReportConfig>): void {
    this.configData = { ...this.configData, ...updates };
    this._config.set(this.configData);
    this.saveConfig();
  }

  /**
   * Get reports by template
   */
  public getReportsByTemplate(templateId: string): ReportData[] {
    return Array.from(this.reportsMap.values())
      .filter(report => report.templateId === templateId)
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  /**
   * Get reports by category
   */
  public getReportsByCategory(category: string): ReportData[] {
    const templateIds = Array.from(this.templatesMap.values())
      .filter(template => template.category === category)
      .map(template => template.id);

    return Array.from(this.reportsMap.values())
      .filter(report => templateIds.includes(report.templateId))
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const reports = Array.from(this.reportsMap.values());
    const templates = Array.from(this.templatesMap.values());
    const schedules = Array.from(this.schedulesMap.values());

    const newStats: ReportStats = {
      totalReports: reports.length,
      reportsByCategory: this.groupReportsByCategory(reports, templates),
      reportsByType: this.groupReportsByType(reports, templates),
      totalTemplates: templates.length,
      activeSchedules: schedules.filter(s => s.enabled).length,
      totalDownloads: reports.reduce((sum, report) => sum + report.downloadCount, 0),
      averageGenerationTime: 2000, // 2 seconds
      lastGenerated: reports.length > 0 ? reports[0].generatedAt : null
    };

    this._stats.set(newStats);
  }

  /**
   * Group reports by category
   */
  private groupReportsByCategory(reports: ReportData[], templates: ReportTemplate[]): { [key: string]: number } {
    const templateMap = new Map(templates.map(t => [t.id, t.category]));
    return reports.reduce((acc, report) => {
      const category = templateMap.get(report.templateId) || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  /**
   * Group reports by type
   */
  private groupReportsByType(reports: ReportData[], templates: ReportTemplate[]): { [key: string]: number } {
    const templateMap = new Map(templates.map(t => [t.id, t.type]));
    return reports.reduce((acc, report) => {
      const type = templateMap.get(report.templateId) || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  /**
   * Get current configuration
   */
  public getConfig(): ReportConfig {
    return { ...this.configData };
  }

  /**
   * Get current statistics
   */
  public getStats(): ReportStats {
    return this._stats();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.templatesMap.clear();
    this.reportsMap.clear();
    this.schedulesMap.clear();
  }
}

