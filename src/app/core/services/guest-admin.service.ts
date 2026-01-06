/**
 * Guest Admin Service
 * 
 * Service for admin guest management
 * Matches backend admin guest routes
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Guest, GuestCreate, GuestUpdate } from '../models/guest.model';
import { handleApiResponse, handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class GuestAdminService {
  constructor(private api: ApiService) {}

  /**
   * Get guests for admin management with pagination
   * Backend: GET /api/v1/admin/guests
   */
  getAdminGuests(params?: {
    page?: number;
    size?: number;
    sort?: string;
    order?: string;
    search?: string;
    status?: string;
  }): Observable<PaginatedApiResponse<Guest>> {
    return this.api.get<any>('/admin/guests', params).pipe(
      map(response => handlePaginatedResponse<Guest>(response))
    );
  }

  /**
   * Get a single guest by ID for admin management
   * Backend: GET /api/v1/admin/guests/{guest_id}
   */
  getAdminGuestById(guestId: string): Observable<Guest> {
    return this.api.get<any>(`/admin/guests/${guestId}`).pipe(
      map(response => handleApiResponse<Guest>(response))
    );
  }

  /**
   * Create a new guest via admin API
   * Backend: POST /api/v1/admin/guests
   */
  createAdminGuest(guestData: GuestCreate): Observable<Guest> {
    return this.api.post<any>('/admin/guests', guestData).pipe(
      map(response => handleApiResponse<Guest>(response))
    );
  }

  /**
   * Update an existing guest via admin API
   * Backend: PUT /api/v1/admin/guests/{guest_id}
   */
  updateAdminGuest(guestId: string, guestData: GuestUpdate): Observable<Guest> {
    return this.api.put<any>(`/admin/guests/${guestId}`, guestData).pipe(
      map(response => handleApiResponse<Guest>(response))
    );
  }

  /**
   * Delete a guest via admin API
   * Backend: DELETE /api/v1/admin/guests/{guest_id}
   */
  deleteAdminGuest(guestId: string): Observable<void> {
    return this.api.delete<void>(`/admin/guests/${guestId}`);
  }

  /**
   * Check in a guest via admin API
   * Backend: PATCH /api/v1/admin/guests/{guest_id}/checkin
   */
  checkinGuest(guestId: string): Observable<Guest> {
    return this.api.patch<any>(`/admin/guests/${guestId}/checkin`, {}).pipe(
      map(response => handleApiResponse<Guest>(response))
    );
  }

  /**
   * Check out a guest via admin API
   * Backend: PATCH /api/v1/admin/guests/{guest_id}/checkout
   */
  checkoutGuest(guestId: string): Observable<Guest> {
    return this.api.patch<any>(`/admin/guests/${guestId}/checkout`, {}).pipe(
      map(response => handleApiResponse<Guest>(response))
    );
  }
}
