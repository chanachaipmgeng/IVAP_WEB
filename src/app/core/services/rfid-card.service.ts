import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  RFIDCard,
  CreateRFIDCardDto,
  UpdateRFIDCardDto,
  RFIDVerifyRequest,
  RFIDVerifyResponse,
  RFIDStatistics,
  RFIDCardStatus,
  RFIDCardType,
  PaginatedResponse
} from '../models/rfid-card.model';

@Injectable({
  providedIn: 'root'
})
export class RFIDCardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rfid-cards`;

  /**
   * Get all RFID cards with pagination and filters
   */
  getRFIDCards(
    page: number = 1,
    size: number = 10,
    search?: string,
    status?: RFIDCardStatus,
    cardType?: RFIDCardType
  ): Observable<PaginatedResponse<RFIDCard>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    if (status) {
      params = params.set('status', status);
    }
    if (cardType) {
      params = params.set('card_type', cardType);
    }
    
    return this.http.get<PaginatedResponse<RFIDCard>>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.warn('Error loading RFID cards (API may not be available):', error);
        return of({
          items: [],
          total: 0,
          page: page,
          size: size,
          totalPages: 0
        } as PaginatedResponse<RFIDCard>);
      })
    );
  }

  /**
   * Get RFID card by ID
   */
  getRFIDCardById(id: string): Observable<RFIDCard> {
    return this.http.get<RFIDCard>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get RFID card by card number
   */
  getRFIDCardByNumber(cardNumber: string): Observable<RFIDCard> {
    return this.http.get<RFIDCard>(`${this.apiUrl}/number/${cardNumber}`);
  }

  /**
   * Create new RFID card
   */
  createRFIDCard(data: CreateRFIDCardDto): Observable<RFIDCard> {
    return this.http.post<RFIDCard>(this.apiUrl, data);
  }

  /**
   * Update RFID card
   */
  updateRFIDCard(id: string, data: UpdateRFIDCardDto): Observable<RFIDCard> {
    return this.http.put<RFIDCard>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Delete RFID card
   */
  deleteRFIDCard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Verify RFID card
   */
  verifyRFIDCard(request: RFIDVerifyRequest): Observable<RFIDVerifyResponse> {
    return this.http.post<RFIDVerifyResponse>(`${this.apiUrl}/verify`, request);
  }

  /**
   * Get RFID card statistics
   */
  getStatistics(): Observable<RFIDStatistics> {
    return this.http.get<RFIDStatistics>(`${this.apiUrl}/statistics`);
  }

  /**
   * Get RFID card types
   */
  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/types`);
  }

  /**
   * Update RFID card status
   */
  updateStatus(id: string, status: RFIDCardStatus): Observable<RFIDCard> {
    return this.http.patch<RFIDCard>(`${this.apiUrl}/${id}/status`, { new_status: status });
  }

  /**
   * Update RFID card authorization
   */
  updateAuthorization(id: string, isAuthorized: boolean): Observable<RFIDCard> {
    return this.http.patch<RFIDCard>(`${this.apiUrl}/${id}/authorization`, { is_authorized: isAuthorized });
  }

  /**
   * Import RFID cards from CSV
   */
  importCards(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import`, formData);
  }

  /**
   * Export RFID cards to CSV
   */
  exportCards(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }
}

