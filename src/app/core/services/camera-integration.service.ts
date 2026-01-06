import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, map, retry, retryWhen, delay, take } from 'rxjs/operators';

export interface CameraDevice {
  id: string;
  name: string;
  type: 'CCTV' | 'NVR' | 'IP_CAMERA' | 'ANALOG_CAMERA';
  brand: string;
  model: string;
  ipAddress: string;
  port: number;
  username: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  resolution: string;
  fps: number;
  bitrate: number;
  codec: 'H264' | 'H265' | 'MJPEG';
  nightVision: boolean;
  panTiltZoom: boolean;
  audio: boolean;
  motionDetection: boolean;
  recording: boolean;
  lastSeen: Date;
  location: {
    building: string;
    floor: string;
    room: string;
    coordinates?: { x: number; y: number };
  };
  settings: CameraSettings;
  capabilities: CameraCapabilities;
}

export interface CameraSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sharpness: number;
  exposure: 'auto' | 'manual';
  whiteBalance: 'auto' | 'manual';
  focus: 'auto' | 'manual';
  zoom: number;
  pan: number;
  tilt: number;
  nightMode: boolean;
  motionSensitivity: number;
  recordingQuality: 'low' | 'medium' | 'high' | 'ultra';
  audioEnabled: boolean;
  privacyMasking: boolean;
  privacyZones: Array<{
    id: string;
    name: string;
    coordinates: Array<{ x: number; y: number }>;
    enabled: boolean;
  }>;
}

export interface CameraCapabilities {
  maxResolution: string;
  supportedResolutions: string[];
  supportedFPS: number[];
  supportedCodecs: string[];
  hasNightVision: boolean;
  hasPanTiltZoom: boolean;
  hasAudio: boolean;
  hasMotionDetection: boolean;
  hasRecording: boolean;
  hasPrivacyMasking: boolean;
  hasAudioDetection: boolean;
  hasLineCrossing: boolean;
  hasIntrusionDetection: boolean;
  hasFaceDetection: boolean;
  hasLicensePlateRecognition: boolean;
}

export interface CameraStream {
  id: string;
  cameraId: string;
  streamType: 'main' | 'sub' | 'snapshot';
  resolution: string;
  fps: number;
  bitrate: number;
  codec: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  viewers: number;
  bandwidth: number;
  latency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface RecordingSettings {
  cameraId: string;
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
  storage: {
    local: boolean;
    cloud: boolean;
    nas: boolean;
    path: string;
  };
  preRecord: number; // seconds
  postRecord: number; // seconds
}

export interface CameraEvent {
  id: string;
  cameraId: string;
  type: 'motion' | 'audio' | 'line_crossing' | 'intrusion' | 'face_detection' | 'license_plate' | 'tampering' | 'disconnection';
  timestamp: Date;
  confidence: number;
  location: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  imageUrl?: string;
  videoUrl?: string;
  metadata: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class CameraIntegrationService {
  // ✅ Signals for reactive state
  private _cameras = signal<CameraDevice[]>([]);
  private _streams = signal<CameraStream[]>([]);
  private _events = signal<CameraEvent[]>([]);
  private _isConnected = signal<boolean>(false);
  private _connectionStatus = signal<string>('disconnected');

  // ✅ Readonly signals for public access
  public readonly cameras = this._cameras.asReadonly();
  public readonly streams = this._streams.asReadonly();
  public readonly events = this._events.asReadonly();
  public readonly isConnected = this._isConnected.asReadonly();
  public readonly connectionStatus = this._connectionStatus.asReadonly();

  // ✅ Computed signals for derived state
  public readonly camerasCount = computed(() => this._cameras().length);
  public readonly onlineCamerasCount = computed(() => this._cameras().filter(c => c.status === 'online').length);
  public readonly streamsCount = computed(() => this._streams().length);
  public readonly activeStreamsCount = computed(() => this._streams().filter(s => s.status === 'active').length);
  public readonly eventsCount = computed(() => this._events().length);
  public readonly unacknowledgedEventsCount = computed(() => this._events().filter(e => !e.acknowledged).length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public cameras$ = new Observable<CameraDevice[]>(observer => {
    observer.next(this._cameras());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public streams$ = new Observable<CameraStream[]>(observer => {
    observer.next(this._streams());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public events$ = new Observable<CameraEvent[]>(observer => {
    observer.next(this._events());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public isConnected$ = new Observable<boolean>(observer => {
    observer.next(this._isConnected());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public connectionStatus$ = new Observable<string>(observer => {
    observer.next(this._connectionStatus());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    // Simulate initial camera discovery
    this.discoverCameras().subscribe({
      next: (cameras) => {
        this._cameras.set(cameras);
        this._isConnected.set(true);
        this._connectionStatus.set('connected');
      },
      error: (error) => {
        console.error('Camera discovery failed:', error);
        this._isConnected.set(false);
        this._connectionStatus.set('error');
      }
    });
  }

  // Camera Management
  getCameras(): Observable<CameraDevice[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._cameras());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getCamera(id: string): CameraDevice | undefined {
    return this._cameras().find(camera => camera.id === id);
  }

  addCamera(camera: Omit<CameraDevice, 'id' | 'lastSeen' | 'status'>): Observable<CameraDevice> {
    const newCamera: CameraDevice = {
      ...camera,
      id: this.generateId(),
      lastSeen: new Date(),
      status: 'offline'
    };

    return this.connectToCamera(newCamera).pipe(
      map(connectedCamera => {
        this._cameras.update(cameras => [...cameras, connectedCamera]);
        return connectedCamera;
      }),
      catchError(error => {
        console.error('Failed to add camera:', error);
        return throwError(() => error);
      })
    );
  }

  updateCamera(id: string, updates: Partial<CameraDevice>): Observable<CameraDevice> {
    this._cameras.update(cameras => {
      const index = cameras.findIndex(camera => camera.id === id);
      if (index === -1) return cameras;

      cameras[index] = { ...cameras[index], ...updates };
      return [...cameras];
    });

    const updatedCamera = this._cameras().find(c => c.id === id);
    if (!updatedCamera) {
      return throwError(() => new Error('Camera not found'));
    }

    return this.updateCameraSettings(id, updates.settings || {}).pipe(
      map(() => updatedCamera),
      catchError(error => {
        console.error('Failed to update camera:', error);
        return throwError(() => error);
      })
    );
  }

  removeCamera(id: string): Observable<boolean> {
    const cameras = this._cameras();
    const filteredCameras = cameras.filter(camera => camera.id !== id);
    this._cameras.set(filteredCameras);

    return this.disconnectFromCamera(id).pipe(
      map(() => true),
      catchError(error => {
        console.error('Failed to remove camera:', error);
        return throwError(() => error);
      })
    );
  }

  // Camera Discovery
  discoverCameras(): Observable<CameraDevice[]> {
    // Simulate camera discovery process
    return new Observable(observer => {
      const discoveredCameras: CameraDevice[] = [
        {
          id: 'cam-001',
          name: 'Main Entrance Camera',
          type: 'IP_CAMERA',
          brand: 'Hikvision',
          model: 'DS-2CD2143G0-I',
          ipAddress: '192.168.1.100',
          port: 80,
          username: 'admin',
          status: 'online',
          resolution: '1920x1080',
          fps: 30,
          bitrate: 4096,
          codec: 'H264',
          nightVision: true,
          panTiltZoom: false,
          audio: true,
          motionDetection: true,
          recording: true,
          lastSeen: new Date(),
          location: {
            building: 'Main Building',
            floor: 'Ground Floor',
            room: 'Entrance',
            coordinates: { x: 100, y: 200 }
          },
          settings: this.getDefaultSettings(),
          capabilities: this.getDefaultCapabilities()
        },
        {
          id: 'cam-002',
          name: 'Parking Lot Camera',
          type: 'CCTV',
          brand: 'Dahua',
          model: 'N45CG52',
          ipAddress: '192.168.1.101',
          port: 80,
          username: 'admin',
          status: 'online',
          resolution: '2560x1440',
          fps: 25,
          bitrate: 6144,
          codec: 'H265',
          nightVision: true,
          panTiltZoom: true,
          audio: false,
          motionDetection: true,
          recording: true,
          lastSeen: new Date(),
          location: {
            building: 'Main Building',
            floor: 'Basement',
            room: 'Parking Lot',
            coordinates: { x: 150, y: 300 }
          },
          settings: this.getDefaultSettings(),
          capabilities: this.getDefaultCapabilities()
        }
      ];

      // Simulate discovery delay
      timer(1000).subscribe(() => {
        observer.next(discoveredCameras);
        observer.complete();
      });
    });
  }

  // Camera Connection
  connectToCamera(camera: CameraDevice): Observable<CameraDevice> {
    return new Observable(observer => {
      // Simulate connection process
      timer(2000).subscribe(() => {
        const connectedCamera = {
          ...camera,
          status: 'online' as const,
          lastSeen: new Date()
        };
        observer.next(connectedCamera);
        observer.complete();
      });
    });
  }

  disconnectFromCamera(cameraId: string): Observable<boolean> {
    return new Observable(observer => {
      // Simulate disconnection process
      timer(1000).subscribe(() => {
        observer.next(true);
        observer.complete();
      });
    });
  }

  // Camera Settings
  updateCameraSettings(cameraId: string, settings: Partial<CameraSettings>): Observable<boolean> {
    return new Observable(observer => {
      // Simulate settings update
      timer(500).subscribe(() => {
        const cameras = this._cameras();
        const index = cameras.findIndex(camera => camera.id === cameraId);

        if (index !== -1) {
          cameras[index].settings = { ...cameras[index].settings, ...settings };
          this._cameras.set([...cameras]);
        }

        observer.next(true);
        observer.complete();
      });
    });
  }

  // Camera Control
  controlCamera(cameraId: string, action: string, params: any = {}): Observable<boolean> {
    return new Observable(observer => {
      // Simulate camera control
      timer(300).subscribe(() => {
        // Camera action executed
        observer.next(true);
        observer.complete();
      });
    });
  }

  // Stream Management
  getStreams(): Observable<CameraStream[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._streams());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  startStream(cameraId: string, streamType: 'main' | 'sub' | 'snapshot' = 'main'): Observable<CameraStream> {
    return new Observable(observer => {
      const stream: CameraStream = {
        id: this.generateId(),
        cameraId,
        streamType,
        resolution: '1920x1080',
        fps: 30,
        bitrate: 4096,
        codec: 'H264',
        url: `rtsp://192.168.1.${Math.floor(Math.random() * 255)}/stream`,
        status: 'active',
        viewers: 1,
        bandwidth: 4096,
        latency: 50,
        quality: 'excellent'
      };

      this._streams.update(streams => [...streams, stream]);

      observer.next(stream);
      observer.complete();
    });
  }

  stopStream(streamId: string): Observable<boolean> {
    this._streams.update(streams => streams.filter(stream => stream.id !== streamId));

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Recording Management
  startRecording(cameraId: string, settings: Partial<RecordingSettings>): Observable<boolean> {
    return new Observable(observer => {
      timer(500).subscribe(() => {
        const cameras = this._cameras();
        const index = cameras.findIndex(camera => camera.id === cameraId);

        if (index !== -1) {
          cameras[index].recording = true;
          this._cameras.set([...cameras]);
        }

        observer.next(true);
        observer.complete();
      });
    });
  }

  stopRecording(cameraId: string): Observable<boolean> {
    return new Observable(observer => {
      timer(500).subscribe(() => {
        const cameras = this._cameras();
        const index = cameras.findIndex(camera => camera.id === cameraId);

        if (index !== -1) {
          cameras[index].recording = false;
          this._cameras.set([...cameras]);
        }

        observer.next(true);
        observer.complete();
      });
    });
  }

  // Event Management
  getEvents(): Observable<CameraEvent[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._events());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getEventsByCamera(cameraId: string): CameraEvent[] {
    return this._events().filter(event => event.cameraId === cameraId);
  }

  acknowledgeEvent(eventId: string): Observable<boolean> {
    this._events.update(events => {
      const index = events.findIndex(event => event.id === eventId);
      if (index !== -1) {
        events[index].acknowledged = true;
        return [...events];
      }
      return events;
    });

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Status Monitoring
  getConnectionStatus(): boolean {
    return this._isConnected();
  }

  getConnectionStatusText(): string {
    return this._connectionStatus();
  }

  // Health Check
  performHealthCheck(): Observable<{ status: string; cameras: number; issues: string[] }> {
    return new Observable(observer => {
      const cameras = this._cameras();
      const onlineCameras = cameras.filter(camera => camera.status === 'online');
      const issues: string[] = [];

      if (onlineCameras.length === 0) {
        issues.push('No cameras online');
      }

      if (onlineCameras.length < cameras.length) {
        issues.push(`${cameras.length - onlineCameras.length} cameras offline`);
      }

      const status = issues.length === 0 ? 'healthy' : 'warning';

      observer.next({
        status,
        cameras: onlineCameras.length,
        issues
      });
      observer.complete();
    });
  }

  // Utility Methods
  private generateId(): string {
    return 'cam-' + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultSettings(): CameraSettings {
    return {
      brightness: 50,
      contrast: 50,
      saturation: 50,
      hue: 0,
      sharpness: 50,
      exposure: 'auto',
      whiteBalance: 'auto',
      focus: 'auto',
      zoom: 1,
      pan: 0,
      tilt: 0,
      nightMode: false,
      motionSensitivity: 50,
      recordingQuality: 'high',
      audioEnabled: true,
      privacyMasking: false,
      privacyZones: []
    };
  }

  private getDefaultCapabilities(): CameraCapabilities {
    return {
      maxResolution: '1920x1080',
      supportedResolutions: ['640x480', '1280x720', '1920x1080'],
      supportedFPS: [15, 25, 30],
      supportedCodecs: ['H264', 'H265'],
      hasNightVision: true,
      hasPanTiltZoom: false,
      hasAudio: true,
      hasMotionDetection: true,
      hasRecording: true,
      hasPrivacyMasking: true,
      hasAudioDetection: true,
      hasLineCrossing: true,
      hasIntrusionDetection: true,
      hasFaceDetection: false,
      hasLicensePlateRecognition: false
    };
  }
}

