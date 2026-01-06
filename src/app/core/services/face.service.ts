/**
 * Face Service
 * 
 * Service for managing face recognition and face encodings
 * Matches backend face routes
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UUID } from '../models/base.model';

/**
 * Face Encoding Response (from backend)
 */
export interface FaceEncodingResponse {
  face_encoding_id: string;  // UUID
  member_id: string;  // UUID
  created_at: string;  // ISO datetime string
  image_url: string;  // URL to enrolled image
}

/**
 * Add Face Response
 */
export interface AddFaceResponse {
  message: string;
  face_encoding_id: UUID;
}

/**
 * Check Face Employee Response
 */
export interface CheckFaceEmployeeResponse {
  message: string;
  member_id?: UUID;
}

/**
 * Recognize Many Faces Response
 */
export interface RecognizeManyFacesResponse {
  member_id: UUID;
  first_name?: string;
  last_name?: string;
  location: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Verify Face Response
 */
export interface VerifyFaceResponse {
  match: boolean;
  distance?: number;
  message: string;
}

/**
 * Delete Face Encoding Response
 */
export interface DeleteFaceEncodingResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class FaceService {
  constructor(private api: ApiService) {}

  /**
   * Add face encoding for a member
   * Backend: POST /api/v1/face/members/{member_id}/add-face
   */
  public addFace(memberId: UUID, file: File): Observable<AddFaceResponse> {
    return this.api.upload<AddFaceResponse>(`/face/members/${memberId}/add-face`, file);
  }

  /**
   * Check face against employees (liveness check)
   * Backend: POST /api/v1/face/members/check-face-emp
   */
  public checkFaceEmployee(files: File[]): Observable<CheckFaceEmployeeResponse> {
    // Limit to max 3 files as per backend
    const filesToUpload = files.slice(0, 3);
    return this.api.uploadMultiple<CheckFaceEmployeeResponse>('/face/members/check-face-emp', filesToUpload);
  }

  /**
   * Get face encodings for a member
   * Backend: GET /api/v1/face/members/{member_id}/encodings
   */
  public getFaceEncodings(memberId: UUID): Observable<FaceEncodingResponse[]> {
    return this.api.get<FaceEncodingResponse[]>(`/face/members/${memberId}/encodings`);
  }

  /**
   * Delete face encoding
   * Backend: DELETE /api/v1/face/encodings/{face_encoding_id}
   */
  public deleteFaceEncoding(faceEncodingId: UUID): Observable<DeleteFaceEncodingResponse> {
    return this.api.delete<DeleteFaceEncodingResponse>(`/face/encodings/${faceEncodingId}`);
  }

  /**
   * Recognize many faces in an image
   * Backend: POST /api/v1/face/recognize-many
   */
  public recognizeManyFaces(file: File): Observable<RecognizeManyFacesResponse[]> {
    return this.api.upload<RecognizeManyFacesResponse[]>('/face/recognize-many', file);
  }

  /**
   * Verify face 1-to-1
   * Backend: POST /api/v1/face/verify/{member_id}
   */
  public verifyFace(memberId: UUID, file: File): Observable<VerifyFaceResponse> {
    return this.api.upload<VerifyFaceResponse>(`/face/verify/${memberId}`, file);
  }
}
