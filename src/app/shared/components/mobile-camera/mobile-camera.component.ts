/**
 * Mobile Camera Component
 *
 * A mobile camera component for capturing photos using device camera.
 * Supports flash, zoom, timer, HDR, grid, and camera switching.
 *
 * @example
 * ```html
 * <app-mobile-camera
 *   [autoStart]="true"
 *   [showSettings]="true"
 *   [ariaLabel]="'Camera'"
 *   (photoCaptured)="onPhotoCaptured($event)">
 * </app-mobile-camera>
 * ```
 */

import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MobileCameraService, PhotoResult, CameraSettings } from '../../../core/services/mobile-camera.service';
import { NativeBridgeService } from '../../../core/services/native-bridge.service';
import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { GlassCardComponent } from '../glass-card/glass-card.component';
import { BaseComponent } from '../../../core/base/base.component';

import { ImageOptimizationDirective } from '../../directives/image-optimization.directive';

@Component({
  selector: 'app-mobile-camera',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    GlassButtonComponent,
    GlassCardComponent,
    ImageOptimizationDirective
  ],
  templateUrl: './mobile-camera.component.html',
  styleUrls: ['./mobile-camera.component.scss']
})
export class MobileCameraComponent extends BaseComponent implements OnInit {
  /**
   * Video element reference
   */
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  /**
   * Canvas element reference
   */
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  /**
   * Show settings panel
   */
  @Input() showSettings: boolean = true;

  /**
   * Show preview panel
   */
  @Input() showPreview: boolean = true;

  /**
   * Auto start camera
   */
  @Input() autoStart: boolean = false;

  /**
   * Enable flash
   */
  @Input() enableFlash: boolean = true;

  /**
   * Enable zoom
   */
  @Input() enableZoom: boolean = true;

  /**
   * Enable timer
   */
  @Input() enableTimer: boolean = true;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Photo captured event
   */
  @Output() photoCaptured = new EventEmitter<PhotoResult>();

  /**
   * Camera ready event
   */
  @Output() cameraReady = new EventEmitter<boolean>();

  /**
   * Error event
   */
  @Output() error = new EventEmitter<string>();

  // Component state
  isInitialized = false;
  isStreaming = false;
  isCapturing = false;
  hasPermission = false;
  lastPhoto: PhotoResult | null = null;
  cameraSettings: CameraSettings;
  showSettingsPanel = false;
  showPreviewPanel = false;
  countdown = 0;
  countdownInterval: any = null;

  // UI state
  flashMode: 'auto' | 'on' | 'off' = 'auto';
  zoomLevel = 1;
  timerDelay = 0;
  enableHDR = false;
  enableGrid = false;

  constructor(
    private mobileCamera: MobileCameraService,
    private nativeBridge: NativeBridgeService
  ) {
    super();
    this.cameraSettings = this.mobileCamera.getSettings();
  }

  ngOnInit(): void {
    this.subscribeToServices();
    if (this.autoStart) {
      this.initializeCamera();
    }
  }

  override ngOnDestroy(): void {
    this.cleanup();
    super.ngOnDestroy();
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToServices(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const state = this.mobileCamera.cameraState();
      this.isInitialized = state.isInitialized;
      this.isStreaming = state.isStreaming;
      this.isCapturing = state.isCapturing;
      this.hasPermission = state.hasPermission;

      if (state.error) {
        this.error.emit(state.error.message);
      }
    });

    effect(() => {
      const photo = this.mobileCamera.photo();
      if (photo) {
        this.lastPhoto = photo;
        this.photoCaptured.emit(photo);
      }
    });
  }

  /**
   * Initialize camera
   */
  async initializeCamera(): Promise<void> {
    try {
      if (!this.videoElement || !this.canvasElement) {
        throw new Error('Video or canvas element not available');
      }

      await this.mobileCamera.initializeCamera(
        this.videoElement.nativeElement,
        this.canvasElement.nativeElement
      );

      this.cameraReady.emit(true);
    } catch (error) {
      this.error.emit((error as Error).message);
      this.cameraReady.emit(false);
    }
  }

  /**
   * Start camera
   */
  async startCamera(): Promise<void> {
    try {
      await this.mobileCamera.startCamera();
    } catch (error) {
      this.error.emit((error as Error).message);
    }
  }

  /**
   * Stop camera
   */
  async stopCamera(): Promise<void> {
    try {
      await this.mobileCamera.stopCamera();
    } catch (error) {
      this.error.emit((error as Error).message);
    }
  }

  /**
   * Capture photo
   */
  async capturePhoto(): Promise<void> {
    try {
      if (this.timerDelay > 0) {
        await this.startCountdown();
      } else {
        await this.takePhoto();
      }
    } catch (error) {
      this.error.emit((error as Error).message);
    }
  }

  /**
   * Start countdown timer
   */
  private async startCountdown(): Promise<void> {
    this.countdown = this.timerDelay;
    this.isCapturing = true;

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.takePhoto();
      }
    }, 1000);
  }

  /**
   * Take photo
   */
  private async takePhoto(): Promise<void> {
    try {
      await this.mobileCamera.capturePhoto();
      this.isCapturing = false;
    } catch (error) {
      this.isCapturing = false;
      this.error.emit((error as Error).message);
    }
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera(): Promise<void> {
    try {
      await this.mobileCamera.switchCamera();
    } catch (error) {
      this.error.emit((error as Error).message);
    }
  }

  /**
   * Toggle flash
   */
  async toggleFlash(): Promise<void> {
    const modes: ('auto' | 'on' | 'off')[] = ['auto', 'on', 'off'];
    const currentIndex = modes.indexOf(this.flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.flashMode = modes[nextIndex];

    await this.mobileCamera.setFlashMode(this.flashMode);
  }

  /**
   * Set zoom level
   */
  async setZoom(zoom: number): Promise<void> {
    this.zoomLevel = Math.max(1, Math.min(10, zoom));
    await this.mobileCamera.setZoom(this.zoomLevel);
  }

  /**
   * Set focus mode
   */
  async setFocusMode(mode: 'auto' | 'manual' | 'continuous'): Promise<void> {
    await this.mobileCamera.setFocusMode(mode);
  }

  /**
   * Toggle HDR
   */
  toggleHDR(): void {
    this.enableHDR = !this.enableHDR;
    this.updateSettings();
  }

  /**
   * Toggle grid
   */
  toggleGrid(): void {
    this.enableGrid = !this.enableGrid;
    this.updateSettings();
  }

  /**
   * Update camera settings
   */
  private updateSettings(): void {
    this.mobileCamera.updateSettings({
      enableHDR: this.enableHDR,
      enableGrid: this.enableGrid,
      flashMode: this.flashMode,
      zoom: this.zoomLevel,
      timerDelay: this.timerDelay
    });
  }

  /**
   * Toggle settings panel
   */
  toggleSettings(): void {
    this.showSettingsPanel = !this.showSettingsPanel;
  }

  /**
   * Toggle preview panel
   */
  togglePreview(): void {
    this.showPreviewPanel = !this.showPreviewPanel;
  }

  /**
   * Retake photo
   */
  retakePhoto(): void {
    this.lastPhoto = null;
    this.showPreviewPanel = false;
  }

  /**
   * Use photo
   */
  usePhoto(): void {
    if (this.lastPhoto) {
      this.photoCaptured.emit(this.lastPhoto);
    }
  }

  /**
   * Get flash icon
   */
  getFlashIcon(): string {
    switch (this.flashMode) {
      case 'auto':
        return 'fas fa-bolt';
      case 'on':
        return 'fas fa-bolt';
      case 'off':
        return 'fas fa-bolt-slash';
      default:
        return 'fas fa-bolt';
    }
  }

  /**
   * Get flash label
   */
  getFlashLabel(): string {
    switch (this.flashMode) {
      case 'auto':
        return 'Auto';
      case 'on':
        return 'On';
      case 'off':
        return 'Off';
      default:
        return 'Auto';
    }
  }

  /**
   * Get timer label
   */
  getTimerLabel(): string {
    return this.timerDelay > 0 ? `${this.timerDelay}s` : 'Off';
  }

  /**
   * Get zoom label
   */
  getZoomLabel(): string {
    return `${this.zoomLevel}x`;
  }

  /**
   * Check if camera is available
   */
  isCameraAvailable(): boolean {
    return this.mobileCamera.isCameraAvailable();
  }

  /**
   * Check if native app
   */
  isNative(): boolean {
    return this.nativeBridge.isNative();
  }

  /**
   * Get device info
   */
  getDeviceInfo(): string {
    const info = this.nativeBridge.getDeviceInfo();
    return info ? `${info.manufacturer} ${info.model}` : 'Web Browser';
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    await this.mobileCamera.cleanup();
  }
}

