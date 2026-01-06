/**
 * QR Code Service
 * 
 * Service for managing QR codes
 * Extends BaseCrudService for standard CRUD operations
 * Uses snake_case to match backend API directly
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
   * Regenerate QR code
   * Backend: POST /api/v1/qr-codes/{id}/regenerate
   */
  regenerateQRCode(id: string): Observable<QRCode> {
    const options = { skipTransform: true };
    return this.api.post<QRCode>(`${this.baseEndpoint}/${id}/regenerate`, {}, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Activate QR code
   * Backend: POST /api/v1/qr-codes/{id}/activate
   */
  activateQRCode(id: string): Observable<QRCode> {
    const options = { skipTransform: true };
    return this.api.post<QRCode>(`${this.baseEndpoint}/${id}/activate`, {}, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Deactivate QR code
   * Backend: POST /api/v1/qr-codes/{id}/deactivate
   */
  deactivateQRCode(id: string): Observable<QRCode> {
    const options = { skipTransform: true };
    return this.api.post<QRCode>(`${this.baseEndpoint}/${id}/deactivate`, {}, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Scan QR code
   * Backend: POST /api/v1/qr-codes/scan
   */
  scanQRCode(code: string): Observable<QRCodeScanResult> {
    const options = { skipTransform: true };
    return this.api.post<QRCodeScanResult>(`${this.baseEndpoint}/scan`, { code }, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Get QR code scan history
   * Backend: GET /api/v1/qr-codes/{id}/history
   */
  getScanHistory(id: string): Observable<any[]> {
    const options = { skipTransform: true };
    return this.api.get<any[]>(`${this.baseEndpoint}/${id}/history`, undefined, options).pipe(
      map((response: any) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data || response?.items || [];
      })
    );
  }

  /**
   * Download QR code as image
   * Backend: GET /api/v1/qr-codes/{id}/download?format={format}
   */
  downloadQRCode(id: string, format: 'png' | 'svg' = 'png'): void {
    const url = `${this.baseEndpoint}/${id}/download?format=${format}`;
    window.open(url, '_blank');
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
