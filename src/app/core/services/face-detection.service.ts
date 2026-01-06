import { Injectable, signal, computed } from '@angular/core';
import * as faceapi from 'face-api.js';
import { Observable } from 'rxjs';

export interface FaceDetectionResult {
  detection: faceapi.FaceDetection;
  landmarks?: faceapi.FaceLandmarks68;
  descriptor?: Float32Array;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  age?: number;
  gender?: string;
  genderProbability?: number;
  expressions?: any;
  snapshot?: string; // Base64 image data
}

export interface FaceRecognitionResult {
  id: string;
  faceId: string;
  confidence: number;
  name?: string;
  isRecognized: boolean;
}

export interface FaceEnrollmentData {
  id: string;
  name: string;
  descriptors: Float32Array[];
  imageData: string;
  enrolledAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FaceDetectionService {
  private modelsLoaded = false;
  private isInitialized = false;
  private faceDescriptors: Map<string, FaceEnrollmentData> = new Map();

  // ✅ Signals for reactive state
  private _detections = signal<FaceDetectionResult[]>([]);
  private _recognitions = signal<FaceRecognitionResult[]>([]);
  private _enrollments = signal<FaceEnrollmentData[]>([]);

  // ✅ Readonly signals for public access
  public readonly detections = this._detections.asReadonly();
  public readonly recognitions = this._recognitions.asReadonly();
  public readonly enrollments = this._enrollments.asReadonly();

  // ✅ Computed signals for derived state
  public readonly detectionsCount = computed(() => this._detections().length);
  public readonly recognitionsCount = computed(() => this._recognitions().length);
  public readonly recognizedCount = computed(() => this._recognitions().filter(r => r.isRecognized).length);
  public readonly enrollmentsCount = computed(() => this._enrollments().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public detection$ = new Observable<FaceDetectionResult[]>(observer => {
    observer.next(this._detections());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public recognition$ = new Observable<FaceRecognitionResult[]>(observer => {
    observer.next(this._recognitions());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public enrollment$ = new Observable<FaceEnrollmentData[]>(observer => {
    observer.next(this._enrollments());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeModels();
  }

  /**
   * Initialize face-api.js models
   */
  private async initializeModels(): Promise<void> {
    try {
      // Load models from assets - use base path
      // face-api.js will automatically look for manifest files in subdirectories
      const basePath = '/assets/models';

      // Loading face detection models

      // Load essential models first
      await this.loadModelSafely('TinyFaceDetector', () =>
        faceapi.nets.tinyFaceDetector.loadFromUri(`${basePath}/tiny_face_detector`)
      );

      // @ts-ignore - ssdMobilenetv1 exists in runtime but might be missing in types
      await this.loadModelSafely('SsdMobilenetv1', () =>
        (faceapi.nets as any).ssdMobilenetv1.loadFromUri(`${basePath}/ssd_mobilenetv1`)
      );

      await this.loadModelSafely('FaceLandmark68Net', () =>
        faceapi.nets.faceLandmark68Net.loadFromUri(`${basePath}/face_landmark_68`)
      );

      await this.loadModelSafely('FaceRecognitionNet', () =>
        faceapi.nets.faceRecognitionNet.loadFromUri(`${basePath}/face_recognition`)
      );

      // Load Age and Gender model
      await this.loadModelSafely('AgeGenderNet', () =>
        (faceapi.nets.ageGenderNet as any).loadFromUri(`${basePath}/age_gender_model`)
      );

      // Load Face Expression model
      await this.loadModelSafely('FaceExpressionNet', () =>
        (faceapi.nets.faceExpressionNet as any).loadFromUri(`${basePath}/face_expression`)
      );

      // Check if essential models are loaded
      const hasTinyFaceDetector = this.isModelLoaded(faceapi.nets.tinyFaceDetector);
      const hasLandmarks = this.isModelLoaded(faceapi.nets.faceLandmark68Net);
      const hasRecognition = this.isModelLoaded(faceapi.nets.faceRecognitionNet);

      if (hasTinyFaceDetector && hasLandmarks && hasRecognition) {
        this.modelsLoaded = true;
        this.isInitialized = true;
        // Face detection models loaded successfully
      } else {
        console.warn('⚠️ Some models failed to load');
        console.warn(`TinyFaceDetector: ${hasTinyFaceDetector}, Landmarks: ${hasLandmarks}, Recognition: ${hasRecognition}`);
        // Still mark as loaded if we have at least detection and landmarks
        this.modelsLoaded = hasTinyFaceDetector && hasLandmarks;
        this.isInitialized = this.modelsLoaded;
      }
    } catch (error) {
      console.error('Failed to load face detection models:', error);
      // Don't throw - allow app to continue without face detection
      this.modelsLoaded = false;
      this.isInitialized = false;
    }
  }

  /**
   * Load a model safely with error handling
   */
  private async loadModelSafely(modelName: string, loadFn: () => Promise<void>): Promise<void> {
    try {
      await loadFn();
      // Model loaded successfully
    } catch (error: any) {
      console.error(`✗ Failed to load ${modelName}:`, error?.message || error);
      // Try loading from base path as fallback
      try {
        const basePath = '/assets/models';
        if (modelName === 'TinyFaceDetector') {
          await faceapi.nets.tinyFaceDetector.loadFromUri(basePath);
        } else if (modelName === 'FaceLandmark68Net') {
          await faceapi.nets.faceLandmark68Net.loadFromUri(basePath);
        } else if (modelName === 'FaceRecognitionNet') {
          await faceapi.nets.faceRecognitionNet.loadFromUri(basePath);
        } else if (modelName === 'FaceExpressionNet' && faceapi.nets.faceExpressionNet) {
          await faceapi.nets.faceExpressionNet.loadFromUri(basePath);
        } else if (modelName === 'AgeGenderNet' && faceapi.nets.ageGenderNet) {
          await faceapi.nets.ageGenderNet.loadFromUri(basePath);
        }
        // Model loaded from base path
      } catch (fallbackError) {
        console.error(`✗ ${modelName} failed to load from fallback path:`, fallbackError);
      }
    }
  }

  /**
   * Check if a model is loaded
   */
  private isModelLoaded(net: any): boolean {
    try {
      if (!net) return false;
      // Check if model has isLoaded property or method
      if (typeof net.isLoaded === 'function') {
        return net.isLoaded();
      }
      // Some versions use a property instead
      if (typeof net.isLoaded === 'boolean') {
        return net.isLoaded;
      }
      // Check for _isLoaded internal property
      if (net._isLoaded === true) {
        return true;
      }
      // If model has params, it's likely loaded
      if (net.params) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check if models are loaded
   */
  public isReady(): boolean {
    return this.isInitialized && this.modelsLoaded;
  }

  /**
   * Detect faces in an image
   */
  public async detectFaces(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<FaceDetectionResult[]> {
    if (!this.isReady()) {
      throw new Error('Face detection models not loaded');
    }

    try {
      // Use SsdMobilenetv1Options for better accuracy if available, otherwise TinyFaceDetectorOptions
      // @ts-ignore
      const useSsd = faceapi.nets.ssdMobilenetv1 && (faceapi.nets.ssdMobilenetv1 as any).isLoaded;

      const options = useSsd
        // @ts-ignore
        ? new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
        : new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });

      // Create detection task
      let task = faceapi.detectAllFaces(imageElement, options)
        .withFaceLandmarks();

      // Add expressions if model loaded
      // @ts-ignore
      if (faceapi.nets.faceExpressionNet && (faceapi.nets.faceExpressionNet as any).isLoaded) {
        // @ts-ignore - chaining works but types might be tricky
        task = task.withFaceExpressions();
      }

      // Add age and gender if model loaded
      // @ts-ignore
      if (faceapi.nets.ageGenderNet && (faceapi.nets.ageGenderNet as any).isLoaded) {
        // @ts-ignore
        task = task.withAgeAndGender();
      }

      // Add descriptors (always needed for recognition)

      // Note: detectAllFaces uses withFaceDescriptors (plural) in runtime,
      // but type definition might incorrectly say withFaceDescriptor (singular)
      // @ts-ignore
      const detections = await task.withFaceDescriptors();

      const results: FaceDetectionResult[] = detections.map((detection: any) => {
        const result: FaceDetectionResult = {
          detection: detection.detection,
          landmarks: detection.landmarks,
          descriptor: detection.descriptor,
          confidence: detection.detection.score,
          boundingBox: {
            x: detection.detection.box.x,
            y: detection.detection.box.y,
            width: detection.detection.box.width,
            height: detection.detection.box.height
          }
        };

        if (detection.age) result.age = Math.round(detection.age);
        if (detection.gender) {
          result.gender = detection.gender;
          result.genderProbability = detection.genderProbability;
        }
        if (detection.expressions) result.expressions = detection.expressions;

        return result;
      });

      this._detections.set(results);
      return results;
    } catch (error) {
      console.error('Face detection failed:', error);
      throw error;
    }
  }

  /**
   * Recognize faces using enrolled descriptors
   */
  public async recognizeFaces(detectionResults: FaceDetectionResult[]): Promise<FaceRecognitionResult[]> {
    if (!this.isReady()) {
      throw new Error('Face detection models not loaded');
    }

    const recognitionResults: FaceRecognitionResult[] = [];
    const enrolledFaces = Array.from(this.faceDescriptors.values());

    for (const detection of detectionResults) {
      if (!detection.descriptor) continue;

      let bestMatch: FaceRecognitionResult = {
        id: '',
        faceId: '',
        confidence: 0,
        isRecognized: false
      };

      for (const enrolledFace of enrolledFaces) {
        for (const enrolledDescriptor of enrolledFace.descriptors) {
          const distance = faceapi.euclideanDistance(detection.descriptor, enrolledDescriptor);
          const confidence = 1 - distance; // Convert distance to confidence

          if (confidence > bestMatch.confidence && confidence > 0.6) { // Threshold for recognition
            bestMatch = {
              id: enrolledFace.id,
              faceId: enrolledFace.id,
              confidence,
              name: enrolledFace.name,
              isRecognized: true
            };
          }
        }
      }

      recognitionResults.push(bestMatch);
    }

    this._recognitions.set(recognitionResults);
    return recognitionResults;
  }

  /**
   * Enroll a new face
   */
  public async enrollFace(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    name: string,
    faceId?: string
  ): Promise<FaceEnrollmentData> {
    if (!this.isReady()) {
      throw new Error('Face detection models not loaded');
    }

    try {
      const detections = await this.detectFaces(imageElement);

      if (detections.length === 0) {
        throw new Error('No face detected in the image');
      }

      if (detections.length > 1) {
        throw new Error('Multiple faces detected. Please use an image with only one face');
      }

      const detection = detections[0];
      if (!detection.descriptor) {
        throw new Error('Could not extract face descriptor');
      }

      const id = faceId || this.generateFaceId();
      const imageData = this.captureImageData(imageElement);

      const enrollmentData: FaceEnrollmentData = {
        id,
        name,
        descriptors: [detection.descriptor],
        imageData,
        enrolledAt: new Date()
      };

      this.faceDescriptors.set(id, enrollmentData);
      this._enrollments.set(Array.from(this.faceDescriptors.values()));

      return enrollmentData;
    } catch (error) {
      console.error('Face enrollment failed:', error);
      throw error;
    }
  }

  /**
   * Add additional descriptors to existing enrollment
   */
  public async addFaceDescriptor(faceId: string, imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<void> {
    const enrollment = this.faceDescriptors.get(faceId);
    if (!enrollment) {
      throw new Error('Face not found');
    }

    const detections = await this.detectFaces(imageElement);
    if (detections.length === 0) {
      throw new Error('No face detected in the image');
    }

    const detection = detections[0];
    if (!detection.descriptor) {
      throw new Error('Could not extract face descriptor');
    }

    enrollment.descriptors.push(detection.descriptor);
    this.faceDescriptors.set(faceId, enrollment);
    this._enrollments.set(Array.from(this.faceDescriptors.values()));
  }

  /**
   * Remove a face from enrollment
   */
  public removeFace(faceId: string): void {
    this.faceDescriptors.delete(faceId);
    this._enrollments.set(Array.from(this.faceDescriptors.values()));
  }

  /**
   * Get all enrolled faces
   */
  public getEnrolledFaces(): FaceEnrollmentData[] {
    return Array.from(this.faceDescriptors.values());
  }

  /**
   * Clear all enrolled faces
   */
  public clearEnrollments(): void {
    this.faceDescriptors.clear();
    this._enrollments.set([]);
  }

  /**
   * Export enrollment data
   */
  public exportEnrollments(): string {
    const data = Array.from(this.faceDescriptors.values());
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import enrollment data
   */
  public importEnrollments(data: string): void {
    try {
      const enrollments: FaceEnrollmentData[] = JSON.parse(data);
      this.faceDescriptors.clear();

      enrollments.forEach(enrollment => {
        this.faceDescriptors.set(enrollment.id, enrollment);
      });

      this._enrollments.set(Array.from(this.faceDescriptors.values()));
    } catch (error) {
      console.error('Failed to import enrollments:', error);
      throw error;
    }
  }

  /**
   * Generate unique face ID
   */
  private generateFaceId(): string {
    return 'face_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Capture image data as base64
   */
  private captureImageData(element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = element.width || (element as any).videoWidth || (element as any).naturalWidth;
    canvas.height = element.height || (element as any).videoHeight || (element as any).naturalHeight;

    ctx.drawImage(element, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  /**
   * Get face expressions
   */
  public async getFaceExpressions(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<any> {
    if (!this.isReady()) {
      throw new Error('Face detection models not loaded');
    }

    try {
      const detections = await faceapi
        .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions?.() || [];

      return detections.map((detection: any) => ({
        expressions: detection.expressions,
        confidence: detection.detection.score
      }));
    } catch (error) {
      console.error('Face expression detection failed:', error);
      throw error;
    }
  }

  /**
   * Get age and gender prediction
   */
  public async getAgeAndGender(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<any> {
    if (!this.isReady()) {
      throw new Error('Face detection models not loaded');
    }

    try {
      const detections = await faceapi
        .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withAgeAndGender?.() || [];

      return detections.map((detection: any) => ({
        age: Math.round(detection.age),
        gender: detection.gender,
        genderProbability: detection.genderProbability,
        confidence: detection.detection.score
      }));
    } catch (error) {
      console.error('Age and gender detection failed:', error);
      throw error;
    }
  }
}
