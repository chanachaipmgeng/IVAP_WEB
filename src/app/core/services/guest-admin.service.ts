/**
 * Guest Admin Service
 * 
 * Service for admin guest management
 * Extends BaseCrudService for standard CRUD operations
 * Uses snake_case to match backend API directly
 * Endpoint: /admin/guests
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { BaseCrudService } from './base-crud.service';
import { Guest, GuestCreate, GuestUpdate } from '../models/guest.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class GuestAdminService extends BaseCrudService<Guest, GuestCreate, GuestUpdate> {
  protected baseEndpoint = '/admin/guests';

  constructor(api: ApiService) {
    super(api);
  }

  /**
   * Check in a guest via admin API
   * Backend: PATCH /api/v1/admin/guests/{guest_id}/checkin
   */
  checkinGuest(guestId: string): Observable<Guest> {
    const options = { skipTransform: true };
    return this.api.patch<Guest>(`${this.baseEndpoint}/${guestId}/checkin`, {}, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }

  /**
   * Check out a guest via admin API
   * Backend: PATCH /api/v1/admin/guests/{guest_id}/checkout
   */
  checkoutGuest(guestId: string): Observable<Guest> {
    const options = { skipTransform: true };
    return this.api.patch<Guest>(`${this.baseEndpoint}/${guestId}/checkout`, {}, undefined, options).pipe(
      map((response: any) => response?.data || response)
    );
  }
}
