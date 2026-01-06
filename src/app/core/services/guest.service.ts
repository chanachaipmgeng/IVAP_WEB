import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { UUID, PaginatedResponse } from '../models/base.model';
import {
  Guest,
  GuestCreate,
  GuestUpdate,
  GuestCheckIn,
  GuestCheckOut,
  GuestRegistration,
  GuestRegistrationCreate,
  GuestService as GuestServiceModel,
  GuestServiceCreate,
  GuestFilters,
  GuestStats,
  GuestSummary,
  isGuestCheckedIn,
  isGuestExpired,
  canGuestCheckIn,
  canGuestCheckOut,
  getGuestDuration
} from '../models/guest.model';
import { GuestStatus } from '../models/enums.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class GuestService extends BaseCrudService<Guest, GuestCreate, GuestUpdate> {
  protected baseEndpoint = '/guests';

  constructor(
    protected override api: ApiService,
    private auth: AuthService
  ) {
    super(api);
  }

  /**
   * Get current company ID from auth
   */
  private getCompanyId(): UUID {
    const companyId = this.auth.currentUser()?.companyId || (this.auth.currentUser() as any)?.company_id;
    if (!companyId) {
      throw new Error('Company ID not found. User must be logged in.');
    }
    // Convert to string if it's a number
    return typeof companyId === 'number' ? companyId.toString() : companyId;
  }

  // ==================== Guest CRUD (Override BaseCrudService) ====================

  /**
   * Get all guests with filters and pagination
   * Override to use company-specific endpoint
   */
  override getAll(filters?: GuestFilters): Observable<PaginatedApiResponse<Guest>> {
    try {
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
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get guests with filters and pagination (alias for getAll)
   */
  getGuests(filters?: GuestFilters): Observable<PaginatedApiResponse<Guest>> {
    return this.getAll(filters);
  }

  /**
   * Get guests as simple list
   */
  getGuestsList(filters?: GuestFilters): Observable<Guest[]> {
    return this.getAll(filters).pipe(
      map(response => response.data || response.items || [])
    );
  }

  /**
   * Get guest by ID
   * Override to use company-specific endpoint
   */
  override getById(id: UUID): Observable<Guest> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<any>(`${this.baseEndpoint}/company/${companyId}/${id}`, undefined, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get guest by ID (alias)
   */
  getGuestById(id: UUID): Observable<Guest> {
    return this.getById(id);
  }

  /**
   * Create new guest
   * Override to use company-specific endpoint
   */
  override create(data: GuestCreate): Observable<Guest> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<any>(`${this.baseEndpoint}/company/${companyId}`, data, undefined, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Create guest (alias)
   */
  createGuest(guestData: GuestCreate): Observable<Guest> {
    return this.create(guestData);
  }

  /**
   * Update existing guest
   * Override to use company-specific endpoint
   */
  override update(id: UUID, data: GuestUpdate): Observable<Guest> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.put<any>(`${this.baseEndpoint}/company/${companyId}/${id}`, data, undefined, options).pipe(
        map((response: any) => {
          return response.data || response;
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update guest (alias)
   */
  updateGuest(id: UUID, updates: GuestUpdate): Observable<Guest> {
    return this.update(id, updates);
  }

  /**
   * Delete guest
   * Override to use company-specific endpoint
   */
  override delete(id: UUID): Observable<void> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.delete<void>(`${this.baseEndpoint}/company/${companyId}/${id}`, undefined, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Delete guest (alias)
   */
  deleteGuest(id: UUID): Observable<void> {
    return this.delete(id);
  }

  // ==================== Check-in/out Operations ====================

  /**
   * Check in guest
   */
  checkInGuest(id: UUID, checkInData: GuestCheckIn): Observable<Guest> {
    try {
      const companyId = this.getCompanyId();
      return this.api.post<Guest>(`/guests/company/${companyId}/${id}/check-in`, checkInData);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Check out guest
   */
  checkOutGuest(id: UUID, checkOutData: GuestCheckOut): Observable<Guest> {
    try {
      const companyId = this.getCompanyId();
      return this.api.post<Guest>(`/guests/company/${companyId}/${id}/check-out`, checkOutData);
    } catch (error) {
      return throwError(() => error);
    }
  }

  // ==================== Guest Registrations (Event System) ====================

  /**
   * Register guest for an event
   */
  registerGuestForEvent(registrationData: GuestRegistrationCreate): Observable<GuestRegistration> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<GuestRegistration>(`/guest-registrations`, {
        ...registrationData,
        company_id: companyId
      }, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get all registrations for a guest
   */
  getGuestRegistrations(guestId: UUID): Observable<GuestRegistration[]> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<GuestRegistration[]>(`/guests/${guestId}/registrations`, { company_id: companyId }, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get all registrations for an event
   */
  getEventRegistrations(eventId: UUID): Observable<GuestRegistration[]> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<GuestRegistration[]>(`/guest-registrations/event/${eventId}`, { company_id: companyId }, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get registration by ID
   */
  getRegistrationById(registrationId: UUID): Observable<GuestRegistration> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<GuestRegistration>(`/guest-registrations/${registrationId}`, { company_id: companyId }, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update registration status
   */
  updateRegistrationStatus(
    registrationId: UUID,
    status: 'pending' | 'confirmed' | 'cancelled' | 'attended'
  ): Observable<GuestRegistration> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.put<GuestRegistration>(`/guest-registrations/${registrationId}/status`, {
        status,
        company_id: companyId
      }, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Confirm registration
   */
  confirmRegistration(registrationId: UUID): Observable<GuestRegistration> {
    return this.updateRegistrationStatus(registrationId, 'confirmed');
  }

  /**
   * Cancel registration
   */
  cancelRegistration(registrationId: UUID): Observable<GuestRegistration> {
    return this.updateRegistrationStatus(registrationId, 'cancelled');
  }

  /**
   * Mark as attended
   */
  markAsAttended(registrationId: UUID): Observable<GuestRegistration> {
    return this.updateRegistrationStatus(registrationId, 'attended');
  }

  // ==================== Guest Services (Special Services) ====================

  /**
   * Request a service for guest
   */
  requestGuestService(serviceData: GuestServiceCreate): Observable<GuestServiceModel> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.post<GuestServiceModel>(`/guest-services`, {
        ...serviceData,
        company_id: companyId
      }, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get all services for a guest
   */
  getGuestServices(guestId: UUID): Observable<GuestServiceModel[]> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.get<GuestServiceModel[]>(`/guests/${guestId}/services`, { company_id: companyId }, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update service status
   */
  updateServiceStatus(
    serviceId: UUID,
    status: 'requested' | 'approved' | 'provided' | 'cancelled'
  ): Observable<GuestServiceModel> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true };
      return this.api.put<GuestServiceModel>(`/guest-services/${serviceId}/status`, {
        status,
        company_id: companyId
      }, undefined, options);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Approve service request
   */
  approveService(serviceId: UUID): Observable<GuestServiceModel> {
    return this.updateServiceStatus(serviceId, 'approved');
  }

  /**
   * Mark service as provided
   */
  markServiceProvided(serviceId: UUID): Observable<GuestServiceModel> {
    return this.updateServiceStatus(serviceId, 'provided');
  }

  /**
   * Cancel service request
   */
  cancelService(serviceId: UUID): Observable<GuestServiceModel> {
    return this.updateServiceStatus(serviceId, 'cancelled');
  }

  // ==================== Statistics & Reports ====================

  /**
   * Get guest statistics
   * Backend: GET /api/v1/guests/company/{company_id}/statistics
   */
  getGuestStats(filters?: any): Observable<GuestStats> {
    try {
      const companyId = this.getCompanyId();
      return this.api.get<GuestStats>(`/guests/company/${companyId}/statistics`, filters);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get guest summary list
   */
  getGuestSummaries(filters?: GuestFilters): Observable<GuestSummary[]> {
    return this.getGuests(filters).pipe(
      map(response => {
        const guests = response.data || response.items || [];
        return guests.map(g => ({
          id: g.id,
          name: g.name,
          email: g.email,
          phone: g.phone,
          company: g.company,
          status: g.status,
          host_employee_name: g.host_employee_name,
          check_in_time: g.check_in_time
        }));
      })
    );
  }

  // ==================== Filter Helpers ====================

  /**
   * Get guests by status
   */
  getGuestsByStatus(status: GuestStatus): Observable<Guest[]> {
    return this.getGuestsList({ status });
  }

  /**
   * Get pending guests
   */
  getPendingGuests(): Observable<Guest[]> {
    return this.getGuestsByStatus(GuestStatus.PENDING);
  }

  /**
   * Get checked-in guests
   */
  getCheckedInGuests(): Observable<Guest[]> {
    return this.getGuestsByStatus(GuestStatus.CHECKED_IN);
  }

  /**
   * Get expired guests
   */
  getExpiredGuests(): Observable<Guest[]> {
    return this.getGuestsByStatus(GuestStatus.EXPIRED);
  }

  /**
   * Search guests
   */
  searchGuests(query: string): Observable<Guest[]> {
    return this.getGuestsList({ search: query });
  }

  // ==================== Helper Methods ====================

  /**
   * Check if guest is checked in
   */
  isCheckedIn(guest: Guest): boolean {
    return isGuestCheckedIn(guest);
  }

  /**
   * Check if guest has expired
   */
  isExpired(guest: Guest): boolean {
    return isGuestExpired(guest);
  }

  /**
   * Check if guest can check in
   */
  canCheckIn(guest: Guest): boolean {
    return canGuestCheckIn(guest);
  }

  /**
   * Check if guest can check out
   */
  canCheckOut(guest: Guest): boolean {
    return canGuestCheckOut(guest);
  }

  /**
   * Get guest duration
   */
  getDuration(guest: Guest): number | null {
    return getGuestDuration(guest);
  }

  // ==================== Export ====================

  /**
   * Export guests data
   * Backend: GET /api/v1/guests/company/{company_id}/export
   */
  exportGuests(filters?: GuestFilters): Observable<Blob> {
    try {
      const companyId = this.getCompanyId();
      return this.api.get<Blob>(`/guests/company/${companyId}/export`, filters, { responseType: 'blob' });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Export registrations data
   */
  exportRegistrations(eventId: UUID, format: 'csv' | 'json' | 'excel' = 'csv'): Observable<Blob> {
    try {
      const companyId = this.getCompanyId();
      const options = { skipTransform: true, responseType: 'blob' as const };
      return this.api.get<Blob>(`/guest-registrations/event/${eventId}/export`, {
        company_id: companyId,
        format
      }, options);
    } catch (error) {
      return throwError(() => error);
    }
  }
}
