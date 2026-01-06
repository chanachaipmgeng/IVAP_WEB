export interface AIModel {
  modelId: string;
  modelName: string;
  modelType: string;
  description: string;
  version: string;
  isActive: boolean;
  classes: string[];
  confidenceThreshold: number;
  device: string;
  status: string;
}

export interface DetectionRequest {
  image_data: string;
  model_name?: string;
  camera_id?: string;
  confidence_threshold?: number;
}

export interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface SafetyViolation {
  type: string;
  severity: string;
  confidence: number;
  location: string;
  timestamp: string;
}

export interface EnvironmentalHazard {
  type: string;
  severity: string;
  confidence: number;
  location: string;
  timestamp: string;
}

export interface DetectionResponse {
  camera_id: string;
  model_name: string;
  detections: Detection[];
  violations: SafetyViolation[];
  hazards: EnvironmentalHazard[];
  processing_time: number;
  timestamp: string;
}

export interface ProcessingStatus {
  is_running: boolean;
  total_cameras: number;
  active_cameras: number;
  cameras: CameraStatus[];
}

export interface CameraStatus {
  camera_id: string;
  status: string;
  fps: number;
  last_frame: string;
}

export interface ModelInfo {
  models: Record<string, ModelDetails>;
  device: string;
}

export interface ModelDetails {
  type: string;
  classes: string[];
  confidence_threshold: number;
  status: string;
}

