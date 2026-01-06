import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { NativeBridgeService } from './native-bridge.service';

export interface CameraSettings {
  quality: number; // 0-100
  resolution: {
    width: number;
    height: number;
  };
  flashMode: 'auto' | 'on' | 'off';
  focusMode: 'auto' | 'manual' | 'continuous';
  whiteBalance: 'auto' | 'sunny' | 'cloudy' | 'tungsten' | 'fluorescent';
  exposure: number; // -2 to 2
  zoom: number; // 1 to 10
  enableHDR: boolean;
  enableStabilization: boolean;
  enableGrid: boolean;
  enableTimer: boolean;
  timerDelay: number; // seconds
}

export interface PhotoResult {
  dataUrl: string;
  base64: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  metadata: {
    camera: string;
    settings: CameraSettings;
    device: string;
    platform: string;
  };
}

export interface CameraError {
  code: string;
  message: string;
  details?: any;
}

export interface CameraState {
  isInitialized: boolean;
  isStreaming: boolean;
  isCapturing: boolean;
  hasPermission: boolean;
  error?: CameraError;
  settings: CameraSettings;
}

@Injectable({
  providedIn: 'root'
})
export class MobileCameraService {
  private cameraStateData: CameraState = {
    isInitialized: false,
    isStreaming: false,
    isCapturing: false,
    hasPermission: false,
    settings: this.getDefaultSettings()
  };

  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;

  // ✅ Signals for reactive state
  private _cameraState = signal<CameraState>(this.cameraStateData);
  private _photo = signal<PhotoResult | null>(null);

  // ✅ Readonly signals for public access
  public readonly cameraState = this._cameraState.asReadonly();
  public readonly photo = this._photo.asReadonly();

  constructor(
    private nativeBridge: NativeBridgeService
  ) {}

  /**
   * Get default camera settings
   */
  private getDefaultSettings(): CameraSettings {
    return {
      quality: 80,
      resolution: {
        width: 1920,
        height: 1080
      },
      flashMode: 'auto',
      focusMode: 'auto',
      whiteBalance: 'auto',
      exposure: 0,
      zoom: 1,
      enableHDR: false,
      enableStabilization: true,
      enableGrid: false,
      enableTimer: false,
      timerDelay: 3
    };
  }

  /**
   * Initialize camera
   */
  public async initializeCamera(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void> {
    try {
      this.videoElement = videoElement;
      this.canvasElement = canvasElement;

      // Check if native camera is available
      if (this.nativeBridge.isNative() && this.nativeBridge.hasCapability('hasCamera')) {
        await this.initializeNativeCamera();
      } else {
        await this.initializeWebCamera();
      }

      this.cameraStateData.isInitialized = true;
      this.cameraStateData.hasPermission = true;
      this.updateCameraState();
    } catch (error) {
      this.cameraStateData.error = {
        code: 'INIT_FAILED',
        message: 'Failed to initialize camera',
        details: error
      };
      this.updateCameraState();
      throw error;
    }
  }

  /**
   * Initialize native camera
   */
  private async initializeNativeCamera(): Promise<void> {
    // Native camera initialization would be handled by the native bridge
    // For now, fallback to web camera
    await this.initializeWebCamera();
  }

  /**
   * Initialize web camera
   */
  private async initializeWebCamera(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: this.cameraStateData.settings.resolution.width },
          height: { ideal: this.cameraStateData.settings.resolution.height },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.videoElement) {
        this.videoElement.srcObject = this.mediaStream;
        await this.videoElement.play();
        this.cameraStateData.isStreaming = true;
      }

      this.updateCameraState();
    } catch (error) {
      throw new Error(`Camera access denied: ${error}`);
    }
  }

  /**
   * Start camera stream
   */
  public async startCamera(): Promise<void> {
    try {
      if (!this.cameraStateData.isInitialized) {
        throw new Error('Camera not initialized');
      }

      if (this.nativeBridge.isNative()) {
        await this.startNativeCamera();
      } else {
        await this.startWebCamera();
      }

      this.cameraStateData.isStreaming = true;
      this.updateCameraState();
    } catch (error) {
      this.cameraStateData.error = {
        code: 'START_FAILED',
        message: 'Failed to start camera',
        details: error
      };
      this.updateCameraState();
      throw error;
    }
  }

  /**
   * Start native camera
   */
  private async startNativeCamera(): Promise<void> {
    // Native camera start implementation
    // This would use the native bridge to start the camera
  }

  /**
   * Start web camera
   */
  private async startWebCamera(): Promise<void> {
    if (this.videoElement && this.mediaStream) {
      this.videoElement.srcObject = this.mediaStream;
      await this.videoElement.play();
    }
  }

  /**
   * Stop camera stream
   */
  public async stopCamera(): Promise<void> {
    try {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      if (this.videoElement) {
        this.videoElement.srcObject = null;
      }

      this.cameraStateData.isStreaming = false;
      this.updateCameraState();
    } catch (error) {
      this.cameraStateData.error = {
        code: 'STOP_FAILED',
        message: 'Failed to stop camera',
        details: error
      };
      this.updateCameraState();
      throw error;
    }
  }

  /**
   * Capture photo
   */
  public async capturePhoto(): Promise<PhotoResult> {
    try {
      if (!this.cameraStateData.isStreaming) {
        throw new Error('Camera not streaming');
      }

      this.cameraStateData.isCapturing = true;
      this.updateCameraState();

      let photoResult: PhotoResult;

      if (this.nativeBridge.isNative()) {
        photoResult = await this.captureNativePhoto();
      } else {
        photoResult = await this.captureWebPhoto();
      }

      this.cameraStateData.isCapturing = false;
      this.updateCameraState();

      this._photo.set(photoResult);
      return photoResult;
    } catch (error) {
      this.cameraStateData.isCapturing = false;
      this.cameraStateData.error = {
        code: 'CAPTURE_FAILED',
        message: 'Failed to capture photo',
        details: error
      };
      this.updateCameraState();
      throw error;
    }
  }

  /**
   * Capture photo using native camera
   */
  private async captureNativePhoto(): Promise<PhotoResult> {
    try {
      const dataUrl = await this.nativeBridge.takePhoto({
        quality: this.cameraStateData.settings.quality,
        allowEdit: false,
        correctOrientation: true,
        saveToPhotoAlbum: false,
        encodingType: 'JPEG',
        sourceType: 'CAMERA'
      });

      // Get location if available
      let location;
      try {
        const loc = await this.nativeBridge.getCurrentLocation();
        location = {
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy
        };
      } catch (error) {
        // Location not available
      }

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Get image dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      return {
        dataUrl,
        base64: dataUrl.split(',')[1],
        blob,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: blob.size,
        timestamp: new Date(),
        location,
        metadata: {
          camera: 'native',
          settings: this.cameraStateData.settings,
          device: this.nativeBridge.getDeviceInfo()?.model || 'unknown',
          platform: this.nativeBridge.getDeviceInfo()?.platform || 'unknown'
        }
      };
    } catch (error) {
      throw new Error(`Native photo capture failed: ${error}`);
    }
  }

  /**
   * Capture photo using web camera
   */
  private async captureWebPhoto(): Promise<PhotoResult> {
    if (!this.videoElement || !this.canvasElement) {
      throw new Error('Video or canvas element not available');
    }

    const video = this.videoElement;
    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', this.cameraStateData.settings.quality / 100);

    // Convert to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Get location if available
    let location;
    try {
      const loc = await this.nativeBridge.getCurrentLocation();
      location = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy
      };
    } catch (error) {
      // Location not available
    }

    return {
      dataUrl,
      base64: dataUrl.split(',')[1],
      blob,
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
      timestamp: new Date(),
      location,
      metadata: {
        camera: 'web',
        settings: this.cameraStateData.settings,
        device: navigator.userAgent,
        platform: 'web'
      }
    };
  }

  /**
   * Update camera settings
   */
  public updateSettings(settings: Partial<CameraSettings>): void {
    this.cameraStateData.settings = { ...this.cameraStateData.settings, ...settings };
    this.updateCameraState();
  }

  /**
   * Get current settings
   */
  public getSettings(): CameraSettings {
    return { ...this.cameraStateData.settings };
  }

  /**
   * Get camera state
   */
  public getCameraState(): CameraState {
    return { ...this._cameraState() };
  }

  /**
   * Check if camera is available
   */
  public isCameraAvailable(): boolean {
    return this.nativeBridge.hasCapability('hasCamera');
  }

  /**
   * Check if camera is streaming
   */
  public isStreaming(): boolean {
    return this.cameraStateData.isStreaming;
  }

  /**
   * Check if camera is capturing
   */
  public isCapturing(): boolean {
    return this.cameraStateData.isCapturing;
  }

  /**
   * Get last captured photo
   */
  public getLastPhoto(): PhotoResult | null {
    return this._photo();
  }

  /**
   * Clear last photo
   */
  public clearLastPhoto(): void {
    this._photo.set(null);
  }

  /**
   * Switch camera (front/back)
   */
  public async switchCamera(): Promise<void> {
    try {
      if (!this.cameraStateData.isStreaming) {
        throw new Error('Camera not streaming');
      }

      await this.stopCamera();

      // Toggle facing mode
      const currentFacingMode = this.cameraStateData.settings.resolution.width > this.cameraStateData.settings.resolution.height ? 'user' : 'environment';
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      // Update constraints
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: this.cameraStateData.settings.resolution.width },
          height: { ideal: this.cameraStateData.settings.resolution.height },
          facingMode: newFacingMode,
          frameRate: { ideal: 30 }
        }
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.videoElement) {
        this.videoElement.srcObject = this.mediaStream;
        await this.videoElement.play();
      }

      this.updateCameraState();
    } catch (error) {
      this.cameraStateData.error = {
        code: 'SWITCH_FAILED',
        message: 'Failed to switch camera',
        details: error
      };
      this.updateCameraState();
      throw error;
    }
  }

  /**
   * Enable/disable flash
   */
  public async setFlashMode(mode: 'auto' | 'on' | 'off'): Promise<void> {
    this.cameraStateData.settings.flashMode = mode;
    this.updateCameraState();

    // In a real implementation, this would control the actual camera flash
    // For now, we just update the settings
  }

  /**
   * Set zoom level
   */
  public async setZoom(zoom: number): Promise<void> {
    const clampedZoom = Math.max(1, Math.min(10, zoom));
    this.cameraStateData.settings.zoom = clampedZoom;
    this.updateCameraState();

    // In a real implementation, this would control the actual camera zoom
    // For now, we just update the settings
  }

  /**
   * Set focus mode
   */
  public async setFocusMode(mode: 'auto' | 'manual' | 'continuous'): Promise<void> {
    this.cameraStateData.settings.focusMode = mode;
    this.updateCameraState();

    // In a real implementation, this would control the actual camera focus
    // For now, we just update the settings
  }

  /**
   * Update camera state
   */
  private updateCameraState(): void {
    this._cameraState.set({ ...this.cameraStateData });
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    try {
      await this.stopCamera();
      this.mediaStream = null;
      this.videoElement = null;
      this.canvasElement = null;
      this.cameraStateData.isInitialized = false;
      this.updateCameraState();
    } catch (error) {
      console.error('Failed to cleanup camera:', error);
    }
  }
}

