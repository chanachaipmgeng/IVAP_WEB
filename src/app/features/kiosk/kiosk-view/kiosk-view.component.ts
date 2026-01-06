/**
 * Kiosk View Component
 *
 * Kiosk interface component for face recognition verification and event check-in.
 * Supports device management, face recognition, multi-person mode, and event check-in functionality.
 *
 * @example
 * ```html
 * <app-kiosk-view></app-kiosk-view>
 * ```
 */

import { Component, OnInit, signal, computed, ViewChild, ElementRef, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { ApiService } from '../../../core/services/api.service';
import { KioskService } from '../../../core/services/kiosk.service';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService } from '../../../core/services/i18n.service';
import { FaceDetectionService, FaceDetectionResult } from '../../../core/services/face-detection.service';
import { KioskState, KioskDevice, VerificationResult } from '../../../core/models/kiosk.model';
import { ImageQualityAssessment } from '../../../core/utils/image-quality.utils';
import { FaceRecognitionComponent } from '../../../shared/components/face-recognition/face-recognition.component';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-kiosk-view',
  standalone: true,
  imports: [
    CommonModule,
    GlassCardComponent,
    FaceRecognitionComponent
  ],
  templateUrl: './kiosk-view.component.html',
  styleUrl: './kiosk-view.component.scss'
})
export class KioskViewComponent extends BaseComponent implements OnInit {
  @ViewChild(FaceRecognitionComponent) faceRecognitionComponent!: FaceRecognitionComponent;

  deviceId: string = '';
  state = signal<KioskState>('idle');
  result = signal<VerificationResult | null>(null);
  qualityFeedback = signal<string>('');
  qualityScore = signal<number>(0);
  device = signal<KioskDevice | null>(null);
  
  // Multi-person mode
  multiPersonMode = signal<boolean>(false);
  multiPersonResults = signal<any[]>([]);
  
  // Event check-in mode
  isEventMode = computed(() => {
    const device = this.device();
    return device?.active_event_id ? true : false;
  });
  currentEvent = signal<any>(null);
  currentTheme = signal('light');
  currentLang = signal('en');

  private autoVerifyInterval: any = null;
  private heartbeatInterval: any = null;
  private offlineCheckIns = signal<any[]>([]);
  private isOnline = signal(true);
  
  // Face detection state from component
  currentDetections = signal<FaceDetectionResult[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private kioskService: KioskService,
    public theme: ThemeService,
    public i18n: I18nService,
    private faceDetectionService: FaceDetectionService,
    private cdr: ChangeDetectorRef
  ) {
    super();
    // Watch theme changes
    effect(() => {
      const isDark = this.theme.isDark();
      this.currentTheme.set(isDark ? 'dark' : 'light');
      this.cdr.detectChanges();
    });

    // Watch language changes
    effect(() => {
      const lang = this.i18n.currentLanguage();
      this.currentLang.set(lang);
    });
  }

  ngOnInit(): void {
    this.deviceId = this.route.snapshot.paramMap.get('deviceId') || '';
    this.loadDeviceConfig();
    this.startAutoVerify();
    this.startHeartbeat();
    this.setupOfflineMode();
    this.loadOfflineCheckIns();
  }
  
  loadDeviceConfig(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.kioskService.loadDeviceConfig(this.deviceId),
      (device) => {
        this.device.set(device);
        this.kioskService.setDevice(device);
        
        // If device has active event, load event details
        if (device?.active_event_id) {
          this.loadEventDetails(device.active_event_id);
        }
      },
      (error) => {
        console.error('Error loading device config:', error);
      }
    );
  }

  loadEventDetails(eventId: string): void {
    // Load event details for display
    this.subscribe(
      this.api.get(`/events/${eventId}`),
      (response: any) => {
        this.currentEvent.set(response.data || response);
      },
      (error) => {
        console.error('Error loading event details:', error);
      }
    );
  }

  sendHeartbeat(): void {
    const deviceId = this.deviceId;
    this.subscribe(
      this.kioskService.sendHeartbeat(deviceId, {
        status: 'online',
        timestamp: new Date().toISOString()
      }),
      (response) => {
        // Heartbeat sent successfully
      },
      (error) => {
        console.error('Error sending heartbeat:', error);
      }
    );
  }

  override ngOnDestroy(): void {
    if (this.autoVerifyInterval) {
      clearInterval(this.autoVerifyInterval);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    super.ngOnDestroy();
  }

  startHeartbeat(): void {
    // Send heartbeat immediately
    this.sendHeartbeat();

    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000);
  }

  startAutoVerify(): void {
    // Auto-verify every 3 seconds when idle
    this.autoVerifyInterval = setInterval(() => {
      if (this.state() === 'idle') {
        this.captureAndVerify();
      }
    }, 3000);
  }

  /**
   * Handle face detected event from component
   */
  onFaceDetected(detections: FaceDetectionResult[]): void {
    this.currentDetections.set(detections);
  }

  /**
   * Handle quality changed event from component
   */
  onQualityChanged(quality: ImageQualityAssessment): void {
    this.qualityFeedback.set(quality.feedback);
    
    // Convert quality string to score for UI compatibility
    let score = 0;
    switch (quality.quality) {
      case 'excellent': score = 100; break;
      case 'good': score = 80; break;
      case 'fair': score = 60; break;
      case 'poor': score = 40; break;
    }
    this.qualityScore.set(score);
  }

  private calculateQualityScore(metrics: any): number {
    // Legacy support if needed, but we prefer using onQualityChanged
    let score = 100;
    if (metrics.brightness < 50 || metrics.brightness > 200) score -= 30;
    else if (metrics.brightness < 80 || metrics.brightness > 180) score -= 15;
    if (metrics.blurriness < 50) score -= 25;
    else if (metrics.blurriness < 100) score -= 10;
    if (metrics.contrast < 30) score -= 15;
    if (metrics.sharpness < 20) score -= 10;
    return Math.max(0, score);
  }

  async captureAndVerify(): Promise<void> {
    if (this.state() !== 'idle') return;
    
    // Only verify if we have detections
    if (this.currentDetections().length === 0) return;

    try {
      if (!this.faceRecognitionComponent || !this.faceRecognitionComponent.videoElement) {
        console.warn('Face recognition component not ready');
        return;
      }

      const video = this.faceRecognitionComponent.videoElement.nativeElement;
      
      // Basic quality check - if quality is poor, don't verify
      if (this.qualityScore() < 50) {
        return;
      }

      this.state.set('scanning');

      // Detect age and gender if in event mode
      let gender: string | null = null;
      let ageRange: string | null = null;
      
      const detections = this.currentDetections();
      if (this.isEventMode() && detections.length > 0) {
        const primaryFace = detections[0];
        if (primaryFace.age) {
          ageRange = this.formatAgeRange(primaryFace.age);
        }
        if (primaryFace.gender) {
          gender = primaryFace.gender.toLowerCase();
        }
      }

      // Create a canvas to capture the image
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }
      
      ctx.drawImage(video, 0, 0);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95);
      });

      // Create file
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });

      // Send to API for verification with age and gender
      if (this.multiPersonMode() && this.isEventMode()) {
        await this.verifyManyFaces(file);
      } else {
        await this.verifyFace(file, gender, ageRange);
      }

    } catch (error) {
      console.error('Error capturing image:', error);
        this.state.set('error');
        this.result.set({
          success: false,
          message: this.i18n.t('kiosk.captureFailed'),
          timestamp: new Date().toISOString(),
          quality_score: 0,
          details: this.i18n.t('kiosk.unableToCapture')
        });
      this.resetAfterDelay();
    }
  }

  /**
   * Format age to age range (10s, 20s, 30s, etc.)
   */
  formatAgeRange(age: number): string {
    if (age < 10) return '10s';
    if (age < 20) return '10s';
    if (age < 30) return '20s';
    if (age < 40) return '30s';
    if (age < 50) return '40s';
    if (age < 60) return '50s';
    if (age < 70) return '60s';
    if (age < 80) return '70s';
    return '80+';
  }

  async verifyFace(imageFile: File, gender: string | null = null, ageRange: string | null = null): Promise<void> {
    try {
      const device = this.device();
      let response: any;

      // Check if device is in event mode
      if (this.isEventMode() && device?.api_key) {
        // Use event check-in API with gender and age_range
        // Use upload method with additional data
        const additionalData: any = { api_key: device.api_key };
        if (gender) {
          additionalData.gender = gender;
        }
        if (ageRange) {
          additionalData.age_range = ageRange;
        }
        
        response = await this.api.upload<any>(
          `/events/kiosk/check-in`,
          imageFile,
          additionalData
        ).toPromise();
      } else {
        // Use normal face check API
        response = await this.api.upload<any>(
          `/face/members/check-face-emp`,
          imageFile,
          { device_id: this.deviceId }
        ).toPromise();
      }

      if (response.success || response.recognized || response.message?.includes('Check-in successful') || response.message?.includes('Check-out successful')) {
        this.state.set('success');
        this.result.set({
          success: true,
          message: response.message || (this.isEventMode() ? this.i18n.t('kiosk.eventCheckInSuccessful') : this.i18n.t('kiosk.accessGranted')),
          employee: response.employee || response.member || {
            firstName: response.first_name || '',
            lastName: response.last_name || ''
          },
          timestamp: new Date().toISOString(),
          quality_score: this.qualityScore(),
          checkInTime: response.check_in_time,
          checkOutTime: response.check_out_time,
          durationMinutes: response.duration_minutes,
          gender: response.gender,
          ageRange: response.age_range
        });

        // If offline, save to local storage
        if (!this.isOnline()) {
          this.saveOfflineCheckIn({
            success: true,
            employee: response.employee || response.member,
            message: response.message,
            isEventCheckIn: this.isEventMode(),
            gender: response.gender,
            ageRange: response.age_range
          });
        }
      } else {
        this.state.set('error');
        this.result.set({
          success: false,
          message: this.isEventMode() ? this.i18n.t('kiosk.eventCheckInFailed') : this.i18n.t('kiosk.notRecognized'),
          timestamp: new Date().toISOString(),
          quality_score: this.qualityScore(),
          details: response.message || (this.isEventMode() 
            ? this.i18n.t('kiosk.notRegisteredForEvent')
            : this.i18n.t('kiosk.faceNotFound'))
        });
      }

      this.resetAfterDelay();

    } catch (error: any) {
      this.state.set('error');
      this.result.set({
        success: false,
        message: this.isEventMode() ? this.i18n.t('kiosk.eventCheckInFailed') : this.i18n.t('kiosk.verificationFailed'),
        timestamp: new Date().toISOString(),
        quality_score: this.qualityScore(),
        details: error.message || (this.isEventMode()
          ? this.i18n.t('kiosk.unableToCheckIn')
          : this.i18n.t('kiosk.unableToVerify'))
      });

      // If offline, save failed check-in
      if (!this.isOnline()) {
        this.saveOfflineCheckIn({
          success: false,
          error: error.message,
          isEventCheckIn: this.isEventMode()
        });
      }

      this.resetAfterDelay();
    }
  }

  async verifyManyFaces(imageFile: File): Promise<void> {
    try {
      const device = this.device();
      
      if (!this.isEventMode() || !device?.api_key) {
        this.state.set('error');
        this.result.set({
          success: false,
          message: 'Multi-person mode is only available for event check-in',
          timestamp: new Date().toISOString(),
          quality_score: 0
        });
        this.resetAfterDelay();
        return;
      }

      // Use event check-in many API
      const additionalData: any = { api_key: device.api_key };
      
      const response = await this.api.upload<any>(
        `/events/kiosk/check-in-many`,
        imageFile,
        additionalData
      ).toPromise();

      if (response.results && response.results.length > 0) {
        const successful = response.results.filter((r: any) => r.success);
        const failed = response.results.filter((r: any) => !r.success);
        
        this.state.set('success');
        this.multiPersonResults.set(response.results);
        
        this.result.set({
          success: true,
          message: `พบ ${response.total_recognized} คน, Check-in สำเร็จ ${successful.length} คน`,
          timestamp: new Date().toISOString(),
          quality_score: this.qualityScore()
        });

        // If offline, save to local storage
        if (!this.isOnline()) {
          this.saveOfflineCheckIn({
            success: true,
            results: response.results,
            message: response.message,
            isEventCheckIn: true,
            isMultiPerson: true
          });
        }
      } else {
        this.state.set('error');
        this.result.set({
          success: false,
          message: 'ไม่พบใบหน้าที่จดจำได้',
          timestamp: new Date().toISOString(),
          quality_score: this.qualityScore(),
          details: 'กรุณาตรวจสอบว่าทุกคนได้ลงทะเบียนสำหรับ event นี้แล้ว'
        });
      }

      this.resetAfterDelay();

    } catch (error: any) {
      this.state.set('error');
      this.result.set({
        success: false,
        message: 'การตรวจสอบหลายคนล้มเหลว',
        timestamp: new Date().toISOString(),
        quality_score: this.qualityScore(),
        details: error.message || 'ไม่สามารถตรวจสอบหลายคนได้'
      });

      // If offline, save failed check-in
      if (!this.isOnline()) {
        this.saveOfflineCheckIn({
          success: false,
          error: error.message,
          isEventCheckIn: this.isEventMode(),
          isMultiPerson: true
        });
      }

      this.resetAfterDelay();
    }
  }

  toggleMultiPersonMode(): void {
    this.multiPersonMode.set(!this.multiPersonMode());
    this.multiPersonResults.set([]);
  }

  resetAfterDelay(): void {
    setTimeout(() => {
      this.state.set('idle');
      this.result.set(null);
      if (this.multiPersonMode()) {
        this.multiPersonResults.set([]);
      }
    }, 8000); // Longer delay for multi-person mode to read results
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStateMessage(): string {
    const messages = {
      'idle': this.i18n.t('kiosk.pleasePositionFace'),
      'scanning': this.i18n.t('kiosk.scanning'),
      'success': this.i18n.t('kiosk.verificationSuccessful'),
      'error': this.i18n.t('kiosk.verificationFailed')
    };
    return messages[this.state()];
  }

  formatTime(timestamp: string | undefined): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatDateTime(dateTimeString: string | undefined): string {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  setupOfflineMode(): void {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.syncOfflineCheckIns();
    });

    window.addEventListener('offline', () => {
      this.isOnline.set(false);
    });
  }

  loadOfflineCheckIns(): void {
    const stored = localStorage.getItem(`kiosk_checkins_${this.deviceId}`);
    if (stored) {
      const checkIns = JSON.parse(stored);
      this.offlineCheckIns.set(checkIns);

      if (this.isOnline()) {
        this.syncOfflineCheckIns();
      }
    }
  }

  saveOfflineCheckIn(checkInData: any): void {
    const current = this.offlineCheckIns();
    const newCheckIns = [...current, {
      ...checkInData,
      timestamp: new Date().toISOString(),
      deviceId: this.deviceId
    }];

    this.offlineCheckIns.set(newCheckIns);
    localStorage.setItem(`kiosk_checkins_${this.deviceId}`, JSON.stringify(newCheckIns));
  }

  async syncOfflineCheckIns(): Promise<void> {
    const pending = this.offlineCheckIns();
    if (pending.length === 0) return;

    for (const checkIn of pending) {
      try {
        // Try to sync this check-in
        // This would sync with the backend when online
        // Sync logic would be implemented here
      } catch (error) {
        console.error('Error syncing check-in:', error);
      }
    }

    // Clear synced check-ins
    this.offlineCheckIns.set([]);
    localStorage.removeItem(`kiosk_checkins_${this.deviceId}`);
  }

  toggleTheme(): void {
    this.theme.toggleMode();
    const isDark = this.theme.isDark();
    this.currentTheme.set(isDark ? 'dark' : 'light');
    this.cdr.detectChanges();
  }

  getThemeIcon(): string {
    const mode = this.theme.mode();
    const isDark = this.theme.isDark();
    
    if (mode === 'auto') {
      return isDark ? '🌙' : '☀️';
    }
    return mode === 'dark' ? '🌙' : '☀️';
  }

  getThemeLabel(): string {
    const mode = this.theme.mode();
    return this.i18n.t(`theme.${mode}`);
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
    this.currentLang.set(this.i18n.currentLanguage());
  }

  navigateToLanding(): void {
    this.router.navigate(['/']);
  }
}