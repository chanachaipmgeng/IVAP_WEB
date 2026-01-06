/**
 * QR Code Service
 * 
 * Service for managing QR codes
 * Extends BaseCrudService for standard CRUD operations
 * Uses snake_case to match backend API directly
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { BaseCrudService } from './base-crud.service';
import {
  QRCode,
  CreateQRCodeDto,
  UpdateQRCodeDto,
  QRCodeScanResult
} from '../models/qr-code.model';

@Injectable({
  providedIn: 'root'
})
export class QRCodeService extends BaseCrudService<QRCode, CreateQRCodeDto, UpdateQRCodeDto> {
  protected baseEndpoint = '/qr-codes';

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Get QR code by data value
   * Backend: GET /api/v1/qr-codes/data/{qr_data_value}
   */
  getQRCodeByData(qrDataValue: string): Observable<QRCode> {
    const options = { skipTransform: true };
    return this.api.get<QRCode>(`${this.baseEndpoint}/data/${qrDataValue}`, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Verify QR code
   * Backend: POST /api/v1/qr-codes/verify
   */
  verifyQRCode(request: { qr_data: string; device_id?: string }): Observable<any> {
    const options = { skipTransform: true };
    return this.api.post<any>(`${this.baseEndpoint}/verify`, request, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Generate QR code image
   * Backend: GET /api/v1/qr-codes/generate-image?qr_data={data}
   */
  generateImage(qrData: string): Observable<Blob> {
    const options = { skipTransform: true, responseType: 'blob' as 'json' };
    return this.api.get<Blob>(`${this.baseEndpoint}/generate-image`, { qr_data: qrData }, options);
  }

  /**
   * Get QR code statistics
   * Backend: GET /api/v1/qr-codes/statistics
   */
  getStatistics(): Observable<any> {
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/statistics`, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Get QR code types
   * Backend: GET /api/v1/qr-codes/types
   */
  getTypes(): Observable<string[]> {
    const options = { skipTransform: true };
    return this.api.get<string[]>(`${this.baseEndpoint}/types`, undefined, options).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data || response?.items || [];
      })
    );
  }

  /**
   * Update QR code status
   * Backend: PATCH /api/v1/qr-codes/{id}/status
   */
  updateStatus(id: string, status: string): Observable<QRCode> {
    const options = { skipTransform: true };
    return this.api.patch<QRCode>(`${this.baseEndpoint}/${id}/status`, { new_status: status }, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Update QR code authorization
   * Backend: PATCH /api/v1/qr-codes/{id}/authorization
   */
  updateAuthorization(id: string, isAuthorized: boolean): Observable<QRCode> {
    const options = { skipTransform: true };
    return this.api.patch<QRCode>(`${this.baseEndpoint}/${id}/authorization`, { is_authorized: isAuthorized }, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Import QR codes from CSV
   * Backend: POST /api/v1/qr-codes/import
   */
  importQRCodes(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const options = { skipTransform: true };
    return this.api.post<any>(`${this.baseEndpoint}/import`, formData, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Export QR codes to CSV
   * Backend: GET /api/v1/qr-codes/export
   */
  exportQRCodes(): Observable<Blob> {
    const options = { skipTransform: true, responseType: 'blob' as 'json' };
    return this.api.get<Blob>(`${this.baseEndpoint}/export`, undefined, options);
  }

  /**
   * Download QR code as image
   * Backend: GET /api/v1/qr-codes/generate-image?qr_data={data}
   * Note: Uses generateImage internally
   */
  downloadQRCode(id: string, format: 'png' | 'svg' = 'png'): void {
    // Get QR code data first, then generate image
    this.getById(id).subscribe({
      next: (qrCode) => {
        // Use code property from QRCode model, fallback to id if code is not available
        const qrData = qrCode.code || qrCode.id || id;
        this.generateImage(qrData).subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-code-${id}.${format}`;
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error('Error downloading QR code:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error getting QR code:', error);
      }
    });
  }

  /**
   * Regenerate QR code
   * Backend: POST /api/v1/qr-codes/{id}/regenerate (if exists) or use update
   * Note: Backend may not have regenerate endpoint, using update as fallback
   */
  regenerateQRCode(id: string): Observable<QRCode> {
    const options = { skipTransform: true };
    // Try regenerate endpoint first, fallback to update
    return this.api.post<QRCode>(`${this.baseEndpoint}/${id}/regenerate`, {}, undefined, options).pipe(
      map((response: any) => response?.data || response),
      catchError(() => {
        // If regenerate fails, try to update with new data
        return this.update(id, {} as UpdateQRCodeDto);
      })
    );
  }

  /**
   * Activate QR code
   * Backend: PATCH /api/v1/qr-codes/{id}/status with status='ACTIVE'
   */
  activateQRCode(id: string): Observable<QRCode> {
    return this.updateStatus(id, 'ACTIVE');
  }

  /**
   * Deactivate QR code
   * Backend: PATCH /api/v1/qr-codes/{id}/status with status='INACTIVE'
   */
  deactivateQRCode(id: string): Observable<QRCode> {
    return this.updateStatus(id, 'INACTIVE');
  }

  /**
   * Scan QR code
   * Backend: POST /api/v1/qr-codes/verify
   */
  scanQRCode(code: string): Observable<QRCodeScanResult> {
    return this.verifyQRCode({ qr_data: code });
  }

  /**
   * Generate QR code data URL for display
   * Frontend utility method (not backend API)
   */
  getQRCodeDataUrl(code: string): string {
    // This would typically use a QR code library like qrcode or qrious
    // For now, return a placeholder
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="10" y="50">${code}</text></svg>`;
  }
}
