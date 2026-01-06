import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

export interface HardwareDevice {
  id: string;
  name: string;
  type: 'camera' | 'nvr' | 'dvr' | 'access_control' | 'sensor' | 'alarm' | 'network_switch' | 'router' | 'server';
  brand: string;
  model: string;
  serialNumber: string;
  macAddress: string;
  ipAddress: string;
  port: number;
  protocol: 'rtsp' | 'http' | 'https' | 'onvif' | 'modbus' | 'snmp' | 'tcp' | 'udp';
  status: 'online' | 'offline' | 'error' | 'maintenance' | 'unknown';
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  firmware: {
    version: string;
    build: string;
    releaseDate: Date;
    updateAvailable: boolean;
  };
  capabilities: DeviceCapabilities;
  configuration: DeviceConfiguration;
  location: {
    building: string;
    floor: string;
    room: string;
    rack?: string;
    position?: string;
    coordinates?: { x: number; y: number; z: number };
  };
  network: {
    vlan: string;
    subnet: string;
    gateway: string;
    dns: string[];
    bandwidth: number;
    latency: number;
  };
  power: {
    consumption: number; // watts
    voltage: number;
    current: number;
    efficiency: number;
  };
  temperature: {
    current: number;
    min: number;
    max: number;
    threshold: number;
  };
  uptime: {
    current: number; // seconds
    lastReboot: Date;
    totalUptime: number; // seconds
  };
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface DeviceCapabilities {
  video: {
    supported: boolean;
    maxResolution: string;
    supportedResolutions: string[];
    supportedCodecs: string[];
    maxFPS: number;
    channels: number;
  };
  audio: {
    supported: boolean;
    channels: number;
    sampleRate: number;
    bitrate: number;
  };
  storage: {
    supported: boolean;
    type: 'local' | 'network' | 'cloud';
    capacity: number;
    used: number;
    available: number;
  };
  network: {
    ethernet: boolean;
    wifi: boolean;
    cellular: boolean;
    maxBandwidth: number;
  };
  power: {
    poe: boolean;
    battery: boolean;
    solar: boolean;
    maxConsumption: number;
  };
  control: {
    panTiltZoom: boolean;
    focus: boolean;
    zoom: boolean;
    presets: boolean;
  };
  analytics: {
    motionDetection: boolean;
    faceDetection: boolean;
    licensePlateRecognition: boolean;
    lineCrossing: boolean;
    intrusionDetection: boolean;
    audioDetection: boolean;
  };
  security: {
    encryption: boolean;
    authentication: boolean;
    ssl: boolean;
    vpn: boolean;
  };
}

export interface DeviceConfiguration {
  general: {
    name: string;
    description: string;
    timezone: string;
    language: string;
    ntpServer: string;
  };
  network: {
    ipAddress: string;
    subnet: string;
    gateway: string;
    dns: string[];
    port: number;
    protocol: string;
  };
  video: {
    resolution: string;
    fps: number;
    bitrate: number;
    codec: string;
    quality: 'low' | 'medium' | 'high' | 'ultra';
  };
  audio: {
    enabled: boolean;
    volume: number;
    sampleRate: number;
    bitrate: number;
  };
  recording: {
    enabled: boolean;
    schedule: {
      always: boolean;
      timeRanges: Array<{
        start: string;
        end: string;
        days: number[];
      }>;
    };
    motionOnly: boolean;
    quality: 'low' | 'medium' | 'high' | 'ultra';
    retention: number; // days
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
      }>;
    };
    faceDetection: {
      enabled: boolean;
      confidence: number;
      maxFaces: number;
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
      }>;
    };
  };
  security: {
    username: string;
    password: string;
    sslEnabled: boolean;
    certificate: string;
    encryptionKey: string;
  };
  maintenance: {
    autoUpdate: boolean;
    updateSchedule: string;
    backupEnabled: boolean;
    backupSchedule: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

export interface DeviceGroup {
  id: string;
  name: string;
  description: string;
  type: 'location' | 'function' | 'brand' | 'custom';
  devices: string[];
  rules: DeviceGroupRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceGroupRule {
  id: string;
  name: string;
  condition: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
    value: any;
  };
  action: {
    type: 'add_to_group' | 'remove_from_group' | 'update_config' | 'send_alert';
    parameters: Record<string, any>;
  };
  enabled: boolean;
}

export interface DeviceAlert {
  id: string;
  deviceId: string;
  type: 'status_change' | 'performance_degradation' | 'error' | 'maintenance_required' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class HardwareDeviceManagementService {
  // ✅ Signals for reactive state
  private _devices = signal<HardwareDevice[]>([]);
  private _deviceGroups = signal<DeviceGroup[]>([]);
  private _alerts = signal<DeviceAlert[]>([]);
  private _isScanning = signal<boolean>(false);
  private _scanProgress = signal<number>(0);

  // ✅ Readonly signals for public access
  public readonly devices = this._devices.asReadonly();
  public readonly deviceGroups = this._deviceGroups.asReadonly();
  public readonly alerts = this._alerts.asReadonly();
  public readonly isScanning = this._isScanning.asReadonly();
  public readonly scanProgress = this._scanProgress.asReadonly();

  // ✅ Computed signals for derived state
  public readonly devicesCount = computed(() => this._devices().length);
  public readonly onlineDevicesCount = computed(() => this._devices().filter(d => d.status === 'online').length);
  public readonly alertsCount = computed(() => this._alerts().length);
  public readonly activeAlertsCount = computed(() => this._alerts().filter(a => !a.acknowledged && !a.resolved).length);

  constructor() {
    this.initializeDevices();
  }

  private initializeDevices(): void {
    const initialDevices: HardwareDevice[] = [
      {
        id: 'dev-001',
        name: 'Main Entrance Camera',
        type: 'camera',
        brand: 'Hikvision',
        model: 'DS-2CD2143G0-I',
        serialNumber: 'DS-2CD2143G0-I-20240101',
        macAddress: '00:11:22:33:44:55',
        ipAddress: '192.168.1.100',
        port: 80,
        protocol: 'rtsp',
        status: 'online',
        health: 'excellent',
        firmware: {
          version: '5.7.3',
          build: 'build-20231215',
          releaseDate: new Date('2023-12-15'),
          updateAvailable: false
        },
        capabilities: this.getDefaultCapabilities('camera'),
        configuration: this.getDefaultConfiguration('camera'),
        location: {
          building: 'Main Building',
          floor: 'Ground Floor',
          room: 'Entrance',
          coordinates: { x: 100, y: 200, z: 0 }
        },
        network: {
          vlan: 'VLAN-100',
          subnet: '192.168.1.0/24',
          gateway: '192.168.1.1',
          dns: ['8.8.8.8', '8.8.4.4'],
          bandwidth: 1000,
          latency: 5
        },
        power: {
          consumption: 12,
          voltage: 12,
          current: 1,
          efficiency: 0.85
        },
        temperature: {
          current: 35,
          min: 20,
          max: 60,
          threshold: 55
        },
        uptime: {
          current: 86400 * 30, // 30 days
          lastReboot: new Date(Date.now() - 86400 * 30),
          totalUptime: 86400 * 365 // 1 year
        },
        lastSeen: new Date(),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        metadata: {}
      }
    ];

    this._devices.set(initialDevices);
  }

  // Device Management
  getDevices(): Observable<HardwareDevice[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._devices());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getDevice(id: string): HardwareDevice | undefined {
    return this._devices().find(device => device.id === id);
  }

  addDevice(device: Omit<HardwareDevice, 'id' | 'createdAt' | 'updatedAt' | 'lastSeen'>): Observable<HardwareDevice> {
    const newDevice: HardwareDevice = {
      ...device,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSeen: new Date()
    };

    this._devices.update(devices => [...devices, newDevice]);

    return new Observable(observer => {
      observer.next(newDevice);
      observer.complete();
    });
  }

  updateDevice(id: string, updates: Partial<HardwareDevice>): Observable<HardwareDevice> {
    this._devices.update(devices => {
      const index = devices.findIndex(device => device.id === id);
      if (index === -1) return devices;

      devices[index] = {
        ...devices[index],
        ...updates,
        updatedAt: new Date()
      };
      return [...devices];
    });

    const updatedDevice = this._devices().find(d => d.id === id);
    if (!updatedDevice) {
      return throwError(() => new Error('Device not found'));
    }

    return new Observable(observer => {
      observer.next(updatedDevice);
      observer.complete();
    });
  }

  removeDevice(id: string): Observable<boolean> {
    let removed = false;
    this._devices.update(devices => {
      const beforeLength = devices.length;
      const filtered = devices.filter(device => device.id !== id);
      removed = filtered.length < beforeLength;
      return filtered;
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Device Discovery
  scanForDevices(networkRange: string): Observable<HardwareDevice[]> {
    this._isScanning.set(true);
    this._scanProgress.set(0);

    return new Observable(observer => {
      const discoveredDevices: HardwareDevice[] = [];
      const totalSteps = 10;
      let currentStep = 0;

      const scanInterval = setInterval(() => {
        currentStep++;
        this._scanProgress.set((currentStep / totalSteps) * 100);

        // Simulate device discovery
        if (currentStep === 5) {
          discoveredDevices.push({
            id: this.generateId(),
            name: 'Discovered Camera 1',
            type: 'camera',
            brand: 'Dahua',
            model: 'N45CG52',
            serialNumber: 'N45CG52-20240101',
            macAddress: '00:11:22:33:44:66',
            ipAddress: '192.168.1.101',
            port: 80,
            protocol: 'rtsp',
            status: 'online',
            health: 'good',
            firmware: {
              version: '4.0.0',
              build: 'build-20231201',
              releaseDate: new Date('2023-12-01'),
              updateAvailable: true
            },
            capabilities: this.getDefaultCapabilities('camera'),
            configuration: this.getDefaultConfiguration('camera'),
            location: {
              building: 'Main Building',
              floor: 'Ground Floor',
              room: 'Parking Lot'
            },
            network: {
              vlan: 'VLAN-100',
              subnet: '192.168.1.0/24',
              gateway: '192.168.1.1',
              dns: ['8.8.8.8', '8.8.4.4'],
              bandwidth: 1000,
              latency: 8
            },
            power: {
              consumption: 15,
              voltage: 12,
              current: 1.25,
              efficiency: 0.82
            },
            temperature: {
              current: 38,
              min: 20,
              max: 60,
              threshold: 55
            },
            uptime: {
              current: 86400 * 15,
              lastReboot: new Date(Date.now() - 86400 * 15),
              totalUptime: 86400 * 200
            },
            lastSeen: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {}
          });
        }

        if (currentStep >= totalSteps) {
          clearInterval(scanInterval);
          this._isScanning.set(false);
          this._scanProgress.set(100);
          observer.next(discoveredDevices);
          observer.complete();
        }
      }, 500);
    });
  }

  getScanningStatus(): boolean {
    return this._isScanning();
  }

  getScanProgress(): number {
    return this._scanProgress();
  }

  // Device Configuration
  updateDeviceConfiguration(deviceId: string, config: Partial<DeviceConfiguration>): Observable<boolean> {
    this._devices.update(devices => {
      const index = devices.findIndex(device => device.id === deviceId);
      if (index === -1) return devices;

      devices[index].configuration = { ...devices[index].configuration, ...config };
      devices[index].updatedAt = new Date();
      return [...devices];
    });

    const device = this._devices().find(d => d.id === deviceId);
    if (!device) {
      return throwError(() => new Error('Device not found'));
    }

    return new Observable(observer => {
      // Simulate configuration update
      timer(1000).subscribe(() => {
        observer.next(true);
        observer.complete();
      });
    });
  }

  resetDeviceConfiguration(deviceId: string): Observable<boolean> {
    this._devices.update(devices => {
      const index = devices.findIndex(device => device.id === deviceId);
      if (index === -1) return devices;

      devices[index].configuration = this.getDefaultConfiguration(devices[index].type);
      devices[index].updatedAt = new Date();
      return [...devices];
    });

    const device = this._devices().find(d => d.id === deviceId);
    if (!device) {
      return throwError(() => new Error('Device not found'));
    }

    return new Observable(observer => {
      timer(2000).subscribe(() => {
        observer.next(true);
        observer.complete();
      });
    });
  }

  // Device Groups
  getDeviceGroups(): Observable<DeviceGroup[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._deviceGroups());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  createDeviceGroup(group: Omit<DeviceGroup, 'id' | 'createdAt' | 'updatedAt'>): Observable<DeviceGroup> {
    const newGroup: DeviceGroup = {
      ...group,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this._deviceGroups.update(groups => [...groups, newGroup]);

    return new Observable(observer => {
      observer.next(newGroup);
      observer.complete();
    });
  }

  updateDeviceGroup(id: string, updates: Partial<DeviceGroup>): Observable<DeviceGroup> {
    this._deviceGroups.update(groups => {
      const index = groups.findIndex(group => group.id === id);
      if (index === -1) return groups;

      groups[index] = { ...groups[index], ...updates, updatedAt: new Date() };
      return [...groups];
    });

    const group = this._deviceGroups().find(g => g.id === id);
    if (!group) {
      return throwError(() => new Error('Device group not found'));
    }

    return new Observable(observer => {
      observer.next(group);
      observer.complete();
    });
  }

  // Device Monitoring
  getDeviceHealth(deviceId: string): Observable<{ status: string; health: string; issues: string[] }> {
    return new Observable(observer => {
    const devices = this._devices();
    const device = devices.find(d => d.id === deviceId);

      if (!device) {
        observer.error(new Error('Device not found'));
        return;
      }

      const issues: string[] = [];

      if (device.status !== 'online') {
        issues.push('Device is offline');
      }

      if (device.health === 'poor' || device.health === 'critical') {
        issues.push('Device health is poor');
      }

      if (device.temperature.current > device.temperature.threshold) {
        issues.push('Device temperature is high');
      }

      if (device.uptime.current < 3600) { // Less than 1 hour
        issues.push('Device recently rebooted');
      }

      observer.next({
        status: device.status,
        health: device.health,
        issues
      });
      observer.complete();
    });
  }

  // Device Alerts
  getAlerts(): Observable<DeviceAlert[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._alerts());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  createAlert(alert: Omit<DeviceAlert, 'id' | 'timestamp'>): Observable<DeviceAlert> {
    const newAlert: DeviceAlert = {
      ...alert,
      id: this.generateId(),
      timestamp: new Date()
    };

    this._alerts.update(alerts => [...alerts, newAlert]);

    return new Observable(observer => {
      observer.next(newAlert);
      observer.complete();
    });
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): Observable<boolean> {
    let acknowledged = false;
    this._alerts.update(alerts => {
      const index = alerts.findIndex(alert => alert.id === alertId);
      if (index === -1) return alerts;

      acknowledged = true;
      alerts[index].acknowledged = true;
      alerts[index].acknowledgedBy = acknowledgedBy;
      alerts[index].acknowledgedAt = new Date();
      return [...alerts];
    });

    return new Observable(observer => {
      observer.next(acknowledged);
      observer.complete();
    });
  }

  // Utility Methods
  private generateId(): string {
    return 'dev-' + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultCapabilities(type: string): DeviceCapabilities {
    const baseCapabilities: DeviceCapabilities = {
      video: {
        supported: type === 'camera' || type === 'nvr' || type === 'dvr',
        maxResolution: '1920x1080',
        supportedResolutions: ['640x480', '1280x720', '1920x1080'],
        supportedCodecs: ['H264', 'H265'],
        maxFPS: 30,
        channels: 1
      },
      audio: {
        supported: type === 'camera' || type === 'nvr' || type === 'dvr',
        channels: 1,
        sampleRate: 44100,
        bitrate: 128
      },
      storage: {
        supported: type === 'nvr' || type === 'dvr' || type === 'server',
        type: 'local',
        capacity: 1000000000000, // 1TB
        used: 0,
        available: 1000000000000
      },
      network: {
        ethernet: true,
        wifi: false,
        cellular: false,
        maxBandwidth: 1000
      },
      power: {
        poe: type === 'camera',
        battery: false,
        solar: false,
        maxConsumption: 15
      },
      control: {
        panTiltZoom: type === 'camera',
        focus: type === 'camera',
        zoom: type === 'camera',
        presets: type === 'camera'
      },
      analytics: {
        motionDetection: type === 'camera',
        faceDetection: false,
        licensePlateRecognition: false,
        lineCrossing: type === 'camera',
        intrusionDetection: type === 'camera',
        audioDetection: type === 'camera'
      },
      security: {
        encryption: true,
        authentication: true,
        ssl: true,
        vpn: false
      }
    };

    return baseCapabilities;
  }

  private getDefaultConfiguration(type: string): DeviceConfiguration {
    return {
      general: {
        name: '',
        description: '',
        timezone: 'UTC',
        language: 'en',
        ntpServer: 'pool.ntp.org'
      },
      network: {
        ipAddress: '192.168.1.100',
        subnet: '255.255.255.0',
        gateway: '192.168.1.1',
        dns: ['8.8.8.8', '8.8.4.4'],
        port: 80,
        protocol: 'http'
      },
      video: {
        resolution: '1920x1080',
        fps: 30,
        bitrate: 4096,
        codec: 'H264',
        quality: 'high'
      },
      audio: {
        enabled: true,
        volume: 50,
        sampleRate: 44100,
        bitrate: 128
      },
      recording: {
        enabled: true,
        schedule: {
          always: true,
          timeRanges: []
        },
        motionOnly: false,
        quality: 'high',
        retention: 30
      },
      analytics: {
        motionDetection: {
          enabled: true,
          sensitivity: 50,
          regions: []
        },
        faceDetection: {
          enabled: false,
          confidence: 80,
          maxFaces: 10
        },
        lineCrossing: {
          enabled: false,
          lines: []
        }
      },
      security: {
        username: 'admin',
        password: '',
        sslEnabled: false,
        certificate: '',
        encryptionKey: ''
      },
      maintenance: {
        autoUpdate: false,
        updateSchedule: '0 2 * * 0',
        backupEnabled: true,
        backupSchedule: '0 1 * * *',
        logLevel: 'info'
      }
    };
  }
}

