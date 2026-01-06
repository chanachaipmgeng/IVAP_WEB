/**
 * Biometric Data Service
 * 
 * Service for managing biometric data (fingerprint, face, iris, etc.)
 * Extends BaseCrudService for standard CRUD operations
 * Uses snake_case to match backend API directly
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { BaseCrudService } from './base-crud.service';
import {
  BiometricData,
  CreateBiometricDataDto,
  UpdateBiometricDataDto,
  BiometricVerifyRequest,
  BiometricVerifyResponse,
  BiometricStatistics,
  BiometricTypesResponse
} from '../models/biometric-data.model';

@Injectable({
  providedIn: 'root'
})
export class BiometricDataService extends BaseCrudService<BiometricData, CreateBiometricDataDto, UpdateBiometricDataDto> {
  protected baseEndpoint = '/biometric-data';

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Get biometric data with filters
   * Backend: GET /api/v1/biometric-data?member_id={id}&biometric_type={type}
   */
  getBiometricData(memberId?: string, type?: string): Observable<BiometricData[]> {
    const filters: any = {};
    if (memberId) {
      filters.member_id = memberId;
    }
    if (type) {
      filters.biometric_type = type;
    }
    
    const options = { skipTransform: true };
    return this.api.get<BiometricData[]>(this.baseEndpoint, filters, options).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data || response?.items || [];
      })
    );
  }

  /**
   * Verify biometric data
   * Backend: POST /api/v1/biometric-data/verify
   */
  verifyBiometricData(request: BiometricVerifyRequest): Observable<BiometricVerifyResponse> {
    const options = { skipTransform: true };
    return this.api.post<BiometricVerifyResponse>(`${this.baseEndpoint}/verify`, request, undefined, options);
  }

  /**
   * Get biometric data statistics
   * Backend: GET /api/v1/biometric-data/statistics
   */
  getStatistics(): Observable<BiometricStatistics> {
    const options = { skipTransform: true };
    return this.api.get<BiometricStatistics>(`${this.baseEndpoint}/statistics`, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Get biometric data types
   * Backend: GET /api/v1/biometric-data/types
   */
  getTypes(): Observable<BiometricTypesResponse> {
    const options = { skipTransform: true };
    return this.api.get<BiometricTypesResponse>(`${this.baseEndpoint}/types`, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Upload biometric file
   * Backend: POST /api/v1/biometric-data/{id}/upload
   */
  uploadFile(id: string, file: File): Observable<BiometricData> {
    const formData = new FormData();
    formData.append('file', file);
    const options = { skipTransform: true };
    return this.api.post<BiometricData>(`${this.baseEndpoint}/${id}/upload`, formData, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Download biometric file
   * Backend: GET /api/v1/biometric-data/{id}/download
   */
  downloadFile(id: string): Observable<Blob> {
    const options = { skipTransform: true, responseType: 'blob' as 'json' };
    return this.api.get<Blob>(`${this.baseEndpoint}/${id}/download`, undefined, options);
  }
}
