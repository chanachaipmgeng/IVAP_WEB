import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

export interface DeviceConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  deviceType: 'camera' | 'nvr' | 'dvr' | 'access_control' | 'sensor' | 'alarm' | 'network_switch' | 'router' | 'server';
  brand: string;
  model: string;
  version: string;
  configuration: DeviceConfiguration;
  isDefault: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

export interface DeviceConfiguration {
  general: {
    name: string;
    description: string;
    location: {
      building: string;
      floor: string;
      room: string;
      coordinates?: { x: number; y: number; z: number };
    };
    timezone: string;
    language: string;
    ntpServer: string;
    timeSync: boolean;
  };
  network: {
    ipAddress: string;
    subnet: string;
    gateway: string;
    dns: string[];
    port: number;
    protocol: 'http' | 'https' | 'rtsp' | 'onvif';
    vlan: string;
    qos: {
      enabled: boolean;
      priority: number;
      bandwidth: number;
    };
    security: {
      sslEnabled: boolean;
      certificate: string;
      encryption: boolean;
      authentication: boolean;
    };
  };
  video: {
    enabled: boolean;
    resolution: string;
    fps: number;
    bitrate: number;
    codec: 'H264' | 'H265' | 'MJPEG';
    quality: 'low' | 'medium' | 'high' | 'ultra';
    compression: {
      enabled: boolean;
      level: number;
      profile: string;
    };
    streaming: {
      mainStream: {
        enabled: boolean;
        resolution: string;
        fps: number;
        bitrate: number;
      };
      subStream: {
        enabled: boolean;
        resolution: string;
        fps: number;
        bitrate: number;
      };
      snapshot: {
        enabled: boolean;
        resolution: string;
        interval: number;
        quality: number;
      };
    };
    display: {
      brightness: number;
      contrast: number;
      saturation: number;
      hue: number;
      sharpness: number;
      gamma: number;
    };
    exposure: {
      mode: 'auto' | 'manual' | 'shutter' | 'iris';
      shutter: number;
      gain: number;
      iris: number;
      whiteBalance: 'auto' | 'manual' | 'indoor' | 'outdoor' | 'fluorescent' | 'incandescent';
    };
    focus: {
      mode: 'auto' | 'manual';
      speed: number;
      sensitivity: number;
    };
    zoom: {
      enabled: boolean;
      level: number;
      digital: boolean;
      optical: boolean;
    };
    panTilt: {
      enabled: boolean;
      speed: number;
      limits: {
        panMin: number;
        panMax: number;
        tiltMin: number;
        tiltMax: number;
      };
      presets: Array<{
        id: string;
        name: string;
        pan: number;
        tilt: number;
        zoom: number;
      }>;
    };
  };
  audio: {
    enabled: boolean;
    input: {
      enabled: boolean;
      volume: number;
      gain: number;
      noiseReduction: boolean;
      echoCancellation: boolean;
    };
    output: {
      enabled: boolean;
      volume: number;
      speaker: boolean;
    };
    codec: 'G.711' | 'G.722' | 'G.726' | 'AAC';
    bitrate: number;
    sampleRate: number;
    channels: number;
  };
  recording: {
    enabled: boolean;
    schedule: {
      always: boolean;
      timeRanges: Array<{
        id: string;
        name: string;
        start: string;
        end: string;
        days: number[];
        enabled: boolean;
      }>;
    };
    motionOnly: boolean;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    retention: number; // days
    storage: {
      local: boolean;
      network: boolean;
      cloud: boolean;
      path: string;
      nas: {
        enabled: boolean;
        server: string;
        path: string;
        username: string;
        password: string;
      };
    };
    preRecord: number; // seconds
    postRecord: number; // seconds
    overwrite: boolean;
    compression: {
      enabled: boolean;
      level: number;
    };
  };
  analytics: {
    motionDetection: {
      enabled: boolean;
      sensitivity: number;
      regions: Array<{
        id: string;
        name: string;
        coordinates: Array<{ x: number; y: number }>;
        enabled: boolean;
        sensitivity: number;
      }>;
      schedule: {
        always: boolean;
        timeRanges: Array<{
          start: string;
          end: string;
          days: number[];
        }>;
      };
    };
    faceDetection: {
      enabled: boolean;
      confidence: number;
      maxFaces: number;
      quality: number;
      age: boolean;
      gender: boolean;
      emotion: boolean;
    };
    licensePlateRecognition: {
      enabled: boolean;
      confidence: number;
      countries: string[];
      format: string;
    };
    lineCrossing: {
      enabled: boolean;
      lines: Array<{
        id: string;
        name: string;
        start: { x: number; y: number };
        end: { x: number; y: number };
        direction: 'both' | 'left_to_right' | 'right_to_left';
        enabled: boolean;
        sensitivity: number;
      }>;
    };
    intrusionDetection: {
      enabled: boolean;
      regions: Array<{
        id: string;
        name: string;
        coordinates: Array<{ x: number; y: number }>;
        enabled: boolean;
        sensitivity: number;
      }>;
      schedule: {
        always: boolean;
        timeRanges: Array<{
          start: string;
          end: string;
          days: number[];
        }>;
      };
    };
    audioDetection: {
      enabled: boolean;
      sensitivity: number;
      threshold: number;
      duration: number;
    };
    tamperingDetection: {
      enabled: boolean;
      sensitivity: number;
      threshold: number;
    };
  };
  privacy: {
    masking: {
      enabled: boolean;
      regions: Array<{
        id: string;
        name: string;
        coordinates: Array<{ x: number; y: number }>;
        enabled: boolean;
        type: 'rectangle' | 'polygon' | 'circle';
      }>;
    };
    blurring: {
      enabled: boolean;
      regions: Array<{
        id: string;
        name: string;
        coordinates: Array<{ x: number; y: number }>;
        enabled: boolean;
        intensity: number;
      }>;
    };
    encryption: {
      enabled: boolean;
      algorithm: 'AES-128' | 'AES-256';
      key: string;
    };
  };
  alerts: {
    enabled: boolean;
    email: {
      enabled: boolean;
      recipients: string[];
      subject: string;
      template: string;
    };
    sms: {
      enabled: boolean;
      recipients: string[];
      message: string;
    };
    push: {
      enabled: boolean;
      devices: string[];
      title: string;
      message: string;
    };
    webhook: {
      enabled: boolean;
      url: string;
      method: 'GET' | 'POST' | 'PUT';
      headers: Record<string, string>;
      payload: Record<string, any>;
    };
    events: Array<{
      id: string;
      name: string;
      type: string;
      enabled: boolean;
      severity: 'low' | 'medium' | 'high' | 'critical';
      conditions: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
    }>;
  };
  maintenance: {
    autoUpdate: boolean;
    updateSchedule: string;
    backupEnabled: boolean;
    backupSchedule: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    logRetention: number; // days
    healthCheck: {
      enabled: boolean;
      interval: number; // minutes
      thresholds: {
        cpu: number;
        memory: number;
        disk: number;
        temperature: number;
      };
    };
    restart: {
      enabled: boolean;
      schedule: string;
      condition: 'time' | 'memory' | 'cpu' | 'error';
      threshold: number;
    };
  };
  security: {
    username: string;
    password: string;
    passwordExpiry: number; // days
    twoFactor: boolean;
    ssl: {
      enabled: boolean;
      certificate: string;
      privateKey: string;
      caCertificate: string;
    };
    firewall: {
      enabled: boolean;
      rules: Array<{
        id: string;
        name: string;
        action: 'allow' | 'deny';
        protocol: 'tcp' | 'udp' | 'icmp' | 'all';
        port: number;
        source: string;
        destination: string;
        enabled: boolean;
      }>;
    };
    access: {
      enabled: boolean;
      users: Array<{
        id: string;
        username: string;
        password: string;
        role: 'admin' | 'operator' | 'viewer';
        permissions: string[];
        enabled: boolean;
      }>;
      groups: Array<{
        id: string;
        name: string;
        users: string[];
        permissions: string[];
        enabled: boolean;
      }>;
    };
  };
}

export interface ConfigurationBackup {
  id: string;
  deviceId: string;
  name: string;
  description: string;
  configuration: DeviceConfiguration;
  version: string;
  createdAt: Date;
  createdBy: string;
  size: number; // bytes
  checksum: string;
  tags: string[];
}

export interface ConfigurationDeployment {
  id: string;
  deviceId: string;
  templateId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: number; // percentage
  startedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  error?: string;
  rollbackAvailable: boolean;
  rollbackId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceConfigurationService {
  // ✅ Signals for reactive state
  private _configurationTemplates = signal<DeviceConfigurationTemplate[]>([]);
  private _deviceConfigurations = signal<Map<string, DeviceConfiguration>>(new Map());
  private _configurationBackups = signal<ConfigurationBackup[]>([]);
  private _deployments = signal<ConfigurationDeployment[]>([]);

  // ✅ Readonly signals for public access
  public readonly configurationTemplates = this._configurationTemplates.asReadonly();
  public readonly deviceConfigurations = this._deviceConfigurations.asReadonly();
  public readonly configurationBackups = this._configurationBackups.asReadonly();
  public readonly deployments = this._deployments.asReadonly();

  // ✅ Computed signals for derived state
  public readonly templatesCount = computed(() => this._configurationTemplates().length);
  public readonly defaultTemplatesCount = computed(() =>
    this._configurationTemplates().filter(t => t.isDefault).length
  );
  public readonly configurationsCount = computed(() => this._deviceConfigurations().size);
  public readonly backupsCount = computed(() => this._configurationBackups().length);
  public readonly deploymentsCount = computed(() => this._deployments().length);
  public readonly activeDeploymentsCount = computed(() =>
    this._deployments().filter(d => d.status === 'in_progress' || d.status === 'pending').length
  );

  // ✅ Observable compatibility layer (for backward compatibility)
  public configurationTemplates$ = new Observable<DeviceConfigurationTemplate[]>(observer => {
    observer.next(this._configurationTemplates());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public deviceConfigurations$ = new Observable<Map<string, DeviceConfiguration>>(observer => {
    observer.next(this._deviceConfigurations());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public configurationBackups$ = new Observable<ConfigurationBackup[]>(observer => {
    observer.next(this._configurationBackups());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public deployments$ = new Observable<ConfigurationDeployment[]>(observer => {
    observer.next(this._deployments());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    const defaultTemplates: DeviceConfigurationTemplate[] = [
      {
        id: 'template-001',
        name: 'Default Camera Configuration',
        description: 'Standard configuration for IP cameras',
        deviceType: 'camera',
        brand: 'Generic',
        model: 'All',
        version: '1.0.0',
        configuration: this.getDefaultConfiguration('camera'),
        isDefault: true,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        tags: ['default', 'camera', 'ip']
      },
      {
        id: 'template-002',
        name: 'High Security Camera',
        description: 'High security configuration with encryption and privacy features',
        deviceType: 'camera',
        brand: 'Generic',
        model: 'All',
        version: '1.0.0',
        configuration: this.getHighSecurityConfiguration('camera'),
        isDefault: false,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        tags: ['security', 'camera', 'encryption']
      }
    ];

    this._configurationTemplates.set(defaultTemplates);
  }

  // Template Management
  getConfigurationTemplates(): Observable<DeviceConfigurationTemplate[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._configurationTemplates());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getConfigurationTemplate(id: string): Observable<DeviceConfigurationTemplate | undefined> {
    return new Observable(observer => {
      observer.next(this._configurationTemplates().find(template => template.id === id));
      observer.complete();
    });
  }

  createConfigurationTemplate(template: Omit<DeviceConfigurationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Observable<DeviceConfigurationTemplate> {
    const newTemplate: DeviceConfigurationTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this._configurationTemplates.update(templates => [...templates, newTemplate]);

    return new Observable(observer => {
      observer.next(newTemplate);
      observer.complete();
    });
  }

  updateConfigurationTemplate(id: string, updates: Partial<DeviceConfigurationTemplate>): Observable<DeviceConfigurationTemplate> {
    let updatedTemplate: DeviceConfigurationTemplate | undefined;

    this._configurationTemplates.update(templates => {
      const index = templates.findIndex(template => template.id === id);
      if (index === -1) {
        throw new Error('Template not found');
      }
      updatedTemplate = { ...templates[index], ...updates, updatedAt: new Date() };
      templates[index] = updatedTemplate;
      return [...templates];
    });

    if (!updatedTemplate) {
      return throwError(() => new Error('Template not found'));
    }

    return new Observable(observer => {
      observer.next(updatedTemplate!);
      observer.complete();
    });
  }

  deleteConfigurationTemplate(id: string): Observable<boolean> {
    this._configurationTemplates.update(templates => templates.filter(template => template.id !== id));

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Device Configuration Management
  getDeviceConfiguration(deviceId: string): Observable<DeviceConfiguration | undefined> {
    return new Observable(observer => {
      observer.next(this._deviceConfigurations().get(deviceId));
      observer.complete();
    });
  }

  setDeviceConfiguration(deviceId: string, configuration: DeviceConfiguration): Observable<boolean> {
    this._deviceConfigurations.update(configurations => {
      const newConfigurations = new Map(configurations);
      newConfigurations.set(deviceId, configuration);
      return newConfigurations;
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  updateDeviceConfiguration(deviceId: string, updates: Partial<DeviceConfiguration>): Observable<boolean> {
    const existingConfig = this._deviceConfigurations().get(deviceId);

    if (!existingConfig) {
      return throwError(() => new Error('Device configuration not found'));
    }

    const updatedConfig = this.deepMerge(existingConfig, updates);
    this._deviceConfigurations.update(configurations => {
      const newConfigurations = new Map(configurations);
      newConfigurations.set(deviceId, updatedConfig);
      return newConfigurations;
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  resetDeviceConfiguration(deviceId: string, templateId?: string): Observable<boolean> {
    let newConfiguration: DeviceConfiguration;
    if (templateId) {
      const templates = this._configurationTemplates();
      const template = templates.find(t => t.id === templateId);
      if (template) {
        newConfiguration = this.deepClone(template.configuration);
      } else {
        return throwError(() => new Error('Template not found'));
      }
    } else {
      newConfiguration = this.getDefaultConfiguration('camera');
    }

    this._deviceConfigurations.update(configurations => {
      const newConfigurations = new Map(configurations);
      newConfigurations.set(deviceId, newConfiguration);
      return newConfigurations;
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Configuration Deployment
  deployConfiguration(deviceId: string, templateId: string): Observable<ConfigurationDeployment> {
    const deployment: ConfigurationDeployment = {
      id: this.generateId(),
      deviceId,
      templateId,
      status: 'pending',
      progress: 0,
      startedAt: new Date(),
      rollbackAvailable: false
    };

    this._deployments.update(deployments => [...deployments, deployment]);

    // Simulate deployment process
    this.simulateDeployment(deployment);

    return new Observable(observer => {
      observer.next(deployment);
      observer.complete();
    });
  }

  private simulateDeployment(deployment: ConfigurationDeployment): void {
    this._deployments.update(deployments => {
      const index = deployments.findIndex(d => d.id === deployment.id);
      if (index === -1) return deployments;

      deployments[index] = { ...deployments[index], status: 'in_progress' };
      return [...deployments];
    });

    // Simulate progress
    const progressInterval = setInterval(() => {
      this._deployments.update(deployments => {
        const index = deployments.findIndex(d => d.id === deployment.id);
        if (index === -1) return deployments;

        const updatedDeployment = { ...deployments[index] };
        updatedDeployment.progress += Math.random() * 20;

        if (updatedDeployment.progress >= 100) {
          updatedDeployment.progress = 100;
          updatedDeployment.status = 'completed';
          updatedDeployment.completedAt = new Date();
          updatedDeployment.rollbackAvailable = true;
          clearInterval(progressInterval);
        }

        deployments[index] = updatedDeployment;
        return [...deployments];
      });
    }, 1000);
  }

  getDeployments(): Observable<ConfigurationDeployment[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._deployments());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getDeployment(id: string): Observable<ConfigurationDeployment | undefined> {
    return new Observable(observer => {
      observer.next(this._deployments().find(d => d.id === id));
      observer.complete();
    });
  }

  cancelDeployment(id: string): Observable<boolean> {
    this._deployments.update(deployments => {
      const index = deployments.findIndex(d => d.id === id);
      if (index !== -1 && deployments[index].status === 'in_progress') {
        deployments[index] = {
          ...deployments[index],
          status: 'cancelled',
          cancelledAt: new Date()
        };
        return [...deployments];
      }
      return deployments;
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Configuration Backup
  createConfigurationBackup(deviceId: string, name: string, description: string): Observable<ConfigurationBackup> {
    const configuration = this._deviceConfigurations().get(deviceId);
    if (!configuration) {
      return throwError(() => new Error('Device configuration not found'));
    }

    const backup: ConfigurationBackup = {
      id: this.generateId(),
      deviceId,
      name,
      description,
      configuration: this.deepClone(configuration),
      version: '1.0.0',
      createdAt: new Date(),
      createdBy: 'current_user',
      size: JSON.stringify(configuration).length,
      checksum: this.calculateChecksum(configuration),
      tags: []
    };

    this._configurationBackups.update(backups => [...backups, backup]);

    return new Observable(observer => {
      observer.next(backup);
      observer.complete();
    });
  }

  getConfigurationBackups(deviceId?: string): Observable<ConfigurationBackup[]> {
    return new Observable(observer => {
      const backups = this._configurationBackups();
      observer.next(deviceId ? backups.filter(b => b.deviceId === deviceId) : backups);
      observer.complete();
    });
  }

  restoreConfigurationBackup(deviceId: string, backupId: string): Observable<boolean> {
    const backups = this._configurationBackups();
    const backup = backups.find(b => b.id === backupId);

    if (!backup) {
      return throwError(() => new Error('Backup not found'));
    }

    this._deviceConfigurations.update(configurations => {
      const newConfigurations = new Map(configurations);
      newConfigurations.set(deviceId, this.deepClone(backup.configuration));
      return newConfigurations;
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  deleteConfigurationBackup(backupId: string): Observable<boolean> {
    this._configurationBackups.update(backups => backups.filter(b => b.id !== backupId));

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Configuration Validation
  validateConfiguration(configuration: DeviceConfiguration): Observable<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate general settings
    if (!configuration.general.name.trim()) {
      errors.push('Device name is required');
    }

    // Validate network settings
    if (!this.isValidIP(configuration.network.ipAddress)) {
      errors.push('Invalid IP address');
    }

    if (!this.isValidIP(configuration.network.gateway)) {
      errors.push('Invalid gateway address');
    }

    // Validate video settings
    if (configuration.video.enabled) {
      if (configuration.video.fps < 1 || configuration.video.fps > 60) {
        errors.push('FPS must be between 1 and 60');
      }

      if (configuration.video.bitrate < 100 || configuration.video.bitrate > 10000) {
        errors.push('Bitrate must be between 100 and 10000 kbps');
      }
    }

    // Validate recording settings
    if (configuration.recording.enabled) {
      if (configuration.recording.retention < 1 || configuration.recording.retention > 365) {
        errors.push('Retention must be between 1 and 365 days');
      }
    }

    return new Observable(observer => {
      observer.next({
        valid: errors.length === 0,
        errors
      });
      observer.complete();
    });
  }

  // Utility Methods
  private generateId(): string {
    return 'config-' + Math.random().toString(36).substr(2, 9);
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  private calculateChecksum(obj: any): string {
    return btoa(JSON.stringify(obj)).slice(0, 16);
  }

  private isValidIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  private getDefaultConfiguration(deviceType: string): DeviceConfiguration {
    return {
      general: {
        name: '',
        description: '',
        location: {
          building: '',
          floor: '',
          room: ''
        },
        timezone: 'UTC',
        language: 'en',
        ntpServer: 'pool.ntp.org',
        timeSync: true
      },
      network: {
        ipAddress: '192.168.1.100',
        subnet: '255.255.255.0',
        gateway: '192.168.1.1',
        dns: ['8.8.8.8', '8.8.4.4'],
        port: 80,
        protocol: 'http',
        vlan: 'default',
        qos: {
          enabled: false,
          priority: 0,
          bandwidth: 0
        },
        security: {
          sslEnabled: false,
          certificate: '',
          encryption: false,
          authentication: true
        }
      },
      video: {
        enabled: true,
        resolution: '1920x1080',
        fps: 30,
        bitrate: 4096,
        codec: 'H264',
        quality: 'high',
        compression: {
          enabled: true,
          level: 5,
          profile: 'main'
        },
        streaming: {
          mainStream: {
            enabled: true,
            resolution: '1920x1080',
            fps: 30,
            bitrate: 4096
          },
          subStream: {
            enabled: true,
            resolution: '640x480',
            fps: 15,
            bitrate: 1024
          },
          snapshot: {
            enabled: true,
            resolution: '1920x1080',
            interval: 30,
            quality: 80
          }
        },
        display: {
          brightness: 50,
          contrast: 50,
          saturation: 50,
          hue: 0,
          sharpness: 50,
          gamma: 1.0
        },
        exposure: {
          mode: 'auto',
          shutter: 0,
          gain: 0,
          iris: 0,
          whiteBalance: 'auto'
        },
        focus: {
          mode: 'auto',
          speed: 50,
          sensitivity: 50
        },
        zoom: {
          enabled: false,
          level: 1,
          digital: true,
          optical: false
        },
        panTilt: {
          enabled: false,
          speed: 50,
          limits: {
            panMin: -180,
            panMax: 180,
            tiltMin: -90,
            tiltMax: 90
          },
          presets: []
        }
      },
      audio: {
        enabled: true,
        input: {
          enabled: true,
          volume: 50,
          gain: 50,
          noiseReduction: true,
          echoCancellation: true
        },
        output: {
          enabled: false,
          volume: 50,
          speaker: false
        },
        codec: 'G.711',
        bitrate: 64,
        sampleRate: 8000,
        channels: 1
      },
      recording: {
        enabled: true,
        schedule: {
          always: true,
          timeRanges: []
        },
        motionOnly: false,
        quality: 'high',
        retention: 30,
        storage: {
          local: true,
          network: false,
          cloud: false,
          path: '/recordings',
          nas: {
            enabled: false,
            server: '',
            path: '',
            username: '',
            password: ''
          }
        },
        preRecord: 5,
        postRecord: 10,
        overwrite: true,
        compression: {
          enabled: true,
          level: 5
        }
      },
      analytics: {
        motionDetection: {
          enabled: true,
          sensitivity: 50,
          regions: [],
          schedule: {
            always: true,
            timeRanges: []
          }
        },
        faceDetection: {
          enabled: false,
          confidence: 80,
          maxFaces: 10,
          quality: 80,
          age: false,
          gender: false,
          emotion: false
        },
        licensePlateRecognition: {
          enabled: false,
          confidence: 80,
          countries: ['US'],
          format: 'US'
        },
        lineCrossing: {
          enabled: false,
          lines: []
        },
        intrusionDetection: {
          enabled: false,
          regions: [],
          schedule: {
            always: true,
            timeRanges: []
          }
        },
        audioDetection: {
          enabled: false,
          sensitivity: 50,
          threshold: 50,
          duration: 5
        },
        tamperingDetection: {
          enabled: false,
          sensitivity: 50,
          threshold: 50
        }
      },
      privacy: {
        masking: {
          enabled: false,
          regions: []
        },
        blurring: {
          enabled: false,
          regions: []
        },
        encryption: {
          enabled: false,
          algorithm: 'AES-256',
          key: ''
        }
      },
      alerts: {
        enabled: true,
        email: {
          enabled: false,
          recipients: [],
          subject: 'Device Alert',
          template: 'default'
        },
        sms: {
          enabled: false,
          recipients: [],
          message: 'Device alert'
        },
        push: {
          enabled: true,
          devices: [],
          title: 'Device Alert',
          message: 'Device alert notification'
        },
        webhook: {
          enabled: false,
          url: '',
          method: 'POST',
          headers: {},
          payload: {}
        },
        events: []
      },
      maintenance: {
        autoUpdate: false,
        updateSchedule: '0 2 * * 0',
        backupEnabled: true,
        backupSchedule: '0 1 * * *',
        logLevel: 'info',
        logRetention: 30,
        healthCheck: {
          enabled: true,
          interval: 5,
          thresholds: {
            cpu: 80,
            memory: 85,
            disk: 90,
            temperature: 70
          }
        },
        restart: {
          enabled: false,
          schedule: '0 3 * * 0',
          condition: 'time',
          threshold: 0
        }
      },
      security: {
        username: 'admin',
        password: '',
        passwordExpiry: 90,
        twoFactor: false,
        ssl: {
          enabled: false,
          certificate: '',
          privateKey: '',
          caCertificate: ''
        },
        firewall: {
          enabled: false,
          rules: []
        },
        access: {
          enabled: true,
          users: [],
          groups: []
        }
      }
    };
  }

  private getHighSecurityConfiguration(deviceType: string): DeviceConfiguration {
    const config = this.getDefaultConfiguration(deviceType);

    // Enhance security settings
    config.security.ssl.enabled = true;
    config.security.twoFactor = true;
    config.security.passwordExpiry = 30;
    config.privacy.encryption.enabled = true;
    config.privacy.masking.enabled = true;
    config.network.security.encryption = true;
    config.alerts.enabled = true;
    config.alerts.email.enabled = true;
    config.alerts.push.enabled = true;

    return config;
  }
}

