import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { QRCode, CreateQRCodeDto, QRCodeScanResult } from '../models/qr-code.model';

@Injectable({
  providedIn: 'root'
})
export class QRCodeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/qr-codes`;

  /**
   * Get all QR codes
   */
  getQRCodes(): Observable<QRCode[]> {
    return this.http.get<QRCode[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.warn('Error loading QR codes (API may not be available):', error);
        return of([] as QRCode[]);
      })
    );
  }

  /**
   * Get QR code by ID
   */
  getQRCodeById(id: string): Observable<QRCode> {
    return this.http.get<QRCode>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new QR code
   */
  createQRCode(data: CreateQRCodeDto): Observable<QRCode> {
    return this.http.post<QRCode>(this.apiUrl, data);
  }

  /**
   * Regenerate QR code
   */
  regenerateQRCode(id: string): Observable<QRCode> {
    return this.http.post<QRCode>(`${this.apiUrl}/${id}/regenerate`, {});
  }

  /**
   * Delete QR code
   */
  deleteQRCode(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activate QR code
   */
  activateQRCode(id: string): Observable<QRCode> {
    return this.http.post<QRCode>(`${this.apiUrl}/${id}/activate`, {});
  }

  /**
   * Deactivate QR code
   */
  deactivateQRCode(id: string): Observable<QRCode> {
    return this.http.post<QRCode>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  /**
   * Scan QR code
   */
  scanQRCode(code: string): Observable<QRCodeScanResult> {
    return this.http.post<QRCodeScanResult>(`${this.apiUrl}/scan`, { code });
  }

  /**
   * Get QR code scan history
   */
  getScanHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`);
  }

  /**
   * Download QR code as image
   */
  downloadQRCode(id: string, format: 'png' | 'svg' = 'png'): void {
    window.open(`${this.apiUrl}/${id}/download?format=${format}`, '_blank');
  }

  /**
   * Generate QR code data URL for display
   */
  getQRCodeDataUrl(code: string): string {
    // This would typically use a QR code library like qrcode or qrious
    // For now, return a placeholder
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="10" y="50">${code}</text></svg>`;
  }
}

