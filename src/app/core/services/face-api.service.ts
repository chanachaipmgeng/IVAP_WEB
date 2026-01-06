import { Injectable, signal } from '@angular/core';
import * as faceapi from 'face-api.js';

@Injectable({
  providedIn: 'root'
})
export class FaceApiService {
  private modelsLoaded = signal(false);
  private loading = signal(false);

  getModelsLoaded = () => this.modelsLoaded.asReadonly();
  getLoading = () => this.loading.asReadonly();

  /**
   * Load FaceApi.js models
   */
  async loadModels(): Promise<void> {
    if (this.modelsLoaded()) {
      return;
    }

    this.loading.set(true);
    try {
      const MODEL_URL = '/assets/models';

      // Load required models for face detection
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);

      this.modelsLoaded.set(true);
      // FaceApi.js models loaded successfully
    } catch (error) {
      console.error('Error loading FaceApi.js models:', error);
      throw new Error('Failed to load face detection models');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Detect faces in an image/video element
   */
  async detectFaces(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    options?: any
  ): Promise<any[]> {
    if (!this.modelsLoaded()) {
      await this.loadModels();
    }

    const defaultOptions = {
      inputSize: 416,
      scoreThreshold: 0.5
    };

    const detectionOptions = options || defaultOptions;

    // Detect faces with landmarks and descriptors
    const detections = await faceapi
      .detectAllFaces(input, detectionOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detections;
  }

  /**
   * Detect single face (returns first face found)
   */
  async detectSingleFace(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    options?: any
  ): Promise<any | null> {
    if (!this.modelsLoaded()) {
      await this.loadModels();
    }

    const defaultOptions = {
      inputSize: 416,
      scoreThreshold: 0.5
    };

    const detectionOptions = options || defaultOptions;

    const detection = await faceapi
      .detectSingleFace(input, detectionOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection;
  }

  /**
   * Validate face quality (check if face is clear and properly positioned)
   */
  validateFaceQuality(detection: any): {
    isValid: boolean;
    message?: string;
  } {
    const { detection: faceDetection, landmarks } = detection;

    // Check face size (should be at least 100x100 pixels)
    const box = faceDetection.box;
    if (box.width < 100 || box.height < 100) {
      return {
        isValid: false,
        message: 'Face is too small. Please move closer to the camera.'
      };
    }

    // Check if face is centered (roughly)
    // This is a simple check - you can make it more sophisticated
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    
    // Check face angle (using landmarks)
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNoseTip();

    if (!leftEye || !rightEye || !nose || leftEye.length === 0 || rightEye.length === 0 || nose.length === 0) {
      return {
        isValid: false,
        message: 'Face landmarks not detected properly. Please face the camera directly.'
      };
    }

    // Check if eyes are roughly at the same level (face not tilted too much)
    const leftEyeY = leftEye.reduce((sum: number, p: { x: number; y: number }) => sum + p.y, 0) / leftEye.length;
    const rightEyeY = rightEye.reduce((sum: number, p: { x: number; y: number }) => sum + p.y, 0) / rightEye.length;
    const eyeLevelDiff = Math.abs(leftEyeY - rightEyeY);

    if (eyeLevelDiff > 20) {
      return {
        isValid: false,
        message: 'Please keep your face straight and look directly at the camera.'
      };
    }

    // Check detection score
    if (faceDetection.score < 0.7) {
      return {
        isValid: false,
        message: 'Face detection confidence is low. Please ensure good lighting and face the camera directly.'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Draw face detection box on canvas
   */
  drawFaceBox(
    canvas: HTMLCanvasElement,
    detection: any,
    options?: { color?: string; lineWidth?: number }
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { detection: faceDetection } = detection;
    const box = faceDetection.box;
    const color = options?.color || '#00ff00';
    const lineWidth = options?.lineWidth || 2;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    // Draw landmarks
    const landmarks = detection.landmarks;
    ctx.fillStyle = color;
    landmarks.positions.forEach((point: { x: number; y: number }) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  /**
   * Clear canvas
   */
  clearCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

