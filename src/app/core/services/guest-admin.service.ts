/**
 * Guest Admin Service
 * 
 * Service for admin guest management
 * Uses snake_case to match backend API directly
 * Backend endpoints: /guests/company/{company_id}/...
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Guest, GuestCreate, GuestUpdate } from '../models/guest.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class GuestAdminService {
  private baseEndpoint = '/guests';

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  /**
   * Get company ID from current user
   */
  private getCompanyId(): string {
    const companyId = this.auth.currentUser()?.company_id || this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found');
    }
    return String(companyId);
  }

  /**
   * Get all guests for company
   * Backend: GET /api/v1/guests/company/{company_id}
   */
  getAdminGuests(filters?: any): Observable<PaginatedApiResponse<Guest>> {
    const companyId = this.getCompanyId();
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}`, filters, options).pipe(
      map((response: any) => {
        const items = response.items || response.data || [];
        return {
          total: response.total || items.length,
          data: items,
          items: items,
          page: response.page || 1,
          size: response.size || response.page_size || items.length
        } as PaginatedApiResponse<Guest>;
      })
    );
  }

  /**
   * Get guest by ID
   * Backend: GET /api/v1/guests/company/{company_id}/{guest_id}
   */
  getAdminGuestById(guestId: string): Observable<Guest> {
    const companyId = this.getCompanyId();
    const options = { skipTransform: true };
    return this.api.get<Guest>(`${this.baseEndpoint}/company/${companyId}/${guestId}`, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Create guest
   * Backend: POST /api/v1/guests/company/{company_id}
   */
  createAdminGuest(data: GuestCreate): Observable<Guest> {
    const companyId = this.getCompanyId();
    const options = { skipTransform: true };
    return this.api.post<Guest>(`${this.baseEndpoint}/company/${companyId}`, data, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Update guest
   * Backend: PUT /api/v1/guests/company/{company_id}/{guest_id}
   */
  updateAdminGuest(guestId: string, data: GuestUpdate): Observable<Guest> {
    const companyId = this.getCompanyId();
    const options = { skipTransform: true };
    return this.api.put<Guest>(`${this.baseEndpoint}/company/${companyId}/${guestId}`, data, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Delete guest
   * Backend: DELETE /api/v1/guests/company/{company_id}/{guest_id}
   */
  deleteAdminGuest(guestId: string): Observable<void> {
    const companyId = this.getCompanyId();
    const options = { skipTransform: true };
    return this.api.delete<void>(`${this.baseEndpoint}/company/${companyId}/${guestId}`, undefined, undefined, options);
  }

  /**
   * Check in a guest
   * Backend: POST /api/v1/guests/company/{company_id}/{guest_id}/check-in
   */
  checkinGuest(guestId: string, checkInData?: any): Observable<Guest> {
    const companyId = this.getCompanyId();
    const options = { skipTransform: true };
    return this.api.post<Guest>(`${this.baseEndpoint}/company/${companyId}/${guestId}/check-in`, checkInData || {}, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Check out a guest
   * Backend: POST /api/v1/guests/company/{company_id}/{guest_id}/check-out
   */
  checkoutGuest(guestId: string, checkOutData?: any): Observable<Guest> {
    const companyId = this.getCompanyId();
    const options = { skipTransform: true };
    return this.api.post<Guest>(`${this.baseEndpoint}/company/${companyId}/${guestId}/check-out`, checkOutData || {}, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Get guest statistics
   * Backend: GET /api/v1/guests/company/{company_id}/statistics
   */
  getStatistics(): Observable<any> {
    const companyId = this.getCompanyId();
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}/statistics`, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Export guests
   * Backend: GET /api/v1/guests/company/{company_id}/export
   */
  exportGuests(filters?: any): Observable<Blob> {
    const companyId = this.getCompanyId();
    const options = { skipTransform: true, responseType: 'blob' as 'json' };
    return this.api.get<Blob>(`${this.baseEndpoint}/company/${companyId}/export`, filters, options);
  }
}
