/**
 * Face Recognition Live Component
 *
 * Live face recognition component with real-time video streaming and face tracking.
 * Supports multiple video streams, face detection, recognition, tracking, and mock camera mode.
 *
 * @example
 * ```html
 * <app-face-recognition-live></app-face-recognition-live>
 * ```
 */

import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener, NgZone, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { FaceService, RecognizeManyFacesResponse } from '../../../../core/services/face.service';
import { FaceDetectionService, FaceDetectionResult } from '../../../../core/services/face-detection.service';
import { assessImageQuality, ImageQualityAssessment } from '../../../../core/utils/image-quality.utils';
import { I18nService } from '../../../../core/services/i18n.service';
import { BaseComponent } from '../../../../core/base/base.component';

/**
 * Tracked face interface
 */
interface TrackedFace {
  id: string; // Unique ID for this tracking session
  bbox: { x: number, y: number, width: number, height: number };
  lastSeen: number; // Timestamp
  lastRecognized: number; // Timestamp of last API call
  lastLog: number; // Timestamp of last UI log
  name?: string;
  confidence: number;
  gender?: string;
  age?: number;
  recognized: boolean;
}

/**
 * Video stream interface
 */
interface VideoStream {
  id: number;
  videoElement: HTMLVideoElement | null;
  canvasElement: HTMLCanvasElement | null;
  overlayCanvas: HTMLCanvasElement | null; // Canvas for drawing landmarks
  stream: MediaStream | null;
  isActive: boolean;
  isDetecting: boolean;
  showLandmarks: boolean;
  useMockCamera: boolean; // ใช้กล้องจำลองหรือไม่
  mockCanvas: HTMLCanvasElement | null; // Canvas สำหรับกล้องจำลอง
  mockAnimationId: number | null; // Animation ID สำหรับกล้องจำลอง
  selectedDeviceId: string | null; // Device ID ที่เลือก
  deviceLabel: string; // ชื่อกล้อง
  currentDetections: Map<string, DetectionInfo>; // Deprecated: keeping for compatibility if needed, but should use trackedFaces
  trackedFaces: Map<string, TrackedFace>; // New tracking system
  displayFaces: TrackedFace[]; // Array for HTML overlay rendering
  isLoading: boolean; // สถานะกำลังโหลด
  emptyFrames: number; // จำนวนเฟรมที่ไม่เจอหน้าต่อเนื่อง
  isFullscreen: boolean; // สถานะเต็มจอ
  imageQuality: ImageQualityAssessment | null; // คุณภาพภาพของสตรีมนี้
  showQualityWarning: boolean; // แสดงแจ้งเตือนคุณภาพภาพ
}

/**
 * Detection info interface
 */
interface DetectionInfo {
  name?: string;
  recognized: boolean;
  gender?: string;
  age?: number;
  confidence: number;
  timestamp: Date;
}

interface CameraDevice {
  deviceId: string;
  label: string;
  kind: string;
}

interface DetectedFace {
  id: string;
  streamId: number;
  image: string; // Base64 image
  name?: string; // ชื่อถ้าจดจำได้
  gender?: string; // เพศ
  age?: number; // อายุ
  confidence?: number; // ความมั่นใจ
  timestamp: Date;
  recognized: boolean; // จดจำได้หรือไม่
}

@Component({
  selector: 'app-face-recognition-live',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatIconModule,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './face-recognition-live.component.html',
  styleUrls: ['./face-recognition-live.component.scss']
})
export class FaceRecognitionLiveComponent extends BaseComponent implements OnInit {
  @ViewChild('videoContainer1', { static: false }) videoContainer1!: ElementRef<HTMLDivElement>;
  @ViewChild('videoContainer2', { static: false }) videoContainer2!: ElementRef<HTMLDivElement>;
  @ViewChild('videoContainer3', { static: false }) videoContainer3!: ElementRef<HTMLDivElement>;

  // Video streams
  videoStreams: VideoStream[] = [
    { id: 1, videoElement: null, canvasElement: null, overlayCanvas: null, stream: null, isActive: false, isDetecting: false, showLandmarks: true, useMockCamera: false, mockCanvas: null, mockAnimationId: null, selectedDeviceId: null, deviceLabel: 'กล้อง #1', currentDetections: new Map(), trackedFaces: new Map(), displayFaces: [], isLoading: false, emptyFrames: 0, isFullscreen: false, imageQuality: null, showQualityWarning: false },
    { id: 2, videoElement: null, canvasElement: null, overlayCanvas: null, stream: null, isActive: false, isDetecting: false, showLandmarks: true, useMockCamera: false, mockCanvas: null, mockAnimationId: null, selectedDeviceId: null, deviceLabel: 'กล้อง #2', currentDetections: new Map(), trackedFaces: new Map(), displayFaces: [], isLoading: false, emptyFrames: 0, isFullscreen: false, imageQuality: null, showQualityWarning: false },
    { id: 3, videoElement: null, canvasElement: null, overlayCanvas: null, stream: null, isActive: false, isDetecting: false, showLandmarks: true, useMockCamera: false, mockCanvas: null, mockAnimationId: null, selectedDeviceId: null, deviceLabel: 'กล้อง #3', currentDetections: new Map(), trackedFaces: new Map(), displayFaces: [], isLoading: false, emptyFrames: 0, isFullscreen: false, imageQuality: null, showQualityWarning: false }
  ];

  // Available camera devices
  availableCameras: CameraDevice[] = [];
  showCameraSelector: Map<number, boolean> = new Map();


  // Detected faces
  detectedFaces: DetectedFace[] = [];
  maxDetectedFaces = 100;

  // Detection settings
  detectionInterval = 1000; // Check every 1 second
  minConfidence = 0.5; // Threshold for face detection

  // Tracking settings
  iouThreshold = 0.4; // Intersection over Union threshold for tracking
  recognitionCooldown = 3000; // Wait 3 seconds before recognizing the same face again
  logCooldown = 5000; // Wait 5 seconds before logging/displaying the same face again

  // Stats
  stats = {
    totalDetections: 0,
    recognizedFaces: 0,
    totalErrors: 0
  };

  private detectionTimers: Map<number, any> = new Map();
  private processedFaces = new Set<string>(); // Track processed faces to avoid duplicates
  private successSound: HTMLAudioElement | null = null; // Sound effect

  constructor(
    private faceService: FaceService,
    private faceDetectionService: FaceDetectionService,
    private cdr: ChangeDetectorRef,
    public i18n: I18nService,
    private ngZone: NgZone
  ) {
    super();
    this.initializeSound();
  }

  /**
   * Initialize sound effect
   */
  private initializeSound(): void {
    // Try to use a local asset first, fallback to synthesized beep if needed
    // Assuming we don't have a file yet, let's use Web Audio API for a simple pleasant chime
  }

  /**
   * Play success chime
   */
  private playSuccessSound(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Nice "ding" sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Start at 800Hz
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1); // Ramp up to 1200Hz

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }

  ngOnInit(): void {
    this.initializeVideoStreams();
    this.initializeFaceDetection();
    this.loadAvailableCameras();
  }

  /**
   * Load available camera devices
   */
  async loadAvailableCameras(): Promise<void> {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `กล้อง ${device.deviceId.substring(0, 8)}`,
          kind: device.kind
        }));

      this.availableCameras = videoDevices;

      // Set default cameras for each stream
      this.videoStreams.forEach((stream, index) => {
        if (videoDevices.length > 0) {
          const deviceIndex = index % videoDevices.length;
          stream.selectedDeviceId = videoDevices[deviceIndex].deviceId;
          stream.deviceLabel = videoDevices[deviceIndex].label;
        }
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load cameras:', error);
      // If no real cameras, add mock camera option
      this.availableCameras = [
        { deviceId: 'mock', label: 'กล้องจำลอง', kind: 'videoinput' }
      ];
    }
  }

  override ngOnDestroy(): void {
    this.stopAllStreams();
    this.detectionTimers.forEach(timer => clearInterval(timer));
    this.detectionTimers.clear();
    super.ngOnDestroy();
  }

  /**
   * Initialize face detection models
   * Note: FaceDetectionService loads models automatically in constructor
   */
  private async initializeFaceDetection(): Promise<void> {
    // Models are loaded automatically in FaceDetectionService constructor
    // Just wait a bit for initialization to complete
    let attempts = 0;
    const maxAttempts = 10;

    while (!this.faceDetectionService.isReady() && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    if (!this.faceDetectionService.isReady()) {
      console.warn('Face detection models may not be fully loaded yet');
    }
  }

  /**
   * Initialize video stream elements
   */
  private initializeVideoStreams(): void {
    setTimeout(() => {
      this.videoStreams.forEach((stream, index) => {
        const container = this.getVideoContainer(index);
        if (container) {
          // Create video element
          const video = document.createElement('video');
          video.autoplay = true;
          video.playsInline = true;
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'cover';
          video.style.borderRadius = '0.5rem';
          container.appendChild(video);
          stream.videoElement = video;

          // Create mock camera canvas (hidden initially)
          const mockCanvas = document.createElement('canvas');
          mockCanvas.style.display = 'none';
          container.appendChild(mockCanvas);
          stream.mockCanvas = mockCanvas;

          // Create canvas element (hidden) for processing
          const canvas = document.createElement('canvas');
          canvas.style.display = 'none';
          container.appendChild(canvas);
          stream.canvasElement = canvas;

          // Create overlay canvas for drawing landmarks
          const overlayCanvas = document.createElement('canvas');
          overlayCanvas.className = 'overlay-canvas';
          overlayCanvas.style.position = 'absolute';
          overlayCanvas.style.top = '0';
          overlayCanvas.style.left = '0';
          overlayCanvas.style.width = '100%';
          overlayCanvas.style.height = '100%';
          overlayCanvas.style.pointerEvents = 'none';
          overlayCanvas.style.zIndex = '10';
          overlayCanvas.style.display = 'block';
          overlayCanvas.style.visibility = 'visible';
          overlayCanvas.style.opacity = '1';
          container.appendChild(overlayCanvas);
          stream.overlayCanvas = overlayCanvas;
        }
      });
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Get video container element
   */
  private getVideoContainer(index: number): HTMLDivElement | null {
    switch (index) {
      case 0:
        return this.videoContainer1?.nativeElement || null;
      case 1:
        return this.videoContainer2?.nativeElement || null;
      case 2:
        return this.videoContainer3?.nativeElement || null;
      default:
        return null;
    }
  }

  /**
   * Toggle camera state (Start/Stop)
   */
  toggleCameraState(streamIndex: number): void {
    const stream = this.videoStreams[streamIndex];
    if (!stream) return;

    if (stream.isActive) {
      this.stopStream(streamIndex);
    } else {
      this.startStream(streamIndex);
    }
  }

  /**
   * Start video stream for a specific camera
   */
  async startStream(streamIndex: number): Promise<void> {
    const stream = this.videoStreams[streamIndex];
    if (!stream || stream.isActive) return;

    stream.isLoading = true; // Set loading state

    try {
      // Check if using mock camera
      if (stream.useMockCamera || stream.selectedDeviceId === 'mock') {
        // ใช้กล้องจำลอง
        this.startMockCamera(streamIndex);
      } else {
        // ใช้กล้องจริง
        const deviceId = stream.selectedDeviceId;

        if (!deviceId) {
          // If no device selected, try to get default
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');

          if (videoDevices.length > 0) {
            stream.selectedDeviceId = videoDevices[streamIndex % videoDevices.length].deviceId;
            stream.deviceLabel = videoDevices[streamIndex % videoDevices.length].label || `กล้อง ${streamIndex + 1}`;
          } else {
            // No cameras available, use mock
            this.startMockCamera(streamIndex);
            return;
          }
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: stream.selectedDeviceId ? { exact: stream.selectedDeviceId } : undefined,
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });

        if (stream.videoElement) {
          stream.videoElement.srcObject = mediaStream;
          stream.videoElement.play();
          stream.stream = mediaStream;
          stream.isActive = true;
          stream.isLoading = false; // Stop loading state

          // Start detection for this stream
          this.startDetection(streamIndex);
        }
      }
    } catch (error: any) {
      console.error(`Failed to start stream ${streamIndex}:`, error);

      // Fallback to mock camera if real camera fails
      if (!stream.useMockCamera) {
        console.warn('Falling back to mock camera');
        stream.useMockCamera = true;
        this.startMockCamera(streamIndex);
        // startMockCamera will handle isLoading = false
      } else {
        stream.isLoading = false; // Stop loading state on error
        alert(`ไม่สามารถเริ่มสตรีมวิดีโอ #${streamIndex + 1}: ${error.message}`);
      }
    }
  }

  /**
   * Start mock camera (simulated webcam)
   */
  private startMockCamera(streamIndex: number): void {
    const stream = this.videoStreams[streamIndex];
    if (!stream || !stream.videoElement || !stream.mockCanvas) {
      stream.isLoading = false;
      return;
    }

    const video = stream.videoElement;
    const canvas = stream.mockCanvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      stream.isLoading = false;
      return;
    }

    // Set canvas size
    canvas.width = 640;
    canvas.height = 480;

    // Create a MediaStream from canvas
    const mockStream = canvas.captureStream(30); // 30 FPS

    video.srcObject = mockStream;
    video.play();
    stream.stream = mockStream;
    stream.isActive = true;
    stream.isLoading = false; // Stop loading state

    // Start animation loop outside angular to prevent CD thrashing
    this.ngZone.runOutsideAngular(() => {
    let frame = 0;
    const animate = () => {
      if (!stream.isActive || !ctx) {
        if (stream.mockAnimationId) {
          cancelAnimationFrame(stream.mockAnimationId);
          stream.mockAnimationId = null;
        }
        return;
      }

      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated background
      const time = Date.now() * 0.001;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsl(${(time * 50 + streamIndex * 120) % 360}, 70%, 50%)`);
      gradient.addColorStop(1, `hsl(${(time * 50 + streamIndex * 120 + 60) % 360}, 70%, 30%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated circles
      for (let i = 0; i < 5; i++) {
        const x = canvas.width / 2 + Math.cos(time + i) * (100 + Math.sin(time * 2) * 50);
        const y = canvas.height / 2 + Math.sin(time + i) * (100 + Math.cos(time * 2) * 50);
        const radius = 30 + Math.sin(time * 2 + i) * 20;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time + i) * 0.2})`;
        ctx.fill();
      }

      // Assess Image Quality (Every 10 frames or so to save performance)
      if (frame % 10 === 0 && ctx) {
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const quality = assessImageQuality(imageData);

            // Update quality info inside Angular zone to update UI
            this.ngZone.run(() => {
                stream.imageQuality = quality;
                // Show warning only if quality is poor or fair
                stream.showQualityWarning = quality.quality === 'poor' || quality.quality === 'fair';
            });
        } catch (err) {
            console.warn('Quality assessment failed', err);
        }
      }

      // Draw text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Mock Camera Stream #${streamIndex + 1}`, canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = '16px Arial';
      ctx.fillText(`Frame: ${frame++}`, canvas.width / 2, canvas.height / 2 + 20);
      ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, canvas.width / 2, canvas.height / 2 + 40);

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo((canvas.width / 10) * i, 0);
        ctx.lineTo((canvas.width / 10) * i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 10) * i);
        ctx.lineTo(canvas.width, (canvas.height / 10) * i);
        ctx.stroke();
      }

      stream.mockAnimationId = requestAnimationFrame(animate);
    };

    stream.mockAnimationId = requestAnimationFrame(animate);
    });

    // Start detection for this stream
    this.startDetection(streamIndex);
  }

  /**
   * Stop video stream
   */
  stopStream(streamIndex: number): void {
    const stream = this.videoStreams[streamIndex];
    if (!stream || !stream.isActive) return;

    // Stop detection
    this.stopDetection(streamIndex);

    // Stop mock camera animation
    if (stream.mockAnimationId) {
      cancelAnimationFrame(stream.mockAnimationId);
      stream.mockAnimationId = null;
    }

    // Stop media stream
    if (stream.stream) {
      stream.stream.getTracks().forEach(track => track.stop());
      stream.stream = null;
    }

    if (stream.videoElement) {
      stream.videoElement.srcObject = null;
    }

    // Clear overlay canvas
    if (stream.overlayCanvas) {
      const ctx = stream.overlayCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, stream.overlayCanvas.width, stream.overlayCanvas.height);
      }
    }

    // Clear mock canvas
    if (stream.mockCanvas) {
      const ctx = stream.mockCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, stream.mockCanvas.width, stream.mockCanvas.height);
      }
    }

    stream.isActive = false;
    stream.isDetecting = false;
    stream.isLoading = false;
  }

  /**
   * Start all streams
   */
  startAllStreams(): void {
    this.videoStreams.forEach((_, index) => {
      this.startStream(index);
    });
  }

  /**
   * Stop all streams
   */
  stopAllStreams(): void {
    this.videoStreams.forEach((_, index) => {
      this.stopStream(index);
    });
  }

  /**
   * Start detection for a stream
   */
  private startDetection(streamIndex: number): void {
    const stream = this.videoStreams[streamIndex];
    if (!stream || !stream.isActive) return;

    // Clear existing timer if any
    this.stopDetection(streamIndex);

    // Use recursive loop instead of setInterval for better performance
    const loop = async () => {
      if (!stream.isActive) return;

      // 1. Check if models are ready
      if (!this.faceDetectionService.isReady()) {
          console.log('Waiting for models to load...');
          // Retry faster if waiting for models
          this.detectionTimers.set(streamIndex, setTimeout(loop, 500));
          return;
      }

      // 2. Check if video is ready (for real camera)
      if (!stream.useMockCamera && stream.videoElement) {
          if (stream.videoElement.readyState < 2) { // HAVE_CURRENT_DATA = 2
              console.log('Waiting for video data...');
              this.detectionTimers.set(streamIndex, setTimeout(loop, 200));
              return;
          }
      }

      const startTime = performance.now();
      let facesFound = false;

      try {
        await this.performDetection(streamIndex);
        // Check if faces were found in the last detection
        facesFound = stream.trackedFaces.size > 0;

        if (facesFound) {
          stream.emptyFrames = 0;
        } else {
          stream.emptyFrames++;
        }
      } catch (error) {
        console.error('Detection loop error:', error);
      }

      // Dynamic interval adjustment
      const processingTime = performance.now() - startTime;

      // Base interval: 200ms (~5 FPS) for smoother detection
      let targetInterval = 200;

      // If no faces found for a while (e.g., 10 frames), slow down to save resources
      if (stream.emptyFrames > 20) {
        targetInterval = 1000; // ~1 FPS for idle monitoring
      }

      const delay = Math.max(10, targetInterval - processingTime);

      if (stream.isActive) {
        const timer = setTimeout(() => {
            this.ngZone.runOutsideAngular(() => loop());
        }, delay);
        this.detectionTimers.set(streamIndex, timer);
      }
    };

    // Start the loop outside angular
    this.ngZone.runOutsideAngular(() => loop());
  }

  /**
   * Stop detection for a stream
   */
  private stopDetection(streamIndex: number): void {
    const timer = this.detectionTimers.get(streamIndex);
    if (timer) {
      clearTimeout(timer); // Changed from clearInterval to clearTimeout for recursive loop
      this.detectionTimers.delete(streamIndex);
    }
  }

  /**
   * Calculate IoU (Intersection over Union)
   */
  private getIoU(box1: any, box2: any): number {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    if (x2 < x1 || y2 < y1) return 0;

    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;

    return intersection / (area1 + area2 - intersection);
  }

  /**
   * Perform face detection and recognition on a stream
   */
  private async performDetection(streamIndex: number): Promise<void> {
    const stream = this.videoStreams[streamIndex];
    if (!stream || !stream.isActive || !stream.videoElement || !stream.canvasElement || stream.isDetecting) {
      return;
    }

    try {
      stream.isDetecting = true;
      const video = stream.videoElement;
      const canvas = stream.canvasElement;
      const ctx = canvas.getContext('2d');

      // For mock camera, check mockCanvas instead
      if (stream.useMockCamera && stream.mockCanvas) {
        if (!ctx) {
          stream.isDetecting = false;
          return;
        }

        // Set canvas size from mock canvas
        canvas.width = stream.mockCanvas.width;
        canvas.height = stream.mockCanvas.height;

        // Draw mock canvas to processing canvas
        ctx.drawImage(stream.mockCanvas, 0, 0, canvas.width, canvas.height);
      } else {
        // Real camera
        if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
          stream.isDetecting = false;
          return;
        }

        // Set canvas size
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      // 3. Assess Image Quality (Throttled)
      // We can do this on the canvas we just drew
      if (stream.canvasElement) {
          // Check quality every ~2 seconds (every 10th check if interval is 200ms)
          // Simplified: just check randomly with 10% chance
          if (Math.random() < 0.1) {
             const qualityCtx = stream.canvasElement.getContext('2d');
             if (qualityCtx) {
                 const imageData = qualityCtx.getImageData(0, 0, stream.canvasElement.width, stream.canvasElement.height);
                 const quality = assessImageQuality(imageData);
                 this.ngZone.run(() => {
                     stream.imageQuality = quality;
                     stream.showQualityWarning = quality.quality === 'poor';
                 });
             }
          }
      }

      // Detect faces using face-api.js
      // Use mockCanvas if using mock camera, otherwise use video element
      const detectionSource = stream.useMockCamera && stream.mockCanvas
        ? stream.mockCanvas
        : video;
      const detections = await this.faceDetectionService.detectFaces(detectionSource);

      // Filter detections by confidence immediately
      const validDetections = detections.filter(d => d.confidence >= this.minConfidence);

      const now = Date.now();
      const currentTrackedFaces = new Set<string>();

      // Tracking Logic
      for (const detection of validDetections) {
        const box = detection.boundingBox;
        let matchedFaceId: string | null = null;
        let maxIoU = 0;

        // Find best match among existing tracked faces
        stream.trackedFaces.forEach((trackedFace, id) => {
          // Only match if not already matched in this frame
          if (currentTrackedFaces.has(id)) return;

          const iou = this.getIoU(box, trackedFace.bbox);
          if (iou > this.iouThreshold && iou > maxIoU) {
            maxIoU = iou;
            matchedFaceId = id;
          }
        });

        let trackedFace: TrackedFace;

        if (matchedFaceId) {
          // Update existing face
          trackedFace = stream.trackedFaces.get(matchedFaceId)!;
          trackedFace.bbox = box;
          trackedFace.lastSeen = now;
          trackedFace.confidence = detection.confidence;
          if (detection.gender) trackedFace.gender = detection.gender;
          if (detection.age) trackedFace.age = detection.age;
          currentTrackedFaces.add(matchedFaceId);
        } else {
          // Create new tracked face
          const newId = `${streamIndex}-${now}-${Math.random().toString(36).substr(2, 5)}`;
          trackedFace = {
            id: newId,
            bbox: box,
            lastSeen: now,
            lastRecognized: 0,
            lastLog: 0,
            confidence: detection.confidence,
            gender: detection.gender,
            age: detection.age,
            recognized: false
          };
          stream.trackedFaces.set(newId, trackedFace);
          currentTrackedFaces.add(newId);
        }

        // Recognition Logic (Throttled)
        if (now - trackedFace.lastRecognized > this.recognitionCooldown) {
          trackedFace.lastRecognized = now; // Mark as recognizing/attempted

          // Extract face region
          const faceCanvas = document.createElement('canvas');
          const faceCtx = faceCanvas.getContext('2d');

          if (faceCtx) {
            // Add padding for better recognition (20% padding)
            const paddingX = box.width * 0.2;
            const paddingY = box.height * 0.2;

            // Calculate padded coordinates ensuring they stay within canvas bounds
            const cropX = Math.max(0, box.x - paddingX);
            const cropY = Math.max(0, box.y - paddingY);
            const cropWidth = Math.min(canvas.width - cropX, box.width + (paddingX * 2));
            const cropHeight = Math.min(canvas.height - cropY, box.height + (paddingY * 2));

            if (cropWidth <= 0 || cropHeight <= 0) continue; // Skip invalid crops

            // Optimization: Resize large faces to save bandwidth
            const MAX_DIMENSION = 320;
            let targetWidth = cropWidth;
            let targetHeight = cropHeight;
            const aspectRatio = cropWidth / cropHeight;

            if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
              if (targetWidth > targetHeight) {
                targetWidth = MAX_DIMENSION;
                targetHeight = targetWidth / aspectRatio;
              } else {
                targetHeight = MAX_DIMENSION;
                targetWidth = targetHeight * aspectRatio;
              }
            }

            faceCanvas.width = targetWidth;
            faceCanvas.height = targetHeight;

            // Draw with smoothing for better quality downscaling
            faceCtx.imageSmoothingEnabled = true;
            faceCtx.imageSmoothingQuality = 'high';

            faceCtx.drawImage(
              canvas,
              cropX, cropY, cropWidth, cropHeight,
              0, 0, targetWidth, targetHeight
            );

            // Convert to base64
            const faceImage = faceCanvas.toDataURL('image/jpeg', 0.85);

            try {
              // Convert canvas to blob
              const blob = await new Promise<Blob>((resolve) => {
                faceCanvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85);
              });
              const file = new File([blob], `face-${trackedFace.id}.jpg`, { type: 'image/jpeg' });

              // Call recognition API
              // ✅ Auto-unsubscribe on component destroy
              this.subscribe(
                this.faceService.recognizeManyFaces(file),
                (recognitionResults: RecognizeManyFacesResponse[]) => {
                  // Debug Log: Check Raw API Response
                  console.log('API Response:', recognitionResults);

                  if (recognitionResults && recognitionResults.length > 0) {
                    const result = recognitionResults[0];
                    console.log('Processing Face Result:', result); // Debug Log

                    // Check if we have a valid member_id (Stronger check than name)
                    if (result.member_id) {
                      const firstName = result.first_name || '';
                      const lastName = result.last_name || '';
                      // Fallback to "Unknown Name" if both are empty but ID exists
                      const newName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : 'Unknown Name';

                      console.log('Recognized Name:', newName); // Debug Log

                      const employeeId = result.employee_id;

                      // Check if name changed or it's a new recognition
                      const nameChanged = trackedFace.name !== newName;

                      // Update Tracked Face Object (Reference update)
                      trackedFace.name = newName;
                      trackedFace.confidence = result.confidence; // Use API confidence
                      trackedFace.recognized = true;

                      // Also store extra info if needed for UI
                      // trackedFace.employeeId = employeeId;

                      // Only increment recognized count if we are logging
                      if (nameChanged || (now - trackedFace.lastLog > this.logCooldown)) {
                         this.stats.recognizedFaces++;
                         this.playSuccessSound(); // Play sound!
                      }

                      // Log Logic (Throttled)
                      // Log if: New name recognized OR it's been a while since last log for this face
                      if (nameChanged || (now - trackedFace.lastLog > this.logCooldown)) {
                        trackedFace.lastLog = now;
                        this.addDetectedFace(trackedFace, streamIndex, faceImage);
                      }
                    } else {
                        // member_id missing, treat as unknown
                         console.log('Member ID missing in result, treating as unknown'); // Debug Log
                         const newName = 'ไม่รู้จัก';

                         const nameChanged = trackedFace.name !== newName;
                         trackedFace.name = newName;
                         trackedFace.recognized = false;
                         if (nameChanged || (now - trackedFace.lastLog > this.logCooldown)) {
                             trackedFace.lastLog = now;
                             this.addDetectedFace(trackedFace, streamIndex, faceImage);
                         }
                    }
                  } else {
                    // API returned empty array or null
                    console.log('API returned no results'); // Debug Log
                    const newName = 'ไม่รู้จัก';

                    const nameChanged = trackedFace.name !== newName;

                    trackedFace.name = newName;
                    trackedFace.recognized = false;

                    if (nameChanged || (now - trackedFace.lastLog > this.logCooldown)) {
                      trackedFace.lastLog = now;
                      this.addDetectedFace(trackedFace, streamIndex, faceImage);
                    }
                  }

                  // Force UI Update
                  this.ngZone.run(() => {
                      // Update the display array specifically to trigger change detection
                      stream.displayFaces = Array.from(stream.trackedFaces.values());
                      this.cdr.detectChanges();
                  });
                },
                (error: any) => {
                  console.warn('Face recognition failed:', error);
                  this.stats.totalErrors++;
                }
              );
            } catch (err) {
              console.error('Error preparing face for recognition:', err);
            }
          }
        }
      }

      // Cleanup old tracked faces
      stream.trackedFaces.forEach((face, id) => {
        if (now - face.lastSeen > 1000) { // Lost for 1 second
          stream.trackedFaces.delete(id);
        }
      });

      // Sync for drawing
      this.updateCurrentDetectionsForDrawing(stream);

      // Draw landmarks ONLY on overlay canvas (Performance optimization)
      // Bounding box and Info card will be handled by HTML overlay
      if (stream.overlayCanvas) {
        // Clear canvas first
        const overlayCtx = stream.overlayCanvas.getContext('2d');
        if (overlayCtx) {
            overlayCtx.clearRect(0, 0, stream.overlayCanvas.width, stream.overlayCanvas.height);

            // Draw landmarks only
            if (stream.showLandmarks) {
                validDetections.forEach(detection => {
                    if (detection.landmarks) {
                        this.drawLandmarks(overlayCtx, detection.landmarks);
                    }
                });
            }
        }
      }

      stream.isDetecting = false;

      // Manually trigger change detection only when necessary (e.g. faces found or lost)
      // or simply run inside zone for the array update part
      this.ngZone.run(() => {
          // Update display array
          stream.displayFaces = Array.from(stream.trackedFaces.values());
          this.cdr.markForCheck();
      });

    } catch (error: any) {
      console.error(`Error performing detection for stream ${streamIndex}:`, error);
      stream.isDetecting = false;
      // this.cdr.detectChanges(); // Removed, rely on manual markForCheck inside zone
    }
  }

  /**
   * Helper to sync tracked faces to the display map
   */
  private updateCurrentDetectionsForDrawing(stream: VideoStream): void {
    // Deprecated but keeping map updated just in case logic depends on it
    stream.currentDetections.clear();
    stream.trackedFaces.forEach((face) => {
      stream.currentDetections.set(face.id, {
        name: face.name,
        recognized: face.recognized,
        gender: face.gender,
        age: face.age,
        confidence: face.confidence,
        timestamp: new Date(face.lastSeen)
      });
    });
  }

  private addDetectedFace(face: TrackedFace, streamIndex: number, image: string) {
    const detectedFace: DetectedFace = {
      id: `${face.id}-${Date.now()}`,
      streamId: streamIndex,
      image: image,
      name: face.name,
      gender: face.gender,
      age: face.age,
      confidence: face.confidence,
      timestamp: new Date(),
      recognized: face.recognized
    };

    this.detectedFaces.unshift(detectedFace);
    this.stats.totalDetections++;

    // Keep only last N faces
    if (this.detectedFaces.length > this.maxDetectedFaces) {
      this.detectedFaces = this.detectedFaces.slice(0, this.maxDetectedFaces);
    }
  }

  /**
   * Clear detected faces
   */
  clearDetectedFaces(): void {
    this.detectedFaces = [];
    this.processedFaces.clear();
    this.stats = {
      totalDetections: 0,
      recognizedFaces: 0,
      totalErrors: 0
    };
    this.cdr.detectChanges();
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp: Date): string {
    const locale = this.i18n.currentLanguage() === 'th' ? 'th-TH' : 'en-US';
    return new Date(timestamp).toLocaleTimeString(locale);
  }

  /**
   * Get gender text in Thai
   */
  getGenderText(gender?: string): string {
    if (!gender) return 'ไม่ทราบ';
    return gender.toLowerCase() === 'male' ? 'ชาย' : gender.toLowerCase() === 'female' ? 'หญิง' : 'ไม่ทราบ';
  }

  /**
   * Get stream status
   */
  getStreamStatus(streamIndex: number): string {
    const stream = this.videoStreams[streamIndex];
    if (!stream) return 'inactive';
    if (!stream.isActive) return 'inactive';
    if (stream.isDetecting) return 'detecting';
    return 'active';
  }

  /**
   * Toggle landmarks for a stream
   */
  toggleLandmarks(streamIndex: number): void {
    const stream = this.videoStreams[streamIndex];
    if (stream) {
      stream.showLandmarks = !stream.showLandmarks;
      // Clear overlay if hiding landmarks
      if (!stream.showLandmarks && stream.overlayCanvas) {
        const ctx = stream.overlayCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, stream.overlayCanvas.width, stream.overlayCanvas.height);
        }
      }
      this.cdr.detectChanges();
    }
  }

  /**
   * Toggle camera selector for a stream
   */
  toggleCameraSelector(streamIndex: number): void {
    const current = this.showCameraSelector.get(streamIndex) || false;
    this.showCameraSelector.set(streamIndex, !current);
    this.cdr.detectChanges();
  }

  /**
   * Select camera for a stream
   */
  selectCamera(streamIndex: number, deviceId: string, deviceLabel: string): void {
    const stream = this.videoStreams[streamIndex];
    if (!stream) return;

    const wasActive = stream.isActive;

    // Stop current stream if active
    if (wasActive) {
      this.stopStream(streamIndex);
    }

    // Update camera selection
    if (deviceId === 'mock') {
      stream.useMockCamera = true;
      stream.selectedDeviceId = 'mock';
      stream.deviceLabel = 'กล้องจำลอง';
    } else {
      stream.useMockCamera = false;
      stream.selectedDeviceId = deviceId;
      stream.deviceLabel = deviceLabel;
    }

    // Hide selector
    this.showCameraSelector.set(streamIndex, false);

    // Always restart stream when camera is changed (auto-start)
    setTimeout(() => {
      this.startStream(streamIndex);
    }, 100);

    this.cdr.detectChanges();
  }

  /**
   * Handle camera dropdown change
   */
  onCameraChange(event: Event, streamIndex: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const deviceId = selectElement.value;
    const camera = this.availableCameras.find(cam => cam.deviceId === deviceId);

    if (camera) {
      this.selectCamera(streamIndex, camera.deviceId, camera.label);
    }
  }

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  onFullscreenChange(event: Event): void {
    const isFullscreen = !!document.fullscreenElement;

    this.videoStreams.forEach((stream, index) => {
      const container = this.getVideoContainer(index);
      if (container) {
        stream.isFullscreen = (document.fullscreenElement === container);
      }
    });

    this.cdr.detectChanges();
  }

  toggleFullScreen(streamIndex: number): void {
    const stream = this.videoStreams[streamIndex];
    const container = this.getVideoContainer(streamIndex);

    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }

  trackByCamera(index: number, camera: CameraDevice): string {
    return camera.deviceId;
  }

  trackByFace(index: number, face: DetectedFace): string {
    return face.id;
  }


  /**
   * Helper function to get tracked faces for template
   */
  getTrackedFaces(stream: VideoStream): TrackedFace[] {
    return stream.displayFaces || [];
  }

  /**
   * Calculate style for bounding box
   */
  getFaceBoxStyle(face: TrackedFace, stream: VideoStream): any {
    const video = stream.videoElement;
    if (!video) return {};

    // Get actual video source dimensions
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Get displayed video element dimensions
    const rect = video.getBoundingClientRect();
    const elementWidth = rect.width;
    const elementHeight = rect.height;

    if (!elementWidth || !elementHeight) return {};

    // Calculate scaling to handle object-fit: contain
    const videoAspect = videoWidth / videoHeight;
    const elementAspect = elementWidth / elementHeight;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (videoAspect > elementAspect) {
        // Video is wider than container (fit width, black bars top/bottom)
        renderWidth = elementWidth;
        renderHeight = elementWidth / videoAspect;
        offsetX = 0;
        offsetY = (elementHeight - renderHeight) / 2;
    } else {
        // Video is taller than container (fit height, black bars left/right)
        renderHeight = elementHeight;
        renderWidth = elementHeight * videoAspect;
        offsetX = (elementWidth - renderWidth) / 2;
        offsetY = 0;
    }

    const scaleX = renderWidth / videoWidth;
    const scaleY = renderHeight / videoHeight;

    const { x, y, width, height } = face.bbox;

    // Return pixel values for precise positioning
    return {
        'left.px': (x * scaleX) + offsetX,
        'top.px': (y * scaleY) + offsetY,
        'width.px': (width * scaleX),
        'height.px': (height * scaleY)
    };
  }

  /**
   * Get class for face box based on status
   */
  getFaceBoxClass(face: TrackedFace): string {
    if (face.recognized) return 'face-box-recognized';
    if (face.name && face.name !== 'ไม่รู้จัก') return 'face-box-recognized';
    if (face.name === 'ไม่รู้จัก') return 'face-box-unknown';
    return 'face-box-detecting';
  }

  trackByFaceId(index: number, face: TrackedFace): string {
    return face.id;
  }

  /**
   * Draw detections and landmarks on overlay canvas
   */
  private drawDetectionsOnCanvas(stream: VideoStream, detections: FaceDetectionResult[]): void {
    // Deprecated: Logic moved to HTML overlay for boxes/cards.
    // This function is removed or replaced by simple landmark drawing.
  }

  /**
   * Draw face landmarks on canvas
   */
  private drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any): void {
    if (!landmarks) return;

    // face-api.js landmarks structure: landmarks.positions is an array of {x, y}
    // Try to get positions from different possible structures
    let positions: Array<{ x: number; y: number }> = [];

    if (landmarks.positions && Array.isArray(landmarks.positions)) {
      positions = landmarks.positions;
    } else if (landmarks._positions && Array.isArray(landmarks._positions)) {
      positions = landmarks._positions;
    } else if (landmarks.landmarks && landmarks.landmarks.positions) {
      positions = landmarks.landmarks.positions;
    }

    if (!positions || positions.length === 0) return;

    // Draw all landmark points
    ctx.fillStyle = '#00FF00'; // Bright Green for points
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;

    positions.forEach((point: { x: number; y: number }) => {
      // Draw point - make it larger and more visible
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
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
}
