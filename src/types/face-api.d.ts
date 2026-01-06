declare module 'face-api.js' {
  export interface TinyFaceDetectorOptions {
    inputSize?: number;
    scoreThreshold?: number;
  }

  export class TinyFaceDetectorOptions {
    constructor(options?: TinyFaceDetectorOptions);
    inputSize: number;
    scoreThreshold: number;
  }

  export interface FaceDetection {
    score: number;
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }

  export interface FaceLandmarks68 {
    positions: Array<{ x: number; y: number }>;
    getLeftEye(): Array<{ x: number; y: number }>;
    getRightEye(): Array<{ x: number; y: number }>;
    getNoseTip(): Array<{ x: number; y: number }>;
  }

  export interface FaceDescriptor {
    descriptor: Float32Array;
  }

  export interface WithFaceDetection<T> {
    detection: FaceDetection;
  }

  export interface WithFaceLandmarks<T, L> {
    landmarks: L;
  }

  export interface WithFaceDescriptor<T> {
    descriptor: Float32Array;
  }

  export type WithFaceLandmarks68<T> = T & WithFaceLandmarks<T, FaceLandmarks68>;
  export type WithFaceDescriptor68<T> = T & WithFaceDescriptor<T>;
  export type WithFaceDetection68<T> = T & WithFaceDetection<T>;

  export type FullFaceDescription = WithFaceLandmarks68<
    WithFaceDescriptor68<WithFaceDetection68<FaceDetection>>
  >;

  export class nets {
    static tinyFaceDetector: {
      loadFromUri(uri: string): Promise<void>;
      isLoaded: boolean;
    };
    static faceLandmark68Net: {
      loadFromUri(uri: string): Promise<void>;
      isLoaded: boolean;
    };
    static faceRecognitionNet: {
      loadFromUri(uri: string): Promise<void>;
      isLoaded: boolean;
    };
    static faceExpressionNet?: {
      loadFromUri(uri: string): Promise<void>;
      isLoaded: boolean;
    };
    static ageGenderNet?: {
      loadFromUri(uri: string): Promise<void>;
      isLoaded: boolean;
    };
  }

  export function detectSingleFace(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    options?: TinyFaceDetectorOptions
  ): {
    withFaceLandmarks(): {
      withFaceDescriptor(): Promise<FullFaceDescription | null>;
    };
  };

  export function detectAllFaces(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    options?: TinyFaceDetectorOptions
  ): {
    withFaceLandmarks(): {
      withFaceDescriptor(): Promise<FullFaceDescription[]>;
      withFaceExpressions?(): Promise<any[]>;
      withAgeAndGender?(): Promise<any[]>;
    };
    withFaceExpressions?(): Promise<any[]>;
    withAgeAndGender?(): Promise<any[]>;
  };

  export function euclideanDistance(
    descriptor1: Float32Array,
    descriptor2: Float32Array
  ): number;
}

