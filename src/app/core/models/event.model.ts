/**
 * Event Models
 * 
 * Represents events and event management
 * Matches backend Event model and schema
 */

import { UUID, BaseTimestamps } from './base.model';

/**
 * Event Status Enum
 */
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

/**
 * Event Type Enum
 */
export type EventType = 'meeting' | 'training' | 'conference' | 'social' | 'workshop' | 'seminar' | 'webinar' | 'other';

/**
 * Registration Status Enum
 */
export type RegistrationStatus = 'registered' | 'attended' | 'cancelled';

/**
 * Event Interface
 * Represents an event
 */
export interface Event extends BaseTimestamps {
  // Primary key
  id: UUID;  // event_id in backend
  
  // Event information
  event_name: string;  // event_name in backend (snake_case)
  description?: string;  // description in backend
  start_date: string;  // start_date in backend (DateTime)
  end_date: string;  // end_date in backend (DateTime)
  location?: string;  // location in backend
  
  // Event configuration
  public_url?: string;  // public_url in backend (unique URL slug)
  status: EventStatus;  // status in backend
  event_type?: EventType;  // event_type in backend
  max_attendees?: number;  // max_attendees in backend (null for unlimited)
  
  // Foreign key
  company_id: UUID;  // company_id in backend
}

/**
 * Event Create Request
 */
export interface EventCreate {
  event_name: string;  // snake_case to match backend
  description?: string;
  start_date: string;  // ISO 8601 datetime string
  end_date: string;  // ISO 8601 datetime string
  location?: string;
  public_url?: string;  // Unique URL slug
  status?: EventStatus;
  event_type?: EventType;
  max_attendees?: number;
}

/**
 * Event Update Request
 */
export interface EventUpdate {
  event_name?: string;  // snake_case to match backend
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  public_url?: string;
  status?: EventStatus;
  event_type?: EventType;
  max_attendees?: number;
}

/**
 * Event Response (from API)
 */
export interface EventResponse extends Event {
  // All fields from Event interface
}

/**
 * Event Attendee Interface
 * Represents an attendee registered for an event
 */
export interface EventAttendee {
  id: UUID;  // attendee_id in backend
  event_id: UUID;  // event_id in backend (snake_case)
  member_id: UUID;  // member_id in backend (snake_case)
  status: RegistrationStatus;  // status in backend
  check_in_time?: string;  // check_in_time in backend (DateTime)
  check_out_time?: string;  // check_out_time in backend (DateTime)
  duration_minutes?: string;  // duration_minutes in backend (Format: "HH:MM")
  gender?: string;  // gender in backend ('male' or 'female')
  age_range?: string;  // age_range in backend ('10s', '20s', '30s', '40s', '50s', '60s', '70s', '80+')
  member_first_name?: string;  // member_first_name in backend
  member_last_name?: string;  // member_last_name in backend
  created_at: string;  // snake_case
}

/**
 * Event Attendee Create Request
 */
export interface EventAttendeeCreate {
  member_id: UUID;  // snake_case to match backend
  event_id: UUID;  // snake_case to match backend
}

/**
 * Event Attendee Response (from API)
 */
export interface EventAttendeeResponse extends EventAttendee {
  // All fields from EventAttendee interface
}

/**
 * Public Registration Request
 * Used for public event registration
 */
export interface PublicRegistrationRequest {
  email: string;
  first_name: string;  // snake_case to match backend
  last_name: string;  // snake_case to match backend
  face_image: string;  // Base64 encoded image data string (snake_case)
}

/**
 * Public Event Response
 * Event details for public registration page
 */
export interface PublicEventResponse {
  event_name: string;  // snake_case to match backend
  description?: string;
  start_date: string;  // snake_case to match backend
  end_date: string;  // snake_case to match backend
}

/**
 * Event QR Code Response
 */
export interface EventQRCodeResponse {
  qr_code_data: string;  // Base64 encoded QR code image (snake_case)
  qr_code_url: string;  // URL to display QR code (snake_case)
  check_in_url: string;  // URL for check-in (snake_case)
  expiration_date?: string;  // QR code expiration date (snake_case)
}

/**
 * Registration Trend Item
 */
export interface RegistrationTrendItem {
  date: string;  // Date in YYYY-MM-DD format
  count: number;  // Number of registrations on this date
}

/**
 * Attendance By Date Item
 */
export interface AttendanceByDateItem {
  date: string;  // Date in YYYY-MM-DD format
  attendance: number;  // Number of attendees on this date
}

/**
 * Event Statistics Response
 */
export interface EventStatisticsResponse {
  total_registrations: number;  // total_registrations in backend (snake_case)
  confirmed_emails: number;  // confirmed_emails in backend (snake_case)
  checked_in: number;  // checked_in in backend (snake_case)
  attendance_rate: number;  // attendance_rate in backend (Percentage 0-100) (snake_case)
  registration_trend: RegistrationTrendItem[];  // registration_trend in backend (snake_case)
  attendance_by_date: AttendanceByDateItem[];  // attendance_by_date in backend (snake_case)
}

/**
 * Event Reminder Request
 * Note: eventId is sent in URL path, not in request body
 */
export interface EventReminderRequest {
  reminder_type: 'email' | 'sms';  // reminder_type in backend (snake_case)
  reminder_time?: string;  // reminder_time in backend (e.g., '24_hours_before', '1_hour_before') (snake_case)
  message?: string;  // message in backend
}

/**
 * Event Reminder Response
 */
export interface EventReminderResponse {
  success: boolean;  // success in backend
  emails_sent: number;  // emails_sent in backend (snake_case)
  messages_sent: number;  // messages_sent in backend (snake_case)
  message: string;  // message in backend
}

/**
 * Email Confirmation Response
 */
export interface EmailConfirmationResponse {
  success: boolean;
  message: string;
}

/**
 * Event Filters
 */
export interface EventFilters {
  search?: string;
  company_id?: UUID;  // snake_case to match backend
  status?: EventStatus;
  event_type?: EventType;  // snake_case to match backend
  start_date_from?: string;  // snake_case to match backend
  start_date_to?: string;  // snake_case to match backend
}

/**
 * Event Statistics
 */
export interface EventStatistics {
  total_events: number;  // snake_case to match backend
  active_events: number;  // snake_case to match backend
  completed_events: number;  // snake_case to match backend
  cancelled_events: number;  // snake_case to match backend
  events_by_type: Record<EventType, number>;  // snake_case to match backend
  events_by_status: Record<EventStatus, number>;  // snake_case to match backend
}
