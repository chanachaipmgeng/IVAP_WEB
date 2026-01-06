import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  BiometricData,
  CreateBiometricDataDto,
  UpdateBiometricDataDto,
  BiometricVerifyRequest,
  BiometricVerifyResponse,
  BiometricStatistics,
  BiometricTypesResponse,
  BiometricType
} from '../models/biometric-data.model';

@Injectable({
  providedIn: 'root'
})
export class BiometricDataService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/biometric-data`;

  /**
   * Get all biometric data records
   */
  getBiometricData(memberId?: string, type?: BiometricType): Observable<BiometricData[]> {
    let params = new HttpParams();
    if (memberId) {
      params = params.set('member_id', memberId);
    }
    if (type) {
      params = params.set('biometric_type', type);
    }
    return this.http.get<BiometricData[]>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.warn('Error loading biometric data (API may not be available):', error);
        return of([] as BiometricData[]);
      })
    );
  }

  /**
   * Get biometric data by ID
   */
  getBiometricDataById(id: string): Observable<BiometricData> {
    return this.http.get<BiometricData>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new biometric data
   */
  createBiometricData(data: CreateBiometricDataDto): Observable<BiometricData> {
    return this.http.post<BiometricData>(this.apiUrl, data);
  }

  /**
   * Update biometric data
   */
  updateBiometricData(id: string, data: UpdateBiometricDataDto): Observable<BiometricData> {
    return this.http.put<BiometricData>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Delete biometric data
   */
  deleteBiometricData(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Verify biometric data
   */
  verifyBiometricData(request: BiometricVerifyRequest): Observable<BiometricVerifyResponse> {
    return this.http.post<BiometricVerifyResponse>(`${this.apiUrl}/verify`, request);
  }

  /**
   * Get biometric data statistics
   */
  getStatistics(): Observable<BiometricStatistics> {
    return this.http.get<BiometricStatistics>(`${this.apiUrl}/statistics`);
  }

  /**
   * Get biometric data types
   */
  getTypes(): Observable<BiometricTypesResponse> {
    return this.http.get<BiometricTypesResponse>(`${this.apiUrl}/types`);
  }

  /**
   * Upload biometric file
   */
  uploadFile(id: string, file: File): Observable<BiometricData> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<BiometricData>(`${this.apiUrl}/${id}/upload`, formData);
  }

  /**
   * Download biometric file
   */
  downloadFile(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }
}

