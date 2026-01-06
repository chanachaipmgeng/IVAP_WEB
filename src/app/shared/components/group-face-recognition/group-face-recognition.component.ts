/**
 * Group Face Recognition Component
 *
 * A component for group face recognition using camera stream.
 * Supports multiple face detection, recognition, and quality assessment.
 *
 * @example
 * ```html
 * <app-group-face-recognition
 *   [autoDetect]="true"
 *   [maxFaces]="10"
 *   [ariaLabel]="'Group face recognition'"
 *   (facesRecognized)="onFacesRecognized($event)">
 * </app-group-face-recognition>
 * ```
 */

import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaceDetectionService, FaceDetectionResult, FaceRecognitionResult } from '../../../core/services/face-detection.service';
import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { GlassCardComponent } from '../glass-card/glass-card.component';
import { assessImageQuality, ImageQualityAssessment, isImageQualitySufficientForGroup } from '../../../core/utils/image-quality.utils';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

import { ImageOptimizationDirective } from '../../directives/image-optimization.directive';

/**
 * Group recognition result interface
 */
export interface GroupRecognitionResult {
  memberId: string;
  firstName: string;
  lastName: string;
  confidence: number;
  location: { top: number; right: number; bottom: number; left: number };
  timestamp: Date;
  snapshot?: string;
  age?: number;
  gender?: string;
  expressions?: Record<string, unknown>;
}

@Component({
  selector: 'app-group-face-recognition',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    GlassButtonComponent,
    GlassCardComponent,
    ImageOptimizationDirective
  ],
  templateUrl: './group-face-recognition.component.html',
  styleUrls: ['./group-face-recognition.component.scss']
})
export class GroupFaceRecognitionComponent extends BaseComponent implements OnInit {
  /**
   * Video element reference
   */
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  /**
   * Canvas element reference
   */
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  /**
   * Auto detect faces
   */
  @Input() autoDetect: boolean = true;

  /**
   * Detection interval in milliseconds
   */
  @Input() detectionInterval: number = 1000;

  /**
   * Enable quality check
   */
  @Input() enableQualityCheck: boolean = true;

  /**
   * Show face landmarks
   */
  @Input() showLandmarks: boolean = true;

  /**
   * Maximum number of faces
   */
  @Input() maxFaces: number = 10;

  /**
   * Minimum confidence threshold
   */
  @Input() minConfidence: number = 0.6;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Faces recognized event
   */
  @Output() facesRecognized = new EventEmitter<GroupRecognitionResult[]>();

  /**
   * Quality changed event
   */
  @Output() qualityChanged = new EventEmitter<ImageQualityAssessment>();

  /**
   * Initialization state
   */
  isInitialized = false;

  /**
   * Streaming state
   */
  isStreaming = false;

  /**
   * Detecting state
   */
  isDetecting = false;

  /**
   * Current face detections
   */
  currentDetections: FaceDetectionResult[] = [];

  /**
   * Current face recognitions
   */
  currentRecognitions: GroupRecognitionResult[] = [];

  /**
   * Recognized faces
   */
  recognizedFaces: GroupRecognitionResult[] = [];

  /**
   * Image quality assessment
   */
  imageQuality: ImageQualityAssessment | null = null;

  /**
   * Show quality feedback
   */
  showQualityFeedback = false;

  /**
   * Quality feedback message
   */
  qualityFeedbackMessage = '';

  /**
   * Quality recommendations
   */
  qualityRecommendations: string[] = [];

  /**
   * Detection timer
   */
  private detectionTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Last save timestamp
   */
  private lastSaveAt = 0;

  /**
   * Saving state
   */
  private isSaving = false;

  constructor(
    private faceDetectionService: FaceDetectionService,
    public i18n: I18nService
  ) {
    super();
  }

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.initializeService();
    this.subscribeToService();
  }

  /**
   * Translate key
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }

  /**
   * Cleanup on destroy
   */
  override ngOnDestroy(): void {
    this.stopDetection();
    this.stopCamera();
    super.ngOnDestroy();
  }

  /**
   * Initialize face detection service
   */
  private async initializeService(): Promise<void> {
    try {
      // Wait for models to load
      while (!this.faceDetectionService.isReady()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize face detection service:', error);
    }
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToService(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const detections = this.faceDetectionService.detections();
      this.currentDetections = detections;
      this.updateRecognitions();
    });

    effect(() => {
      const recognitions = this.faceDetectionService.recognitions();
      this.updateGroupRecognitions(recognitions);
    });
  }

  /**
   * Start camera stream
   */
  async startCamera(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = stream;
        this.videoElement.nativeElement.play();
        this.isStreaming = true;

        if (this.autoDetect) {
          this.startDetection();
        }
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง');
    }
  }

  /**
   * Stop camera stream
   */
  stopCamera(): void {
    if (this.videoElement && this.videoElement.nativeElement.srcObject) {
      const stream = this.videoElement.nativeElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      this.videoElement.nativeElement.srcObject = null;
    }
    this.isStreaming = false;
    this.stopDetection();
  }

  /**
   * Start automatic face detection
   */
  startDetection(): void {
    if (this.detectionTimer) {
      clearInterval(this.detectionTimer);
    }

    this.detectionTimer = setInterval(async () => {
      if (this.isStreaming && this.videoElement) {
        await this.detectFaces();
      }
    }, this.detectionInterval);
  }

  /**
   * Stop automatic face detection
   */
  stopDetection(): void {
    if (this.detectionTimer) {
      clearInterval(this.detectionTimer);
      this.detectionTimer = null;
    }
  }

  /**
   * Detect faces in current frame
   */
  async detectFaces(): Promise<void> {
    if (!this.isInitialized || this.isDetecting) return;

    try {
      this.isDetecting = true;
      const element = this.videoElement?.nativeElement;

      if (!element) return;

      // Assess image quality first
      if (this.enableQualityCheck) {
        this.assessCurrentImageQuality(element);
      }

      const detections = await this.faceDetectionService.detectFaces(element);

      if (detections.length > 0) {
        // Capture snapshots
        this.captureFaceSnapshots(detections, element);

        await this.faceDetectionService.recognizeFaces(detections);
      }

      // Draw detections on canvas
      this.drawDetections(detections);

      // Auto-save recognized faces every 10 seconds
      const now = Date.now();
      if (!this.isSaving && this.recognizedFaces.length > 0 && (now - this.lastSaveAt) > 10000) {
        this.isSaving = true;
        await this.saveRecognizedFaces();
        this.lastSaveAt = Date.now();
        this.isSaving = false;
      }
    } catch (error) {
      console.error('Face detection failed:', error);
    } finally {
      this.isDetecting = false;
    }
  }

  /**
   * Capture face snapshots from video/canvas
   */
  private captureFaceSnapshots(detections: FaceDetectionResult[], element: HTMLVideoElement | HTMLCanvasElement): void {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw the current frame to an off-screen canvas to extract crops
      // Use original element dimensions
      const width = element instanceof HTMLVideoElement ? element.videoWidth : element.width;
      const height = element instanceof HTMLVideoElement ? element.videoHeight : element.height;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(element, 0, 0, width, height);

      detections.forEach(detection => {
        const { x, y, width: boxWidth, height: boxHeight } = detection.boundingBox;

        // Add some padding to the crop
        const padding = 20;
        const cropX = Math.max(0, x - padding);
        const cropY = Math.max(0, y - padding);
        const cropWidth = Math.min(width - cropX, boxWidth + (padding * 2));
        const cropHeight = Math.min(height - cropY, boxHeight + (padding * 2));

        if (cropWidth > 0 && cropHeight > 0) {
          const faceCanvas = document.createElement('canvas');
          faceCanvas.width = cropWidth;
          faceCanvas.height = cropHeight;
          const faceCtx = faceCanvas.getContext('2d');

          if (faceCtx) {
            faceCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
            detection.snapshot = faceCanvas.toDataURL('image/jpeg', 0.8);
          }
        }
      });
    } catch (error) {
      console.error('Failed to capture face snapshot:', error);
    }
  }

  /**
   * Update group recognitions from service results
   */
  private updateGroupRecognitions(recognitions: FaceRecognitionResult[]): void {
    this.currentRecognitions = recognitions.map((recognition, index) => {
      const detection = this.currentDetections[index];
      return {
        memberId: recognition.id || `face_${index}`,
        firstName: recognition.name?.split(' ')[0] || 'Unknown',
        lastName: recognition.name?.split(' ').slice(1).join(' ') || '',
        confidence: recognition.confidence,
        location: {
          top: detection.boundingBox.y,
          right: detection.boundingBox.x + detection.boundingBox.width,
          bottom: detection.boundingBox.y + detection.boundingBox.height,
          left: detection.boundingBox.x
        },
        timestamp: new Date(),
        snapshot: detection.snapshot,
        age: detection.age,
        gender: detection.gender,
        expressions: detection.expressions
      };
    });

    // Update recognized faces list - Filter by minConfidence
    this.recognizedFaces = this.currentRecognitions.filter(r => r.confidence >= this.minConfidence);
    this.facesRecognized.emit(this.recognizedFaces);
  }

  /**
   * Update recognitions based on current detections
   */
  private updateRecognitions(): void {
    // This will be called when detections change
    // The actual recognition will be handled by the service
  }

  /**
   * Draw face detections on canvas
   */
  private drawDetections(detections: FaceDetectionResult[]): void {
    const canvas = this.canvasElement?.nativeElement;
    const video = this.videoElement?.nativeElement;

    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw face detections
    detections.forEach((detection, index) => {
      const { x, y, width, height } = detection.boundingBox;
      const recognition = this.currentRecognitions[index];

      // Draw bounding box
      ctx.strokeStyle = recognition?.confidence > 0.7 ? '#10B981' : '#EF4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw landmarks if enabled
      if (this.showLandmarks && detection.landmarks) {
        this.drawLandmarks(ctx, detection.landmarks);
      }

      // Draw confidence score
      ctx.fillStyle = recognition?.confidence > 0.7 ? '#10B981' : '#EF4444';
      ctx.font = '14px Arial';
      ctx.fillText(
        `${Math.round(detection.confidence * 100)}%`,
        x,
        y - 5
      );

      // Draw recognition info
      if (recognition) {
        ctx.fillText(
          `${recognition.firstName} ${recognition.lastName} (${Math.round(recognition.confidence * 100)}%)`,
          x,
          y + height + 20
        );
      }
    });
  }

  /**
   * Draw face landmarks on canvas
   */
  private drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any): void {
    if (!landmarks) return;

    // face-api.js landmarks structure: landmarks.positions is an array of {x, y}
    const positions = landmarks.positions || landmarks._positions || [];
    if (!positions || positions.length === 0) return;

    // Draw all landmark points
    ctx.fillStyle = '#3B82F6'; // Blue color for landmarks
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 1;

    positions.forEach((point: { x: number; y: number }) => {
      // Draw point
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw connections for face outline (jaw line)
    if (positions.length >= 17) {
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 17; i++) {
        const point = positions[i];
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
    }

    // Draw right eyebrow (points 17-21)
    if (positions.length >= 22) {
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 17; i <= 21; i++) {
        const point = positions[i];
        if (i === 17) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
    }

    // Draw left eyebrow (points 22-26)
    if (positions.length >= 27) {
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 22; i <= 26; i++) {
        const point = positions[i];
        if (i === 22) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
    }

    // Draw nose (points 27-35)
    if (positions.length >= 36) {
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 27; i <= 35; i++) {
        const point = positions[i];
        if (i === 27) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
    }

    // Draw right eye (points 36-41)
    if (positions.length >= 42) {
      ctx.strokeStyle = '#10B981'; // Green for eyes
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 36; i <= 41; i++) {
        const point = positions[i];
        if (i === 36) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw left eye (points 42-47)
    if (positions.length >= 48) {
      ctx.strokeStyle = '#10B981'; // Green for eyes
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 42; i <= 47; i++) {
        const point = positions[i];
        if (i === 42) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw mouth outer (points 48-59)
    if (positions.length >= 60) {
      ctx.strokeStyle = '#F59E0B'; // Orange for mouth
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 48; i <= 59; i++) {
        const point = positions[i];
        if (i === 48) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw mouth inner (points 60-67)
    if (positions.length >= 68) {
      ctx.strokeStyle = '#F59E0B'; // Orange for mouth
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 60; i <= 67; i++) {
        const point = positions[i];
        if (i === 60) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  /**
   * Assess image quality of current frame
   */
  private assessCurrentImageQuality(element: HTMLVideoElement): void {
    try {
      const canvas = this.canvasElement?.nativeElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
      ctx.drawImage(element, 0, 0, canvas.width, canvas.height);

      // Get image data for quality assessment
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.imageQuality = assessImageQuality(imageData);

      // Update feedback
      this.qualityFeedbackMessage = this.imageQuality.feedback;
      this.qualityRecommendations = this.imageQuality.recommendations;
      this.showQualityFeedback = this.imageQuality.quality === 'poor' || this.imageQuality.quality === 'fair';

      // Emit quality change
      this.qualityChanged.emit(this.imageQuality);
    } catch (error) {
      console.error('Image quality assessment failed:', error);
    }
  }

  /**
   * Save recognized faces
   */
  private async saveRecognizedFaces(): Promise<void> {
    try {
      // Saving recognized faces
      // Here you would typically send the data to your backend
      // For now, we'll just emit the event
      this.facesRecognized.emit(this.recognizedFaces);
    } catch (error) {
      console.error('Failed to save recognized faces:', error);
    }
  }

  /**
   * Check if current image quality is sufficient for group recognition
   */
  isQualitySufficient(): boolean {
    return this.imageQuality ? isImageQualitySufficientForGroup({
      data: new Uint8ClampedArray(),
      width: 0,
      height: 0,
      colorSpace: 'srgb'
    } as ImageData) : false;
  }

  /**
   * Get quality status class for UI
   */
  getQualityStatusClass(): string {
    if (!this.imageQuality) return 'quality-unknown';

    switch (this.imageQuality.quality) {
      case 'excellent': return 'quality-excellent';
      case 'good': return 'quality-good';
      case 'fair': return 'quality-fair';
      case 'poor': return 'quality-poor';
      default: return 'quality-unknown';
    }
  }

  /**
   * Get quality status text for UI
   */
  getQualityStatusText(): string {
    if (!this.imageQuality) return 'กำลังตรวจสอบ...';

    switch (this.imageQuality.quality) {
      case 'excellent': return 'คุณภาพดีเยี่ยม';
      case 'good': return 'คุณภาพดี';
      case 'fair': return 'คุณภาพปานกลาง';
      case 'poor': return 'คุณภาพต่ำ';
      default: return 'ไม่ทราบ';
    }
  }

  /**
   * Toggle detection mode
   */
  toggleDetection(): void {
    if (this.autoDetect) {
      this.stopDetection();
    } else {
      this.startDetection();
    }
    this.autoDetect = !this.autoDetect;
  }

  /**
   * Clear all recognized faces
   */
  clearRecognizedFaces(): void {
    this.recognizedFaces = [];
    this.currentRecognitions = [];
    this.facesRecognized.emit([]);
  }

  /**
   * Export recognized faces data
   */
  exportRecognizedFaces(): void {
    const data = JSON.stringify(this.recognizedFaces, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `group-recognition-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
