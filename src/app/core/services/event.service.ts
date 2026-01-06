/**
 * Event Service
 * 
 * Service for managing events and event attendees
 * Matches backend event routes
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { handleApiResponse, handlePaginatedResponse, PaginatedApiResponse } from '../utils/response-handler';
import {
  Event,
  EventCreate,
  EventUpdate,
  EventResponse,
  EventAttendee,
  EventAttendeeCreate,
  EventAttendeeResponse,
  PublicRegistrationRequest,
  PublicEventResponse,
  EventQRCodeResponse,
  EventStatisticsResponse,
  EventReminderRequest,
  EventReminderResponse,
  EmailConfirmationResponse,
  EventFilters,
  EventStatistics
} from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService extends BaseCrudService<Event, EventCreate, EventUpdate> {
  protected baseEndpoint = '/events';

  constructor(protected override api: ApiService) {
    super(api);
  }

  /**
   * Get all events with pagination
   */
  override getAll(filters?: EventFilters): Observable<PaginatedApiResponse<Event>> {
    return this.api.get<any>(this.baseEndpoint, filters).pipe(
      map(response => handlePaginatedResponse<Event>(response))
    );
  }

  /**
   * Get event by ID
   */
  override getById(id: string): Observable<Event> {
    return this.api.get<any>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => handleApiResponse<Event>(response))
    );
  }

  /**
   * Create new event
   */
  override create(data: EventCreate): Observable<Event> {
    return this.api.post<any>(this.baseEndpoint, data).pipe(
      map(response => handleApiResponse<Event>(response))
    );
  }

  /**
   * Update existing event
   */
  override update(id: string, data: EventUpdate): Observable<Event> {
    return this.api.put<any>(`${this.baseEndpoint}/${id}`, data).pipe(
      map(response => handleApiResponse<Event>(response))
    );
  }

  /**
   * Delete event
   */
  override delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Get event attendees
   */
  getAttendees(eventId: string): Observable<EventAttendee[]> {
    return this.api.get<any>(`${this.baseEndpoint}/${eventId}/attendees`).pipe(
      map(response => {
        // Handle both array and paginated response
        if (Array.isArray(response)) {
          return response;
        }
        return (response as any).data || [];
      })
    );
  }

  /**
   * Add attendee to event
   */
  addAttendee(data: EventAttendeeCreate): Observable<EventAttendee> {
    return this.api.post<any>(`${this.baseEndpoint}/attendees`, data).pipe(
      map(response => handleApiResponse<EventAttendee>(response))
    );
  }

  /**
   * Get event statistics
   */
  getEventStatistics(eventId: string): Observable<EventStatisticsResponse> {
    return this.api.get<any>(`${this.baseEndpoint}/${eventId}/statistics`).pipe(
      map(response => handleApiResponse<EventStatisticsResponse>(response))
    );
  }

  /**
   * Send event reminders
   * Backend: POST /api/v1/events/{event_id}/send-reminders
   * Note: eventId is sent in URL path, request body contains reminderType, reminderTime, message
   */
  sendReminders(eventId: string, data: EventReminderRequest): Observable<EventReminderResponse> {
    return this.api.post<any>(`${this.baseEndpoint}/${eventId}/send-reminders`, data).pipe(
      map(response => handleApiResponse<EventReminderResponse>(response))
    );
  }

  // ==================== Public Endpoints ====================

  /**
   * Get public event details (no authentication required)
   */
  getPublicEventDetails(publicUrl: string): Observable<PublicEventResponse> {
    return this.api.get<any>(`${this.baseEndpoint}/public/details/${publicUrl}`).pipe(
      map(response => handleApiResponse<PublicEventResponse>(response))
    );
  }

  /**
   * Register for public event (no authentication required)
   */
  registerForPublicEvent(publicUrl: string, data: PublicRegistrationRequest): Observable<any> {
    return this.api.post<any>(`${this.baseEndpoint}/public/register/${publicUrl}`, data).pipe(
      map(response => handleApiResponse<any>(response))
    );
  }

  /**
   * Confirm email for event registration
   */
  confirmEmail(publicUrl: string, token: string): Observable<EmailConfirmationResponse> {
    // Token is passed as query parameter, not in body
    return this.api.post<any>(`${this.baseEndpoint}/public/register/${publicUrl}/confirm-email?token=${encodeURIComponent(token)}`, {}).pipe(
      map(response => handleApiResponse<EmailConfirmationResponse>(response))
    );
  }

  /**
   * Get event QR code
   */
  getEventQRCode(publicUrl: string): Observable<EventQRCodeResponse> {
    return this.api.get<any>(`${this.baseEndpoint}/public/${publicUrl}/qr-code`).pipe(
      map(response => handleApiResponse<EventQRCodeResponse>(response))
    );
  }

  // ==================== Kiosk Endpoints ====================

  /**
   * Event check-in via kiosk (face scan)
   */
  checkInViaKiosk(apiKey: string, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('api_key', apiKey);

    // Note: This endpoint might need special handling for FormData
    return this.api.post<any>(`${this.baseEndpoint}/kiosk/check-in`, formData, { api_key: apiKey }).pipe(
      map(response => handleApiResponse<any>(response))
    );
  }

  /**
   * Get event statistics (general)
   */
  getStatistics(companyId?: string): Observable<EventStatistics> {
    const params = companyId ? { companyId } : {};
    return this.api.get<EventStatistics>(`${this.baseEndpoint}/statistics`, params).pipe(
      map(response => handleApiResponse<EventStatistics>(response))
    );
  }

  /**
   * Get all devices linked to an event
   * Backend: GET /api/v1/events/{event_id}/devices
   */
  getEventLinkedDevices(eventId: string): Observable<any[]> {
    return this.api.get<any>(`${this.baseEndpoint}/${eventId}/devices`).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        return (response as any).data || [];
      })
    );
  }

  /**
   * Event check-in via kiosk (multiple people)
   * Backend: POST /api/v1/events/kiosk/check-in-many
   */
  checkInManyViaKiosk(apiKey: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // Note: api_key is passed as query parameter
    return this.api.post<any>(`${this.baseEndpoint}/kiosk/check-in-many`, formData, { api_key: apiKey });
  }

  /**
   * Check check-in status by email
   * Backend: GET /api/v1/events/public/{public_url}/check-status?email={email}
   */
  checkCheckinStatus(publicUrl: string, email: string): Observable<any> {
    return this.api.get<any>(`${this.baseEndpoint}/public/${publicUrl}/check-status`, { email });
  }
}
