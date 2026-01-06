import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  /**
   * Get current company ID from auth
   */
  private getCompanyId(): UUID {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      throw new Error('Company ID not found. User must be logged in.');
    }
    // Convert to string if it's a number
    return typeof companyId === 'number' ? companyId.toString() : companyId;
  }

  // ==================== Guest CRUD ====================

  /**
   * Get all guests with filters and pagination
   */
  getGuests(filters?: GuestFilters): Observable<PaginatedResponse<Guest>> {
    try {
      const companyId = this.getCompanyId();
      return this.api.get<PaginatedResponse<Guest>>(`/guests/company/${companyId}`, filters);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Get guests as simple list
   */
  getGuestsList(filters?: GuestFilters): Observable<Guest[]> {
    return this.getGuests(filters).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get guest by ID
   */
  getGuestById(id: UUID): Observable<Guest> {
    try {
      const companyId = this.getCompanyId();
      return this.api.get<Guest>(`/guests/company/${companyId}/${id}`);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Create new guest
   */
  createGuest(guestData: GuestCreate): Observable<Guest> {
    try {
      const companyId = this.getCompanyId();
      return this.api.post<Guest>(`/guests/company/${companyId}`, guestData);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Update existing guest
   */
  updateGuest(id: UUID, updates: GuestUpdate): Observable<Guest> {
    try {
      const companyId = this.getCompanyId();
      return this.api.put<Guest>(`/guests/company/${companyId}/${id}`, updates);
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Delete guest
   */
  deleteGuest(id: UUID): Observable<void> {
    try {
      const companyId = this.getCompanyId();
      return this.api.delete<void>(`/guests/company/${companyId}/${id}`);
    } catch (error) {
      return throwError(() => error);
    }
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
      return this.api.post<GuestRegistration>(`/guest-registrations`, {
        ...registrationData,
        companyId
      });
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
      return this.api.get<GuestRegistration[]>(`/guests/${guestId}/registrations`, { companyId });
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
      return this.api.get<GuestRegistration[]>(`/guest-registrations/event/${eventId}`, { companyId });
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
      return this.api.get<GuestRegistration>(`/guest-registrations/${registrationId}`, { companyId });
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
      return this.api.put<GuestRegistration>(`/guest-registrations/${registrationId}/status`, { 
        status,
        companyId 
      });
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
      return this.api.post<GuestServiceModel>(`/guest-services`, {
        ...serviceData,
        companyId
      });
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
      return this.api.get<GuestServiceModel[]>(`/guests/${guestId}/services`, { companyId });
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
      return this.api.put<GuestServiceModel>(`/guest-services/${serviceId}/status`, {
        status,
        companyId
      });
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
      map(response => response.data.map(g => ({
        id: g.id,
        name: g.name,
        email: g.email,
        phone: g.phone,
        company: g.company,
        status: g.status,
        hostEmployeeName: g.hostEmployeeName,
        checkInTime: g.checkInTime
      })))
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
      return this.api.get<Blob>(`/guest-registrations/event/${eventId}/export`, {
        companyId,
        format
      });
    } catch (error) {
      return throwError(() => error);
    }
  }
}
