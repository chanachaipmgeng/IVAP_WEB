import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface SystemConfiguration {
  id: string;
  category: 'general' | 'security' | 'performance' | 'integration' | 'ui' | 'notifications' | 'backup' | 'maintenance';
  name: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isRequired: boolean;
  isEditable: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: any[];
  };
  defaultValue: any;
  currentValue: any;
  lastModified: Date;
  modifiedBy: string;
  environment: 'development' | 'staging' | 'production';
  isActive: boolean;
}

export interface ConfigurationGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  configurations: SystemConfiguration[];
  isCollapsible: boolean;
  isExpanded: boolean;
  order: number;
}

export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  environment: string;
  configurations: { [key: string]: any };
  isDefault: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface ConfigurationBackup {
  id: string;
  name: string;
  description: string;
  configurations: SystemConfiguration[];
  environment: string;
  createdAt: Date;
  createdBy: string;
  size: number; // in bytes
  isEncrypted: boolean;
}

export interface ConfigurationMetrics {
  totalConfigurations: number;
  configurationsByCategory: { [key: string]: number };
  modifiedToday: number;
  modifiedThisWeek: number;
  backupCount: number;
  lastBackup: Date;
  validationErrors: number;
  environmentDistribution: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class SystemConfigurationService {
  // ✅ Signals for reactive state
  private _configurations = signal<SystemConfiguration[]>([]);
  private _groups = signal<ConfigurationGroup[]>([]);
  private _templates = signal<ConfigurationTemplate[]>([]);
  private _backups = signal<ConfigurationBackup[]>([]);
  private _metrics = signal<ConfigurationMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly configurations = this._configurations.asReadonly();
  public readonly groups = this._groups.asReadonly();
  public readonly templates = this._templates.asReadonly();
  public readonly backups = this._backups.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly configurationsCount = computed(() => this._configurations().length);
  public readonly activeConfigurationsCount = computed(() => this._configurations().filter(c => c.isActive).length);
  public readonly groupsCount = computed(() => this._groups().length);
  public readonly templatesCount = computed(() => this._templates().length);
  public readonly backupsCount = computed(() => this._backups().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public configurations$ = new Observable<SystemConfiguration[]>(observer => {
    observer.next(this._configurations());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public groups$ = new Observable<ConfigurationGroup[]>(observer => {
    observer.next(this._groups());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public templates$ = new Observable<ConfigurationTemplate[]>(observer => {
    observer.next(this._templates());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public backups$ = new Observable<ConfigurationBackup[]>(observer => {
    observer.next(this._backups());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public metrics$ = new Observable<ConfigurationMetrics>(observer => {
    observer.next(this._metrics());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Get all configurations
   */
  getConfigurations(): SystemConfiguration[] {
    return this._configurations();
  }

  /**
   * Get configuration by key
   */
  getConfiguration(key: string): SystemConfiguration | undefined {
    return this._configurations().find(c => c.key === key);
  }

  /**
   * Get configuration value
   */
  getConfigurationValue(key: string): any {
    const config = this.getConfiguration(key);
    return config ? config.currentValue : undefined;
  }

  /**
   * Set configuration value
   */
  setConfigurationValue(key: string, value: any, modifiedBy: string = 'system'): boolean {
    const configurations = this._configurations();
    const config = configurations.find(c => c.key === key);

    if (!config || !config.isEditable) {
      return false;
    }

    // Validate value
    if (!this.validateConfigurationValue(config, value)) {
      return false;
    }

    config.currentValue = value;
    config.lastModified = new Date();
    config.modifiedBy = modifiedBy;

    this._configurations.set([...configurations]);
    this.updateMetrics();
    return true;
  }

  /**
   * Update configuration
   */
  updateConfiguration(configId: string, updates: Partial<SystemConfiguration>): boolean {
    const configurations = this._configurations();
    const index = configurations.findIndex(c => c.id === configId);

    if (index === -1) return false;

    configurations[index] = {
      ...configurations[index],
      ...updates,
      lastModified: new Date()
    };

    this._configurations.set([...configurations]);
    this.updateMetrics();
    return true;
  }

  /**
   * Reset configuration to default
   */
  resetConfiguration(configId: string, modifiedBy: string = 'system'): boolean {
    const configurations = this._configurations();
    const config = configurations.find(c => c.id === configId);

    if (!config) return false;

    config.currentValue = config.defaultValue;
    config.lastModified = new Date();
    config.modifiedBy = modifiedBy;

    this._configurations.set([...configurations]);
    this.updateMetrics();
    return true;
  }

  /**
   * Get configurations by category
   */
  getConfigurationsByCategory(category: string): SystemConfiguration[] {
    return this._configurations().filter(c => c.category === category);
  }

  /**
   * Get configuration groups
   */
  getConfigurationGroups(): ConfigurationGroup[] {
    return this._groups();
  }

  /**
   * Create configuration group
   */
  createConfigurationGroup(group: Omit<ConfigurationGroup, 'id' | 'configurations'>): ConfigurationGroup {
    const newGroup: ConfigurationGroup = {
      ...group,
      id: this.generateId(),
      configurations: this.getConfigurationsByCategory(group.category)
    };

    this._groups.update(groups => [...groups, newGroup]);

    return newGroup;
  }

  /**
   * Get configuration templates
   */
  getConfigurationTemplates(): ConfigurationTemplate[] {
    return this._templates();
  }

  /**
   * Create configuration template
   */
  createConfigurationTemplate(template: Omit<ConfigurationTemplate, 'id' | 'createdAt'>): ConfigurationTemplate {
    const newTemplate: ConfigurationTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date()
    };

    this._templates.update(templates => [...templates, newTemplate]);

    return newTemplate;
  }

  /**
   * Apply configuration template
   */
  applyConfigurationTemplate(templateId: string, modifiedBy: string = 'system'): boolean {
    const template = this._templates().find(t => t.id === templateId);
    if (!template) return false;

    const configurations = this._configurations();
    let updated = false;

    for (const [key, value] of Object.entries(template.configurations)) {
      const config = configurations.find(c => c.key === key);
      if (config && config.isEditable) {
        config.currentValue = value;
        config.lastModified = new Date();
        config.modifiedBy = modifiedBy;
        updated = true;
      }
    }

    if (updated) {
      this._configurations.set([...configurations]);
      this.updateMetrics();
    }

    return updated;
  }

  /**
   * Get configuration backups
   */
  getConfigurationBackups(): ConfigurationBackup[] {
    return this._backups();
  }

  /**
   * Create configuration backup
   */
  createConfigurationBackup(backup: Omit<ConfigurationBackup, 'id' | 'createdAt' | 'size'>): ConfigurationBackup {
    const configurations = this._configurations();
    const size = JSON.stringify(configurations).length;

    const newBackup: ConfigurationBackup = {
      ...backup,
      id: this.generateId(),
      createdAt: new Date(),
      size
    };

    this._backups.update(backups => [...backups, newBackup]);

    return newBackup;
  }

  /**
   * Restore configuration backup
   */
  restoreConfigurationBackup(backupId: string, modifiedBy: string = 'system'): boolean {
    const backup = this._backups().find(b => b.id === backupId);
    if (!backup) return false;

    // Create current backup before restoring
    this.createConfigurationBackup({
      name: `Auto-backup before restore ${new Date().toISOString()}`,
      description: 'Automatic backup created before restoring from backup',
      configurations: this._configurations(),
      environment: 'production',
      createdBy: 'system',
      isEncrypted: false
    });

    // Restore configurations
    this._configurations.set([...backup.configurations]);
    this.updateMetrics();

    return true;
  }

  /**
   * Export configurations
   */
  exportConfigurations(options: {
    category?: string;
    environment?: string;
    format: 'json' | 'yaml' | 'csv';
    includeInactive?: boolean;
  }): string {
    let configurations = this._configurations();

    if (options.category) {
      configurations = configurations.filter(c => c.category === options.category);
    }
    if (options.environment) {
      configurations = configurations.filter(c => c.environment === options.environment);
    }
    if (!options.includeInactive) {
      configurations = configurations.filter(c => c.isActive);
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      environment: options.environment || 'all',
      category: options.category || 'all',
      configurations: configurations.map(c => ({
        key: c.key,
        value: c.currentValue,
        type: c.type,
        description: c.description
      }))
    };

    switch (options.format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      case 'yaml':
        return this.convertToYaml(exportData);
      case 'csv':
        return this.convertToCsv(configurations);
      default:
        return JSON.stringify(exportData, null, 2);
    }
  }

  /**
   * Import configurations
   */
  importConfigurations(data: string, format: 'json' | 'yaml' | 'csv', modifiedBy: string = 'system'): boolean {
    try {
      let importData: any;

      switch (format) {
        case 'json':
          importData = JSON.parse(data);
          break;
        case 'yaml':
          importData = this.parseYaml(data);
          break;
        case 'csv':
          importData = this.parseCsv(data);
          break;
        default:
          return false;
      }

      const configurations = this._configurations();
      let updated = false;

      for (const configData of importData.configurations || []) {
        const config = configurations.find(c => c.key === configData.key);
        if (config && config.isEditable) {
          config.currentValue = configData.value;
          config.lastModified = new Date();
          config.modifiedBy = modifiedBy;
          updated = true;
        }
      }

      if (updated) {
        this._configurations.set([...configurations]);
        this.updateMetrics();
      }

      return updated;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): ConfigurationMetrics {
    return this._metrics();
  }

  /**
   * Validate configuration value
   */
  private validateConfigurationValue(config: SystemConfiguration, value: any): boolean {
    if (!config.validation) return true;

    const validation = config.validation;

    if (validation.min !== undefined && typeof value === 'number' && value < validation.min) {
      return false;
    }
    if (validation.max !== undefined && typeof value === 'number' && value > validation.max) {
      return false;
    }
    if (validation.pattern && typeof value === 'string' && !new RegExp(validation.pattern).test(value)) {
      return false;
    }
    if (validation.options && !validation.options.includes(value)) {
      return false;
    }

    return true;
  }

  /**
   * Convert to YAML
   */
  private convertToYaml(data: any): string {
    // Simple YAML conversion - in a real app, use a proper YAML library
    return JSON.stringify(data, null, 2).replace(/"/g, '').replace(/,/g, '');
  }

  /**
   * Parse YAML
   */
  private parseYaml(data: string): any {
    // Simple YAML parsing - in a real app, use a proper YAML library
    return JSON.parse(data.replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
  }

  /**
   * Convert to CSV
   */
  private convertToCsv(configurations: SystemConfiguration[]): string {
    const headers = ['Key', 'Value', 'Type', 'Category', 'Description', 'Last Modified'];
    const rows = configurations.map(c => [
      c.key,
      c.currentValue,
      c.type,
      c.category,
      c.description,
      c.lastModified.toISOString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Parse CSV
   */
  private parseCsv(data: string): any {
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    const configurations = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const config: any = {};
      headers.forEach((header, index) => {
        config[header.trim()] = values[index]?.trim();
      });
      configurations.push(config);
    }

    return { configurations };
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const configurations = this._configurations();
    const backups = this._backups();
    const metrics = this.calculateMetrics(configurations, backups);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(configurations: SystemConfiguration[], backups: ConfigurationBackup[]): ConfigurationMetrics {
    const totalConfigurations = configurations.length;
    const configurationsByCategory = this.groupBy(configurations, 'category');
    const modifiedToday = configurations.filter(c =>
      c.lastModified.toDateString() === new Date().toDateString()
    ).length;
    const modifiedThisWeek = configurations.filter(c => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return c.lastModified >= weekAgo;
    }).length;
    const backupCount = backups.length;
    const lastBackup = backups.length > 0 ?
      new Date(Math.max(...backups.map(b => b.createdAt.getTime()))) : new Date();
    const validationErrors = configurations.filter(c =>
      !this.validateConfigurationValue(c, c.currentValue)
    ).length;
    const environmentDistribution = this.groupBy(configurations, 'environment');

    return {
      totalConfigurations,
      configurationsByCategory,
      modifiedToday,
      modifiedThisWeek,
      backupCount,
      lastBackup,
      validationErrors,
      environmentDistribution
    };
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
  private getDefaultMetrics(): ConfigurationMetrics {
    return {
      totalConfigurations: 0,
      configurationsByCategory: {},
      modifiedToday: 0,
      modifiedThisWeek: 0,
      backupCount: 0,
      lastBackup: new Date(),
      validationErrors: 0,
      environmentDistribution: {}
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    const demoConfigurations: SystemConfiguration[] = [
      {
        id: 'config-1',
        category: 'general',
        name: 'Application Name',
        key: 'app.name',
        value: 'Intelligent Video Analytics Platform',
        type: 'string',
        description: 'The name of the application',
        isRequired: true,
        isEditable: true,
        defaultValue: 'Intelligent Video Analytics Platform',
        currentValue: 'Intelligent Video Analytics Platform',
        lastModified: new Date(),
        modifiedBy: 'admin',
        environment: 'production',
        isActive: true
      },
      {
        id: 'config-2',
        category: 'general',
        name: 'Application Version',
        key: 'app.version',
        value: '1.0.0',
        type: 'string',
        description: 'The version of the application',
        isRequired: true,
        isEditable: true,
        defaultValue: '1.0.0',
        currentValue: '1.0.0',
        lastModified: new Date(),
        modifiedBy: 'admin',
        environment: 'production',
        isActive: true
      },
      {
        id: 'config-3',
        category: 'security',
        name: 'Session Timeout',
        key: 'security.sessionTimeout',
        value: 3600,
        type: 'number',
        description: 'Session timeout in seconds',
        isRequired: true,
        isEditable: true,
        validation: { min: 300, max: 86400 },
        defaultValue: 3600,
        currentValue: 3600,
        lastModified: new Date(),
        modifiedBy: 'admin',
        environment: 'production',
        isActive: true
      },
      {
        id: 'config-4',
        category: 'security',
        name: 'Enable MFA',
        key: 'security.mfa.enabled',
        value: true,
        type: 'boolean',
        description: 'Enable multi-factor authentication',
        isRequired: false,
        isEditable: true,
        defaultValue: false,
        currentValue: true,
        lastModified: new Date(),
        modifiedBy: 'admin',
        environment: 'production',
        isActive: true
      },
      {
        id: 'config-5',
        category: 'performance',
        name: 'Max Concurrent Users',
        key: 'performance.maxConcurrentUsers',
        value: 1000,
        type: 'number',
        description: 'Maximum number of concurrent users',
        isRequired: true,
        isEditable: true,
        validation: { min: 10, max: 10000 },
        defaultValue: 100,
        currentValue: 1000,
        lastModified: new Date(),
        modifiedBy: 'admin',
        environment: 'production',
        isActive: true
      },
      {
        id: 'config-6',
        category: 'notifications',
        name: 'Email Notifications',
        key: 'notifications.email.enabled',
        value: true,
        type: 'boolean',
        description: 'Enable email notifications',
        isRequired: false,
        isEditable: true,
        defaultValue: true,
        currentValue: true,
        lastModified: new Date(),
        modifiedBy: 'admin',
        environment: 'production',
        isActive: true
      },
      {
        id: 'config-7',
        category: 'ui',
        name: 'Default Theme',
        key: 'ui.theme.default',
        value: 'dark',
        type: 'string',
        description: 'Default theme for the application',
        isRequired: false,
        isEditable: true,
        validation: { options: ['light', 'dark', 'auto'] },
        defaultValue: 'light',
        currentValue: 'dark',
        lastModified: new Date(),
        modifiedBy: 'admin',
        environment: 'production',
        isActive: true
      }
    ];

    this._configurations.set(demoConfigurations);

    // Create demo groups
    const demoGroups: ConfigurationGroup[] = [
      {
        id: 'group-1',
        name: 'General Settings',
        description: 'Basic application configuration',
        category: 'general',
        configurations: demoConfigurations.filter(c => c.category === 'general'),
        isCollapsible: true,
        isExpanded: true,
        order: 1
      },
      {
        id: 'group-2',
        name: 'Security Settings',
        description: 'Security and authentication configuration',
        category: 'security',
        configurations: demoConfigurations.filter(c => c.category === 'security'),
        isCollapsible: true,
        isExpanded: false,
        order: 2
      },
      {
        id: 'group-3',
        name: 'Performance Settings',
        description: 'Performance and optimization configuration',
        category: 'performance',
        configurations: demoConfigurations.filter(c => c.category === 'performance'),
        isCollapsible: true,
        isExpanded: false,
        order: 3
      }
    ];

    this._groups.set(demoGroups);

    // Create demo templates
    const demoTemplates: ConfigurationTemplate[] = [
      {
        id: 'template-1',
        name: 'Production Template',
        description: 'Production environment configuration template',
        environment: 'production',
        configurations: {
          'app.name': 'Intelligent Video Analytics Platform',
          'security.sessionTimeout': 3600,
          'security.mfa.enabled': true,
          'performance.maxConcurrentUsers': 1000
        },
        isDefault: true,
        createdAt: new Date(),
        createdBy: 'admin'
      },
      {
        id: 'template-2',
        name: 'Development Template',
        description: 'Development environment configuration template',
        environment: 'development',
        configurations: {
          'app.name': 'IVAP Dev',
          'security.sessionTimeout': 7200,
          'security.mfa.enabled': false,
          'performance.maxConcurrentUsers': 100
        },
        isDefault: false,
        createdAt: new Date(),
        createdBy: 'admin'
      }
    ];

    this._templates.set(demoTemplates);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'config-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

