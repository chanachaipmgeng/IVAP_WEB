/**
 * RFID Card Service
 * 
 * Service for managing RFID cards
 * Extends BaseCrudService for standard CRUD operations
 * Uses snake_case to match backend API directly
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { BaseCrudService } from './base-crud.service';
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
export class RFIDCardService extends BaseCrudService<RFIDCard, CreateRFIDCardDto, UpdateRFIDCardDto> {
  protected baseEndpoint = '/rfid-cards';

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Get RFID cards with pagination and filters
   * Backend: GET /api/v1/rfid-cards?page={page}&size={size}&search={search}&status={status}&card_type={cardType}
   */
  getRFIDCards(
    page: number = 1,
    size: number = 10,
    search?: string,
    status?: RFIDCardStatus,
    cardType?: RFIDCardType
  ): Observable<PaginatedResponse<RFIDCard>> {
    const filters: any = {
      page,
      size
    };
    
    if (search) {
      filters.search = search;
    }
    if (status) {
      filters.status = status;
    }
    if (cardType) {
      filters.card_type = cardType;
    }
    
    return this.getAll(filters).pipe(
      map((response) => {
        // Map PaginatedApiResponse to PaginatedResponse
        return {
          items: response.items || response.data || [],
          total: response.total || 0,
          page: response.page || page,
          size: response.size || size
        } as PaginatedResponse<RFIDCard>;
      })
    );
  }

  /**
   * Get RFID card by card number
   * Backend: GET /api/v1/rfid-cards/number/{cardNumber}
   */
  getRFIDCardByNumber(cardNumber: string): Observable<RFIDCard> {
    const options = { skipTransform: true };
    return this.api.get<RFIDCard>(`${this.baseEndpoint}/number/${cardNumber}`, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Verify RFID card
   * Backend: POST /api/v1/rfid-cards/verify
   */
  verifyRFIDCard(request: RFIDVerifyRequest): Observable<RFIDVerifyResponse> {
    const options = { skipTransform: true };
    return this.api.post<RFIDVerifyResponse>(`${this.baseEndpoint}/verify`, request, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Get RFID card statistics
   * Backend: GET /api/v1/rfid-cards/statistics
   */
  getStatistics(): Observable<RFIDStatistics> {
    const options = { skipTransform: true };
    return this.api.get<RFIDStatistics>(`${this.baseEndpoint}/statistics`, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Get RFID card types
   * Backend: GET /api/v1/rfid-cards/types
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
   * Update RFID card status
   * Backend: PATCH /api/v1/rfid-cards/{id}/status
   */
  updateStatus(id: string, status: RFIDCardStatus): Observable<RFIDCard> {
    const options = { skipTransform: true };
    return this.api.patch<RFIDCard>(`${this.baseEndpoint}/${id}/status`, { new_status: status }, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Update RFID card authorization
   * Backend: PATCH /api/v1/rfid-cards/{id}/authorization
   */
  updateAuthorization(id: string, isAuthorized: boolean): Observable<RFIDCard> {
    const options = { skipTransform: true };
    return this.api.patch<RFIDCard>(`${this.baseEndpoint}/${id}/authorization`, { is_authorized: isAuthorized }, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Import RFID cards from CSV
   * Backend: POST /api/v1/rfid-cards/import
   */
  importCards(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const options = { skipTransform: true };
    return this.api.post<any>(`${this.baseEndpoint}/import`, formData, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Export RFID cards to CSV
   * Backend: GET /api/v1/rfid-cards/export
   */
  exportCards(): Observable<Blob> {
    const options = { skipTransform: true, responseType: 'blob' as 'json' };
    return this.api.get<Blob>(`${this.baseEndpoint}/export`, undefined, options);
  }
}
