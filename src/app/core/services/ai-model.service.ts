import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AIModel,
  DetectionRequest,
  DetectionResponse,
  ProcessingStatus,
  ModelInfo
} from '../models/ai-model.model';

@Injectable({
  providedIn: 'root'
})
export class AIModelService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai-models`;

  /**
   * Get all AI models
   */
  getModels(): Observable<AIModel[]> {
    return this.http.get<AIModel[]>(`${this.apiUrl}/models`);
  }

  /**
   * Get AI model by ID
   */
  getModelById(modelId: string): Observable<AIModel> {
    return this.http.get<AIModel>(`${this.apiUrl}/models/${modelId}`);
  }

  /**
   * Get AI model status by ID
   */
  getModelStatus(modelId: string): Observable<AIModel> {
    return this.http.get<AIModel>(`${this.apiUrl}/models/${modelId}/status`);
  }

  /**
   * Detect objects in image using specified model
   */
  detectObjects(modelId: string, request: DetectionRequest): Observable<DetectionResponse> {
    return this.http.post<DetectionResponse>(`${this.apiUrl}/models/${modelId}/detect`, request);
  }

  /**
   * Process video frame
   */
  processFrame(request: DetectionRequest): Observable<DetectionResponse> {
    return this.http.post<DetectionResponse>(`${this.apiUrl}/process-frame`, request);
  }

  /**
   * Get processing status
   */
  getProcessingStatus(): Observable<ProcessingStatus> {
    return this.http.get<ProcessingStatus>(`${this.apiUrl}/processing/status`);
  }

  /**
   * Start processing camera
   */
  startProcessing(cameraId: string, rtspUrl: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/processing/start`, null, {
      params: { camera_id: cameraId, rtsp_url: rtspUrl }
    });
  }

  /**
   * Stop processing camera
   */
  stopProcessing(cameraId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/processing/stop`, null, {
      params: { camera_id: cameraId }
    });
  }

  /**
   * Initialize processing
   */
  initializeProcessing(): Observable<any> {
    return this.http.post(`${this.apiUrl}/processing/initialize`, {});
  }

  /**
   * Get models info
   */
  getModelsInfo(): Observable<ModelInfo> {
    return this.http.get<ModelInfo>(`${this.apiUrl}/models/info`);
  }
}

