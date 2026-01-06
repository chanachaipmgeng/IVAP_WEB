/**
 * Face Recognition Component
 *
 * A component for face detection and recognition using camera or image upload.
 * Supports face enrollment, recognition, expressions, age/gender detection, and landmarks.
 *
 * @example
 * ```html
 * <app-face-recognition
 *   [mode]="'camera'"
 *   [showEnrollment]="true"
 *   [showRecognition]="true"
 *   [ariaLabel]="'Face recognition'"
 *   (faceDetected)="onFaceDetected($event)">
 * </app-face-recognition>
 * ```
 */

import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaceDetectionService, FaceDetectionResult, FaceRecognitionResult, FaceEnrollmentData } from '../../../core/services/face-detection.service';
import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { GlassCardComponent } from '../glass-card/glass-card.component';
import { GlassInputComponent } from '../glass-input/glass-input.component';
import { assessImageQuality, ImageQualityAssessment, isImageQualitySufficient } from '../../../core/utils/image-quality.utils';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

import { ImageOptimizationDirective } from '../../directives/image-optimization.directive';

@Component({
  selector: 'app-face-recognition',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    GlassButtonComponent,
    GlassCardComponent,
    GlassInputComponent,
    ImageOptimizationDirective
  ],
  templateUrl: './face-recognition.component.html',
  styleUrls: ['./face-recognition.component.scss']
})
export class FaceRecognitionComponent extends BaseComponent implements OnInit {
  /**
   * Video element reference
   */
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  /**
   * Canvas element reference
   */
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  /**
   * File input element reference
   */
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  /**
   * Operation mode
   */
  @Input() mode: 'camera' | 'upload' = 'camera';

  /**
   * Show enrollment features
   */
  @Input() showEnrollment: boolean = true;

  /**
   * Show recognition features
   */
  @Input() showRecognition: boolean = true;

  /**
   * Show expressions detection
   */
  @Input() showExpressions: boolean = false;

  /**
   * Show age/gender detection
   */
  @Input() showAgeGender: boolean = false;

  /**
   * Show face landmarks
   */
  @Input() showLandmarks: boolean = true;

  /**
   * Auto detect faces
   */
  @Input() autoDetect: boolean = true;

  /**
   * Detection interval in milliseconds
   */
  @Input() detectionInterval: number = 1000;

  /**
   * Show controls
   */
  @Input() showControls: boolean = true;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Face detected event
   */
  @Output() faceDetected = new EventEmitter<FaceDetectionResult[]>();

  /**
   * Face recognized event
   */
  @Output() faceRecognized = new EventEmitter<FaceRecognitionResult[]>();

  /**
   * Face enrolled event
   */
  @Output() faceEnrolled = new EventEmitter<FaceEnrollmentData>();

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
   * Enrolling state
   */
  isEnrolling = false;

  /**
   * Current face detections
   */
  currentDetections: FaceDetectionResult[] = [];

  /**
   * Current face recognitions
   */
  currentRecognitions: FaceRecognitionResult[] = [];

  /**
   * Enrolled faces
   */
  enrolledFaces: FaceEnrollmentData[] = [];

  /**
   * Selected file
   */
  selectedFile: File | null = null;

  /**
   * Preview image URL
   */
  previewImage: string | null = null;

  /**
   * Enrollment name
   */
  enrollmentName = '';

  /**
   * Enrollment ID
   */
  enrollmentId = '';

  /**
   * Show enrollment form
   */
  showEnrollmentForm = false;

  /**
   * Detection statistics
   */
  detectionStats = {
    totalDetections: 0,
    successfulRecognitions: 0,
    averageConfidence: 0
  };

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

      // Capture snapshots if video/canvas element is available
      const element = this.videoElement?.nativeElement || this.canvasElement?.nativeElement;
      if (element && detections.length > 0) {
        this.captureFaceSnapshots(detections, element);
      }

      this.faceDetected.emit(detections);
      this.updateDetectionStats();
    });

    effect(() => {
      const recognitions = this.faceDetectionService.recognitions();
      this.currentRecognitions = recognitions;
      this.faceRecognized.emit(recognitions);
      this.updateDetectionStats();
    });

    effect(() => {
      const enrollments = this.faceDetectionService.enrollments();
      this.enrolledFaces = enrollments;
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
      const element = this.videoElement?.nativeElement || this.canvasElement?.nativeElement;

      if (!element) return;

      // Assess image quality first
      this.assessCurrentImageQuality(element);

      const detections = await this.faceDetectionService.detectFaces(element);

      if (this.showRecognition && detections.length > 0) {
        await this.faceDetectionService.recognizeFaces(detections);
      }

      // Draw detections on canvas
      this.drawDetections(detections);
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
      ctx.strokeStyle = recognition?.isRecognized ? '#10B981' : '#EF4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw landmarks if enabled
      if (this.showLandmarks && detection.landmarks) {
        this.drawLandmarks(ctx, detection.landmarks);
      }

      // Function to draw text with background
      const drawTextWithBg = (text: string, x: number, y: number, bgColor: string = 'rgba(0, 0, 0, 0.5)') => {
        ctx.font = '14px Arial';
        const textMetrics = ctx.measureText(text);
        const textHeight = 14;
        const padding = 4;

        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y - textHeight - padding, textMetrics.width + (padding * 2), textHeight + (padding * 2));

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, x + padding, y);
      };

      // Draw confidence score
      ctx.fillStyle = recognition?.isRecognized ? '#10B981' : '#EF4444';
      drawTextWithBg(
        `${Math.round(detection.confidence * 100)}%`,
        x,
        y - 5,
        recognition?.isRecognized ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'
      );

      // Draw recognition info
      if (recognition?.isRecognized) {
        drawTextWithBg(
          `${recognition.name}`,
          x,
          y + height + 20,
          'rgba(16, 185, 129, 0.7)'
        );
      }

      // Draw age and gender if available and enabled
      if (this.showAgeGender && detection.age && detection.gender) {
        const genderText = detection.gender === 'male' ? 'ชาย' : 'หญิง';
        const ageText = `${Math.round(detection.age)} ปี`;

        // Find dominant expression
        let exprText = '';
        if (this.showExpressions && detection.expressions) {
          const expressions = detection.expressions;
          const sorted = Object.entries(expressions).sort((a: any, b: any) => b[1] - a[1]);
          if (sorted.length > 0 && (sorted[0][1] as number) > 0.5) {
             const exprMap: {[key: string]: string} = {
               neutral: 'ปกติ',
               happy: 'มีความสุข',
               sad: 'เศร้า',
               angry: 'โกรธ',
               fearful: 'กลัว',
               disgusted: 'รังเกียจ',
               surprised: 'ประหลาดใจ'
             };
             exprText = ` • ${exprMap[sorted[0][0]] || sorted[0][0]}`;
          }
        }

        drawTextWithBg(
          `${genderText}, ${ageText}${exprText}`,
          x,
          y + height + (recognition?.isRecognized ? 45 : 20),
          'rgba(59, 130, 246, 0.7)'
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
    ctx.fillStyle = '#00FF00'; // Bright Green for points
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2; // Thicker lines

    positions.forEach((point: { x: number; y: number }) => {
      // Draw point
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw connections for face outline (jaw line)
    if (positions.length >= 17) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
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
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
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
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.previewImage = URL.createObjectURL(this.selectedFile);
    }
  }

  /**
   * Detect faces in uploaded image
   */
  async detectInImage(): Promise<void> {
    if (!this.selectedFile) return;

    try {
      const img = new Image();
      img.onload = async () => {
        // Set canvas size to match image
        const canvas = this.canvasElement?.nativeElement;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            // Draw image first
            ctx.drawImage(img, 0, 0);

            // Detect faces
            if (!this.isInitialized || this.isDetecting) return;

            try {
              this.isDetecting = true;

              const detections = await this.faceDetectionService.detectFaces(img);

              if (this.showRecognition && detections.length > 0) {
                await this.faceDetectionService.recognizeFaces(detections);
              }

              // Draw detections on canvas (including landmarks)
              this.drawDetectionsOnImage(ctx, detections, img.width, img.height);
            } catch (error) {
              console.error('Face detection failed:', error);
            } finally {
              this.isDetecting = false;
            }
          }
        }
      };
      img.src = this.previewImage!;
    } catch (error) {
      console.error('Image detection failed:', error);
    }
  }

  /**
   * Draw detections on uploaded image
   */
  private drawDetectionsOnImage(ctx: CanvasRenderingContext2D, detections: FaceDetectionResult[], width: number, height: number): void {
    // Draw face detections
    detections.forEach((detection, index) => {
      const { x, y, width: boxWidth, height: boxHeight } = detection.boundingBox;
      const recognition = this.currentRecognitions[index];

      // Draw bounding box
      ctx.strokeStyle = recognition?.isRecognized ? '#10B981' : '#EF4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxWidth, boxHeight);

      // Draw landmarks if enabled
      if (this.showLandmarks && detection.landmarks) {
        this.drawLandmarks(ctx, detection.landmarks);
      }

      // Function to draw text with background
      const drawTextWithBg = (text: string, x: number, y: number, bgColor: string = 'rgba(0, 0, 0, 0.5)') => {
        ctx.font = '14px Arial';
        const textMetrics = ctx.measureText(text);
        const textHeight = 14;
        const padding = 4;

        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y - textHeight - padding, textMetrics.width + (padding * 2), textHeight + (padding * 2));

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, x + padding, y);
      };

      // Draw confidence score
      ctx.fillStyle = recognition?.isRecognized ? '#10B981' : '#EF4444';
      drawTextWithBg(
        `${Math.round(detection.confidence * 100)}%`,
        x,
        y - 5,
        recognition?.isRecognized ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'
      );

      // Draw recognition info
      if (recognition?.isRecognized) {
        drawTextWithBg(
          `${recognition.name}`,
          x,
          y + boxHeight + 20,
          'rgba(16, 185, 129, 0.7)'
        );
      }

      // Draw age and gender if available and enabled
      if (this.showAgeGender && detection.age && detection.gender) {
        const genderText = detection.gender === 'male' ? 'ชาย' : 'หญิง';
        const ageText = `${Math.round(detection.age)} ปี`;

        // Find dominant expression
        let exprText = '';
        if (this.showExpressions && detection.expressions) {
          const expressions = detection.expressions;
          const sorted = Object.entries(expressions).sort((a: any, b: any) => b[1] - a[1]);
          if (sorted.length > 0 && (sorted[0][1] as number) > 0.5) {
             const exprMap: {[key: string]: string} = {
               neutral: 'ปกติ',
               happy: 'มีความสุข',
               sad: 'เศร้า',
               angry: 'โกรธ',
               fearful: 'กลัว',
               disgusted: 'รังเกียจ',
               surprised: 'ประหลาดใจ'
             };
             exprText = ` • ${exprMap[sorted[0][0]] || sorted[0][0]}`;
          }
        }

        drawTextWithBg(
          `${genderText}, ${ageText}${exprText}`,
          x,
          y + boxHeight + (recognition?.isRecognized ? 45 : 20),
          'rgba(59, 130, 246, 0.7)'
        );
      }
    });
  }

  /**
   * Start face enrollment
   */
  startEnrollment(): void {
    this.showEnrollmentForm = true;
    this.enrollmentName = '';
    this.enrollmentId = '';
  }

  /**
   * Cancel enrollment
   */
  cancelEnrollment(): void {
    this.showEnrollmentForm = false;
    this.enrollmentName = '';
    this.enrollmentId = '';
  }

  /**
   * Enroll current face
   */
  async enrollFace(): Promise<void> {
    if (!this.enrollmentName.trim()) {
      alert('กรุณากรอกชื่อ');
      return;
    }

    try {
      this.isEnrolling = true;
      const element = this.videoElement?.nativeElement || this.canvasElement?.nativeElement;

      if (!element) {
        alert('ไม่พบภาพสำหรับการลงทะเบียน');
        return;
      }

      const enrollmentData = await this.faceDetectionService.enrollFace(
        element,
        this.enrollmentName,
        this.enrollmentId || undefined
      );

      this.faceEnrolled.emit(enrollmentData);
      this.showEnrollmentForm = false;
      this.enrollmentName = '';
      this.enrollmentId = '';

      alert(`ลงทะเบียนใบหน้า "${enrollmentData.name}" สำเร็จ`);
    } catch (error) {
      console.error('Face enrollment failed:', error);
      alert('การลงทะเบียนใบหน้าล้มเหลว: ' + (error as Error).message);
    } finally {
      this.isEnrolling = false;
    }
  }

  /**
   * Remove enrolled face
   */
  removeFace(faceId: string): void {
    this.faceDetectionService.removeFace(faceId);
  }

  /**
   * Clear all enrollments
   */
  clearAllFaces(): void {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลใบหน้าทั้งหมด?')) {
      this.faceDetectionService.clearEnrollments();
    }
  }

  /**
   * Export enrollment data
   */
  exportEnrollments(): void {
    const data = this.faceDetectionService.exportEnrollments();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'face-enrollments.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import enrollment data
   */
  onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.faceDetectionService.importEnrollments(e.target?.result as string);
          alert('นำเข้าข้อมูลใบหน้าสำเร็จ');
        } catch (error) {
          alert('การนำเข้าข้อมูลล้มเหลว: ' + (error as Error).message);
        }
      };
      reader.readAsText(file);
    }
  }

  /**
   * Update detection statistics
   */
  private updateDetectionStats(): void {
    this.detectionStats.totalDetections = this.currentDetections.length;
    this.detectionStats.successfulRecognitions = this.currentRecognitions.filter(r => r.isRecognized).length;

    if (this.currentRecognitions.length > 0) {
      const totalConfidence = this.currentRecognitions.reduce((sum, r) => sum + r.confidence, 0);
      this.detectionStats.averageConfidence = totalConfidence / this.currentRecognitions.length;
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
   * Assess image quality of current frame
   */
  private assessCurrentImageQuality(element: HTMLVideoElement | HTMLCanvasElement): void {
    try {
      const canvas = this.canvasElement?.nativeElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Set canvas size to match element
      if (element instanceof HTMLVideoElement) {
        canvas.width = element.videoWidth;
        canvas.height = element.videoHeight;
        ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
      } else {
        canvas.width = element.width;
        canvas.height = element.height;
        ctx.drawImage(element, 0, 0);
      }

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
   * Check if current image quality is sufficient for face recognition
   */
  isQualitySufficient(): boolean {
    return this.imageQuality ? isImageQualitySufficient({
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
   * Get face box style for display
   */
  getFaceBoxStyle(detection: FaceDetectionResult): string {
    return `width: ${detection.boundingBox.width}px; height: ${detection.boundingBox.height}px;`;
  }
}
